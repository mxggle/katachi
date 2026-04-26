import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConjugationType, WordEntry, WordType } from './distractorEngine';
import type { Language } from './i18n';
import {
  DEFAULT_STUDY_STATE,
  computeMasteryLevel,
  createEmptyFormStats,
  createEmptyPatternStats,
  createEmptyWordStats,
  type FormStats,
  type PatternStats,
  type PracticeType,
  type StudySessionConfig,
  type StudyState,
  type WordStats,
} from '@/lib/study/types';
import { migratePersistedStudyState } from '@/lib/study/migrate';
import { getInitialSRS, updateSRS } from '@/lib/study/srs';
import { getRulePattern } from '@/lib/study/patterns';

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
  configSnapshot: StudySessionConfig;
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
  startSession: (words: { unitKey: string; word: WordEntry; type: ConjugationType; choices: string[] }[], configSnapshot: StudySessionConfig, practiceType: PracticeType) => void;
  submitAnswer: (isCorrect: boolean) => void;
  endSession: () => void;
  updateConfig: (config: Partial<SessionConfig>) => void;
  updateDailyConfig: (config: Partial<StudySessionConfig>) => void;
  updateFreeConfig: (config: Partial<StudySessionConfig>) => void;
  updateDailyGoal: (dailyQuestionGoal: number) => void;
  checkDailyStreak: () => void;
  setLanguage: (language: Language) => void;
  setStudyState: (studyState: StudyState) => void;
  resetStore: () => void;
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
    if (lang.startsWith('vi')) return 'vi';
  }
  return 'en';
}

function buildConfig(studyState: StudyState): SessionConfig {
  return {
    ...studyState.preferences.defaultSessionConfig,
    practiceType: 'daily',
  };
}

function createRandomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createSessionId(): string {
  return createRandomId('session');
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isSameLocalDate(isoString: string, localDate: string): boolean {
  return getLocalDateString(new Date(isoString)) === localDate;
}

function updateDailyStreak(previousDate: string | null, previousStreak: number, today: string) {
  if (previousDate === today) {
    return { dailyStreak: previousStreak, lastPracticeDate: previousDate };
  }

  const yesterday = new Date(`${today}T00:00:00.000Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

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
    ...getInitialSRS(),
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

// ---------------------------------------------------------------------------
// Diagnostic stats updaters
// ---------------------------------------------------------------------------

function applyFormStatsUpdate(
  formStats: Record<string, FormStats>,
  form: ConjugationType,
  isCorrect: boolean,
  now: string,
): Record<string, FormStats> {
  const existing = formStats[form] ?? createEmptyFormStats(form);
  const totalAttempts = existing.totalAttempts + 1;
  const correctAttempts = existing.correctAttempts + (isCorrect ? 1 : 0);
  const accuracy = correctAttempts / totalAttempts;

  return {
    ...formStats,
    [form]: {
      ...existing,
      totalAttempts,
      correctAttempts,
      accuracy,
      masteryLevel: computeMasteryLevel(totalAttempts, accuracy),
      lastAttemptAt: now,
      lastCorrectAt: isCorrect ? now : existing.lastCorrectAt,
      lastWrongAt: isCorrect ? existing.lastWrongAt : now,
    },
  };
}

function applyPatternStatsUpdate(
  patternStats: Record<string, PatternStats>,
  pattern: string,
  form: ConjugationType,
  isCorrect: boolean,
  now: string,
): Record<string, PatternStats> {
  const existing = patternStats[pattern] ?? createEmptyPatternStats(pattern, form);
  const totalAttempts = existing.totalAttempts + 1;
  const correctAttempts = existing.correctAttempts + (isCorrect ? 1 : 0);
  const accuracy = correctAttempts / totalAttempts;

  return {
    ...patternStats,
    [pattern]: {
      ...existing,
      totalAttempts,
      correctAttempts,
      accuracy,
      masteryLevel: computeMasteryLevel(totalAttempts, accuracy),
      lastAttemptAt: now,
      lastCorrectAt: isCorrect ? now : existing.lastCorrectAt,
      lastWrongAt: isCorrect ? existing.lastWrongAt : now,
    },
  };
}

function applyWordStatsUpdate(
  wordStatsMap: Record<string, WordStats>,
  wordId: string,
  isCorrect: boolean,
  now: string,
): Record<string, WordStats> {
  const existing = wordStatsMap[wordId] ?? createEmptyWordStats(wordId);

  return {
    ...wordStatsMap,
    [wordId]: {
      ...existing,
      totalAttempts: existing.totalAttempts + 1,
      correctAttempts: existing.correctAttempts + (isCorrect ? 1 : 0),
      lastAttemptAt: now,
    },
  };
}

// ---------------------------------------------------------------------------
// Daily goal progress (only counts daily, non-retry attempts)
// ---------------------------------------------------------------------------

export function getDailyGoalProgress(studyState: StudyState, today: string): number {
  return studyState.attemptHistory.filter(
    (a) =>
      isSameLocalDate(a.answeredAt, today) &&
      a.countsTowardDailyGoal === true
  ).length;
}

// ---------------------------------------------------------------------------
// Extract persisted state
// ---------------------------------------------------------------------------

export function extractPersistedStudyState(persisted: unknown): StudyState {
  const envelope = (persisted as PersistedStudyEnvelope & Record<string, unknown>) ?? {};
  const rawState = envelope.studyState ?? envelope.state?.studyState ?? envelope;
  return migratePersistedStudyState(rawState as any);
}

export const STORE_STORAGE_KEY = 'katachi-storage';

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

        setStudyState: (studyState) => {
          const nextConfig = buildConfig(studyState);
          set({
            ...syncAliases(studyState, nextConfig),
            studyState,
            config: nextConfig,
          });
        },

        resetStore: () => {
          const initialStudyState = DEFAULT_STUDY_STATE(getDefaultLanguage());
          set({
            ...syncAliases(initialStudyState, defaultBaseConfig),
            studyState: initialStudyState,
            activeSession: null,
          });
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(STORE_STORAGE_KEY);
          }
        },

        updateConfig: (newConfig) =>
          set((state) => {
            const nextConfig = { ...state.config, ...newConfig };
            // Legacy updateConfig now only affects the transient session config alias
            // and the deprecated defaultSessionConfig to maintain backward compatibility 
            // without touching the decoupled Daily/Free configs.
            const nextStudyState: StudyState = {
              ...state.studyState,
              preferences: {
                ...state.studyState.preferences,
                defaultSessionConfig: {
                  levels: nextConfig.levels,
                  wordTypes: nextConfig.wordTypes,
                  forms: nextConfig.forms,
                  questionCount: state.studyState.preferences.defaultSessionConfig.questionCount,
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

        updateDailyConfig: (newConfig) =>
          set((state) => {
            const nextDailyConfig = { ...state.studyState.preferences.dailySessionConfig, ...newConfig };
            const nextStudyState: StudyState = {
              ...state.studyState,
              preferences: {
                ...state.studyState.preferences,
                dailySessionConfig: nextDailyConfig,
              },
            };
            return {
              ...syncAliases(nextStudyState, { ...nextDailyConfig, practiceType: 'daily' }),
              studyState: nextStudyState,
              config: { ...nextDailyConfig, practiceType: 'daily' },
            };
          }),

        updateFreeConfig: (newConfig) =>
          set((state) => {
            const nextFreeConfig = { ...state.studyState.preferences.freeSessionConfig, ...newConfig };
            const nextStudyState: StudyState = {
              ...state.studyState,
              preferences: {
                ...state.studyState.preferences,
                freeSessionConfig: nextFreeConfig,
              },
            };
            return {
              studyState: nextStudyState,
              // When updating free config, we also update the transient config alias if we are in free mode
              ...(state.config.practiceType === 'free' ? { config: { ...nextFreeConfig, practiceType: 'free' } } : {}),
            };
          }),

        updateDailyGoal: (dailyQuestionGoal) =>
          set((state) => {
            const nextStudyState: StudyState = {
              ...state.studyState,
              preferences: {
                ...state.studyState.preferences,
                dailyQuestionGoal,
                dailyNewLimit: Math.max(0, Math.floor(dailyQuestionGoal * 0.25)),
              },
            };

            return {
              ...syncAliases(nextStudyState, state.config),
              studyState: nextStudyState,
            };
          }),

        startSession: (words, configSnapshot, practiceType) =>
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
              practiceType,
              configSnapshot,
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
            const today = getLocalDateString(new Date(now));
            const practiceType = activeSession.practiceType;
            const isRetry = currentItem.retryCount > 0;

            // Determine which stats this attempt affects
            const affectsMastery = practiceType !== 'free';
            const affectsWeakness = practiceType === 'weakness';
            const countsTowardDailyGoal = practiceType === 'daily' && !isRetry;
            const countsTowardStreak = practiceType === 'daily';

            // Compute rule pattern
            const rulePattern = getRulePattern(currentItem.word, currentItem.type);

            // Update UnitProgress (for backward compat, only if affects mastery)
            const existingProgress =
              state.studyState.unitProgress[currentItem.unitKey] ??
              buildInitialProgress(currentItem.word, currentItem.type, state.config.mode);

            const nextUnitProgress = affectsMastery
              ? {
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
                  ...updateSRS(existingProgress, isCorrect, now),
                }
              : existingProgress;

            // Update FormStats and PatternStats (only if affects mastery)
            let nextFormStats = state.studyState.formStats;
            let nextPatternStats = state.studyState.patternStats;

            if (affectsMastery) {
              nextFormStats = applyFormStatsUpdate(nextFormStats, currentItem.type, isCorrect, now);
              nextPatternStats = applyPatternStatsUpdate(nextPatternStats, rulePattern, currentItem.type, isCorrect, now);
            }

            const nextWordStats = affectsMastery
              ? applyWordStatsUpdate(state.studyState.wordStats, currentItem.word.id, isCorrect, now)
              : state.studyState.wordStats;

            // Re-queue on wrong answer
            const nextWords = [...activeSession.words];
            if (!isCorrect) {
              nextWords.push({
                ...currentItem,
                retryCount: currentItem.retryCount + 1,
              });
            }
            const nextCurrentIndex = activeSession.currentIndex + 1;
            const nextSessionCorrect = activeSession.sessionCorrect + (isCorrect ? 1 : 0);
            const nextSessionStreak = isCorrect ? activeSession.sessionStreak + 1 : 0;
            const completed = nextCurrentIndex >= nextWords.length;

            const nextSummaryBase = {
              ...state.studyState.learnerSummary,
              totalAnswered: affectsMastery
                ? state.studyState.learnerSummary.totalAnswered + 1
                : state.studyState.learnerSummary.totalAnswered,
              totalCorrect: affectsMastery
                ? state.studyState.learnerSummary.totalCorrect + (isCorrect ? 1 : 0)
                : state.studyState.learnerSummary.totalCorrect,
              lastSessionAt: affectsMastery ? now : state.studyState.learnerSummary.lastSessionAt,
            };

            // Only update streak for daily practice
            const streakUpdate = countsTowardStreak
              ? updateDailyStreak(
                  state.studyState.learnerSummary.lastPracticeDate,
                  state.studyState.learnerSummary.dailyStreak,
                  today
                )
              : {
                  dailyStreak: state.studyState.learnerSummary.dailyStreak,
                  lastPracticeDate: state.studyState.learnerSummary.lastPracticeDate,
                };

            const nextStudyState: StudyState = {
              ...state.studyState,
              learnerSummary: {
                ...nextSummaryBase,
                dailyStreak: streakUpdate.dailyStreak,
                lastPracticeDate: streakUpdate.lastPracticeDate,
              },
              unitProgress: affectsMastery
                ? {
                    ...state.studyState.unitProgress,
                    [currentItem.unitKey]: nextUnitProgress,
                  }
                : state.studyState.unitProgress,
              formStats: nextFormStats,
              patternStats: nextPatternStats,
              wordStats: nextWordStats,
              attemptHistory: [
                ...state.studyState.attemptHistory,
                {
                  attemptId: createRandomId('attempt'),
                  sessionId: activeSession.sessionId,
                  wordId: currentItem.word.id,
                  conjugationType: currentItem.type,
                  mode: state.config.mode,
                  isCorrect,
                  answeredAt: now,
                  // Diagnostic fields
                  practiceType,
                  scopeType: practiceType === 'free' ? 'user-selected' : 'curriculum',
                  wordType: currentItem.word.word_type,
                  group: currentItem.word.group,
                  rulePattern,
                  isRetry,
                  affectsMastery,
                  affectsWeakness,
                  countsTowardDailyGoal,
                  countsTowardStreak,
                },
              ],
              sessionHistory: completed && affectsMastery
                ? [
                    ...state.studyState.sessionHistory,
                    {
                      sessionId: activeSession.sessionId,
                      practiceType: activeSession.practiceType,
                      configSnapshot: activeSession.configSnapshot,
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
      name: STORE_STORAGE_KEY,
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
