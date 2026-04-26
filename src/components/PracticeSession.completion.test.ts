import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const practiceSessionSource = readFileSync(path.resolve(__dirname, './PracticeSession.tsx'), 'utf8');

describe('practice session completion flow', () => {
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
});
