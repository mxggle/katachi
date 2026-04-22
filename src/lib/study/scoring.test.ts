import { describe, expect, it } from 'vitest';
import { calculateWeaknessScore } from '@/lib/study/scoring';
import type { UnitProgress } from '@/lib/study/types';

function buildProgress(overrides: Partial<UnitProgress> = {}): UnitProgress {
  return {
    wordId: 'iku',
    conjugationType: 'te_form',
    mode: 'choice',
    wordType: 'verb',
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
    ...overrides,
  };
}

describe('calculateWeaknessScore', () => {
  it('boosts recently and repeatedly wrong items above mostly-correct items', () => {
    const now = '2026-04-22T12:00:00.000Z';

    const weak = calculateWeaknessScore(
      buildProgress({
        seenCount: 6,
        correctCount: 1,
        wrongCount: 5,
        consecutiveWrong: 3,
        lastWrongAt: '2026-04-22T11:55:00.000Z',
        lastSeenAt: '2026-04-22T11:55:00.000Z',
      }),
      now
    );

    const strong = calculateWeaknessScore(
      buildProgress({
        seenCount: 6,
        correctCount: 5,
        wrongCount: 1,
        consecutiveCorrect: 3,
        lastCorrectAt: '2026-04-22T11:55:00.000Z',
        lastSeenAt: '2026-04-22T11:55:00.000Z',
      }),
      now
    );

    expect(weak).toBeGreaterThan(strong);
  });

  it('treats typing mistakes as harder than multiple-choice mistakes', () => {
    const now = '2026-04-22T12:00:00.000Z';

    const choiceScore = calculateWeaknessScore(
      buildProgress({
        mode: 'choice',
        seenCount: 2,
        wrongCount: 1,
        lastWrongAt: '2026-04-22T11:00:00.000Z',
      }),
      now
    );

    const inputScore = calculateWeaknessScore(
      buildProgress({
        mode: 'input',
        seenCount: 2,
        wrongCount: 1,
        lastWrongAt: '2026-04-22T11:00:00.000Z',
      }),
      now
    );

    expect(inputScore).toBeGreaterThan(choiceScore);
  });
});
