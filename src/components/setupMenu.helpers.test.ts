import { describe, expect, it } from 'vitest';
import {
  buildSetupSummary,
  getProgressSummary,
  getSetupDescription,
  getSetupHeading,
} from '@/components/setupMenu.helpers';
import type { SessionConfig } from '@/lib/store';

const config: SessionConfig = {
  levels: ['N5'],
  wordTypes: ['verb', 'i-adj'],
  forms: ['polite', 'te_form'],
  questionCount: 10,
  mode: 'choice',
};

describe('setup menu helpers', () => {
  it('builds a compact plain-language setup summary', () => {
    expect(buildSetupSummary(config, 'en')).toBe(
      'N5 • verbs, i-adjectives • 2 forms • multiple choice • 10 questions'
    );
  });

  it('returns first-session messaging for new users', () => {
    expect(getSetupHeading(0, 'en')).toBe('Start a focused practice set.');
    expect(getSetupDescription(0, 'en')).toBe('Pick what to practice and start in a few seconds.');
  });

  it('returns resume messaging and progress summary for returning users', () => {
    expect(getSetupHeading(12, 'en')).toBe('Resume with your last setup.');
    expect(getSetupDescription(12, 'en')).toBe(
      'Start immediately or adjust the session before you jump back in.'
    );
    expect(getProgressSummary(12, 9, 3, 'en')).toEqual([
      { label: 'Answered', value: '12' },
      { label: 'Accuracy', value: '75%' },
      { label: 'Streak', value: '3 days' },
    ]);
  });

  it('omits progress summary when no questions have been answered', () => {
    expect(getProgressSummary(0, 0, 0, 'en')).toEqual([]);
  });

  it('keeps the returning user heading action-oriented', () => {
    expect(getSetupHeading(5, 'en')).toBe('Resume with your last setup.');
    expect(getSetupDescription(5, 'en')).not.toContain('fine-tune');
  });
});
