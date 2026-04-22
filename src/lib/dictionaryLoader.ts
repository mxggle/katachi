import { WordEntry } from './distractorEngine';
import type { Language } from './i18n';
import { getWordDisplayText } from './displayText';
import baseData from '../../dictionary-base.json';
import enMeanings from '../../dictionary-en.json';
import zhMeanings from '../../dictionary-zh.json';

const meaningMaps: Record<Language, Record<string, string>> = {
  en: enMeanings as Record<string, string>,
  zh: zhMeanings as Record<string, string>,
};

export function loadDictionary(language: Language): WordEntry[] {
  const meanings = meaningMaps[language] ?? meaningMaps.en;
  return (baseData as { words: Omit<WordEntry, 'meaning'>[] }).words.map((word) => ({
    ...word,
    meaning: meanings[word.id] ?? getWordDisplayText(word),
  }));
}
