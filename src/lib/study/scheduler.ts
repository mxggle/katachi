import type { ConjugationType, WordEntry, WordType } from '@/lib/distractorEngine';
import { CONJS_FOR_WORD_TYPE } from '@/lib/distractorEngine';
import { getRulePattern } from '@/lib/study/patterns';
import {
  makeUnitKey,
  type PracticeType,
  type StudyPreferences,
  type StudySessionConfig,
  type StudyState,
  type UnitProgress,
} from '@/lib/study/types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface PracticeUnit {
  unitKey: string;
  word: WordEntry;
  conjugationType: ConjugationType;
  mode: StudySessionConfig['mode'];
  wordType: WordType;
  rulePattern: string;
  /** @deprecated Kept for backward compat; scheduler no longer drives by SRS dates */
  nextReviewDate: string;
}

interface SelectPracticeUnitsOptions {
  words: WordEntry[];
  config: StudySessionConfig;
  practiceType: PracticeType;
  preferences: StudyPreferences;
  unitProgress: Record<string, UnitProgress>;
  studyState: StudyState;
  now: string;
}

// ---------------------------------------------------------------------------
// Daily allocation ratios
// ---------------------------------------------------------------------------

export const DAILY_WEAKNESS_RATIO = 0.5;
export const DAILY_COVERAGE_RATIO = 0.3;
export const DAILY_EXPLORATION_RATIO = 0.2;

// ---------------------------------------------------------------------------
// Meta-group for interleaving
// ---------------------------------------------------------------------------

function getMetaGroup(group: string): string {
  if (group === 'suru' || group === 'kuru') return 'irregular';
  return group;
}

// ---------------------------------------------------------------------------
// Build full candidate pool (all word × form combinations)
// ---------------------------------------------------------------------------

function buildAllCandidates(
  words: WordEntry[],
  config: StudySessionConfig,
): PracticeUnit[] {
  const seen = new Set<string>();
  const units: PracticeUnit[] = [];

  for (const word of words) {
    const allowedForms = config.forms.filter((form) =>
      CONJS_FOR_WORD_TYPE[word.word_type].includes(form)
    );

    for (const conjugationType of allowedForms) {
      const unitKey = makeUnitKey(word.id, conjugationType, config.mode);
      if (seen.has(unitKey)) continue;
      seen.add(unitKey);

      units.push({
        unitKey,
        word,
        conjugationType,
        mode: config.mode,
        wordType: word.word_type,
        rulePattern: getRulePattern(word, conjugationType),
        nextReviewDate: new Date().toISOString(),
      });
    }
  }

  return units;
}

// ---------------------------------------------------------------------------
// Diversified selection with group interleaving
// ---------------------------------------------------------------------------

function takeDiversifiedUnits(
  units: PracticeUnit[],
  total: number,
  blockedWordIds = new Set<string>()
): PracticeUnit[] {
  const selected: PracticeUnit[] = [];
  const selectedWordIds = new Set(blockedWordIds);

  // Group units by meta-group while preserving their internal order
  const groupBuckets: Record<string, PracticeUnit[]> = {};
  for (const unit of units) {
    const mg = getMetaGroup(unit.word.group);
    if (!groupBuckets[mg]) groupBuckets[mg] = [];
    groupBuckets[mg].push(unit);
  }

  const activeMetaGroups = Object.keys(groupBuckets)
    .filter((mg) => groupBuckets[mg].some((u) => !selectedWordIds.has(u.word.id)))
    .sort();

  let mgIndex = 0;
  const bucketPointers: Record<string, number> = Object.fromEntries(
    Object.keys(groupBuckets).map((mg) => [mg, 0])
  );

  // First pass: unique words, interleaved
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
      activeMetaGroups.splice(mgIndex % activeMetaGroups.length, 1);
    } else {
      mgIndex++;
    }
  }

  // Second pass: fill remaining with non-duplicate unitKeys
  if (selected.length < total) {
    const selectedUnitKeys = new Set(selected.map((u) => u.unitKey));
    const remainingActiveGroups = Object.keys(groupBuckets)
      .filter((mg) => groupBuckets[mg].some((u) => !selectedUnitKeys.has(u.unitKey)))
      .sort();

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

  return selected;
}

// ---------------------------------------------------------------------------
// Classify patterns/forms by mastery level
// ---------------------------------------------------------------------------

