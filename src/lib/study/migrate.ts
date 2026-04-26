import type { ConjugationType } from '@/lib/distractorEngine';
import type { Language } from '@/lib/i18n';
import {
  DEFAULT_STUDY_SESSION_CONFIG,
  DEFAULT_STUDY_STATE,
  computeMasteryLevel,
  createEmptyFormStats,
  createEmptyPatternStats,
  createEmptyWordStats,
  type AttemptRecord,
  type FormStats,
  type PatternStats,
  type SessionRecord,
  type StudyState,
  type UnitProgress,
  type WordStats,
} from '@/lib/study/types';

interface LegacyProgressStats {
  totalAnswered: number;
  totalCorrect: number;
}

interface LegacyPersistedState {
  dailyStreak?: number;
  lastLoginDate?: string | null;
  lastPracticeDate?: string | null;
  globalStats?: LegacyProgressStats;
  progress?: LegacyProgressStats;
  language?: Language;
  config?: {
    levels?: ('N5' | 'N4' | 'N3')[];
    leves?: ('N5' | 'N4' | 'N3')[];
    wordTypes?: ('verb' | 'i-adj' | 'na-adj')[];
    forms?: ConjugationType[];
    categories?: ConjugationType[];
    questionCount?: number;
    batchSize?: number;
    mode?: 'choice' | 'input';
  };
  unitProgress?: Record<string, UnitProgress>;
  sessionHistory?: SessionRecord[];
  attemptHistory?: AttemptRecord[];
  // V4 fields (may already exist in migrated state)
  formStats?: Record<string, FormStats>;
  patternStats?: Record<string, PatternStats>;
  wordStats?: Record<string, WordStats>;
}

/**
 * Rebuild formStats, patternStats, wordStats from unitProgress.
 *
 * This is used when migrating from schema v3 (word-level SRS) to v4
 * (conjugation ability diagnostic). We aggregate per-unit data into
 * form-level and pattern-level summaries.
 *
 * Note: pattern-level stats can only be partially reconstructed from
 * unitProgress since we don't have the original word data to compute
 * fine-grained rule patterns. We use conjugationType as a fallback.
 */
function rebuildStatsFromUnitProgress(
  unitProgress: Record<string, UnitProgress>,
): {
  formStats: Record<string, FormStats>;
  patternStats: Record<string, PatternStats>;
  wordStats: Record<string, WordStats>;
} {
  const formStats: Record<string, FormStats> = {};
  const patternStats: Record<string, PatternStats> = {};
  const wordStats: Record<string, WordStats> = {};

  for (const progress of Object.values(unitProgress)) {
    // Aggregate into FormStats
    const formKey = progress.conjugationType;
    if (!formStats[formKey]) {
      formStats[formKey] = createEmptyFormStats(progress.conjugationType);
    }
    formStats[formKey].totalAttempts += progress.seenCount;
    formStats[formKey].correctAttempts += progress.correctCount;

    // Best-effort pattern: use {conjugationType}::{wordType} as fallback
    // (we can't determine godan sub-patterns without the original word data)
    const patternKey = `${progress.conjugationType}::${progress.wordType}`;
    if (!patternStats[patternKey]) {
      patternStats[patternKey] = createEmptyPatternStats(patternKey, progress.conjugationType);
    }
    patternStats[patternKey].totalAttempts += progress.seenCount;
    patternStats[patternKey].correctAttempts += progress.correctCount;

    // Aggregate into WordStats
    const wordId = progress.wordId;
    if (!wordStats[wordId]) {
      wordStats[wordId] = createEmptyWordStats(wordId);
    }
    wordStats[wordId].totalAttempts += progress.seenCount;
    wordStats[wordId].correctAttempts += progress.correctCount;
    if (progress.lastSeenAt) {
      if (!wordStats[wordId].lastAttemptAt || progress.lastSeenAt > wordStats[wordId].lastAttemptAt!) {
        wordStats[wordId].lastAttemptAt = progress.lastSeenAt;
      }
    }
  }

  // Compute accuracy and mastery levels
  for (const fs of Object.values(formStats)) {
    fs.accuracy = fs.totalAttempts > 0 ? fs.correctAttempts / fs.totalAttempts : 0;
    fs.masteryLevel = computeMasteryLevel(fs.totalAttempts, fs.accuracy);
  }

  for (const ps of Object.values(patternStats)) {
    ps.accuracy = ps.totalAttempts > 0 ? ps.correctAttempts / ps.totalAttempts : 0;
    ps.masteryLevel = computeMasteryLevel(ps.totalAttempts, ps.accuracy);
  }

  return { formStats, patternStats, wordStats };
}

