import { describe, expect, it } from 'vitest';
import { DEFAULT_STUDY_STATE, type StudyState } from '@/lib/study/types';
import { mergeStudyStates } from './studySync';

function makeState(overrides: Partial<StudyState>): StudyState {
  return {
    ...DEFAULT_STUDY_STATE('en'),
    ...overrides,
  };
}

describe('Supabase study state merge', () => {
  it('keeps the richer local guest state when no remote snapshot exists', () => {
    const local = makeState({
      learnerSummary: {
        ...DEFAULT_STUDY_STATE('en').learnerSummary,
        dailyStreak: 3,
        totalAnswered: 10,
        totalCorrect: 8,
      },
    });

    expect(mergeStudyStates(local, null)).toEqual(local);
  });

  it('merges local and remote progress without lowering existing counters', () => {
    const local = makeState({
      learnerSummary: {
        ...DEFAULT_STUDY_STATE('en').learnerSummary,
        dailyStreak: 2,
        lastPracticeDate: '2026-04-20',
        lastSessionAt: '2026-04-20T02:00:00.000Z',
        totalAnswered: 7,
        totalCorrect: 5,
      },
      unitProgress: {
        'taberu::te_form::choice': {
          wordId: 'taberu',
          conjugationType: 'te_form',
          mode: 'choice',
          wordType: 'verb',
          seenCount: 7,
          correctCount: 5,
          wrongCount: 2,
          consecutiveCorrect: 1,
          consecutiveWrong: 0,
          lastSeenAt: '2026-04-20T02:00:00.000Z',
          lastCorrectAt: '2026-04-20T02:00:00.000Z',
          lastWrongAt: '2026-04-19T02:00:00.000Z',
          sameDayExposureCount: 2,
          sameSessionRetryCount: 0,
        },
      },
    });
    const remote = makeState({
      learnerSummary: {
        ...DEFAULT_STUDY_STATE('en').learnerSummary,
        dailyStreak: 5,
        lastPracticeDate: '2026-04-22',
        lastSessionAt: '2026-04-22T02:00:00.000Z',
        totalAnswered: 4,
        totalCorrect: 4,
      },
      preferences: {
        ...DEFAULT_STUDY_STATE('zh').preferences,
        language: 'zh',
      },
      unitProgress: {
        'taberu::te_form::choice': {
          wordId: 'taberu',
          conjugationType: 'te_form',
          mode: 'choice',
          wordType: 'verb',
          seenCount: 4,
          correctCount: 4,
          wrongCount: 0,
          consecutiveCorrect: 4,
          consecutiveWrong: 0,
          lastSeenAt: '2026-04-22T02:00:00.000Z',
          lastCorrectAt: '2026-04-22T02:00:00.000Z',
          lastWrongAt: null,
          sameDayExposureCount: 1,
          sameSessionRetryCount: 0,
        },
      },
    });

    const merged = mergeStudyStates(local, remote);

    expect(merged.preferences.language).toBe('zh');
    expect(merged.learnerSummary.dailyStreak).toBe(5);
    expect(merged.learnerSummary.totalAnswered).toBe(7);
    expect(merged.learnerSummary.totalCorrect).toBe(5);
    expect(merged.learnerSummary.lastPracticeDate).toBe('2026-04-22');
    expect(merged.unitProgress['taberu::te_form::choice']).toMatchObject({
      seenCount: 7,
      correctCount: 5,
      wrongCount: 2,
      consecutiveCorrect: 4,
      lastSeenAt: '2026-04-22T02:00:00.000Z',
    });
  });
});
