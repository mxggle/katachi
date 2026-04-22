import type { ConjugationType } from '@/lib/distractorEngine';
import type { Language } from '@/lib/i18n';
import {
  DEFAULT_STUDY_SESSION_CONFIG,
  DEFAULT_STUDY_STATE,
  type StudyState,
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
    unitProgress: {},
    sessionHistory: [],
    attemptHistory: [],
  };
}
