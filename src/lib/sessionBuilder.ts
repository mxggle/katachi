import dictionaryData from '../../dictionary.json';
import {
  CONJS_FOR_WORD_TYPE,
  ConjugationType,
  generateDistractors,
  WordEntry,
  WordType,
} from '@/lib/distractorEngine';
import type { SessionConfig } from '@/lib/store';

export function buildPracticeSession(config: SessionConfig) {
  const availableWords = (dictionaryData as { words: WordEntry[] }).words.filter(
    (word) => config.levels.includes(word.level as 'N5' | 'N4') && config.wordTypes.includes(word.word_type)
  );

  if (availableWords.length === 0) {
    return { error: 'No words match this setup. Try another level or word type.' } as const;
  }

  const availableForms = new Set<ConjugationType>();
  for (const wordType of config.wordTypes) {
    for (const form of CONJS_FOR_WORD_TYPE[wordType]) {
      availableForms.add(form);
    }
  }

  const activeForms = config.forms.filter((form) => availableForms.has(form));
  if (activeForms.length === 0) {
    return { error: 'Select at least one conjugation form.' } as const;
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
      error: 'Could not build a session from this combination. Adjust the setup and try again.',
    } as const;
  }

  return { words: sessionWords } as const;
}
