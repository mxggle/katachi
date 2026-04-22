import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConjugationType, WordEntry, WordType } from './distractorEngine';
import type { Language } from './i18n';
import {
  DEFAULT_STUDY_STATE,
  type PracticeType,
  type StudySessionConfig,
  type StudyState,
} from '@/lib/study/types';
import { migratePersistedStudyState } from '@/lib/study/migrate';

export interface SessionConfig extends StudySessionConfig {
  practiceType: PracticeType;
}

interface SessionItem {
  unitKey: string;
  word: WordEntry;
  type: ConjugationType;
  choices: string[];
  retryCount: number;
}

interface MiniSession {
  sessionId: string;
  practiceType: PracticeType;
  words: SessionItem[];
  currentIndex: number;
  sessionStreak: number;
  sessionCorrect: number;
  results: boolean[];
  startedAt: string;
}

interface ProgressStats {
  totalAnswered: number;
  totalCorrect: number;
}

interface PersistedStudyEnvelope {
  studyState?: StudyState;
  state?: {
    studyState?: StudyState;
  };
}

export interface AppState {
  dailyStreak: number;
  lastPracticeDate: string | null;
  progress: ProgressStats;
  config: SessionConfig;
  language: Language;
  studyState: StudyState;
  activeSession: MiniSession | null;
  startSession: (words: { unitKey: string; word: WordEntry; type: ConjugationType; choices: string[] }[]) => void;
  submitAnswer: (isCorrect: boolean) => void;
  endSession: () => void;
  updateConfig: (config: Partial<SessionConfig>) => void;
  checkDailyStreak: () => void;
  setLanguage: (language: Language) => void;
}

const defaultBaseConfig: SessionConfig = {
  levels: ['N5'],
  wordTypes: ['verb', 'i-adj', 'na-adj'],
  forms: ['te_form', 'polite', 'negative_plain', 'past_plain'],
  questionCount: 10,
  mode: 'choice',
  practiceType: 'daily',
};

function getDefaultLanguage(): Language {
  if (typeof navigator !== 'undefined' && navigator.language) {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('zh')) return 'zh';
  }
  return 'en';
}

function buildConfig(studyState: StudyState): SessionConfig {
  return {
    ...studyState.preferences.defaultSessionConfig,
    practiceType: 'daily',
  };
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}`;
}

function getTodayDateString(date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function updateDailyStreak(previousDate: string | null, previousStreak: number, today: string) {
  if (previousDate === today) {
    return { dailyStreak: previousStreak, lastPracticeDate: previousDate };
  }

  const yesterday = new Date(`${today}T00:00:00.000Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayString = getTodayDateString(yesterday);

  if (previousDate === yesterdayString) {
    return { dailyStreak: previousStreak + 1, lastPracticeDate: today };
  }

  return { dailyStreak: 1, lastPracticeDate: today };
}

function buildInitialProgress(word: WordEntry, type: ConjugationType, mode: SessionConfig['mode']) {
  return {
    wordId: word.id,
    conjugationType: type,
    mode,
    wordType: word.word_type as WordType,
    seenCount: 0,
    correctCount: 0,
    wrongCount: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    lastSeenAt: null,
    lastCorrectAt: null,
    lastWrongAt: null,
    sameDayExposureCount: 0,
    sameSessionRetryCount: 0,
  };
}

function syncAliases(studyState: StudyState, config?: SessionConfig) {
  return {
    dailyStreak: studyState.learnerSummary.dailyStreak,
    lastPracticeDate: studyState.learnerSummary.lastPracticeDate,
    progress: {
      totalAnswered: studyState.learnerSummary.totalAnswered,
      totalCorrect: studyState.learnerSummary.totalCorrect,
    },
    language: studyState.preferences.language,
    config: config ?? buildConfig(studyState),
  };
}

export function extractPersistedStudyState(persisted: unknown): StudyState {
  const envelope = (persisted as PersistedStudyEnvelope & Record<string, unknown>) ?? {};
  return envelope.studyState ?? envelope.state?.studyState ?? migratePersistedStudyState(envelope as never);
}

