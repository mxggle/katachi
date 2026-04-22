import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConjugationType, WordEntry, WordType } from './distractorEngine';

export interface SessionConfig {
  levels: ('N5' | 'N4')[];
  wordTypes: WordType[];
  forms: ConjugationType[];
  questionCount: number;
  mode: 'choice' | 'input';
}

interface MiniSession {
  words: { word: WordEntry; type: ConjugationType; choices: string[] }[];
  currentIndex: number;
  sessionStreak: number;
  sessionCorrect: number;
  results: boolean[];
}

interface ProgressStats {
  totalAnswered: number;
  totalCorrect: number;
}

export interface AppState {
  dailyStreak: number;
  lastPracticeDate: string | null;
  progress: ProgressStats;
  config: SessionConfig;
  activeSession: MiniSession | null;
  startSession: (words: { word: WordEntry; type: ConjugationType; choices: string[] }[]) => void;
  submitAnswer: (isCorrect: boolean) => void;
  endSession: () => void;
  updateConfig: (config: Partial<SessionConfig>) => void;
  checkDailyStreak: () => void;
}

const defaultConfig: SessionConfig = {
  levels: ['N5'],
  wordTypes: ['verb', 'i-adj', 'na-adj'],
  forms: ['te_form', 'polite', 'negative_plain', 'past_plain'],
  questionCount: 10,
  mode: 'choice',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      dailyStreak: 0,
      lastPracticeDate: null,
      progress: { totalAnswered: 0, totalCorrect: 0 },
      config: defaultConfig,
      activeSession: null,

      updateConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),

      startSession: (words) =>
        set({
          activeSession: {
            words,
            currentIndex: 0,
            sessionStreak: 0,
            sessionCorrect: 0,
            results: [],
          },
        }),

      submitAnswer: (isCorrect) =>
        set((state) => {
          if (!state.activeSession) {
            return state;
          }

          return {
            progress: {
              totalAnswered: state.progress.totalAnswered + 1,
              totalCorrect: state.progress.totalCorrect + (isCorrect ? 1 : 0),
            },
            activeSession: {
              ...state.activeSession,
              sessionStreak: isCorrect ? state.activeSession.sessionStreak + 1 : 0,
              sessionCorrect: state.activeSession.sessionCorrect + (isCorrect ? 1 : 0),
              results: [...state.activeSession.results, isCorrect],
              currentIndex: state.activeSession.currentIndex + 1,
            },
          };
        }),

      endSession: () => set({ activeSession: null }),

      checkDailyStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastPracticeDate;

        if (lastDate === today) {
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayString) {
          set((state) => ({
            dailyStreak: state.dailyStreak + 1,
            lastPracticeDate: today,
          }));
          return;
        }

        set({
          dailyStreak: 1,
          lastPracticeDate: today,
        });
      },
    }),
    {
      name: 'katachi-storage',
      partialize: (state) => ({
        dailyStreak: state.dailyStreak,
        lastPracticeDate: state.lastPracticeDate,
        progress: state.progress,
        config: state.config,
      }),
      merge: (persisted, current) => {
        const legacy = (persisted as {
          dailyStreak?: number;
          lastLoginDate?: string | null;
          lastPracticeDate?: string | null;
          globalStats?: ProgressStats;
          progress?: ProgressStats;
          config?: Partial<SessionConfig> & {
            leves?: ('N5' | 'N4')[];
            categories?: ConjugationType[];
            batchSize?: number;
          };
        }) ?? {};

        return {
          ...current,
          dailyStreak: legacy.dailyStreak ?? current.dailyStreak,
          lastPracticeDate: legacy.lastPracticeDate ?? legacy.lastLoginDate ?? current.lastPracticeDate,
          progress: legacy.progress ?? legacy.globalStats ?? current.progress,
          config: {
            ...current.config,
            ...legacy.config,
            levels: legacy.config?.levels ?? legacy.config?.leves ?? current.config.levels,
            forms: legacy.config?.forms ?? legacy.config?.categories ?? current.config.forms,
            questionCount:
              legacy.config?.questionCount ?? legacy.config?.batchSize ?? current.config.questionCount,
          },
        };
      },
    }
  )
);
