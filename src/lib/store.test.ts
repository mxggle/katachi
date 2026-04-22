import { describe, expect, it } from 'vitest';
import { extractPersistedStudyState } from '@/lib/store';
import { DEFAULT_STUDY_STATE } from '@/lib/study/types';

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
