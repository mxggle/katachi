/**
 * Comprehensive dictionary data consistency and correctness tests.
 *
 * Validates:
 * 1. Schema integrity — required fields, valid enum values
 * 2. Formation existence — each word has exactly the formations it should
 * 3. Formation correctness — every formation matches Japanese grammar rules
 * 4. Cross-file alignment — base.json and dictionary.json stay in sync
 * 5. Localization completeness — all translation files cover every word ID
 */

import { describe, expect, it } from 'vitest';
import baseData from './base.json';
import dictData from './dictionary.json';
import enMeanings from './en.json';
import zhMeanings from './zh.json';
import viMeanings from './vi.json';
import neMeanings from './ne.json';
import myMeanings from './my.json';
import koMeanings from './ko.json';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

interface Word {
  id: string;
  level: string;
  group: string;
  word_type: string;
  dictionary_form: {
    kanji: string;
    kana: string;
    romaji: string;
  };
  conjugations: Record<string, string>;
  meaning?: string;
}

// ═══════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════

const VERB_FORMATIONS = [
  'polite', 'negative_plain', 'negative_polite',
  'past_plain', 'past_polite',
  'past_negative_plain', 'past_negative_polite',
  'te_form',
  'potential', 'passive', 'causative', 'causative_passive',
  'imperative', 'volitional',
  'conditional_ba', 'conditional_tara',
] as const;

const ADJ_FORMATIONS = [
  'polite', 'negative_plain', 'negative_polite',
  'past_plain', 'past_polite',
  'past_negative_plain', 'past_negative_polite',
  'te_form',
  'conditional_ba', 'conditional_tara',
] as const;

const VALID_WORD_TYPES = new Set(['verb', 'i-adj', 'na-adj']);
const VALID_LEVELS = new Set(['N5', 'N4', 'N3']);
const VALID_VERB_GROUPS = new Set(['godan', 'ichidan', 'suru', 'kuru']);
const VALID_ADJ_GROUPS = new Set(['i-adj', 'na-adj']);
const VALID_GROUPS = new Set([...VALID_VERB_GROUPS, ...VALID_ADJ_GROUPS]);

// Category A: stative/potential-like — missing potential, passive, causative,
// causative_passive, imperative, volitional
const CATEGORY_A_IDS = new Set([
  'v_aru', 'v_wakaru', 'v_dekiru', 'v_umareru', 'v_mieru', 'v_kikoeru',
]);
const CATEGORY_A_FORBIDDEN = new Set([
  'potential', 'passive', 'causative', 'causative_passive', 'imperative', 'volitional',
]);

// Category B: intransitive/spontaneous — missing imperative, volitional
const CATEGORY_B_IDS = new Set([
  'v_shiru', 'v_furu', 'v_kakaru', 'v_chigau', 'v_komaru',
  'v_hajimaru', 'v_shimaru', 'v_saku', 'v_kumoru', 'v_sasu',
  'v_kawaru', 'v_maniau', 'v_yakunitatsu', 'v_mitsukaru',
  'v_kimaru', 'v_nakunaru', 'v_naoru', 'v_futoru', 'v_kawaku',
  'v_kotonaru',
  'v_tsukareru', 'v_ochiru', 'v_kowareru', 'v_taoreru',
  'v_okureru', 'v_tariru', 'v_nureru', 'v_yaseru',
  'v_wareru', 'v_oreru', 'v_yakeru', 'v_yogoreru', 'v_moeru',
]);
const CATEGORY_B_FORBIDDEN = new Set(['imperative', 'volitional']);

const HONORIFIC_ARU_IDS = new Set([
  'v_nasaru', 'v_kudasaru', 'v_ossharu', 'v_irassharu',
]);

// ═══════════════════════════════════════════════════════════════════
// Conjugation Engine
// ═══════════════════════════════════════════════════════════════════

const GODAN_MAP: Record<string, Record<string, string>> = {
  'う': { a: 'わ', i: 'い', e: 'え', o: 'お' },
  'く': { a: 'か', i: 'き', e: 'け', o: 'こ' },
  'ぐ': { a: 'が', i: 'ぎ', e: 'げ', o: 'ご' },
  'す': { a: 'さ', i: 'し', e: 'せ', o: 'そ' },
  'つ': { a: 'た', i: 'ち', e: 'て', o: 'と' },
  'ぬ': { a: 'な', i: 'に', e: 'ね', o: 'の' },
  'ぶ': { a: 'ば', i: 'び', e: 'べ', o: 'ぼ' },
  'む': { a: 'ま', i: 'み', e: 'め', o: 'も' },
  'る': { a: 'ら', i: 'り', e: 'れ', o: 'ろ' },
};