function classifyByMastery(
  candidates: PracticeUnit[],
  studyState: StudyState,
): {
  weakUnits: PracticeUnit[];
  coveredUnits: PracticeUnit[];
  explorationUnits: PracticeUnit[];
} {
  const weakPatterns = new Set<string>();
  const coveredPatterns = new Set<string>();

  // Classify patterns
  for (const [, ps] of Object.entries(studyState.patternStats)) {
    if (ps.masteryLevel === 'weak' || ps.masteryLevel === 'unstable') {
      weakPatterns.add(ps.pattern);
    } else if (ps.masteryLevel === 'stable' || ps.masteryLevel === 'mastered') {
      coveredPatterns.add(ps.pattern);
    }
  }

  // Also check form-level mastery
  for (const [, fs] of Object.entries(studyState.formStats)) {
    if (fs.masteryLevel === 'weak' || fs.masteryLevel === 'unstable') {
      // All patterns under this form are implicitly weak
      for (const unit of candidates) {
        if (unit.conjugationType === fs.form) {
          weakPatterns.add(unit.rulePattern);
        }
      }
    }
  }

  const weakUnits: PracticeUnit[] = [];
  const coveredUnits: PracticeUnit[] = [];
  const explorationUnits: PracticeUnit[] = [];

  for (const unit of candidates) {
    if (weakPatterns.has(unit.rulePattern)) {
      weakUnits.push(unit);
    } else if (coveredPatterns.has(unit.rulePattern)) {
      coveredUnits.push(unit);
    } else {
      // Pattern is undiagnosed or not yet tracked
      explorationUnits.push(unit);
    }
  }

  return { weakUnits, coveredUnits, explorationUnits };
}

// ---------------------------------------------------------------------------
// Shuffle helper
// ---------------------------------------------------------------------------

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function selectPracticeUnits(options: SelectPracticeUnitsOptions): PracticeUnit[] {
  const allCandidates = buildAllCandidates(options.words, options.config);
  const total = options.config.questionCount;

  if (options.practiceType === 'free') {
    return selectForFree(allCandidates, total);
  }

  if (options.practiceType === 'weakness') {
    return selectForWeakness(allCandidates, total, options.studyState);
  }

  return selectForDaily(allCandidates, total, options.studyState);
}

// ---------------------------------------------------------------------------
// Daily practice: 50% weakness, 30% coverage, 20% exploration
// ---------------------------------------------------------------------------

function selectForDaily(
  allCandidates: PracticeUnit[],
  total: number,
  studyState: StudyState,
): PracticeUnit[] {
  const { weakUnits, coveredUnits, explorationUnits } = classifyByMastery(allCandidates, studyState);

  // Calculate target slots
  const weaknessSlots = Math.ceil(total * DAILY_WEAKNESS_RATIO);
  let coverageSlots = Math.ceil(total * DAILY_COVERAGE_RATIO);
  let explorationSlots = total - weaknessSlots - coverageSlots;

  // Ensure explorationSlots is non-negative
  if (explorationSlots < 0) {
    coverageSlots += explorationSlots;
    explorationSlots = 0;
  }

  // Select from each category with diversity
  const selectedWeakness = takeDiversifiedUnits(shuffleArray(weakUnits), weaknessSlots);
  const usedWordIds = new Set(selectedWeakness.map((u) => u.word.id));

  const selectedCoverage = takeDiversifiedUnits(shuffleArray(coveredUnits), coverageSlots, usedWordIds);
  for (const u of selectedCoverage) usedWordIds.add(u.word.id);

  const selectedExploration = takeDiversifiedUnits(shuffleArray(explorationUnits), explorationSlots, usedWordIds);

  // Combine
  const selected = [...selectedWeakness, ...selectedCoverage, ...selectedExploration];

  // Backfill if any category was short
  if (selected.length < total) {
    const selectedUnitKeys = new Set(selected.map((u) => u.unitKey));
    const remaining = shuffleArray(allCandidates.filter((u) => !selectedUnitKeys.has(u.unitKey)));
    const usedIds = new Set(selected.map((u) => u.word.id));
    const backfill = takeDiversifiedUnits(remaining, total - selected.length, usedIds);
    selected.push(...backfill);
  }

  return selected.slice(0, total);
}

// ---------------------------------------------------------------------------
// Weakness practice: only weak/unstable forms/patterns
// ---------------------------------------------------------------------------

function selectForWeakness(
  allCandidates: PracticeUnit[],
  total: number,
  studyState: StudyState,
): PracticeUnit[] {
  const weakPatterns = new Set<string>();
  const weakForms = new Set<string>();

  for (const [, ps] of Object.entries(studyState.patternStats)) {
    if (ps.masteryLevel === 'weak' || ps.masteryLevel === 'unstable') {
      weakPatterns.add(ps.pattern);
    }
  }

  for (const [, fs] of Object.entries(studyState.formStats)) {
    if (fs.masteryLevel === 'weak' || fs.masteryLevel === 'unstable') {
      weakForms.add(fs.form);
    }
  }

  const weakUnits = allCandidates.filter(
    (u) => weakPatterns.has(u.rulePattern) || weakForms.has(u.conjugationType)
  );

  return takeDiversifiedUnits(shuffleArray(weakUnits), total);
}

// ---------------------------------------------------------------------------
// Free practice: all eligible items, no mastery filtering
// ---------------------------------------------------------------------------

function selectForFree(
  allCandidates: PracticeUnit[],
  total: number,
): PracticeUnit[] {
  return takeDiversifiedUnits(shuffleArray(allCandidates), total);
}