export function migratePersistedStudyState(legacy: LegacyPersistedState | undefined): StudyState {
  const language = legacy?.language ?? (legacy as any)?.preferences?.language ?? 'en';
  const base = DEFAULT_STUDY_STATE(language);
  const progress = legacy?.progress ?? legacy?.globalStats;

  const migratedUnitProgress = legacy?.unitProgress
    ? Object.fromEntries(
        Object.entries(legacy.unitProgress).map(([key, progress]) => {
          if (progress.nextReviewDate) return [key, progress]; // Already migrated

          // Migrate to SRS — compute nextReviewDate from lastSeenAt, not wall-clock time
          const lastSeenDate = progress.lastSeenAt ? progress.lastSeenAt : new Date().toISOString();

          let status: 'learning' | 'review' | 'graduated' = 'learning';
          let interval = 0;
          let ease = 2.5;

          if (progress.consecutiveCorrect >= 3) {
            status = 'graduated';
            interval = 21;
            ease = 2.8;
          } else if (progress.consecutiveCorrect > 0) {
            status = 'review';
            interval = Math.pow(2.5, progress.consecutiveCorrect);
            ease = 2.5;
          }

          let nextReviewDate: string;
          if (interval > 0 && progress.lastSeenAt) {
            const last = new Date(progress.lastSeenAt);
            last.setHours(last.getHours() + interval * 24);
            nextReviewDate = last.toISOString();
          } else {
            // Learning items or items without lastSeenAt: make them immediately due
            nextReviewDate = lastSeenDate;
          }

          return [
            key,
            {
              ...progress,
              status,
              interval,
              ease,
              nextReviewDate,
            },
          ];
        })
      )
    : {};

  // If already v4 or has formStats, use them directly
  const hasV4Data = !!legacy?.formStats;
  const { formStats, patternStats, wordStats } = hasV4Data
    ? {
        formStats: legacy.formStats!,
        patternStats: legacy.patternStats ?? {},
        wordStats: legacy.wordStats ?? {},
      }
    : rebuildStatsFromUnitProgress(migratedUnitProgress);

  // Extract legacy config from various possible locations
  const legacyConfig = legacy?.config ?? (legacy as any)?.preferences?.defaultSessionConfig;
  const legacyDailyConfig = (legacy as any)?.preferences?.dailySessionConfig;
  const legacyFreeConfig = (legacy as any)?.preferences?.freeSessionConfig;

  return {
    preferences: {
      ...base.preferences,
      language,
      defaultSessionConfig: {
        ...DEFAULT_STUDY_SESSION_CONFIG,
        levels: legacyConfig?.levels ?? legacyConfig?.leves ?? DEFAULT_STUDY_SESSION_CONFIG.levels,
        wordTypes: legacyConfig?.wordTypes ?? DEFAULT_STUDY_SESSION_CONFIG.wordTypes,
        forms: legacyConfig?.forms ?? legacyConfig?.categories ?? DEFAULT_STUDY_SESSION_CONFIG.forms,
        questionCount:
          legacyConfig?.questionCount ?? legacyConfig?.batchSize ?? DEFAULT_STUDY_SESSION_CONFIG.questionCount,
        mode: legacyConfig?.mode ?? DEFAULT_STUDY_SESSION_CONFIG.mode,
      },
      dailySessionConfig: {
        ...(legacyDailyConfig ?? legacyConfig ?? DEFAULT_STUDY_SESSION_CONFIG),
        levels: legacyDailyConfig?.levels ?? legacyConfig?.levels ?? legacyConfig?.leves ?? DEFAULT_STUDY_SESSION_CONFIG.levels,
        wordTypes: legacyDailyConfig?.wordTypes ?? legacyConfig?.wordTypes ?? DEFAULT_STUDY_SESSION_CONFIG.wordTypes,
        forms: legacyDailyConfig?.forms ?? legacyConfig?.forms ?? legacyConfig?.categories ?? DEFAULT_STUDY_SESSION_CONFIG.forms,
        questionCount:
          legacyDailyConfig?.questionCount ?? legacyConfig?.questionCount ?? legacyConfig?.batchSize ?? DEFAULT_STUDY_SESSION_CONFIG.questionCount,
        mode: legacyDailyConfig?.mode ?? legacyConfig?.mode ?? DEFAULT_STUDY_SESSION_CONFIG.mode,
      },
      freeSessionConfig: {
        ...(legacyFreeConfig ?? legacyConfig ?? DEFAULT_STUDY_SESSION_CONFIG),
        levels: legacyFreeConfig?.levels ?? legacyConfig?.levels ?? legacyConfig?.leves ?? DEFAULT_STUDY_SESSION_CONFIG.levels,
        wordTypes: legacyFreeConfig?.wordTypes ?? legacyConfig?.wordTypes ?? DEFAULT_STUDY_SESSION_CONFIG.wordTypes,
        forms: legacyFreeConfig?.forms ?? legacyConfig?.forms ?? legacyConfig?.categories ?? DEFAULT_STUDY_SESSION_CONFIG.forms,
        questionCount:
          legacyFreeConfig?.questionCount ?? legacyConfig?.questionCount ?? legacyConfig?.batchSize ?? DEFAULT_STUDY_SESSION_CONFIG.questionCount,
        mode: legacyFreeConfig?.mode ?? legacyConfig?.mode ?? DEFAULT_STUDY_SESSION_CONFIG.mode,
      },
    },
    learnerSummary: {
      ...base.learnerSummary,
      dailyStreak: legacy?.dailyStreak ?? (legacy as any)?.learnerSummary?.dailyStreak ?? 0,
      lastPracticeDate: legacy?.lastPracticeDate ?? legacy?.lastLoginDate ?? (legacy as any)?.learnerSummary?.lastPracticeDate ?? null,
      totalAnswered: progress?.totalAnswered ?? (legacy as any)?.learnerSummary?.totalAnswered ?? 0,
      totalCorrect: progress?.totalCorrect ?? (legacy as any)?.learnerSummary?.totalCorrect ?? 0,
      schemaVersion: 5,
    },
    unitProgress: migratedUnitProgress,
    formStats,
    patternStats,
    wordStats,
    sessionHistory: legacy?.sessionHistory ?? (legacy as any)?.sessionHistory ?? [],
    attemptHistory: legacy?.attemptHistory ?? (legacy as any)?.attemptHistory ?? [],
  };
}
