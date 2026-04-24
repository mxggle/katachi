import type { SessionConfig } from '@/lib/store';
import type { Language } from '@/lib/i18n';
import { getPracticeModeLabel, getWordTypeLabel } from '@/lib/displayText';
import { translations } from '@/lib/i18n';

export function buildSetupSummary(config: SessionConfig, language: Language) {
  const t = translations[language];
  const PRACTICE_TYPE_SUMMARY: Record<SessionConfig['practiceType'], string> = {
    daily: t.dailyPractice,
    weakness: t.weaknessDrill,
    free: t.freePractice,
  };
  const levels = config.levels.join(', ');
  const wordTypes = config.wordTypes.map((wordType) => getWordTypeLabel(wordType, language)).join(', ');
  
  const formCount = language === 'zh'
    ? `${config.forms.length}种形式`
    : (language === 'ne' 
        ? `${config.forms.length} फारमहरू`
        : `${config.forms.length} form${config.forms.length === 1 ? '' : 's'}`);
        
  const practiceType = PRACTICE_TYPE_SUMMARY[config.practiceType];
  const mode = getPracticeModeLabel(config.mode, language);
  const questionsLabel = t.questions;

  return `${practiceType} • ${levels} • ${wordTypes} • ${formCount} • ${mode} • ${config.questionCount} ${questionsLabel}`;
}

export function getSetupHeading(totalAnswered: number, language: Language) {
  const t = translations[language];
  return totalAnswered > 0 ? t.resumeSetup : t.startSetup;
}

export function getSetupDescription(totalAnswered: number, language: Language) {
  const t = translations[language];
  return totalAnswered > 0 ? t.resumeDescription : t.startDescription;
}

export function getProgressSummary(totalAnswered: number, totalCorrect: number, dailyStreak: number, language: Language) {
  if (totalAnswered === 0) {
    return [];
  }

  const t = translations[language];
  const accuracy = Math.round((totalCorrect / totalAnswered) * 100);
  const dayLabel = dailyStreak === 1 ? t.day : t.days;

  return [
    { label: t.answered, value: String(totalAnswered) },
    { label: t.accuracy, value: `${accuracy}%` },
    { label: t.streak, value: `${dailyStreak} ${dayLabel}` },
  ];
}
