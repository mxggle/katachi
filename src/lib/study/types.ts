import type { ConjugationType, WordGroup, WordType } from '@/lib/distractorEngine';
import type { Language } from '@/lib/i18n';

export type PracticeMode = 'choice' | 'input';
export type PracticeType = 'daily' | 'weakness' | 'free';
export type MasteryLevel = 'undiagnosed' | 'weak' | 'unstable' | 'stable' | 'mastered';

export interface StudySessionConfig {
  levels: ('N5' | 'N4' | 'N3')[];
  wordTypes: WordType[];
  forms: ConjugationType[];
  questionCount: number;
  mode: PracticeMode;
}

export interface StudyPreferences {
  language: Language;
  defaultSessionConfig: StudySessionConfig; // Kept for backward compatibility
  dailySessionConfig: StudySessionConfig;
  freeSessionConfig: StudySessionConfig;
  dailyQuestionGoal: number;
  /** @deprecated Kept for backward compat; exploration allocation replaces this */
  dailyNewLimit: number;
}

export interface LearnerSummary {
  dailyStreak: number;
  lastPracticeDate: string | null;
  lastSessionAt: string | null;
  totalAnswered: number;
  totalCorrect: number;
  schemaVersion: number;
}

/** Per-word × conjugation × mode progress (kept for backward compat & SRS scheduling) */
export interface UnitProgress {
  wordId: string;
  conjugationType: ConjugationType;
  mode: PracticeMode;
  wordType: WordType;
  seenCount: number;
  correctCount: number;
  wrongCount: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  lastSeenAt: string | null;
  lastCorrectAt: string | null;
  lastWrongAt: string | null;
  sameDayExposureCount: number;
  sameSessionRetryCount: number;
  status: 'learning' | 'review' | 'graduated';
  interval: number;
  ease: number;
  nextReviewDate: string;
}

// ---------------------------------------------------------------------------
// New: Form / Pattern / Word Stats (conjugation ability diagnosis)
// ---------------------------------------------------------------------------

/** Form-level mastery stats (e.g. te_form, polite) */
export interface FormStats {
  form: ConjugationType;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  masteryLevel: MasteryLevel;
  lastAttemptAt: string | null;
  lastCorrectAt: string | null;
  lastWrongAt: string | null;
}

/** Pattern-level mastery stats (e.g. te_form::godan-ku) */
export interface PatternStats {
  pattern: string;
  form: ConjugationType;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  masteryLevel: MasteryLevel;
  lastAttemptAt: string | null;
  lastCorrectAt: string | null;
  lastWrongAt: string | null;
}

/** Word-level tracking (lightweight, not primary learning object) */
export interface WordStats {
  wordId: string;
  totalAttempts: number;
  correctAttempts: number;
  lastAttemptAt: string | null;
}

// ---------------------------------------------------------------------------
// Session & Attempt records
// ---------------------------------------------------------------------------

export interface SessionRecord {
  sessionId: string;
  practiceType: PracticeType;
  configSnapshot: StudySessionConfig;
  startedAt: string;
  endedAt: string | null;
  totalAnswered: number;
  totalCorrect: number;
}

export interface AttemptRecord {
  attemptId: string;
  sessionId: string;
  wordId: string;
  conjugationType: ConjugationType;
  mode: PracticeMode;
  isCorrect: boolean;
  answeredAt: string;
  // --- Diagnostic fields (added in schema v4) ---
  practiceType?: PracticeType;
  scopeType?: 'curriculum' | 'user-selected';
  wordType?: WordType;
  group?: WordGroup;
  rulePattern?: string;
  isRetry?: boolean;
  affectsMastery?: boolean;
  affectsWeakness?: boolean;
  countsTowardDailyGoal?: boolean;
  countsTowardStreak?: boolean;
}

// ---------------------------------------------------------------------------
// Study State
// ---------------------------------------------------------------------------

export interface StudyState {
  preferences: StudyPreferences;
  learnerSummary: LearnerSummary;
  unitProgress: Record<string, UnitProgress>;
  formStats: Record<string, FormStats>;
  patternStats: Record<string, PatternStats>;
  wordStats: Record<string, WordStats>;
  sessionHistory: SessionRecord[];
  attemptHistory: AttemptRecord[];
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_STUDY_SESSION_CONFIG: StudySessionConfig = {
  levels: ['N5'],
  wordTypes: ['verb', 'i-adj', 'na-adj'],
  forms: ['te_form', 'polite', 'negative_plain', 'past_plain'],
  questionCount: 10,
  mode: 'choice',
};

export const DEFAULT_STUDY_STATE = (language: Language): StudyState => ({
  preferences: {
    language,
    defaultSessionConfig: DEFAULT_STUDY_SESSION_CONFIG,
    dailySessionConfig: DEFAULT_STUDY_SESSION_CONFIG,
    freeSessionConfig: DEFAULT_STUDY_SESSION_CONFIG,
    dailyQuestionGoal: 20,
    dailyNewLimit: 5,
  },
  learnerSummary: {
    dailyStreak: 0,
    lastPracticeDate: null,
    lastSessionAt: null,
    totalAnswered: 0,
    totalCorrect: 0,
    schemaVersion: 5,
  },
  unitProgress: {},
  formStats: {},
  patternStats: {},
  wordStats: {},
  sessionHistory: [],
  attemptHistory: [],
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function makeUnitKey(wordId: string, conjugationType: ConjugationType, mode: PracticeMode): string {
  return `${wordId}::${conjugationType}::${mode}`;
}

export function computeMasteryLevel(totalAttempts: number, accuracy: number): MasteryLevel {
  if (totalAttempts === 0) return 'undiagnosed';
  if (totalAttempts < 3) return accuracy < 0.5 ? 'weak' : 'unstable';
  if (accuracy < 0.5) return 'weak';
  if (accuracy < 0.75) return 'unstable';
  if (accuracy < 0.9) return 'stable';
  return 'mastered';
}

export function createEmptyFormStats(form: ConjugationType): FormStats {
  return {
    form,
    totalAttempts: 0,
    correctAttempts: 0,
    accuracy: 0,
    masteryLevel: 'undiagnosed',
    lastAttemptAt: null,
    lastCorrectAt: null,
    lastWrongAt: null,
  };
}

export function createEmptyPatternStats(pattern: string, form: ConjugationType): PatternStats {
  return {
    pattern,
    form,
    totalAttempts: 0,
    correctAttempts: 0,
    accuracy: 0,
    masteryLevel: 'undiagnosed',
    lastAttemptAt: null,
    lastCorrectAt: null,
    lastWrongAt: null,
  };
}

export function createEmptyWordStats(wordId: string): WordStats {
  return {
    wordId,
    totalAttempts: 0,
    correctAttempts: 0,
    lastAttemptAt: null,
  };
}
