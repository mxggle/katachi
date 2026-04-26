import type { ConjugationType } from '@/lib/distractorEngine';
import type { Language } from '@/lib/i18n';
import {
  DEFAULT_STUDY_SESSION_CONFIG,
  DEFAULT_STUDY_STATE,
  type AttemptRecord,
  type SessionRecord,
  type StudyState,
  type UnitProgress,
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
}

export function migratePersistedStudyState(legacy: LegacyPersistedState | undefined): StudyState {
  const language = legacy?.language ?? 'en';
  const base = DEFAULT_STUDY_STATE(language);
  const legacyConfig = legacy?.config;
  const progress = legacy?.progress ?? legacy?.globalStats;

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
    },
    learnerSummary: {
      ...base.learnerSummary,
      dailyStreak: legacy?.dailyStreak ?? 0,
      lastPracticeDate: legacy?.lastPracticeDate ?? legacy?.lastLoginDate ?? null,
      totalAnswered: progress?.totalAnswered ?? 0,
      totalCorrect: progress?.totalCorrect ?? 0,
    },
    unitProgress: legacy?.unitProgress
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
      : {},
    sessionHistory: legacy?.sessionHistory ?? [],
    attemptHistory: legacy?.attemptHistory ?? [],
  };
}
