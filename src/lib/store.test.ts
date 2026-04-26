import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractPersistedStudyState, getLocalDateString, isSameLocalDate, STORE_STORAGE_KEY, useStore } from '@/lib/store';
import { DEFAULT_STUDY_STATE } from '@/lib/study/types';
import type { WordEntry } from '@/lib/distractorEngine';

function buildWord(id: string): WordEntry {
  return {
    id,
    level: 'N5',
    group: 'godan',
    word_type: 'verb',
    dictionary_form: {
      kanji: id,
      kana: id,
      romaji: id,
    },
    meaning: id,
    conjugations: {
      te_form: `${id}-te`,
      polite: `${id}-polite`,
    },
  };
}

afterEach(() => {
  useStore.setState({
    ...useStore.getInitialState(),
  });
});

describe('extractPersistedStudyState', () => {
  it('hydrates from zustand persist wrapper shape', () => {
    const persistedStudyState = {
      ...DEFAULT_STUDY_STATE('en'),
      learnerSummary: {
        ...DEFAULT_STUDY_STATE('en').learnerSummary,
        totalAnswered: 9,
        totalCorrect: 7,
        dailyStreak: 3,
        lastPracticeDate: '2026-04-22',
      },
    };

    const extracted = extractPersistedStudyState({ state: { studyState: persistedStudyState } });

    expect(extracted.learnerSummary.totalAnswered).toBe(9);
    expect(extracted.learnerSummary.totalCorrect).toBe(7);
    expect(extracted.learnerSummary.dailyStreak).toBe(3);
  });
});

