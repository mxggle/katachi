import { describe, expect, it } from 'vitest';
import { buildPracticeSession } from '@/lib/sessionBuilder';
import { DEFAULT_STUDY_STATE, makeUnitKey, type StudyState } from '@/lib/study/types';

function buildStudyState(): StudyState {
  return {
    ...DEFAULT_STUDY_STATE('en'),
    unitProgress: {
      [makeUnitKey('v_hashiru', 'polite', 'choice')]: {
        wordId: 'v_hashiru',
        conjugationType: 'polite',
        mode: 'choice',
        wordType: 'verb',
        seenCount: 3,
        correctCount: 1,
        wrongCount: 2,
        consecutiveCorrect: 0,
        consecutiveWrong: 1,
        lastSeenAt: '2026-04-22T10:00:00.000Z',
        lastCorrectAt: '2026-04-20T10:00:00.000Z',
        lastWrongAt: '2026-04-22T10:00:00.000Z',
        sameDayExposureCount: 1,
        sameSessionRetryCount: 0,
      },
    },
  };
}

describe('buildPracticeSession', () => {
  it('forces a focused unit to the front of the generated drill session', () => {
    const result = buildPracticeSession(
      {
        levels: ['N5'],
        wordTypes: ['i-adj'],
        forms: ['polite'],
        questionCount: 5,
        mode: 'choice',
        practiceType: 'weakness',
      },
      buildStudyState(),
      'en',
      { focusUnitKey: makeUnitKey('v_hashiru', 'polite', 'choice') }
    );

    expect('error' in result).toBe(false);
    if ('error' in result) return;
    expect(result.words[0]?.unitKey).toBe(makeUnitKey('v_hashiru', 'polite', 'choice'));
  });
});
