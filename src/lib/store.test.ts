import { afterEach, describe, expect, it, vi } from 'vitest';
import { extractPersistedStudyState, getLocalDateString, STORE_STORAGE_KEY, useStore } from '@/lib/store';
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

  it('does not reinsert the same word into the active session after a wrong answer', () => {
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

    useStore.getState().startSession([
      {
        unitKey: 'word-1::te_form::choice',
        word,
        type: 'te_form',
        choices: ['word-1-te', 'word-1-polite'],
      },
    ]);

    useStore.getState().submitAnswer(false);

    const { activeSession } = useStore.getState();
    expect(activeSession?.words).toHaveLength(1);
    expect(activeSession?.currentIndex).toBe(1);
  });
});
