import { describe, expect, it } from 'vitest';
import { migratePersistedStudyState } from '@/lib/study/migrate';

describe('migratePersistedStudyState', () => {
  it('maps legacy persisted store data into the study domain shape', () => {
    const migrated = migratePersistedStudyState({
      dailyStreak: 4,
      lastPracticeDate: '2026-04-20',
      progress: { totalAnswered: 42, totalCorrect: 30 },
      language: 'zh',
      config: {
        levels: ['N4'],
        wordTypes: ['verb'],
        forms: ['te_form'],
        questionCount: 20,
        mode: 'input',
      },
    });

    expect(migrated.preferences.language).toBe('zh');
    expect(migrated.preferences.defaultSessionConfig).toEqual({
      levels: ['N4'],
      wordTypes: ['verb'],
      forms: ['te_form'],
      questionCount: 20,
      mode: 'input',
    });
    expect(migrated.learnerSummary).toMatchObject({
      dailyStreak: 4,
      lastPracticeDate: '2026-04-20',
      totalAnswered: 42,
      totalCorrect: 30,
      schemaVersion: 5,
    });
    expect(migrated.unitProgress).toEqual({});
    expect(migrated.formStats).toEqual({});
    expect(migrated.patternStats).toEqual({});
    expect(migrated.wordStats).toEqual({});
    expect(migrated.sessionHistory).toEqual([]);
    expect(migrated.attemptHistory).toEqual([]);
  });

  it('supports legacy typo fields from the older local store shape', () => {
    const migrated = migratePersistedStudyState({
      lastLoginDate: '2026-04-21',
      globalStats: { totalAnswered: 12, totalCorrect: 8 },
      config: {
        leves: ['N3'],
        categories: ['polite'],
        batchSize: 30,
        mode: 'choice',
      },
    });

    expect(migrated.preferences.defaultSessionConfig).toMatchObject({
      levels: ['N3'],
      forms: ['polite'],
      questionCount: 30,
      mode: 'choice',
    });
    expect(migrated.learnerSummary.lastPracticeDate).toBe('2026-04-21');
    expect(migrated.learnerSummary.totalAnswered).toBe(12);
    expect(migrated.learnerSummary.totalCorrect).toBe(8);
  });

  it('rebuilds formStats and wordStats from unitProgress during v3→v4 migration', () => {
    const migrated = migratePersistedStudyState({
      language: 'en',
      progress: { totalAnswered: 20, totalCorrect: 14 },
      unitProgress: {
        'taberu::te_form::choice': {
          wordId: 'taberu',
          conjugationType: 'te_form',
          mode: 'choice',
          wordType: 'verb',
          seenCount: 10,
          correctCount: 8,
          wrongCount: 2,
          consecutiveCorrect: 3,
          consecutiveWrong: 0,
          lastSeenAt: '2026-04-22T12:00:00.000Z',
          lastCorrectAt: '2026-04-22T12:00:00.000Z',
          lastWrongAt: '2026-04-20T12:00:00.000Z',
          sameDayExposureCount: 1,
          sameSessionRetryCount: 0,
          status: 'graduated',
          interval: 21,
          ease: 2.8,
          nextReviewDate: '2026-05-13T12:00:00.000Z',
        },
        'kaku::te_form::choice': {
          wordId: 'kaku',
          conjugationType: 'te_form',
          mode: 'choice',
          wordType: 'verb',
          seenCount: 5,
          correctCount: 2,
          wrongCount: 3,
          consecutiveCorrect: 0,
          consecutiveWrong: 1,
          lastSeenAt: '2026-04-22T11:00:00.000Z',
          lastCorrectAt: '2026-04-21T11:00:00.000Z',
          lastWrongAt: '2026-04-22T11:00:00.000Z',
          sameDayExposureCount: 1,
          sameSessionRetryCount: 0,
          status: 'learning',
          interval: 0,
          ease: 2.3,
          nextReviewDate: '2026-04-22T11:10:00.000Z',
        },
        'taberu::polite::choice': {
          wordId: 'taberu',
          conjugationType: 'polite',
          mode: 'choice',
          wordType: 'verb',
          seenCount: 5,
          correctCount: 5,
          wrongCount: 0,
          consecutiveCorrect: 5,
          consecutiveWrong: 0,
          lastSeenAt: '2026-04-22T10:00:00.000Z',
          lastCorrectAt: '2026-04-22T10:00:00.000Z',
          lastWrongAt: null,
          sameDayExposureCount: 1,
          sameSessionRetryCount: 0,
          status: 'graduated',
          interval: 21,
          ease: 3.0,
          nextReviewDate: '2026-05-13T10:00:00.000Z',
        },
      },
    });

    // FormStats should be aggregated by conjugationType
    expect(migrated.formStats['te_form']).toBeDefined();
    expect(migrated.formStats['te_form'].totalAttempts).toBe(15); // 10 + 5
    expect(migrated.formStats['te_form'].correctAttempts).toBe(10); // 8 + 2
    expect(migrated.formStats['te_form'].accuracy).toBeCloseTo(10 / 15);

    expect(migrated.formStats['polite']).toBeDefined();
    expect(migrated.formStats['polite'].totalAttempts).toBe(5);
    expect(migrated.formStats['polite'].correctAttempts).toBe(5);
    expect(migrated.formStats['polite'].masteryLevel).toBe('mastered');

    // WordStats should be aggregated by wordId
    expect(migrated.wordStats['taberu']).toBeDefined();
    expect(migrated.wordStats['taberu'].totalAttempts).toBe(15); // 10 + 5
    expect(migrated.wordStats['taberu'].correctAttempts).toBe(13); // 8 + 5

    expect(migrated.wordStats['kaku']).toBeDefined();
    expect(migrated.wordStats['kaku'].totalAttempts).toBe(5);
    expect(migrated.wordStats['kaku'].correctAttempts).toBe(2);

    // Schema version should be 4
    expect(migrated.learnerSummary.schemaVersion).toBe(5);
  });

  it('handles empty state migration gracefully', () => {
    const migrated = migratePersistedStudyState(undefined);
    expect(migrated.formStats).toEqual({});
    expect(migrated.patternStats).toEqual({});
    expect(migrated.wordStats).toEqual({});
    expect(migrated.learnerSummary.schemaVersion).toBe(5);
  });
});
