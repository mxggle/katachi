import {
  CONJS_FOR_WORD_TYPE,
  ConjugationType,
  generateDistractors,
  WordEntry,
  WordType,
} from '@/lib/distractorEngine';
import { loadDictionary } from '@/lib/dictionaryLoader';
import type { SessionConfig } from '@/lib/store';
import { translations, type Language } from '@/lib/i18n';

export function buildPracticeSession(config: SessionConfig, language?: Language): { error: string } | { words: { word: WordEntry; type: ConjugationType; choices: string[] }[] } {
  const dict = translations[language ?? 'en'];
  const t = (key: keyof typeof dict): string => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const dictionaryData = { words: loadDictionary(language ?? 'en') };
  const availableWords = dictionaryData.words.filter(
    (word) => config.levels.includes(word.level as 'N5' | 'N4' | 'N3') && config.wordTypes.includes(word.word_type)
  );

  if (availableWords.length === 0) {
    return { error: t('noWordsMatch') };
  }

  const availableForms = new Set<ConjugationType>();
  for (const wordType of config.wordTypes) {
    for (const form of CONJS_FOR_WORD_TYPE[wordType]) {
      availableForms.add(form);
    }
  }

  const activeForms = config.forms.filter((form) => availableForms.has(form));
  if (activeForms.length === 0) {
    return { error: t('selectAtLeastOneForm') };
  }

  const sessionWords = [];
  for (let index = 0; index < config.questionCount; index += 1) {
    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    const validForms = activeForms.filter((form) =>
      CONJS_FOR_WORD_TYPE[word.word_type as WordType].includes(form)
    );

    if (validForms.length === 0) {
      continue;
    }

    const type = validForms[Math.floor(Math.random() * validForms.length)];
    const choices =
      config.mode === 'choice'
        ? [word.conjugations[type], ...generateDistractors(word, type)].sort(() => Math.random() - 0.5)
        : [];

    sessionWords.push({ word, type, choices });
  }

  if (sessionWords.length === 0) {
    return {
      error: t('couldNotBuildSession'),
    };
  }

  return { words: sessionWords };
}
