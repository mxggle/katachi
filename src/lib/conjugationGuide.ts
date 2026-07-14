import type { ConjugationType, WordGroup, WordType } from '@/lib/distractorEngine';

export const CONJUGATION_FORM_ORDER: ConjugationType[] = [
  'polite',
  'negative_plain',
  'negative_polite',
  'past_plain',
  'past_polite',
  'past_negative_plain',
  'past_negative_polite',
  'te_form',
  'potential',
  'passive',
  'causative',
  'causative_passive',
  'imperative',
  'volitional',
  'conditional_ba',
  'conditional_tara',
];

export const GUIDE_GROUP_ORDER: WordGroup[] = [
  'godan',
  'ichidan',
  'suru',
  'kuru',
  'i-adj',
  'na-adj',
];

export type FormulaRow = 'a' | 'i' | 'e' | 'o';

export type RuleFormula =
  | { kind: 'godan-row'; row: FormulaRow; suffix: string; uToWa?: boolean }
  | { kind: 'godan-sound-change'; result: 'te' | 'ta' }
  | { kind: 'drop-ru'; suffix: string }
  | { kind: 'replace-i'; suffix: string }
  | { kind: 'keep'; suffix: string }
  | { kind: 'append'; suffix: string }
  | { kind: 'past-plus-ra' }
  | { kind: 'fixed'; before: string; after: string };

export interface ConjugationRule {
  group: WordGroup;
  wordType: WordType;
  formula: RuleFormula;
  example: {
    before: string;
    after: string;
  };
  note?: 'godan-sound-change' | 'ii-adjective';
}

const WORD_TYPE_BY_GROUP: Record<WordGroup, WordType> = {
  godan: 'verb',
  ichidan: 'verb',
  suru: 'verb',
  kuru: 'verb',
  'i-adj': 'i-adj',
  'na-adj': 'na-adj',
};

const EXAMPLE_BASES: Record<WordGroup, string> = {
  godan: '書く（かく）',
  ichidan: '食べる（たべる）',
  suru: '勉強する（べんきょうする）',
  kuru: '来る（くる）',
  'i-adj': '高い（たかい）',
  'na-adj': '静か（しずか）',
};

const EXAMPLE_FORMS: Record<WordGroup, Partial<Record<ConjugationType, string>>> = {
  godan: {
    polite: 'かきます',
    negative_plain: 'かかない',
    negative_polite: 'かきません',
    past_plain: 'かいた',
    past_polite: 'かきました',
    past_negative_plain: 'かかなかった',
    past_negative_polite: 'かきませんでした',
    te_form: 'かいて',
    potential: 'かける',
    passive: 'かかれる',
    causative: 'かかせる',
    causative_passive: 'かかせられる',
    imperative: 'かけ',
    volitional: 'かこう',
    conditional_ba: 'かけば',
    conditional_tara: 'かいたら',
  },
  ichidan: {
    polite: 'たべます',
    negative_plain: 'たべない',
    negative_polite: 'たべません',
    past_plain: 'たべた',
    past_polite: 'たべました',
    past_negative_plain: 'たべなかった',
    past_negative_polite: 'たべませんでした',
    te_form: 'たべて',
    potential: 'たべられる',
    passive: 'たべられる',
    causative: 'たべさせる',
    causative_passive: 'たべさせられる',
    imperative: 'たべろ',
    volitional: 'たべよう',
    conditional_ba: 'たべれば',
    conditional_tara: 'たべたら',
  },
  suru: {
    polite: 'べんきょうします',
    negative_plain: 'べんきょうしない',
    negative_polite: 'べんきょうしません',
    past_plain: 'べんきょうした',
    past_polite: 'べんきょうしました',
    past_negative_plain: 'べんきょうしなかった',
    past_negative_polite: 'べんきょうしませんでした',
    te_form: 'べんきょうして',
    potential: 'べんきょうできる',
    passive: 'べんきょうされる',
    causative: 'べんきょうさせる',
    causative_passive: 'べんきょうさせられる',
    imperative: 'べんきょうしろ',
    volitional: 'べんきょうしよう',
    conditional_ba: 'べんきょうすれば',
    conditional_tara: 'べんきょうしたら',
  },
  kuru: {
    polite: 'きます',
    negative_plain: 'こない',
    negative_polite: 'きません',
    past_plain: 'きた',
    past_polite: 'きました',
    past_negative_plain: 'こなかった',
    past_negative_polite: 'きませんでした',
    te_form: 'きて',
    potential: 'こられる',
    passive: 'こられる',
    causative: 'こさせる',
    causative_passive: 'こさせられる',
    imperative: 'こい',
    volitional: 'こよう',
    conditional_ba: 'くれば',
    conditional_tara: 'きたら',
  },
  'i-adj': {
    polite: 'たかいです',
    negative_plain: 'たかくない',
    negative_polite: 'たかくないです',
    past_plain: 'たかかった',
    past_polite: 'たかかったです',
    past_negative_plain: 'たかくなかった',
    past_negative_polite: 'たかくなかったです',
    te_form: 'たかくて',
    conditional_ba: 'たかければ',
    conditional_tara: 'たかかったら',
  },
  'na-adj': {
    polite: 'しずかです',
    negative_plain: 'しずかじゃない',
    negative_polite: 'しずかじゃありません',
    past_plain: 'しずかだった',
    past_polite: 'しずかでした',
    past_negative_plain: 'しずかじゃなかった',
    past_negative_polite: 'しずかじゃありませんでした',
    te_form: 'しずかで',
    conditional_ba: 'しずかであれば',
    conditional_tara: 'しずかだったら',
  },
};

