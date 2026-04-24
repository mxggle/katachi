import { describe, expect, it } from 'vitest';
import { selectPracticeUnits } from '@/lib/study/scheduler';
import type { StudyPreferences, StudySessionConfig, UnitProgress } from '@/lib/study/types';
import type { ConjugationType, WordEntry } from '@/lib/distractorEngine';

function buildWord(id: string, wordType: WordEntry['word_type'], forms: ConjugationType[], group?: WordEntry['group']): WordEntry {
  const conjugations = Object.fromEntries(forms.map((form) => [form, `${id}-${form}`]));
  return {
    id,
    level: 'N5',
    group: group || (wordType === 'verb' ? 'godan' : wordType as WordEntry['group']),
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

  it('does not repeat words even if questionCount is higher than available words', () => {
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

    // Each word only contributes its best form to the eligible pool, so we only get 2 units.
    expect(selected).toHaveLength(2);
    expect(selected[0].word.id).toBe('word-1');
    expect(selected[1].word.id).toBe('word-2');
    expect(new Set(selected.map((item) => item.word.id)).size).toBe(2);
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

  it('balances verb groups (33/33/33) and interleaves them', () => {
    const words = [
      // Godan
      buildWord('g1', 'verb', ['te_form'], 'godan'),
      buildWord('g2', 'verb', ['te_form'], 'godan'),
      buildWord('g3', 'verb', ['te_form'], 'godan'),
      // Ichidan
      buildWord('i1', 'verb', ['te_form'], 'ichidan'),
      buildWord('i2', 'verb', ['te_form'], 'ichidan'),
      buildWord('i3', 'verb', ['te_form'], 'ichidan'),
      // Irregular
      buildWord('s1', 'verb', ['te_form'], 'suru'),
      buildWord('k1', 'verb', ['te_form'], 'kuru'),
      buildWord('s2', 'verb', ['te_form'], 'suru'),
    ];

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 6 },
      practiceType: 'free',
      preferences,
      unitProgress: {},
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected).toHaveLength(6);
    
    const groups = selected.map(u => u.word.group);
    
    // Check for 33/33/33 balance (2 each for a total of 6)
    const godanCount = groups.filter(g => g === 'godan').length;
    const ichidanCount = groups.filter(g => g === 'ichidan').length;
    const irregularCount = groups.filter(g => g === 'suru' || g === 'kuru').length;

    expect(godanCount).toBe(2);
    expect(ichidanCount).toBe(2);
    expect(irregularCount).toBe(2);

    // Check for interleaving (no two consecutive units from the same meta-group)
    // Meta-groups: godan, ichidan, irregular (suru/kuru)
    const getMetaGroup = (g: string) => (g === 'suru' || g === 'kuru') ? 'irregular' : g;
    for (let i = 0; i < groups.length - 1; i++) {
      expect(getMetaGroup(groups[i])).not.toBe(getMetaGroup(groups[i+1]));
    }
  });

  it('backfills if a group is under-represented', () => {
    const words = [
      // Only 1 Godan
      buildWord('g1', 'verb', ['te_form'], 'godan'),
      // Plenty of Ichidan
      buildWord('i1', 'verb', ['te_form'], 'ichidan'),
      buildWord('i2', 'verb', ['te_form'], 'ichidan'),
      buildWord('i3', 'verb', ['te_form'], 'ichidan'),
      // Plenty of Irregular
      buildWord('s1', 'verb', ['te_form'], 'suru'),
      buildWord('k1', 'verb', ['te_form'], 'kuru'),
      buildWord('s2', 'verb', ['te_form'], 'suru'),
    ];

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 6 },
      practiceType: 'free',
      preferences,
      unitProgress: {},
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected).toHaveLength(6);
    
    const groups = selected.map(u => u.word.group);
    const godanCount = groups.filter(g => g === 'godan').length;
    
    // We only have 1 godan, so it should be exactly 1
    expect(godanCount).toBe(1);
    
    // The rest should be distributed among other groups
    const ichidanCount = groups.filter(g => g === 'ichidan').length;
    const irregularCount = groups.filter(g => g === 'suru' || g === 'kuru').length;
    
    // 6 total, 1 godan leaves 5. Ideally 2 and 3 or 3 and 2.
    expect(ichidanCount + irregularCount).toBe(5);
    expect(ichidanCount).toBeGreaterThanOrEqual(2);
    expect(irregularCount).toBeGreaterThanOrEqual(2);
  });

  it('applies a 24-hour cooldown multiplier to recently seen units', () => {
    const words = [
      buildWord('recent-word', 'verb', ['te_form']),
      buildWord('old-word', 'verb', ['te_form']),
    ];

    const now = '2026-04-22T12:00:00.000Z';
    const oneHourAgo = '2026-04-22T11:00:00.000Z';
    const twoDaysAgo = '2026-04-20T12:00:00.000Z';

    const unitProgress: Record<string, UnitProgress> = {
      'recent-word::te_form::choice': buildProgress({
        wordId: 'recent-word',
        wrongCount: 10,
        consecutiveWrong: 5,
        lastSeenAt: oneHourAgo,
        lastWrongAt: oneHourAgo,
      }),
      'old-word::te_form::choice': buildProgress({
        wordId: 'old-word',
        wrongCount: 2,
        consecutiveWrong: 1,
        lastSeenAt: twoDaysAgo,
        lastWrongAt: twoDaysAgo,
      }),
    };

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 1 },
      practiceType: 'weakness',
      preferences,
      unitProgress,
      now,
    });

    // Even though recent-word has many more errors, old-word should be picked because of the cooldown
    expect(selected[0].word.id).toBe('old-word');
  });

  it('only includes the highest-scoring form for each word in the eligible pool', () => {
    const words = [
      buildWord('word-1', 'verb', ['te_form', 'polite']),
    ];

    const unitProgress: Record<string, UnitProgress> = {
      'word-1::te_form::choice': buildProgress({ wordId: 'word-1', wrongCount: 10 }),
      'word-1::polite::choice': buildProgress({ wordId: 'word-1', conjugationType: 'polite', wrongCount: 5 }),
    };

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 2 },
      practiceType: 'weakness',
      preferences,
      unitProgress,
      now: '2026-04-22T12:00:00.000Z',
    });

    // Should only have 1 unit because word-1 only contributes its best form to eligible pool
    // and there are no other words.
    expect(selected).toHaveLength(1);
    expect(selected[0].conjugationType).toBe('te_form');
  });
});