const GODAN_TE_TA: Record<string, [string, string]> = {
  'う': ['って', 'った'],
  'つ': ['って', 'った'],
  'る': ['って', 'った'],
  'ぬ': ['んで', 'んだ'],
  'ぶ': ['んで', 'んだ'],
  'む': ['んで', 'んだ'],
  'く': ['いて', 'いた'],
  'ぐ': ['いで', 'いだ'],
  'す': ['して', 'した'],
};

function conjugateGodan(kana: string): Record<string, string> {
  const stem = kana.slice(0, -1);
  const ending = kana.slice(-1);
  const rows = GODAN_MAP[ending];
  let [teSuf, taSuf] = GODAN_TE_TA[ending];

  if (kana === 'いく' || kana === 'ゆく') {
    teSuf = 'って';
    taSuf = 'った';
  }

  const pastPlain = stem + taSuf;

  const conj: Record<string, string> = {
    polite:               stem + rows.i + 'ます',
    negative_plain:       stem + rows.a + 'ない',
    negative_polite:      stem + rows.i + 'ません',
    past_plain:           pastPlain,
    past_polite:          stem + rows.i + 'ました',
    past_negative_plain:  stem + rows.a + 'なかった',
    past_negative_polite: stem + rows.i + 'ませんでした',
    te_form:              stem + teSuf,
    potential:            stem + rows.e + 'る',
    passive:              stem + rows.a + 'れる',
    causative:            stem + rows.a + 'せる',
    causative_passive:    stem + rows.a + 'せられる',
    imperative:           stem + rows.e,
    volitional:           stem + rows.o + 'う',
    conditional_ba:       stem + rows.e + 'ば',
    conditional_tara:     pastPlain + 'ら',
  };

  if (kana === 'ある') {
    conj.negative_plain = 'ない';
    conj.past_negative_plain = 'なかった';
  }

  return conj;
}

function conjugateIchidan(kana: string): Record<string, string> {
  const stem = kana.slice(0, -1);
  const pastPlain = stem + 'た';
  return {
    polite:               stem + 'ます',
    negative_plain:       stem + 'ない',
    negative_polite:      stem + 'ません',
    past_plain:           pastPlain,
    past_polite:          stem + 'ました',
    past_negative_plain:  stem + 'なかった',
    past_negative_polite: stem + 'ませんでした',
    te_form:              stem + 'て',
    potential:            stem + 'られる',
    passive:              stem + 'られる',
    causative:            stem + 'させる',
    causative_passive:    stem + 'させられる',
    imperative:           stem + 'ろ',
    volitional:           stem + 'よう',
    conditional_ba:       stem + 'れば',
    conditional_tara:     pastPlain + 'ら',
  };
}

function conjugateSuru(prefix: string): Record<string, string> {
  return {
    polite:               prefix + 'します',
    negative_plain:       prefix + 'しない',
    negative_polite:      prefix + 'しません',
    past_plain:           prefix + 'した',
    past_polite:          prefix + 'しました',
    past_negative_plain:  prefix + 'しなかった',
    past_negative_polite: prefix + 'しませんでした',
    te_form:              prefix + 'して',
    potential:            prefix + 'できる',
    passive:              prefix + 'される',
    causative:            prefix + 'させる',
    causative_passive:    prefix + 'させられる',
    imperative:           prefix + 'しろ',
    volitional:           prefix + 'しよう',
    conditional_ba:       prefix + 'すれば',
    conditional_tara:     prefix + 'したら',
  };
}

function conjugateKuru(): Record<string, string> {
  return {
    polite:               'きます',
    negative_plain:       'こない',
    negative_polite:      'きません',
    past_plain:           'きた',
    past_polite:          'きました',
    past_negative_plain:  'こなかった',
    past_negative_polite: 'きませんでした',
    te_form:              'きて',
    potential:            'こられる',
    passive:              'こられる',
    causative:            'こさせる',
    causative_passive:    'こさせられる',
    imperative:           'こい',
    volitional:           'こよう',
    conditional_ba:       'くれば',
    conditional_tara:     'きたら',
  };
}

