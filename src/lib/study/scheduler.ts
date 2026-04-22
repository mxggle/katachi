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

interface DiversifiedSelection {
  units: PracticeUnit[];
  wordIds: Set<string>;
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

function takeDiversifiedUnits(
  units: PracticeUnit[],
  total: number,
  blockedWordIds = new Set<string>()
): DiversifiedSelection {
  const selected: PracticeUnit[] = [];
  const selectedWordIds = new Set(blockedWordIds);
  const leftovers: PracticeUnit[] = [];

  for (const unit of units) {
    if (selected.length >= total) break;

    if (selectedWordIds.has(unit.word.id)) {
      leftovers.push(unit);
      continue;
    }

    selected.push(unit);
    selectedWordIds.add(unit.word.id);
  }

  if (selected.length < total) {
    for (const unit of units) {
      if (selected.length >= total) break;
      if (selected.includes(unit)) continue;
      selected.push(unit);
    }
  }

  return {
    units: selected,
    wordIds: selectedWordIds,
  };
}

function fillRemainingUnits(
  selected: PracticeUnit[],
  total: number,
  candidates: PracticeUnit[]
): PracticeUnit[] {
  if (selected.length >= total) {
    return selected.slice(0, total);
  }

  const selectedKeys = new Set(selected.map((unit) => unit.unitKey));
  const filled = [...selected];

  for (const candidate of candidates) {
    if (filled.length >= total) break;
    if (selectedKeys.has(candidate.unitKey)) continue;
    filled.push(candidate);
    selectedKeys.add(candidate.unitKey);
  }

  return filled;
}

export function selectPracticeUnits(options: SelectPracticeUnitsOptions): PracticeUnit[] {
  const eligibleUnits = buildEligibleUnits(options);
  const total = options.config.questionCount;

  if (options.practiceType === 'free') {
    return takeDiversifiedUnits(eligibleUnits, total).units;
  }

  const seenUnits = eligibleUnits
    .filter((unit) => options.unitProgress[unit.unitKey])
    .sort((left, right) => right.weaknessScore - left.weaknessScore || left.word.id.localeCompare(right.word.id));

  if (options.practiceType === 'weakness') {
    return takeDiversifiedUnits(seenUnits, total).units;
  }

  const unseenUnits = eligibleUnits.filter((unit) => !options.unitProgress[unit.unitKey]);
  const newLimit = Math.min(options.preferences.dailyNewLimit, total);
  const selectedWeak = takeDiversifiedUnits(seenUnits, Math.max(0, total - newLimit));
  const selectedUnseen = takeDiversifiedUnits(unseenUnits, newLimit, selectedWeak.wordIds);

  return fillRemainingUnits(
    [...selectedWeak.units, ...selectedUnseen.units],
    total,
    [...seenUnits, ...unseenUnits]
  );
}
