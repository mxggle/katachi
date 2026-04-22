import { describe, expect, it } from 'vitest';
import {
  getModeBreakdown,
  getOverviewStats,
  getRecentActivity,
  getWeakestConjugations,
  getWeakestItems,
} from '@/lib/study/progress';
import type { StudyState, UnitProgress } from '@/lib/study/types';
import { DEFAULT_STUDY_STATE } from '@/lib/study/types';

function buildProgress(overrides: Partial<UnitProgress> = {}): UnitProgress {
  return {
    wordId: 'iku',
    conjugationType: 'te_form',
    mode: 'choice',
    wordType: 'verb',
    seenCount: 4,
    correctCount: 1,
    wrongCount: 3,
    consecutiveCorrect: 0,
    consecutiveWrong: 2,
    lastSeenAt: '2026-04-22T12:00:00.000Z',
    lastCorrectAt: '2026-04-20T12:00:00.000Z',
    lastWrongAt: '2026-04-22T12:00:00.000Z',
    sameDayExposureCount: 1,
    sameSessionRetryCount: 1,
    ...overrides,
  };
}

function buildStudyState(): StudyState {
  return {
    ...DEFAULT_STUDY_STATE('en'),
    learnerSummary: {
      dailyStreak: 3,
      lastPracticeDate: '2026-04-22',
      lastSessionAt: '2026-04-22T12:00:00.000Z',
      totalAnswered: 20,
      totalCorrect: 14,
      schemaVersion: 2,
    },
    unitProgress: {
      'iku::te_form::choice': buildProgress(),
      'taberu::polite::choice': buildProgress({
        wordId: 'taberu',
        conjugationType: 'polite',
        seenCount: 5,
        correctCount: 4,
        wrongCount: 1,
        consecutiveWrong: 0,
      }),
      'kirei::negative_plain::input': buildProgress({
        wordId: 'kirei',
        conjugationType: 'negative_plain',
        mode: 'input',
        wordType: 'na-adj',
        seenCount: 3,
        correctCount: 0,
        wrongCount: 3,
        consecutiveWrong: 3,
      }),
    },
    attemptHistory: [
      {
        attemptId: '1',
        sessionId: 's1',
        wordId: 'iku',
        conjugationType: 'te_form',
        mode: 'choice',
        isCorrect: false,
        answeredAt: '2026-04-20T10:00:00.000Z',
      },
      {
        attemptId: '2',
        sessionId: 's2',
        wordId: 'taberu',
        conjugationType: 'polite',
        mode: 'choice',
        isCorrect: true,
        answeredAt: '2026-04-21T10:00:00.000Z',
      },
      {
        attemptId: '3',
        sessionId: 's3',
        wordId: 'kirei',
        conjugationType: 'negative_plain',
        mode: 'input',
        isCorrect: false,
        answeredAt: '2026-04-22T10:00:00.000Z',
      },
    ],
    sessionHistory: [],
  };
}

describe('study progress selectors', () => {
  it('builds overview stats from learner summary', () => {
    const overview = getOverviewStats(buildStudyState(), '2026-04-22');
    expect(overview).toEqual({
      totalAnswered: 20,
      accuracy: 70,
      dailyStreak: 3,
      studiedToday: 1,
    });
  });

  it('groups weakest conjugations by aggregated accuracy', () => {
    const weakest = getWeakestConjugations(buildStudyState(), 2);
    expect(weakest[0]).toMatchObject({ conjugationType: 'negative_plain', accuracy: 0 });
    expect(weakest[1]).toMatchObject({ conjugationType: 'te_form', accuracy: 25 });
  });

  it('sorts weakest items by weakness score', () => {
    const weakestItems = getWeakestItems(buildStudyState(), 2);
    expect(weakestItems[0]).toMatchObject({ wordId: 'kirei', conjugationType: 'negative_plain' });
    expect(weakestItems[1]).toMatchObject({ wordId: 'iku', conjugationType: 'te_form' });
  });

  it('compares choice and input accuracy independently', () => {
    const modes = getModeBreakdown(buildStudyState());
    expect(modes).toEqual([
      { mode: 'choice', answered: 9, accuracy: 56 },
      { mode: 'input', answered: 3, accuracy: 0 },
    ]);
  });

  it('summarizes recent activity by day', () => {
    const recent = getRecentActivity(buildStudyState(), 3, '2026-04-22');
    expect(recent).toEqual([
      { date: '2026-04-20', answered: 1, correct: 0 },
      { date: '2026-04-21', answered: 1, correct: 1 },
      { date: '2026-04-22', answered: 1, correct: 0 },
    ]);
  });

  it('returns null recent activity rows when there is no history', () => {
    const state = { ...DEFAULT_STUDY_STATE('en') };
    expect(getRecentActivity(state, 7, '2026-04-22')).toEqual([]);
  });
});
