import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WordEntry, ConjugationType, WordType } from './distractorEngine';

interface WordStats {
    seen: number;
    correct: number;
    lastReviewed: number;
}

interface SessionConfig {
    leves: ('N5' | 'N4' | 'N3')[];
    wordTypes: WordType[];
    categories: string[];
    batchSize: number;
    mode: 'choice' | 'input';
}

interface MiniSession {
    words: { word: WordEntry; type: ConjugationType; choices: string[] }[];
    currentIndex: number;
    sessionStreak: number;
    results: boolean[];
}

interface AppState {
    // Global Persistence
    dailyStreak: number;
    lastLoginDate: string | null;
    globalStats: { totalAnswered: number; totalCorrect: number };
    wordStats: Record<string, WordStats>;
    config: SessionConfig;

    // Active Session (Non-persistent for simplicity in this draft, but could be)
    activeSession: MiniSession | null;

    // Actions
    startSession: (words: { word: WordEntry; type: ConjugationType; choices: string[] }[]) => void;
    submitAnswer: (isCorrect: boolean) => void;
    endSession: () => void;
    updateConfig: (config: Partial<SessionConfig>) => void;
    checkDailyStreak: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            dailyStreak: 0,
            lastLoginDate: null,
            globalStats: { totalAnswered: 0, totalCorrect: 0 },
            wordStats: {},
            config: {
                leves: ['N5'],
                wordTypes: ['verb', 'i-adj', 'na-adj'],
                categories: ['te_form', 'polite', 'negative_plain'],
                batchSize: 10,
                mode: 'choice'
            },
            activeSession: null,

            updateConfig: (newConfig) => set((state) => ({
                config: { ...state.config, ...newConfig }
            })),

            startSession: (words) => set({
                activeSession: {
                    words,
                    currentIndex: 0,
                    sessionStreak: 0,
                    results: []
                }
            }),

            submitAnswer: (isCorrect) => set((state) => {
                if (!state.activeSession) return state;

                const currentWord = state.activeSession.words[state.activeSession.currentIndex].word;
                const newWordStats = { ...(state.wordStats[currentWord.id] || { seen: 0, correct: 0, lastReviewed: 0 }) };
                newWordStats.seen += 1;
                if (isCorrect) newWordStats.correct += 1;
                newWordStats.lastReviewed = Date.now();

                return {
                    globalStats: {
                        totalAnswered: state.globalStats.totalAnswered + 1,
                        totalCorrect: state.globalStats.totalCorrect + (isCorrect ? 1 : 0)
                    },
                    wordStats: {
                        ...state.wordStats,
                        [currentWord.id]: newWordStats
                    },
                    activeSession: {
                        ...state.activeSession,
                        sessionStreak: isCorrect ? state.activeSession.sessionStreak + 1 : 0,
                        results: [...state.activeSession.results, isCorrect],
                        currentIndex: state.activeSession.currentIndex + 1
                    }
                };
            }),

            endSession: () => set({ activeSession: null }),

            checkDailyStreak: () => {
                const today = new Date().toISOString().split('T')[0];
                const lastDate = get().lastLoginDate;

                if (lastDate === today) return;

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastDate === yesterdayStr) {
                    set((state) => ({ dailyStreak: state.dailyStreak + 1, lastLoginDate: today }));
                } else {
                    set({ dailyStreak: 1, lastLoginDate: today });
                }
            }
        }),
        {
            name: 'katachi-storage',
            partialize: (state) => ({
                dailyStreak: state.dailyStreak,
                lastLoginDate: state.lastLoginDate,
                globalStats: state.globalStats,
                wordStats: state.wordStats,
                config: state.config
            }),
            merge: (persisted: unknown, current: AppState) => {
                const merged = { ...current, ...(persisted as Partial<AppState>) };
                // Backfill new config fields from defaults
                merged.config = {
                    ...current.config,
                    ...(persisted as { config?: Partial<SessionConfig> })?.config,
                };
                return merged;
            },
        }
    )
);
