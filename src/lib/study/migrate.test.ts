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
      schemaVersion: 3,
    });
    expect(migrated.unitProgress).toEqual({});
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
});
