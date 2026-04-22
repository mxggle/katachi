import { describe, expect, it } from 'vitest';
import { selectPracticeUnits } from '@/lib/study/scheduler';
import type { StudyPreferences, StudySessionConfig, UnitProgress } from '@/lib/study/types';
import type { ConjugationType, WordEntry } from '@/lib/distractorEngine';

function buildWord(id: string, wordType: WordEntry['word_type'], forms: ConjugationType[]): WordEntry {
  const conjugations = Object.fromEntries(forms.map((form) => [form, `${id}-${form}`]));
  return {
    id,
    level: 'N5',
    group: wordType === 'verb' ? 'godan' : wordType,
    word_type: wordType,
    dictionary_form: { kanji: id, kana: id, romaji: id },
    meaning: id,
    conjugations,
  };
}

function buildProgress(overrides: Partial<UnitProgress> = {}): UnitProgress {
  return {
    wordId: 'word-1',
    conjugationType: 'te_form',
    mode: 'choice',
    wordType: 'verb',
    seenCount: 1,
    correctCount: 0,
    wrongCount: 1,
    consecutiveCorrect: 0,
    consecutiveWrong: 1,
    lastSeenAt: '2026-04-22T10:00:00.000Z',
    lastCorrectAt: null,
    lastWrongAt: '2026-04-22T10:00:00.000Z',
    sameDayExposureCount: 1,
    sameSessionRetryCount: 0,
    ...overrides,
  };
}

const preferences: StudyPreferences = {
  language: 'en',
  defaultSessionConfig: {
    levels: ['N5'],
    wordTypes: ['verb'],
    forms: ['te_form', 'polite'],
    questionCount: 10,
    mode: 'choice',
  },
  dailyQuestionGoal: 6,
  dailyNewLimit: 2,
};

const config: StudySessionConfig = {
  levels: ['N5'],
  wordTypes: ['verb'],
  forms: ['te_form', 'polite'],
  questionCount: 6,
  mode: 'choice',
};

describe('selectPracticeUnits', () => {
  it('caps new content in daily practice and fills the rest with weak items', () => {
    const words = [
      buildWord('word-1', 'verb', ['te_form']),
      buildWord('word-2', 'verb', ['te_form']),
      buildWord('word-3', 'verb', ['te_form']),
      buildWord('word-4', 'verb', ['te_form']),
      buildWord('word-5', 'verb', ['te_form']),
      buildWord('word-6', 'verb', ['te_form']),
    ];

    const unitProgress: Record<string, UnitProgress> = {
      'word-1::te_form::choice': buildProgress({ wordId: 'word-1', consecutiveWrong: 3, wrongCount: 4 }),
      'word-2::te_form::choice': buildProgress({ wordId: 'word-2', consecutiveWrong: 2, wrongCount: 3 }),
      'word-3::te_form::choice': buildProgress({ wordId: 'word-3', consecutiveWrong: 1, wrongCount: 2 }),
      'word-4::te_form::choice': buildProgress({ wordId: 'word-4', consecutiveWrong: 1, wrongCount: 1 }),
    };

    const selected = selectPracticeUnits({
      words,
      config,
      practiceType: 'daily',
      preferences,
      unitProgress,
      now: '2026-04-22T12:00:00.000Z',
    });

    const newUnits = selected.filter((item) => !unitProgress[item.unitKey]);
    const weakUnits = selected.filter((item) => unitProgress[item.unitKey]);

    expect(selected).toHaveLength(6);
    expect(newUnits).toHaveLength(2);
    expect(weakUnits).toHaveLength(4);
    expect(selected[0].word.id).toBe('word-1');
  });

  it('limits weakness drill to seen weak units only', () => {
    const words = [
      buildWord('word-1', 'verb', ['te_form']),
      buildWord('word-2', 'verb', ['te_form']),
      buildWord('word-3', 'verb', ['te_form']),
    ];

    const unitProgress: Record<string, UnitProgress> = {
      'word-1::te_form::choice': buildProgress({ wordId: 'word-1', wrongCount: 4, consecutiveWrong: 2 }),
      'word-2::te_form::choice': buildProgress({ wordId: 'word-2', wrongCount: 2, consecutiveWrong: 1 }),
    };

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 3 },
      practiceType: 'weakness',
      preferences,
      unitProgress,
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected.map((item) => item.word.id)).toEqual(['word-1', 'word-2']);
  });

  it('lets free practice use all eligible items without a daily new-item cap', () => {
    const words = [
      buildWord('word-1', 'verb', ['te_form']),
      buildWord('word-2', 'verb', ['te_form']),
      buildWord('word-3', 'verb', ['te_form']),
    ];

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 3 },
      practiceType: 'free',
      preferences,
      unitProgress: {},
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected).toHaveLength(3);
  });

  it('prefers unique words before repeating another form in free practice', () => {
    const words = [
      buildWord('word-1', 'verb', ['te_form', 'polite']),
      buildWord('word-2', 'verb', ['te_form', 'polite']),
      buildWord('word-3', 'verb', ['te_form', 'polite']),
    ];

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 3 },
      practiceType: 'free',
      preferences,
      unitProgress: {},
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected).toHaveLength(3);
    expect(new Set(selected.map((item) => item.word.id)).size).toBe(3);
  });

  it('reuses the same word only after unique words run out', () => {
    const words = [
      buildWord('word-1', 'verb', ['te_form', 'polite']),
      buildWord('word-2', 'verb', ['te_form', 'polite']),
    ];

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 3 },
      practiceType: 'free',
      preferences,
      unitProgress: {},
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected).toHaveLength(3);
    expect(selected[0].word.id).toBe('word-1');
    expect(selected[1].word.id).toBe('word-2');
    expect(new Set(selected.slice(0, 2).map((item) => item.word.id)).size).toBe(2);
  });

  it('picks the weakest form per word before repeating a weak word', () => {
    const words = [
      buildWord('word-1', 'verb', ['te_form', 'polite']),
      buildWord('word-2', 'verb', ['te_form', 'polite']),
      buildWord('word-3', 'verb', ['te_form', 'polite']),
    ];

    const unitProgress: Record<string, UnitProgress> = {
      'word-1::te_form::choice': buildProgress({ wordId: 'word-1', wrongCount: 5, consecutiveWrong: 3 }),
      'word-1::polite::choice': buildProgress({ wordId: 'word-1', conjugationType: 'polite', wrongCount: 4, consecutiveWrong: 2 }),
      'word-2::te_form::choice': buildProgress({ wordId: 'word-2', wrongCount: 3, consecutiveWrong: 2 }),
      'word-3::polite::choice': buildProgress({ wordId: 'word-3', conjugationType: 'polite', wrongCount: 2, consecutiveWrong: 1 }),
    };

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 3 },
      practiceType: 'weakness',
      preferences,
      unitProgress,
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected).toHaveLength(3);
    expect(selected.map((item) => item.unitKey)).toEqual([
      'word-1::te_form::choice',
      'word-2::te_form::choice',
      'word-3::polite::choice',
    ]);
  });
});