const GODAN_FORMULAS: Record<ConjugationType, RuleFormula> = {
  polite: { kind: 'godan-row', row: 'i', suffix: 'ます' },
  negative_plain: { kind: 'godan-row', row: 'a', suffix: 'ない', uToWa: true },
  negative_polite: { kind: 'godan-row', row: 'i', suffix: 'ません' },
  past_plain: { kind: 'godan-sound-change', result: 'ta' },
  past_polite: { kind: 'godan-row', row: 'i', suffix: 'ました' },
  past_negative_plain: { kind: 'godan-row', row: 'a', suffix: 'なかった', uToWa: true },
  past_negative_polite: { kind: 'godan-row', row: 'i', suffix: 'ませんでした' },
  te_form: { kind: 'godan-sound-change', result: 'te' },
  potential: { kind: 'godan-row', row: 'e', suffix: 'る' },
  passive: { kind: 'godan-row', row: 'a', suffix: 'れる', uToWa: true },
  causative: { kind: 'godan-row', row: 'a', suffix: 'せる', uToWa: true },
  causative_passive: { kind: 'godan-row', row: 'a', suffix: 'せられる', uToWa: true },
  imperative: { kind: 'godan-row', row: 'e', suffix: '' },
  volitional: { kind: 'godan-row', row: 'o', suffix: 'う' },
  conditional_ba: { kind: 'godan-row', row: 'e', suffix: 'ば' },
  conditional_tara: { kind: 'past-plus-ra' },
};

const ICHIDAN_SUFFIXES: Record<ConjugationType, string> = {
  polite: 'ます',
  negative_plain: 'ない',
  negative_polite: 'ません',
  past_plain: 'た',
  past_polite: 'ました',
  past_negative_plain: 'なかった',
  past_negative_polite: 'ませんでした',
  te_form: 'て',
  potential: 'られる',
  passive: 'られる',
  causative: 'させる',
  causative_passive: 'させられる',
  imperative: 'ろ',
  volitional: 'よう',
  conditional_ba: 'れば',
  conditional_tara: 'たら',
};

