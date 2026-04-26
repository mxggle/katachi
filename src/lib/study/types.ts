import type { ConjugationType, WordType } from '@/lib/distractorEngine';
import type { Language } from '@/lib/i18n';

export type PracticeMode = 'choice' | 'input';
export type PracticeType = 'daily' | 'weakness' | 'free';

export interface StudySessionConfig {
  levels: ('N5' | 'N4' | 'N3')[];
  wordTypes: WordType[];
  forms: ConjugationType[];
  questionCount: number;
  mode: PracticeMode;
}

export interface StudyPreferences {
  language: Language;
  defaultSessionConfig: StudySessionConfig;
  dailyQuestionGoal: number;
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
}

export interface StudyState {
  preferences: StudyPreferences;
  learnerSummary: LearnerSummary;
  unitProgress: Record<string, UnitProgress>;
  sessionHistory: SessionRecord[];
  attemptHistory: AttemptRecord[];
}

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
    dailyQuestionGoal: 20,
    dailyNewLimit: 5,
  },
  learnerSummary: {
    dailyStreak: 0,
    lastPracticeDate: null,
    lastSessionAt: null,
    totalAnswered: 0,
    totalCorrect: 0,
    schemaVersion: 3,
  },
  unitProgress: {},
  sessionHistory: [],
  attemptHistory: [],
});

export function makeUnitKey(wordId: string, conjugationType: ConjugationType, mode: PracticeMode): string {
  return `${wordId}::${conjugationType}::${mode}`;
}
