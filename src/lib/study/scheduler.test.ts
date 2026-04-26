import { describe, expect, it } from 'vitest';
import { selectPracticeUnits, DAILY_WEAKNESS_RATIO } from '@/lib/study/scheduler';
import type { StudyPreferences, StudySessionConfig, UnitProgress, StudyState, FormStats } from '@/lib/study/types';
import { DEFAULT_STUDY_STATE, createEmptyFormStats, createEmptyPatternStats } from '@/lib/study/types';
import type { ConjugationType, WordEntry } from '@/lib/distractorEngine';

function buildWord(id: string, wordType: WordEntry['word_type'], forms: ConjugationType[], group?: WordEntry['group']): WordEntry {
  const lastKana: Record<string, string> = {
    'godan': 'く',
    'ichidan': 'る',
    'suru': 'する',
    'kuru': 'くる',
    'i-adj': 'い',
    'na-adj': 'な',
  };
  const kana = id + (lastKana[group || (wordType === 'verb' ? 'godan' : wordType)] ?? '');
  const conjugations = Object.fromEntries(forms.map((form) => [form, `${id}-${form}`]));
  return {
    id,
    level: 'N5',
    group: group || (wordType === 'verb' ? 'godan' : wordType as WordEntry['group']),
    word_type: wordType,
    dictionary_form: { kanji: id, kana, romaji: id },
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
    status: 'learning',
    interval: 0,
    ease: 2.5,
    nextReviewDate: '2026-04-22T10:00:00.000Z',
    ...overrides,
  };
}

function buildStudyState(overrides: Partial<StudyState> = {}): StudyState {
  return {
    ...DEFAULT_STUDY_STATE('en'),
    ...overrides,
  };
}

function buildWeakFormStats(form: ConjugationType): FormStats {
  return {
    ...createEmptyFormStats(form),
    totalAttempts: 10,
    correctAttempts: 3,
    accuracy: 0.3,
    masteryLevel: 'weak',
  };
}

