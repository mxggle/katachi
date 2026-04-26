import type { ConjugationType, WordEntry, WordGroup } from '@/lib/distractorEngine';

/**
 * Pattern system for Japanese conjugation ability diagnosis.
 *
 * A "rule pattern" encodes the specific morphological rule that a question tests.
 * For example, te-form for godan verbs ending in く follows the く→いて rule,
 * which is distinct from the ぐ→いで rule or the む/ぶ/ぬ→んで rule.
 *
 * Tracking mastery at the pattern level lets us diagnose exactly which rules
 * a learner struggles with rather than which words they know.
 */

// ---------------------------------------------------------------------------
// Te-form pattern constants
// ---------------------------------------------------------------------------

export const TE_FORM_PATTERNS = [
  'te_form::ichidan',
  'te_form::godan-ku',
  'te_form::godan-gu',
  'te_form::godan-u-tsu-ru',
  'te_form::godan-mu-bu-nu',
  'te_form::godan-su',
  'te_form::iku-exception',
  'te_form::suru',
  'te_form::kuru',
] as const;

export type TeFormPattern = (typeof TE_FORM_PATTERNS)[number];

// Godan ending → te-form sub-pattern (kana endings)
const GODAN_ENDING_TO_TE_PATTERN: Record<string, string> = {
  'く': 'godan-ku',
  'ぐ': 'godan-gu',
  'う': 'godan-u-tsu-ru',
  'つ': 'godan-u-tsu-ru',
  'る': 'godan-u-tsu-ru',
  'む': 'godan-mu-bu-nu',
  'ぶ': 'godan-mu-bu-nu',
  'ぬ': 'godan-mu-bu-nu',
  'す': 'godan-su',
};

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * Derive the rule-pattern key for a given word + conjugation type.
 *
 * The pattern encodes `{conjugationType}::{groupVariant}` so that we can
 * track mastery per morphological rule rather than per vocabulary word.
 *
 * @example
 * getRulePattern(書く_word, 'te_form')    // → 'te_form::godan-ku'
 * getRulePattern(食べる_word, 'te_form')   // → 'te_form::ichidan'
 * getRulePattern(行く_word, 'te_form')     // → 'te_form::iku-exception'
 * getRulePattern(食べる_word, 'polite')    // → 'polite::ichidan'
 * getRulePattern(きれい_word, 'negative_plain') // → 'negative_plain::na-adj'
 */
export function getRulePattern(word: WordEntry, conjugationType: ConjugationType): string {
  const group = word.group;

  if (conjugationType === 'te_form') {
    return `te_form::${getTeFormVariant(word, group)}`;
  }

  // For non-te-form conjugations, group by word group directly
  return `${conjugationType}::${normalizeGroup(group)}`;
}

/**
 * Get all possible rule patterns for a given conjugation type.
 * Useful for discovering which patterns are undiagnosed.
 */
export function getAllPatternsForForm(conjugationType: ConjugationType, wordGroups: WordGroup[]): string[] {
  if (conjugationType === 'te_form') {
    // Filter te-form patterns based on which word groups are in scope
    const patterns: string[] = [];
    for (const group of wordGroups) {
      if (group === 'ichidan') patterns.push('te_form::ichidan');
      if (group === 'suru') patterns.push('te_form::suru');
      if (group === 'kuru') patterns.push('te_form::kuru');
      if (group === 'godan') {
        // All godan sub-patterns + iku exception
        patterns.push(
          'te_form::godan-ku',
          'te_form::godan-gu',
          'te_form::godan-u-tsu-ru',
          'te_form::godan-mu-bu-nu',
          'te_form::godan-su',
          'te_form::iku-exception',
        );
      }
      if (group === 'i-adj') patterns.push('te_form::i-adj');
      if (group === 'na-adj') patterns.push('te_form::na-adj');
    }
    return [...new Set(patterns)];
  }

  // For other conjugation types, one pattern per group
  return [...new Set(wordGroups.map((g) => `${conjugationType}::${normalizeGroup(g)}`))];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getTeFormVariant(word: WordEntry, group: WordGroup): string {
  // Exception: 行く (iku) is godan but uses って instead of いて
  if (isIkuException(word)) {
    return 'iku-exception';
  }

  switch (group) {
    case 'ichidan':
      return 'ichidan';
    case 'suru':
      return 'suru';
    case 'kuru':
      return 'kuru';
    case 'godan': {
      const lastKana = word.dictionary_form.kana.slice(-1);
      return GODAN_ENDING_TO_TE_PATTERN[lastKana] ?? 'godan-u-tsu-ru';
    }
    case 'i-adj':
      return 'i-adj';
    case 'na-adj':
      return 'na-adj';
    default:
      return normalizeGroup(group);
  }
}

function isIkuException(word: WordEntry): boolean {
  return (
    word.dictionary_form.kana === 'いく' ||
    word.id === 'iku' ||
    word.dictionary_form.kana === 'いく'
  );
}

function normalizeGroup(group: WordGroup): string {
  // suru/kuru stay as-is for pattern tracking (unlike the scheduler's meta-group)
  return group;
}
