import type { ConjugationType, WordEntry, WordType } from '@/lib/distractorEngine';
import { CONJS_FOR_WORD_TYPE } from '@/lib/distractorEngine';
import { makeUnitKey, type PracticeType, type StudyPreferences, type StudySessionConfig, type UnitProgress } from '@/lib/study/types';

export interface PracticeUnit {
  unitKey: string;
  word: WordEntry;
  conjugationType: ConjugationType;
  mode: StudySessionConfig['mode'];
  wordType: WordType;
  nextReviewDate: string;
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
        nextReviewDate: progress ? progress.nextReviewDate : now,
      };

      const hasProg = !!progress;
      const bestHasProg = bestUnit ? !!unitProgress[bestUnit.unitKey] : false;

      // Prefer forms that have progress (review) over unseen forms
      // Among same category (both have progress or both unseen), prefer earliest nextReviewDate
      const shouldReplace = !bestUnit
        || (hasProg && !bestHasProg)
        || (hasProg === bestHasProg && new Date(unit.nextReviewDate).getTime() < new Date(bestUnit.nextReviewDate).getTime());

      if (shouldReplace) {
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

export function selectPracticeUnits(options: SelectPracticeUnitsOptions): PracticeUnit[] {
  const eligibleUnits = buildEligibleUnits(options);
  const total = options.config.questionCount;

  if (options.practiceType === 'free') {
    return takeDiversifiedUnits(eligibleUnits, total).units;
  }

  const seenUnits = eligibleUnits
    .filter((unit) => options.unitProgress[unit.unitKey])
    .sort((left, right) => new Date(left.nextReviewDate).getTime() - new Date(right.nextReviewDate).getTime() || left.word.id.localeCompare(right.word.id));

  if (options.practiceType === 'weakness') {
    return takeDiversifiedUnits(seenUnits, total).units;
  }

  const nowMs = new Date(options.now).getTime();
  const unseenUnits = eligibleUnits.filter((unit) => !options.unitProgress[unit.unitKey]);

  // Categorize seen units by priority
  const mistakeUnits: PracticeUnit[] = [];
  const unstableUnits: PracticeUnit[] = [];
  const dueReviewUnits: PracticeUnit[] = [];
  const nonDueSeenUnits: PracticeUnit[] = [];

  for (const unit of seenUnits) {
    const progress = options.unitProgress[unit.unitKey]!;
    const isDue = new Date(unit.nextReviewDate).getTime() <= nowMs;

    if (!isDue) {
      nonDueSeenUnits.push(unit);
      continue;
    }

    const isMistake =
      progress.consecutiveWrong > 0 || (progress.wrongCount > 0 && progress.status === 'learning');
    if (isMistake) {
      mistakeUnits.push(unit);
      continue;
    }

    const seenCount = Math.max(progress.seenCount, 1);
    const accuracy = progress.correctCount / seenCount;
    const isUnstable = accuracy < 0.8 && progress.status !== 'graduated';
    if (isUnstable) {
      unstableUnits.push(unit);
      continue;
    }

    dueReviewUnits.push(unit);
  }

  // Select by priority: mistakes → unstable → due review → new → non-due fallback
  const selected: PracticeUnit[] = [];
  const selectedWordIds = new Set<string>();

  function selectFromPool(pool: PracticeUnit[], maxCount: number) {
    const remaining = maxCount - selected.length;
    if (remaining <= 0) return;
    const result = takeDiversifiedUnits(pool, remaining, selectedWordIds);
    selected.push(...result.units);
    for (const id of result.wordIds) {
      selectedWordIds.add(id);
    }
  }

  selectFromPool(mistakeUnits, total);
  selectFromPool(unstableUnits, total);
  selectFromPool(dueReviewUnits, total);

  // Cap new items at dailyNewLimit to avoid flooding the learner
  const newSlots = Math.min(options.preferences.dailyNewLimit, total - selected.length);
  selectFromPool(unseenUnits, selected.length + newSlots);

  selectFromPool(nonDueSeenUnits, total);

  return selected.slice(0, total);
}
