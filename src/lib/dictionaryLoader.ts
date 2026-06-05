import { WordEntry } from './distractorEngine';
import type { Language } from './i18n';
import { getWordDisplayText } from './displayText';
import baseData from '../data/dictionaries/base.json';
import enMeanings from '../data/dictionaries/en.json';
import zhMeanings from '../data/dictionaries/zh.json';
import viMeanings from '../data/dictionaries/vi.json';
import neMeanings from '../data/dictionaries/ne.json';
import myMeanings from '../data/dictionaries/my.json';
import koMeanings from '../data/dictionaries/ko.json';

const meaningMaps: Record<Language, Record<string, string>> = {
  en: enMeanings as Record<string, string>,
  zh: zhMeanings as Record<string, string>,
  vi: viMeanings as Record<string, string>,
  ne: neMeanings as Record<string, string>,
  my: myMeanings as Record<string, string>,
  ko: koMeanings as Record<string, string>,
};

const dictionaryCache = new Map<Language, WordEntry[]>();

export function loadDictionary(language: Language): WordEntry[] {
  const cached = dictionaryCache.get(language);
  if (cached) {
    return cached;
  }

  const meanings = meaningMaps[language] ?? meaningMaps.en;
  const words = (baseData as { words: Omit<WordEntry, 'meaning'>[] }).words.map((word) => ({
    ...word,
    meaning: meanings[word.id] ?? enMeanings[word.id as keyof typeof enMeanings] ?? getWordDisplayText(word),
  }));

  dictionaryCache.set(language, words);
  return words;
}