const SURU_FORMS: Record<ConjugationType, string> = {
  polite: 'します',
  negative_plain: 'しない',
  negative_polite: 'しません',
  past_plain: 'した',
  past_polite: 'しました',
  past_negative_plain: 'しなかった',
  past_negative_polite: 'しませんでした',
  te_form: 'して',
  potential: 'できる',
  passive: 'される',
  causative: 'させる',
  causative_passive: 'させられる',
  imperative: 'しろ',
  volitional: 'しよう',
  conditional_ba: 'すれば',
  conditional_tara: 'したら',
};

const KURU_FORMS: Record<ConjugationType, string> = {
  polite: 'きます',
  negative_plain: 'こない',
  negative_polite: 'きません',
  past_plain: 'きた',
  past_polite: 'きました',
  past_negative_plain: 'こなかった',
  past_negative_polite: 'きませんでした',
  te_form: 'きて',
  potential: 'こられる',
  passive: 'こられる',
  causative: 'こさせる',
  causative_passive: 'こさせられる',
  imperative: 'こい',
  volitional: 'こよう',
  conditional_ba: 'くれば',
  conditional_tara: 'きたら',
};

const I_ADJ_FORMULAS: Partial<Record<ConjugationType, RuleFormula>> = {
  polite: { kind: 'keep', suffix: 'です' },
  negative_plain: { kind: 'replace-i', suffix: 'くない' },
  negative_polite: { kind: 'replace-i', suffix: 'くないです' },
  past_plain: { kind: 'replace-i', suffix: 'かった' },
  past_polite: { kind: 'replace-i', suffix: 'かったです' },
  past_negative_plain: { kind: 'replace-i', suffix: 'くなかった' },
  past_negative_polite: { kind: 'replace-i', suffix: 'くなかったです' },
  te_form: { kind: 'replace-i', suffix: 'くて' },
  conditional_ba: { kind: 'replace-i', suffix: 'ければ' },
  conditional_tara: { kind: 'replace-i', suffix: 'かったら' },
};

const NA_ADJ_SUFFIXES: Partial<Record<ConjugationType, string>> = {
  polite: 'です',
  negative_plain: 'じゃない',
  negative_polite: 'じゃありません',
  past_plain: 'だった',
  past_polite: 'でした',
  past_negative_plain: 'じゃなかった',
  past_negative_polite: 'じゃありませんでした',
  te_form: 'で',
  conditional_ba: 'であれば',
  conditional_tara: 'だったら',
};

function formulaFor(group: WordGroup, type: ConjugationType): RuleFormula | undefined {
  switch (group) {
    case 'godan':
      return GODAN_FORMULAS[type];
    case 'ichidan':
      return { kind: 'drop-ru', suffix: ICHIDAN_SUFFIXES[type] };
    case 'suru':
      return { kind: 'fixed', before: 'する', after: SURU_FORMS[type] };
    case 'kuru':
      return { kind: 'fixed', before: 'くる', after: KURU_FORMS[type] };
    case 'i-adj':
      return I_ADJ_FORMULAS[type];
    case 'na-adj': {
      const suffix = NA_ADJ_SUFFIXES[type];
      return suffix ? { kind: 'append', suffix } : undefined;
    }
  }
}

export function getConjugationRules(type: ConjugationType): ConjugationRule[] {
  return GUIDE_GROUP_ORDER.flatMap((group) => {
    const formula = formulaFor(group, type);
    const after = EXAMPLE_FORMS[group][type];

    if (!formula || !after) {
      return [];
    }

    return [{
      group,
      wordType: WORD_TYPE_BY_GROUP[group],
      formula,
      example: {
        before: EXAMPLE_BASES[group],
        after,
      },
      note:
        group === 'godan' && (type === 'te_form' || type === 'past_plain')
          ? 'godan-sound-change'
          : group === 'i-adj'
            ? 'ii-adjective'
            : undefined,
    } satisfies ConjugationRule];
  });
}

export function isConjugationType(value: string): value is ConjugationType {
  return CONJUGATION_FORM_ORDER.includes(value as ConjugationType);
}
