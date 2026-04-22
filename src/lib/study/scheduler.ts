import type { ConjugationType, WordEntry, WordType } from '@/lib/distractorEngine';
import { CONJS_FOR_WORD_TYPE } from '@/lib/distractorEngine';
import { calculateWeaknessScore } from '@/lib/study/scoring';
import { makeUnitKey, type PracticeType, type StudyPreferences, type StudySessionConfig, type UnitProgress } from '@/lib/study/types';

export interface PracticeUnit {
  unitKey: string;
  word: WordEntry;
  conjugationType: ConjugationType;
  mode: StudySessionConfig['mode'];
  wordType: WordType;
  weaknessScore: number;
}

interface SelectPracticeUnitsOptions {
  words: WordEntry[];
  config: StudySessionConfig;
  practiceType: PracticeType;
  preferences: StudyPreferences;
  unitProgress: Record<string, UnitProgress>;
  now: string;
}

function buildEligibleUnits({
  words,
  config,
  unitProgress,
  now,
}: Pick<SelectPracticeUnitsOptions, 'words' | 'config' | 'unitProgress' | 'now'>): PracticeUnit[] {
  const seen = new Set<string>();
  const units: PracticeUnit[] = [];

  for (const word of words) {
    const allowedForms = config.forms.filter((form) => CONJS_FOR_WORD_TYPE[word.word_type].includes(form));
    for (const conjugationType of allowedForms) {
      const unitKey = makeUnitKey(word.id, conjugationType, config.mode);
      if (seen.has(unitKey)) continue;
      seen.add(unitKey);

      const progress = unitProgress[unitKey];
      units.push({
        unitKey,
        word,
        conjugationType,
        mode: config.mode,
        wordType: word.word_type,
        weaknessScore: progress ? calculateWeaknessScore(progress, now) : 0,
      });
    }
  }

  return units;
}

export function selectPracticeUnits(options: SelectPracticeUnitsOptions): PracticeUnit[] {
  const eligibleUnits = buildEligibleUnits(options);
  const total = options.config.questionCount;

  if (options.practiceType === 'free') {
    return eligibleUnits.slice(0, total);
  }

  const seenUnits = eligibleUnits
    .filter((unit) => options.unitProgress[unit.unitKey])
    .sort((left, right) => right.weaknessScore - left.weaknessScore || left.word.id.localeCompare(right.word.id));

  if (options.practiceType === 'weakness') {
    return seenUnits.slice(0, total);
  }

  const unseenUnits = eligibleUnits.filter((unit) => !options.unitProgress[unit.unitKey]);
  const newLimit = Math.min(options.preferences.dailyNewLimit, total);
  const selectedUnseen = unseenUnits.slice(0, newLimit);
  const selectedWeak = seenUnits.slice(0, Math.max(0, total - selectedUnseen.length));

  return [...selectedWeak, ...selectedUnseen].slice(0, total);
}
