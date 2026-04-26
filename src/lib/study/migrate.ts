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
import { getInitialSRS } from '@/lib/study/srs';

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
            
            // Migrate to SRS
            const srs = getInitialSRS();
            if (progress.consecutiveCorrect >= 3) {
              srs.status = 'graduated';
              srs.interval = 21;
              srs.ease = 2.8;
            } else if (progress.consecutiveCorrect > 0) {
              srs.status = 'review';
              srs.interval = Math.pow(2.5, progress.consecutiveCorrect);
              srs.ease = 2.5;
            } else {
              srs.status = 'learning';
              srs.interval = 0;
            }
            
            let nextReviewDate = new Date();
            if (progress.lastSeenAt && srs.interval > 0) {
              const last = new Date(progress.lastSeenAt);
              last.setHours(last.getHours() + srs.interval * 24);
              nextReviewDate = last;
            }
            srs.nextReviewDate = nextReviewDate.toISOString();

            return [
              key,
              {
                ...progress,
                ...srs,
              },
            ];
          })
        )
      : {},
    sessionHistory: legacy?.sessionHistory ?? [],
    attemptHistory: legacy?.attemptHistory ?? [],
  };
}
