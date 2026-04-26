import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getCompletionWeaknessRows } from './PracticeSession';

const practiceSessionSource = readFileSync(path.resolve(__dirname, './PracticeSession.tsx'), 'utf8');

describe('practice session completion flow', () => {
  it('does not route every non-daily session into the final daily ending state', () => {
    expect(practiceSessionSource).not.toContain("showTodayEnd || activeSession.practiceType !== 'daily'");
  });

  it('has neutral completion copy for free and standalone weakness practice', () => {
    expect(practiceSessionSource).toContain("t('freePracticeComplete')");
    expect(practiceSessionSource).toContain("t('freePracticeCompleteDescription')");
    expect(practiceSessionSource).toContain("t('weaknessPracticeComplete')");
    expect(practiceSessionSource).toContain("t('weaknessPracticeCompleteDescription')");
  });

  it('only offers a weakness follow-up when the completed daily session had a wrong answer', () => {
    expect(practiceSessionSource).toContain('const hasWeakness = Boolean(firstWrongItem)');
    expect(practiceSessionSource).toContain('{hasWeakness ? (');
    expect(practiceSessionSource).toContain("t('noWeaknessToday')");
  });

  it('offers a completed daily goal state before the final today-ended state', () => {
    expect(practiceSessionSource).toContain("t('todayGoalComplete')");
    expect(practiceSessionSource).toContain("t('completedPromptCount')");
    expect(practiceSessionSource).toContain("t('weaknessFoundPrefix')");
    expect(practiceSessionSource).toContain("t('suggestWeaknessDrill')");
    expect(practiceSessionSource).toContain("t('drillFiveQuestions')");
    expect(practiceSessionSource).toContain("t('todayEndsHere')");
    expect(practiceSessionSource).toContain("t('todayHereIsGood')");
    expect(practiceSessionSource).toContain("t('tomorrowPreview')");
  });

  it('shows each weak session item once when retries duplicated it', () => {
    const weakItem = {
      unitKey: 'kaiko::negative_plain::choice',
      type: 'negative_plain',
      word: {
        dictionary_form: { kanji: '賢い' },
        conjugations: { negative_plain: 'かしこくないです' },
      },
    };

    const rows = getCompletionWeaknessRows([
      weakItem,
      { ...weakItem },
      {
        unitKey: 'taberu::negative_plain::choice',
        type: 'negative_plain',
        word: {
          dictionary_form: { kanji: '食べる' },
          conjugations: { negative_plain: '食べない' },
        },
      },
    ], 'negative_plain');

    expect(rows).toHaveLength(2);
    expect(rows.map((item) => item.unitKey)).toEqual([
      'kaiko::negative_plain::choice',
      'taberu::negative_plain::choice',
    ]);
  });
});
