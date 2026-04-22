import type { SessionConfig } from '@/lib/store';
import type { Language } from '@/lib/i18n';
import { getPracticeModeLabel, getWordTypeLabel } from '@/lib/displayText';

export function buildSetupSummary(config: SessionConfig, language: Language) {
  const PRACTICE_TYPE_SUMMARY: Record<SessionConfig['practiceType'], string> = {
    daily: language === 'zh' ? '每日练习' : 'Daily practice',
    weakness: language === 'zh' ? '弱点训练' : 'Weakness drill',
    free: language === 'zh' ? '自由练习' : 'Free practice',
  };
  const levels = config.levels.join(', ');
  const wordTypes = config.wordTypes.map((wordType) => getWordTypeLabel(wordType, language)).join(', ');
  const formCount = language === 'zh'
    ? `${config.forms.length}种形式`
    : `${config.forms.length} form${config.forms.length === 1 ? '' : 's'}`;
  const practiceType = PRACTICE_TYPE_SUMMARY[config.practiceType];
  const mode = getPracticeModeLabel(config.mode, language);
  const questionsLabel = language === 'zh' ? '题' : 'questions';

  return `${practiceType} • ${levels} • ${wordTypes} • ${formCount} • ${mode} • ${config.questionCount} ${questionsLabel}`;
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