describe('useStore session flow', () => {
  it('clears the persisted storage when resetting after sign-out', () => {
    const removeItem = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem,
    });

    useStore.getState().resetStore();

    expect(removeItem).toHaveBeenCalledWith(STORE_STORAGE_KEY);
    vi.unstubAllGlobals();
  });

  it('uses the learner local day instead of the UTC day for streak dates', () => {
    expect(getLocalDateString(new Date('2026-04-23T00:30:00+09:00'))).toBe('2026-04-23');
  });

  it('matches ISO attempt timestamps by learner local day', () => {
    expect(isSameLocalDate('2026-04-22T15:30:00.000Z', '2026-04-23')).toBe(true);
  });

  it('re-queues the word at the end of the session after a wrong answer', () => {
    const word = buildWord('word-1');

    useStore.setState({
      ...useStore.getInitialState(),
      studyState: DEFAULT_STUDY_STATE('en'),
      config: {
        levels: ['N5'],
        wordTypes: ['verb'],
        forms: ['te_form'],
        questionCount: 10,
        mode: 'choice',
        practiceType: 'daily',
      },
    });

    useStore.getState().startSession(
      [
        {
          unitKey: 'word-1::te_form::choice',
          word,
          type: 'te_form',
          choices: ['word-1-te', 'word-1-polite'],
        },
      ],
      useStore.getState().config as Parameters<typeof useStore.getState.startSession>[1],
      useStore.getState().config.practiceType as Parameters<typeof useStore.getState.startSession>[2]
    );

    useStore.getState().submitAnswer(false);

    const { activeSession } = useStore.getState();
    // It should now have 2 words: the original and the re-queued one
    expect(activeSession?.words).toHaveLength(2);
    expect(activeSession?.currentIndex).toBe(1);
    expect(activeSession?.words[1].word.id).toBe('word-1');
    expect(activeSession?.words[1].retryCount).toBe(1);
  });

  it('completes the session only after all re-queued words are answered correctly', () => {
    const word1 = buildWord('word-1');
    const word2 = buildWord('word-2');

    useStore.setState({
      ...useStore.getInitialState(),
      studyState: DEFAULT_STUDY_STATE('en'),
      config: {
        levels: ['N5'],
        wordTypes: ['verb'],
        forms: ['te_form'],
        questionCount: 2,
        mode: 'choice',
        practiceType: 'daily',
      },
    });

    useStore.getState().startSession(
      [
        {
          unitKey: 'word-1::te_form::choice',
          word: word1,
          type: 'te_form',
          choices: ['word-1-te', 'word-1-polite'],
        },
        {
          unitKey: 'word-2::te_form::choice',
          word: word2,
          type: 'te_form',
          choices: ['word-2-te', 'word-2-polite'],
        },
      ],
      useStore.getState().config as Parameters<typeof useStore.getState.startSession>[1],
      useStore.getState().config.practiceType as Parameters<typeof useStore.getState.startSession>[2]
    );

    // Answer word-1 incorrectly -> re-queued
    useStore.getState().submitAnswer(false);
    let state = useStore.getState();
    expect(state.activeSession?.words).toHaveLength(3);
    expect(state.activeSession?.currentIndex).toBe(1);
    expect(state.activeSession?.words[2].word.id).toBe('word-1');
    expect(state.activeSession?.words[2].retryCount).toBe(1);

    // Answer word-2 correctly
    useStore.getState().submitAnswer(true);
    state = useStore.getState();
    expect(state.activeSession?.currentIndex).toBe(2);
    expect(state.activeSession?.words).toHaveLength(3);

    // Answer re-queued word-1 incorrectly again -> re-queued again
    useStore.getState().submitAnswer(false);
    state = useStore.getState();
    expect(state.activeSession?.words).toHaveLength(4);
    expect(state.activeSession?.currentIndex).toBe(3);
    expect(state.activeSession?.words[3].word.id).toBe('word-1');
    expect(state.activeSession?.words[3].retryCount).toBe(2);

    // Answer re-queued word-1 correctly -> session should complete
    useStore.getState().submitAnswer(true);
    state = useStore.getState();
    expect(state.activeSession?.currentIndex).toBe(4);
    expect(state.studyState.sessionHistory).toHaveLength(1);
    expect(state.studyState.sessionHistory[0].totalAnswered).toBe(4);
    expect(state.studyState.sessionHistory[0].totalCorrect).toBe(2);
  });

  it('updates daily question goal and derives new limit from it', () => {
    useStore.getState().updateDailyGoal(40);

    const state = useStore.getState();
    expect(state.studyState.preferences.dailyQuestionGoal).toBe(40);
    expect(state.studyState.preferences.dailyNewLimit).toBe(10);
  });

  it('does not persist questionCount changes through updateConfig', () => {
    useStore.setState({
      ...useStore.getInitialState(),
      studyState: DEFAULT_STUDY_STATE('en'),
    });

    useStore.getState().updateConfig({ levels: ['N4'] });

    const state = useStore.getState();
    expect(state.studyState.preferences.defaultSessionConfig.levels).toEqual(['N4']);
    // questionCount should remain the default, not overwritten by transient config
    expect(state.studyState.preferences.defaultSessionConfig.questionCount).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Diagnostic algorithm: data impact boundary tests
// ---------------------------------------------------------------------------

describe('diagnostic data boundaries', () => {
  function setupSessionWithType(practiceType: 'daily' | 'weakness' | 'free') {
    const word = buildWord('word-1');
    useStore.setState({
      ...useStore.getInitialState(),
      studyState: DEFAULT_STUDY_STATE('en'),
      config: {
        levels: ['N5'],
        wordTypes: ['verb'],
        forms: ['te_form'],
        questionCount: 10,
        mode: 'choice',
        practiceType,
      },
    });

    useStore.getState().startSession(
      [
        {
          unitKey: 'word-1::te_form::choice',
          word,
          type: 'te_form',
          choices: ['word-1-te', 'word-1-polite'],
        },
      ],
      useStore.getState().config as Parameters<typeof useStore.getState.startSession>[1],
      useStore.getState().config.practiceType as Parameters<typeof useStore.getState.startSession>[2]
    );
  }

  it('daily practice updates formStats and patternStats', () => {
    setupSessionWithType('daily');
    useStore.getState().submitAnswer(true);

    const state = useStore.getState();
    expect(Object.keys(state.studyState.formStats).length).toBeGreaterThan(0);
    expect(state.studyState.formStats['te_form']).toBeDefined();
    expect(state.studyState.formStats['te_form'].totalAttempts).toBe(1);
    expect(state.studyState.formStats['te_form'].correctAttempts).toBe(1);

    expect(Object.keys(state.studyState.patternStats).length).toBeGreaterThan(0);
  });

  it('daily practice updates wordStats', () => {
    setupSessionWithType('daily');
    useStore.getState().submitAnswer(true);

    const state = useStore.getState();
    expect(state.studyState.wordStats['word-1']).toBeDefined();
    expect(state.studyState.wordStats['word-1'].totalAttempts).toBe(1);
  });

  it('free practice does NOT update formStats or patternStats', () => {
    setupSessionWithType('free');
    useStore.getState().submitAnswer(true);

    const state = useStore.getState();
    expect(Object.keys(state.studyState.formStats).length).toBe(0);
    expect(Object.keys(state.studyState.patternStats).length).toBe(0);
  });

  it('free practice records only raw attempts without wordStats or summary totals', () => {
    setupSessionWithType('free');
    useStore.getState().submitAnswer(true);

    const state = useStore.getState();
    expect(state.studyState.attemptHistory).toHaveLength(1);
    expect(state.studyState.attemptHistory[0].practiceType).toBe('free');
    expect(state.studyState.attemptHistory[0].affectsMastery).toBe(false);

    expect(Object.keys(state.studyState.wordStats)).toHaveLength(0);
    expect(state.studyState.learnerSummary.totalAnswered).toBe(0);
    expect(state.studyState.learnerSummary.totalCorrect).toBe(0);
    expect(state.studyState.sessionHistory).toHaveLength(0);
  });

  it('free practice does NOT update unitProgress', () => {
    setupSessionWithType('free');
    useStore.getState().submitAnswer(true);

    const state = useStore.getState();
    expect(Object.keys(state.studyState.unitProgress).length).toBe(0);
  });

  it('weakness practice updates formStats and patternStats', () => {
    setupSessionWithType('weakness');
    useStore.getState().submitAnswer(false);

    const state = useStore.getState();
    expect(state.studyState.formStats['te_form']).toBeDefined();
    expect(state.studyState.formStats['te_form'].totalAttempts).toBe(1);
    expect(state.studyState.formStats['te_form'].correctAttempts).toBe(0);
  });

  it('weakness practice does NOT affect streak', () => {
    setupSessionWithType('weakness');
    const streakBefore = useStore.getState().studyState.learnerSummary.dailyStreak;

    useStore.getState().submitAnswer(true);

    const state = useStore.getState();
    // Streak should remain unchanged for weakness practice
    expect(state.studyState.learnerSummary.dailyStreak).toBe(streakBefore);
  });

  it('daily retry does NOT count toward daily goal', () => {
    setupSessionWithType('daily');

    // First answer: wrong → re-queued
    useStore.getState().submitAnswer(false);

    // Second answer (retry): correct
    useStore.getState().submitAnswer(true);

    const state = useStore.getState();
    const attempts = state.studyState.attemptHistory;

    // First attempt: countsTowardDailyGoal should be true (not a retry)
    expect(attempts[0].countsTowardDailyGoal).toBe(true);
    expect(attempts[0].isRetry).toBe(false);

    // Second attempt: countsTowardDailyGoal should be false (is a retry)
    expect(attempts[1].countsTowardDailyGoal).toBe(false);
    expect(attempts[1].isRetry).toBe(true);
  });

  it('attempt record contains all enriched diagnostic fields', () => {
    setupSessionWithType('daily');
    useStore.getState().submitAnswer(true);

    const state = useStore.getState();
    const attempt = state.studyState.attemptHistory[0];

    expect(attempt.practiceType).toBe('daily');
    expect(attempt.scopeType).toBe('curriculum');
    expect(attempt.wordType).toBe('verb');
    expect(attempt.group).toBe('godan');
    expect(attempt.rulePattern).toBeDefined();
    expect(attempt.isRetry).toBe(false);
    expect(attempt.affectsMastery).toBe(true);
    expect(attempt.affectsWeakness).toBe(false);
    expect(attempt.countsTowardDailyGoal).toBe(true);
    expect(attempt.countsTowardStreak).toBe(true);
  });
});
