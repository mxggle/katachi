import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import type { ConjugationType, WordEntry, WordType } from '@/lib/distractorEngine';
import type { SessionConfig } from '@/lib/store';

export function getWordDisplayText(word: Pick<WordEntry, 'dictionary_form' | 'id'>): string {
  return (
    word.dictionary_form.kanji ||
    word.dictionary_form.kana ||
    word.dictionary_form.romaji ||
    'Unknown word'
  );
}

export function getWordTypeLabel(wordType: WordType, language: Language): string {
  const labels: Record<WordType, string> = {
    verb: language === 'zh' ? '动词' : 'verbs',
    'i-adj': language === 'zh' ? 'い形容词' : 'i-adjectives',
    'na-adj': language === 'zh' ? 'な形容词' : 'na-adjectives',
  };

  return labels[wordType];
}

export function getPracticeModeLabel(mode: SessionConfig['mode'], language: Language): string {
  const labels: Record<SessionConfig['mode'], string> = {
    choice: language === 'zh' ? '选择题' : 'multiple choice',
    input: language === 'zh' ? '输入题' : 'typing',
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
