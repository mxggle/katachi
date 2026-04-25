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
    let bestUnit: PracticeUnit | null = null;

    for (const conjugationType of allowedForms) {
      const unitKey = makeUnitKey(word.id, conjugationType, config.mode);
      if (seen.has(unitKey)) continue;
      seen.add(unitKey);

      const progress = unitProgress[unitKey];
      const unit: PracticeUnit = {
        unitKey,
        word,
        conjugationType,
        mode: config.mode,
        wordType: word.word_type,
        weaknessScore: progress ? calculateWeaknessScore(progress, now) : 0,
      };

      if (!bestUnit || unit.weaknessScore > bestUnit.weaknessScore) {
        bestUnit = unit;
      }
    }
    if (bestUnit) {
      units.push(bestUnit);
    }
  }

  return units;
}

function getMetaGroup(group: string): string {
  if (group === 'suru' || group === 'kuru') return 'irregular';
  return group;
}

function takeDiversifiedUnits(
  units: PracticeUnit[],
  total: number,
  blockedWordIds = new Set<string>()
): DiversifiedSelection {
  const selected: PracticeUnit[] = [];
  const selectedWordIds = new Set(blockedWordIds);

  // Group units by meta-group while preserving their internal order (priority)
  const groupBuckets: Record<string, PracticeUnit[]> = {};
  for (const unit of units) {
    const mg = getMetaGroup(unit.word.group);
    if (!groupBuckets[mg]) groupBuckets[mg] = [];
    groupBuckets[mg].push(unit);
  }

  // Identify active meta-groups that have at least one unique word left
  const activeMetaGroups = Object.keys(groupBuckets).filter(mg => 
    groupBuckets[mg].some(u => !selectedWordIds.has(u.word.id))
  );

  // Sort meta-groups to ensure consistent round-robin starting point (optional but good for tests)
  activeMetaGroups.sort();

  let mgIndex = 0;
  const bucketPointers: Record<string, number> = Object.fromEntries(
    Object.keys(groupBuckets).map(mg => [mg, 0])
  );

  while (selected.length < total && activeMetaGroups.length > 0) {
    const mg = activeMetaGroups[mgIndex % activeMetaGroups.length];
    let foundUnique = false;

    for (let i = bucketPointers[mg]; i < groupBuckets[mg].length; i++) {
      const unit = groupBuckets[mg][i];
      if (!selectedWordIds.has(unit.word.id)) {
        selected.push(unit);
        selectedWordIds.add(unit.word.id);
        bucketPointers[mg] = i + 1;
        foundUnique = true;
        break;
      }
    }

    if (!foundUnique) {
      // Exhausted unique words for this meta-group
      activeMetaGroups.splice(mgIndex % activeMetaGroups.length, 1);
      // Don't increment mgIndex
    } else {
      mgIndex++;
    }
  }

  // Fallback: fill remaining slots from units ignoring wordId uniqueness, but keeping group interleaving if possible
  if (selected.length < total) {
    const selectedUnitKeys = new Set(selected.map((u) => u.unitKey));
    const remainingActiveGroups = Object.keys(groupBuckets).filter(mg => 
      groupBuckets[mg].some(u => !selectedUnitKeys.has(u.unitKey))
    );
    remainingActiveGroups.sort();
    
    let fallbackMgIndex = 0;
    while (selected.length < total && remainingActiveGroups.length > 0) {
      const mg = remainingActiveGroups[fallbackMgIndex % remainingActiveGroups.length];
      let foundUnit = false;

      for (let i = bucketPointers[mg]; i < groupBuckets[mg].length; i++) {
        const unit = groupBuckets[mg][i];
        if (!selectedUnitKeys.has(unit.unitKey)) {
          selected.push(unit);
          selectedUnitKeys.add(unit.unitKey);
          selectedWordIds.add(unit.word.id);
          bucketPointers[mg] = i + 1;
          foundUnit = true;
          break;
        }
      }

      if (!foundUnit) {
        remainingActiveGroups.splice(fallbackMgIndex % remainingActiveGroups.length, 1);
      } else {
        fallbackMgIndex++;
      }
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
