import { WordEntry } from './distractorEngine';
import type { Language } from './i18n';
import { getWordDisplayText } from './displayText';
import baseData from '../data/dictionaries/base.json';
import enMeanings from '../data/dictionaries/en.json';
import zhMeanings from '../data/dictionaries/zh.json';
import viMeanings from '../data/dictionaries/vi.json';

const meaningMaps: Record<Language, Record<string, string>> = {
  en: enMeanings as Record<string, string>,
  zh: zhMeanings as Record<string, string>,
  vi: viMeanings as Record<string, string>,
};

export function loadDictionary(language: Language): WordEntry[] {
  const meanings = meaningMaps[language] ?? meaningMaps.en;
  return (baseData as { words: Omit<WordEntry, 'meaning'>[] }).words.map((word) => ({
    ...word,
    meaning: meanings[word.id] ?? enMeanings[word.id as keyof typeof enMeanings] ?? getWordDisplayText(word),
  }));
}
