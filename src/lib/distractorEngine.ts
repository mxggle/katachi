export type WordGroup = 'godan' | 'ichidan' | 'suru' | 'kuru' | 'i-adj' | 'na-adj';
export type WordType = 'verb' | 'i-adj' | 'na-adj';
export type ConjugationType =
  | 'polite' | 'negative_plain' | 'negative_polite'
  | 'past_plain' | 'past_polite' | 'past_negative_plain' | 'past_negative_polite'
  | 'te_form' | 'potential' | 'passive' | 'causative' | 'causative_passive'
  | 'imperative' | 'volitional' | 'conditional_ba' | 'conditional_tara';

/** Conjugation types that only apply to verbs */
export const VERB_ONLY_CONJS: ConjugationType[] = [
  'potential', 'passive', 'causative', 'causative_passive', 'imperative', 'volitional'
];

/** Conjugation types shared by all word types */
export const SHARED_CONJS: ConjugationType[] = [
  'polite', 'negative_plain', 'negative_polite',
  'past_plain', 'past_polite', 'past_negative_plain', 'past_negative_polite',
  'te_form', 'conditional_ba', 'conditional_tara'
];

/** Map word type to its valid conjugation types */
export const CONJS_FOR_WORD_TYPE: Record<WordType, ConjugationType[]> = {
  'verb': [...SHARED_CONJS, ...VERB_ONLY_CONJS],
  'i-adj': [...SHARED_CONJS],
  'na-adj': [...SHARED_CONJS],
};

export interface WordEntry {
  id: string;
  level: 'N5' | 'N4' | 'N3';
  group: WordGroup;
  word_type: WordType;
  dictionary_form: {
    kanji: string;
    kana: string;
    romaji: string;
  };
  meaning: string;
  conjugations: Record<string, string>;
  jlpt?: string;
  is_common?: boolean;
}

/**
 * Distractor Engine Logic
 * Generates 3 plausible incorrect answers based on Japanese grammar rules beginners often confuse.
 */
export function generateDistractors(word: WordEntry, type: ConjugationType): string[] {
  const correct = word.conjugations[type];
  const distractors: Set<string> = new Set();

  // Rule A: Verb Group Confusion (Godan vs Ichidan)
  if (word.group === 'godan' && word.dictionary_form.kana.endsWith('る')) {
    // Treat Godan as Ichidan (The "Ru" Trap)
    const stem = word.dictionary_form.kana.slice(0, -1);
    const fake = applyIchidanRule(stem, type);
    if (fake && fake !== correct) distractors.add(fake);
  } else if (word.group === 'ichidan') {
    // Treat Ichidan as Godan
    const stem = word.dictionary_form.kana.slice(0, -1);
    const fake = applyGodanRule(stem, 'る', type);
    if (fake && fake !== correct) distractors.add(fake);
  }

  // Rule B: Te-Form Sound Swaps
  if (type === 'te_form' && word.group === 'godan') {
    const stem = word.dictionary_form.kana.slice(0, -1);

    // Swap common connectors
    const swaps = ['って', 'んで', 'いて', 'いで', 'して'];
    swaps.forEach(s => {
      const fake = stem + s;
      if (fake !== correct) distractors.add(fake);
    });
  }

  // Rule C: Adjective Identity Crisis
  if (word.group === 'i-adj') {
    // Apply Na-Adj rules to I-Adj
    const base = word.dictionary_form.kana;
    if (type === 'negative_plain') distractors.add(base + 'じゃない');
    if (type === 'past_plain') distractors.add(base + 'だった');
  } else if (word.group === 'na-adj') {
    // Apply I-Adj rules to Na-Adj
    const stem = word.dictionary_form.kana;
    if (type === 'negative_plain') distractors.add(stem + 'くない');
    if (type === 'past_plain') distractors.add(stem + 'かった');
  }

  // Rule D: Naive Concatenation (Dictionary + Ending)
  const dicForm = word.dictionary_form.kana;
  if (type === 'polite') distractors.add(dicForm + 'ます');
  if (type === 'negative_plain') distractors.add(dicForm + 'ない');
  if (type === 'past_plain') distractors.add(dicForm + 'た');
  if (type === 'te_form') distractors.add(dicForm + 'て');

  // Rule E: Regularizing Exceptions
  if (word.dictionary_form.kana === 'いく' && type === 'te_form') {
    distractors.add('いいて'); // Standard 'ku' rule instead of 'itte'
  }

  // Fallback: Random other correct conjugations
  const otherForms = Object.keys(word.conjugations) as ConjugationType[];
  for (const form of otherForms) {
    if (distractors.size >= 10) break;
    const val = word.conjugations[form];
    if (val !== correct) distractors.add(val);
  }

  // Convert to array, filter out any accidental correct answers, and pick 3
  const finalArray = Array.from(distractors)
    .filter(d => d !== correct)
    .sort(() => Math.random() - 0.5);

  return finalArray.slice(0, 3);
}

// Internal Mock Rules for Rule A
function applyIchidanRule(stem: string, type: ConjugationType): string | null {
  const endings: Partial<Record<ConjugationType, string>> = {
    polite: 'ます',
    negative_plain: 'ない',
    te_form: 'て',
    past_plain: 'た',
    volitional: 'よう'
  };
  return endings[type] ? stem + endings[type] : null;
}

function applyGodanRule(stem: string, lastChar: string, type: ConjugationType): string | null {
  // Simplified godan mapping for distractors
  if (type === 'negative_plain') return stem + 'ら' + 'ない'; // Treat as 'ru' godan
  if (type === 'polite') return stem + 'り' + 'ます';
  if (type === 'te_form') return stem + 'って';
  return null;
}