function conjugateIAdj(kana: string): Record<string, string> {
  if (kana === 'いい' || kana === 'よい') {
    return {
      polite:               'いいです',
      negative_plain:       'よくない',
      negative_polite:      'よくないです',
      past_plain:           'よかった',
      past_polite:          'よかったです',
      past_negative_plain:  'よくなかった',
      past_negative_polite: 'よくなかったです',
      te_form:              'よくて',
      conditional_ba:       'よければ',
      conditional_tara:     'よかったら',
    };
  }

  const stem = kana.slice(0, -1);
  return {
    polite:               kana + 'です',
    negative_plain:       stem + 'くない',
    negative_polite:      stem + 'くないです',
    past_plain:           stem + 'かった',
    past_polite:          stem + 'かったです',
    past_negative_plain:  stem + 'くなかった',
    past_negative_polite: stem + 'くなかったです',
    te_form:              stem + 'くて',
    conditional_ba:       stem + 'ければ',
    conditional_tara:     stem + 'かったら',
  };
}

function conjugateNaAdj(kana: string): Record<string, string> {
  return {
    polite:               kana + 'です',
    negative_plain:       kana + 'じゃない',
    negative_polite:      kana + 'じゃありません',
    past_plain:           kana + 'だった',
    past_polite:          kana + 'でした',
    past_negative_plain:  kana + 'じゃなかった',
    past_negative_polite: kana + 'じゃありませんでした',
    te_form:              kana + 'で',
    conditional_ba:       kana + 'であれば',
    conditional_tara:     kana + 'だったら',
  };
}

function getExpectedConjugations(word: Word): Record<string, string> {
  const { id, group } = word;
  const kana = word.dictionary_form.kana;

  let conj: Record<string, string>;

  switch (group) {
    case 'godan':
      conj = conjugateGodan(kana);
      break;
    case 'ichidan':
      conj = conjugateIchidan(kana);
      break;
    case 'suru': {
      const prefix = kana.endsWith('する') ? kana.slice(0, -2) : '';
      conj = conjugateSuru(prefix);
      break;
    }
    case 'kuru':
      conj = conjugateKuru();
      break;
    case 'i-adj':
      conj = conjugateIAdj(kana);
      break;
    case 'na-adj':
      conj = conjugateNaAdj(kana);
      break;
    default:
      return {};
  }

  // Honorific -aru overrides
  if (HONORIFIC_ARU_IDS.has(id)) {
    const stem = kana.slice(0, -1);
    conj.polite               = stem + 'います';
    conj.negative_polite      = stem + 'いません';
    conj.past_polite          = stem + 'いました';
    conj.past_negative_polite = stem + 'いませんでした';
    conj.imperative           = stem + 'い';
  }

  // Remove forbidden formations
  if (CATEGORY_A_IDS.has(id)) {
    for (const key of CATEGORY_A_FORBIDDEN) delete conj[key];
  } else if (CATEGORY_B_IDS.has(id)) {
    for (const key of CATEGORY_B_FORBIDDEN) delete conj[key];
  }

  return conj;
}

function getExpectedFormationKeys(word: Word): Set<string> {
  const { id, group } = word;

  if (group === 'i-adj' || group === 'na-adj') {
    return new Set(ADJ_FORMATIONS);
  }

  const keys = new Set<string>(VERB_FORMATIONS);
  if (CATEGORY_A_IDS.has(id)) {
    for (const k of CATEGORY_A_FORBIDDEN) keys.delete(k);
  } else if (CATEGORY_B_IDS.has(id)) {
    for (const k of CATEGORY_B_FORBIDDEN) keys.delete(k);
  }
  return keys;
}

// ═══════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════

const baseWords = (baseData as { words: Word[] }).words;
const dictWords = (dictData as { words: Word[] }).words;

describe('Dictionary Data: Schema Validation', () => {
  it('every word has all required fields', () => {
    const errors: string[] = [];
    for (const w of baseWords) {
      for (const field of ['id', 'level', 'group', 'word_type', 'dictionary_form', 'conjugations'] as const) {
        if (!(field in w)) errors.push(`[${w.id}] missing field: ${field}`);
      }
      for (const sub of ['kanji', 'kana', 'romaji'] as const) {
        if (!w.dictionary_form?.[sub]) errors.push(`[${w.id}] missing/empty dictionary_form.${sub}`);
      }
    }
    expect(errors).toEqual([]);
  });

  it('all word IDs are unique', () => {
    const ids = baseWords.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all word_type values are valid', () => {
    const invalid = baseWords.filter((w) => !VALID_WORD_TYPES.has(w.word_type));
    expect(invalid.map((w) => `${w.id}: ${w.word_type}`)).toEqual([]);
  });

  it('all level values are valid', () => {
    const invalid = baseWords.filter((w) => !VALID_LEVELS.has(w.level));
    expect(invalid.map((w) => `${w.id}: ${w.level}`)).toEqual([]);
  });

  it('all group values are valid', () => {
    const invalid = baseWords.filter((w) => !VALID_GROUPS.has(w.group));
    expect(invalid.map((w) => `${w.id}: ${w.group}`)).toEqual([]);
  });

  it('group and word_type are consistent', () => {
    const errors: string[] = [];
    for (const w of baseWords) {
      if (VALID_VERB_GROUPS.has(w.group) && w.word_type !== 'verb') {
        errors.push(`[${w.id}] group '${w.group}' should have word_type 'verb', got '${w.word_type}'`);
      }
      if (VALID_ADJ_GROUPS.has(w.group) && w.word_type !== w.group) {
        errors.push(`[${w.id}] group '${w.group}' should have word_type '${w.group}', got '${w.word_type}'`);
      }
    }
    expect(errors).toEqual([]);
  });
});