function buildStableFormStats(form: ConjugationType): FormStats {
  return {
    ...createEmptyFormStats(form),
    totalAttempts: 10,
    correctAttempts: 9,
    accuracy: 0.9,
    masteryLevel: 'mastered',
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
  // ----------------------------------------------------------------
  // Daily practice: 50/30/20 allocation
  // ----------------------------------------------------------------

  it('allocates approximately 50% weakness, 30% coverage, 20% exploration in daily practice', () => {
    const words = Array.from({ length: 20 }, (_, i) =>
      buildWord(`word-${i}`, 'verb', ['te_form', 'polite'])
    );

    // Create studyState with some weak and some mastered patterns
    const studyState = buildStudyState({
      formStats: {
        te_form: buildWeakFormStats('te_form'),
        polite: buildStableFormStats('polite'),
      },
      patternStats: {
        'te_form::godan': {
          ...createEmptyPatternStats('te_form::godan', 'te_form'),
          totalAttempts: 10,
          correctAttempts: 3,
          accuracy: 0.3,
          masteryLevel: 'weak',
        },
        'polite::godan': {
          ...createEmptyPatternStats('polite::godan', 'polite'),
          totalAttempts: 10,
          correctAttempts: 9,
          accuracy: 0.9,
          masteryLevel: 'mastered',
        },
      },
    });

    const total = 10;
    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: total },
      practiceType: 'daily',
      preferences,
      unitProgress: {},
      studyState,
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected.length).toBeLessThanOrEqual(total);
    expect(selected.length).toBeGreaterThan(0);

    // Verify the allocation ratios are reasonable
    const weaknessCount = selected.filter(u => u.conjugationType === 'te_form').length;

    // Weakness (te_form is weak) should get ~50%
    expect(weaknessCount).toBeGreaterThanOrEqual(Math.floor(total * DAILY_WEAKNESS_RATIO * 0.5));
  });

  it('backfills when weakness pool is empty (new user)', () => {
    const words = Array.from({ length: 10 }, (_, i) =>
      buildWord(`word-${i}`, 'verb', ['te_form'])
    );

    const studyState = buildStudyState(); // Fresh state, no stats

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 6 },
      practiceType: 'daily',
      preferences,
      unitProgress: {},
      studyState,
      now: '2026-04-22T12:00:00.000Z',
    });

    // New user: all forms are undiagnosed → exploration fills everything
    expect(selected).toHaveLength(6);
  });

  // ----------------------------------------------------------------
  // Weakness practice
  // ----------------------------------------------------------------

  it('weakness practice only picks from weak/unstable patterns', () => {
    const words = [
      buildWord('word-1', 'verb', ['te_form']),
      buildWord('word-2', 'verb', ['te_form']),
      buildWord('word-3', 'verb', ['polite']),
    ];

    const studyState = buildStudyState({
      formStats: {
        te_form: buildWeakFormStats('te_form'),
        polite: buildStableFormStats('polite'),
      },
      patternStats: {
        'te_form::godan': {
          ...createEmptyPatternStats('te_form::godan', 'te_form'),
          totalAttempts: 5,
          correctAttempts: 1,
          accuracy: 0.2,
          masteryLevel: 'weak',
        },
        'polite::godan': {
          ...createEmptyPatternStats('polite::godan', 'polite'),
          totalAttempts: 10,
          correctAttempts: 9,
          accuracy: 0.9,
          masteryLevel: 'mastered',
        },
      },
    });

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 3 },
      practiceType: 'weakness',
      preferences,
      unitProgress: {},
      studyState,
      now: '2026-04-22T12:00:00.000Z',
    });

    // Should only select te_form words (weak pattern)
    for (const unit of selected) {
      expect(unit.conjugationType).toBe('te_form');
    }
  });

  it('weakness practice does not fall back to unitProgress when no formStats or patternStats exist', () => {
    const words = [
      buildWord('word-1', 'verb', ['te_form']),
      buildWord('word-2', 'verb', ['te_form']),
      buildWord('word-3', 'verb', ['te_form']),
    ];

    const unitProgress: Record<string, UnitProgress> = {
      'word-1::te_form::choice': buildProgress({ wordId: 'word-1', correctCount: 1, seenCount: 5 }),
      'word-2::te_form::choice': buildProgress({ wordId: 'word-2', correctCount: 4, seenCount: 5 }),
    };

    const studyState = buildStudyState({ unitProgress });

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 3 },
      practiceType: 'weakness',
      preferences,
      unitProgress,
      studyState,
      now: '2026-04-22T12:00:00.000Z',
    });

    // UnitProgress is legacy/SRS compatibility data and must not drive diagnostic weakness.
    expect(selected).toHaveLength(0);
  });

  // ----------------------------------------------------------------
  // Free practice
  // ----------------------------------------------------------------

  it('free practice uses all eligible items without filtering', () => {
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
      studyState: buildStudyState(),
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected).toHaveLength(3);
  });

  it('free practice prefers unique words', () => {
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
      studyState: buildStudyState(),
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected).toHaveLength(3);
    expect(new Set(selected.map((item) => item.word.id)).size).toBe(3);
  });

  // ----------------------------------------------------------------
  // Group interleaving
  // ----------------------------------------------------------------

  it('balances verb groups and interleaves them', () => {
    const words = [
      buildWord('g1', 'verb', ['te_form'], 'godan'),
      buildWord('g2', 'verb', ['te_form'], 'godan'),
      buildWord('g3', 'verb', ['te_form'], 'godan'),
      buildWord('i1', 'verb', ['te_form'], 'ichidan'),
      buildWord('i2', 'verb', ['te_form'], 'ichidan'),
      buildWord('i3', 'verb', ['te_form'], 'ichidan'),
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
      studyState: buildStudyState(),
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected).toHaveLength(6);

    const groups = selected.map(u => u.word.group);
    const godanCount = groups.filter(g => g === 'godan').length;
    const ichidanCount = groups.filter(g => g === 'ichidan').length;
    const irregularCount = groups.filter(g => g === 'suru' || g === 'kuru').length;

    expect(godanCount).toBe(2);
    expect(ichidanCount).toBe(2);
    expect(irregularCount).toBe(2);
  });

  it('backfills if a group is under-represented', () => {
    const words = [
      buildWord('g1', 'verb', ['te_form'], 'godan'),
      buildWord('i1', 'verb', ['te_form'], 'ichidan'),
      buildWord('i2', 'verb', ['te_form'], 'ichidan'),
      buildWord('i3', 'verb', ['te_form'], 'ichidan'),
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
      studyState: buildStudyState(),
      now: '2026-04-22T12:00:00.000Z',
    });

    expect(selected).toHaveLength(6);

    const groups = selected.map(u => u.word.group);
    const godanCount = groups.filter(g => g === 'godan').length;
    expect(godanCount).toBe(1);

    const ichidanCount = groups.filter(g => g === 'ichidan').length;
    const irregularCount = groups.filter(g => g === 'suru' || g === 'kuru').length;
    expect(ichidanCount + irregularCount).toBe(5);
    expect(ichidanCount).toBeGreaterThanOrEqual(2);
    expect(irregularCount).toBeGreaterThanOrEqual(2);
  });

  // ----------------------------------------------------------------
  // rulePattern field
  // ----------------------------------------------------------------

  it('attaches rulePattern to selected units', () => {
    const words = [
      buildWord('taberu', 'verb', ['te_form'], 'ichidan'),
      buildWord('kaku', 'verb', ['te_form'], 'godan'),
    ];
    // Make kaku end with く for proper pattern detection
    words[1].dictionary_form.kana = 'かく';

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 2, forms: ['te_form'] },
      practiceType: 'free',
      preferences,
      unitProgress: {},
      studyState: buildStudyState(),
      now: '2026-04-22T12:00:00.000Z',
    });

    const patterns = selected.map(u => u.rulePattern);
    expect(patterns).toContain('te_form::ichidan');
    expect(patterns).toContain('te_form::godan-ku');
  });

  // ----------------------------------------------------------------
  // Multiple forms per word (no longer limited to 1)
  // ----------------------------------------------------------------

  it('can select multiple forms of the same word', () => {
    const words = [
      buildWord('word-1', 'verb', ['te_form', 'polite']),
    ];

    const selected = selectPracticeUnits({
      words,
      config: { ...config, questionCount: 2 },
      practiceType: 'free',
      preferences,
      unitProgress: {},
      studyState: buildStudyState(),
      now: '2026-04-22T12:00:00.000Z',
    });

    // New scheduler builds all word×form candidates
    expect(selected).toHaveLength(2);
    const forms = selected.map(u => u.conjugationType);
    expect(forms).toContain('te_form');
    expect(forms).toContain('polite');
  });
});
