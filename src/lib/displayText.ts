import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import type { ConjugationType, WordEntry, WordType } from '@/lib/distractorEngine';
import type { PracticeMode, StudySessionConfig } from '@/lib/study/types';

export function getWordDisplayText(word: Pick<WordEntry, 'dictionary_form' | 'id'>): string {
  return (
    word.dictionary_form.kanji ||
    word.dictionary_form.kana ||
    word.dictionary_form.romaji ||
    'Unknown word'
  );
}

export function getWordTypeLabel(wordType: WordType, language: Language): string {
  const t = translations[language];
  const labels: Record<WordType, string> = {
    verb: t.verbs,
    'i-adj': t.iAdjectives,
    'na-adj': t.naAdjectives,
  };

  return labels[wordType];
}

export function getPracticeModeLabel(mode: StudySessionConfig['mode'], language: Language): string {
  const t = translations[language];
  const labels: Record<PracticeMode, string> = {
    choice: t.multipleChoice,
    input: t.typing,
  };

  return labels[mode];
}

export function getConjugationLabel(
  type: ConjugationType,
  wordType: WordType,
  language: Language
): string {
  const dict = translations[language];

  if (wordType === 'verb') {
    return dict.verb_form[type] ?? (language === 'zh' ? '变形练习' : 'Conjugation practice');
  }

  return (dict.adj_form as Record<string, string>)[type] ?? (language === 'zh' ? '变形练习' : 'Conjugation practice');
}

export function getWeakPointLabel(
  word: Pick<WordEntry, 'dictionary_form' | 'id' | 'word_type'>,
  type: ConjugationType,
  language: Language
): string {
  return `${getWordDisplayText(word)} · ${getConjugationLabel(type, word.word_type, language)}`;
}