export const useStore = create<AppState>()(
  persist(
    (set) => {
      const initialStudyState = DEFAULT_STUDY_STATE(getDefaultLanguage());

      return {
        ...syncAliases(initialStudyState, defaultBaseConfig),
        studyState: initialStudyState,
        activeSession: null,

        setLanguage: (language) =>
          set((state) => {
            const nextStudyState: StudyState = {
              ...state.studyState,
              preferences: {
                ...state.studyState.preferences,
                language,
              },
            };

            return {
              ...syncAliases(nextStudyState, state.config),
              studyState: nextStudyState,
              config: {
                ...state.config,
              },
              language,
            };
          }),

        updateConfig: (newConfig) =>
          set((state) => {
            const nextConfig = { ...state.config, ...newConfig };
            const nextStudyState: StudyState = {
              ...state.studyState,
              preferences: {
                ...state.studyState.preferences,
                defaultSessionConfig: {
                  levels: nextConfig.levels,
                  wordTypes: nextConfig.wordTypes,
                  forms: nextConfig.forms,
                  questionCount: nextConfig.questionCount,
                  mode: nextConfig.mode,
                },
              },
            };

            return {
              ...syncAliases(nextStudyState, nextConfig),
              studyState: nextStudyState,
              config: nextConfig,
            };
          }),

        startSession: (words) =>
          set((state) => ({
            studyState: {
              ...state.studyState,
              unitProgress: Object.fromEntries(
                Object.entries(state.studyState.unitProgress).map(([key, progress]) => [
                  key,
                  {
                    ...progress,
                    sameSessionRetryCount: 0,
                  },
                ])
              ),
            },
            activeSession: {
              sessionId: createSessionId(),
              practiceType: state.config.practiceType,
              words: words.map((item) => ({ ...item, retryCount: 0 })),
              currentIndex: 0,
              sessionStreak: 0,
              sessionCorrect: 0,
              results: [],
              startedAt: new Date().toISOString(),
            },
          })),

        submitAnswer: (isCorrect) =>
          set((state) => {
            if (!state.activeSession) {
              return state;
            }

            const activeSession = state.activeSession;
            const currentItem = activeSession.words[activeSession.currentIndex];
            if (!currentItem) {
              return state;
            }

            const now = new Date().toISOString();
            const today = getTodayDateString(new Date(now));
            const existingProgress =
              state.studyState.unitProgress[currentItem.unitKey] ??
              buildInitialProgress(currentItem.word, currentItem.type, state.config.mode);

            const nextUnitProgress = {
              ...existingProgress,
              seenCount: existingProgress.seenCount + 1,
              correctCount: existingProgress.correctCount + (isCorrect ? 1 : 0),
              wrongCount: existingProgress.wrongCount + (isCorrect ? 0 : 1),
              consecutiveCorrect: isCorrect ? existingProgress.consecutiveCorrect + 1 : 0,
              consecutiveWrong: isCorrect ? 0 : existingProgress.consecutiveWrong + 1,
              lastSeenAt: now,
              lastCorrectAt: isCorrect ? now : existingProgress.lastCorrectAt,
              lastWrongAt: isCorrect ? existingProgress.lastWrongAt : now,
              sameDayExposureCount: existingProgress.sameDayExposureCount + 1,
              sameSessionRetryCount: existingProgress.sameSessionRetryCount,
            };

            const nextWords = [...activeSession.words];
            const nextCurrentIndex = activeSession.currentIndex + 1;
            const nextSessionCorrect = activeSession.sessionCorrect + (isCorrect ? 1 : 0);
            const nextSessionStreak = isCorrect ? activeSession.sessionStreak + 1 : 0;
            const completed = nextCurrentIndex >= nextWords.length;

            const nextSummaryBase = {
              ...state.studyState.learnerSummary,
              totalAnswered: state.studyState.learnerSummary.totalAnswered + 1,
              totalCorrect: state.studyState.learnerSummary.totalCorrect + (isCorrect ? 1 : 0),
              lastSessionAt: now,
            };

            const streakUpdate = updateDailyStreak(
              state.studyState.learnerSummary.lastPracticeDate,
              state.studyState.learnerSummary.dailyStreak,
              today
            );

            const nextStudyState: StudyState = {
              ...state.studyState,
              learnerSummary: {
                ...nextSummaryBase,
                dailyStreak: streakUpdate.dailyStreak,
                lastPracticeDate: streakUpdate.lastPracticeDate,
              },
              unitProgress: {
                ...state.studyState.unitProgress,
                [currentItem.unitKey]: nextUnitProgress,
              },
              attemptHistory: [
                ...state.studyState.attemptHistory,
                {
                  attemptId: `${activeSession.sessionId}-${state.studyState.attemptHistory.length + 1}`,
                  sessionId: activeSession.sessionId,
                  wordId: currentItem.word.id,
                  conjugationType: currentItem.type,
                  mode: state.config.mode,
                  isCorrect,
                  answeredAt: now,
                },
              ],
              sessionHistory: completed
                ? [
                    ...state.studyState.sessionHistory,
                    {
                      sessionId: activeSession.sessionId,
                      practiceType: activeSession.practiceType,
                      configSnapshot: state.studyState.preferences.defaultSessionConfig,
                      startedAt: activeSession.startedAt,
                      endedAt: now,
                      totalAnswered: nextWords.length,
                      totalCorrect: nextSessionCorrect,
                    },
                  ]
                : state.studyState.sessionHistory,
            };

            return {
              ...syncAliases(nextStudyState, state.config),
              studyState: nextStudyState,
              activeSession: {
                ...activeSession,
                words: nextWords,
                sessionStreak: nextSessionStreak,
                sessionCorrect: nextSessionCorrect,
                results: [...activeSession.results, isCorrect],
                currentIndex: nextCurrentIndex,
              },
            };
          }),

        endSession: () => set({ activeSession: null }),

        checkDailyStreak: () => {
          // Streak advancement is now tied to completed practice sessions.
        },
      };
    },
    {
      name: 'katachi-storage',
      partialize: (state) => ({
        studyState: state.studyState,
      }),
      merge: (persisted, current) => {
        const migratedStudyState = extractPersistedStudyState(persisted);
        const nextConfig = buildConfig(migratedStudyState);

        return {
          ...current,
          ...syncAliases(migratedStudyState, nextConfig),
          studyState: migratedStudyState,
          config: nextConfig,
        };
      },
    }
  )
);
