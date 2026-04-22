import type { SessionConfig } from '@/lib/store';
import type { Language } from '@/lib/i18n';

export function buildSetupSummary(config: SessionConfig, language: Language) {
  const WORD_TYPE_SUMMARY: Record<SessionConfig['wordTypes'][number], string> = {
    verb: language === 'zh' ? '动词' : 'verbs',
    'i-adj': language === 'zh' ? 'い形容词' : 'i-adjectives',
    'na-adj': language === 'zh' ? 'な形容词' : 'na-adjectives',
  };

  const MODE_SUMMARY: Record<SessionConfig['mode'], string> = {
    choice: language === 'zh' ? '选择题' : 'multiple choice',
    input: language === 'zh' ? '输入题' : 'typing',
  };

  const levels = config.levels.join(', ');
  const wordTypes = config.wordTypes.map((wordType) => WORD_TYPE_SUMMARY[wordType]).join(', ');
  const formCount = language === 'zh'
    ? `${config.forms.length}种形式`
    : `${config.forms.length} form${config.forms.length === 1 ? '' : 's'}`;
  const mode = MODE_SUMMARY[config.mode];
  const questionsLabel = language === 'zh' ? '题' : 'questions';

  return `${levels} • ${wordTypes} • ${formCount} • ${mode} • ${config.questionCount} ${questionsLabel}`;
}

export function getSetupHeading(totalAnswered: number, language: Language) {
  return totalAnswered > 0
    ? (language === 'zh' ? '继续使用上次的设置。' : 'Resume with your last setup.')
    : (language === 'zh' ? '开始一组专注的练习。' : 'Start a focused practice set.');
}

export function getSetupDescription(totalAnswered: number, language: Language) {
  return totalAnswered > 0
    ? (language === 'zh' ? '立即开始或在重新开始前调整练习设置。' : 'Start immediately or adjust the session before you jump back in.')
    : (language === 'zh' ? '选择要练习的内容，几秒钟内即可开始。' : 'Pick what to practice and start in a few seconds.');
}

export function getProgressSummary(totalAnswered: number, totalCorrect: number, dailyStreak: number, language: Language) {
  if (totalAnswered === 0) {
    return [];
  }

  const accuracy = Math.round((totalCorrect / totalAnswered) * 100);
  const dayLabel = language === 'zh' ? '天' : `day${dailyStreak === 1 ? '' : 's'}`;

  return [
    { label: language === 'zh' ? '已答题' : 'Answered', value: String(totalAnswered) },
    { label: language === 'zh' ? '正确率' : 'Accuracy', value: `${accuracy}%` },
    { label: language === 'zh' ? '连续天数' : 'Streak', value: `${dailyStreak} ${dayLabel}` },
  ];
}