describe('Dictionary Data: Formation Existence', () => {
  it('every word has exactly the formation keys it should have', () => {
    const errors: string[] = [];
    for (const w of baseWords) {
      const actualKeys = new Set(Object.keys(w.conjugations));
      const expectedKeys = getExpectedFormationKeys(w);

      for (const key of actualKeys) {
        if (!expectedKeys.has(key)) {
          errors.push(`[${w.id}] EXTRA '${key}' should not exist`);
        }
      }
      for (const key of expectedKeys) {
        if (!actualKeys.has(key)) {
          errors.push(`[${w.id}] MISSING '${key}' should exist`);
        }
      }
    }
    expect(errors).toEqual([]);
  });
});

describe('Dictionary Data: Formation Correctness', () => {
  it('every formation spelling matches Japanese grammar rules', () => {
    const errors: string[] = [];
    for (const w of baseWords) {
      const expected = getExpectedConjugations(w);
      for (const [key, actualVal] of Object.entries(w.conjugations)) {
        if (!(key in expected)) continue; // extra key reported by existence check
        const expectedVal = expected[key];
        if (actualVal !== expectedVal) {
          errors.push(
            `[${w.id}] '${key}': got '${actualVal}', expected '${expectedVal}' ` +
            `(${w.dictionary_form.kana}, ${w.group})`
          );
        }
      }
    }
    expect(errors).toEqual([]);
  });
});

describe('Dictionary Data: base.json <-> dictionary.json Alignment', () => {
  it('both files contain the same word IDs', () => {
    const baseIds = new Set(baseWords.map((w) => w.id));
    const dictIds = new Set(dictWords.map((w) => w.id));

    const onlyBase = [...baseIds].filter((id) => !dictIds.has(id));
    const onlyDict = [...dictIds].filter((id) => !baseIds.has(id));

    expect(onlyBase).toEqual([]);
    expect(onlyDict).toEqual([]);
  });

  it('structural fields match between both files', () => {
    const baseMap = new Map(baseWords.map((w) => [w.id, w]));
    const dictMap = new Map(dictWords.map((w) => [w.id, w]));
    const errors: string[] = [];

    for (const [id, bw] of baseMap) {
      const dw = dictMap.get(id);
      if (!dw) continue;

      for (const field of ['level', 'group', 'word_type'] as const) {
        if (bw[field] !== dw[field]) {
          errors.push(`[${id}] '${field}' differs: base='${bw[field]}' dict='${dw[field]}'`);
        }
      }

      if (JSON.stringify(bw.dictionary_form) !== JSON.stringify(dw.dictionary_form)) {
        errors.push(`[${id}] 'dictionary_form' differs`);
      }

      if (JSON.stringify(bw.conjugations) !== JSON.stringify(dw.conjugations)) {
        errors.push(`[${id}] 'conjugations' differs`);
      }
    }

    expect(errors).toEqual([]);
  });
});

describe('Dictionary Data: Localization Completeness', () => {
  const baseIds = new Set(baseWords.map((w) => w.id));
  const locFiles: Record<string, Record<string, string>> = {
    'en.json': enMeanings as Record<string, string>,
    'zh.json': zhMeanings as Record<string, string>,
    'vi.json': viMeanings as Record<string, string>,
    'ne.json': neMeanings as Record<string, string>,
    'my.json': myMeanings as Record<string, string>,
    'ko.json': koMeanings as Record<string, string>,
  };

  for (const [filename, meanings] of Object.entries(locFiles)) {
    it(`${filename} has no missing translations`, () => {
      const locIds = new Set(Object.keys(meanings));
      const missing = [...baseIds].filter((id) => !locIds.has(id));
      expect(missing).toEqual([]);
    });

    it(`${filename} has no extra translations`, () => {
      const locIds = new Set(Object.keys(meanings));
      const extra = [...locIds].filter((id) => !baseIds.has(id));
      expect(extra).toEqual([]);
    });
  }
});
