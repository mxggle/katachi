import type { SessionConfig } from '@/lib/store';

const WORD_TYPE_SUMMARY: Record<SessionConfig['wordTypes'][number], string> = {
  verb: 'verbs',
  'i-adj': 'i-adjectives',
  'na-adj': 'na-adjectives',
};

const MODE_SUMMARY: Record<SessionConfig['mode'], string> = {
  choice: 'multiple choice',
  input: 'typing',
};

export function buildSetupSummary(config: SessionConfig) {
  const levels = config.levels.join(', ');
  const wordTypes = config.wordTypes.map((wordType) => WORD_TYPE_SUMMARY[wordType]).join(', ');
  const formCount = `${config.forms.length} form${config.forms.length === 1 ? '' : 's'}`;
  const mode = MODE_SUMMARY[config.mode];

  return `${levels} • ${wordTypes} • ${formCount} • ${mode} • ${config.questionCount} questions`;
}

export function getSetupHeading(totalAnswered: number) {
  return totalAnswered > 0 ? 'Resume with your last setup.' : 'Start a focused practice set.';
}

export function getSetupDescription(totalAnswered: number) {
  return totalAnswered > 0
    ? 'Start immediately or adjust the session before you jump back in.'
    : 'Pick what to practice and start in a few seconds.';
}

export function getProgressSummary(totalAnswered: number, totalCorrect: number, dailyStreak: number) {
  if (totalAnswered === 0) {
    return [];
  }

  const accuracy = Math.round((totalCorrect / totalAnswered) * 100);

  return [
    { label: 'Answered', value: String(totalAnswered) },
    { label: 'Accuracy', value: `${accuracy}%` },
    { label: 'Streak', value: `${dailyStreak} day${dailyStreak === 1 ? '' : 's'}` },
  ];
}
