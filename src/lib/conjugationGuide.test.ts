import { describe, expect, it } from 'vitest';
import baseData from '@/data/dictionaries/base.json';
import {
  CONJUGATION_FORM_ORDER,
  getConjugationRules,
  isConjugationType,
} from '@/lib/conjugationGuide';
import {
  conjugationGuideTranslations,
  formatRuleFormula,
} from '@/lib/conjugationGuideI18n';
import { SHARED_CONJS, type WordGroup } from '@/lib/distractorEngine';

const EXAMPLE_KANA: Record<WordGroup, string> = {
  godan: 'かく',
  ichidan: 'たべる',
  suru: 'べんきょうする',
  kuru: 'くる',
  'i-adj': 'たかい',
  'na-adj': 'しずか',
};

describe('conjugation guide data', () => {
  it('covers every formation and every applicable word class', () => {
    for (const type of CONJUGATION_FORM_ORDER) {
      const rules = getConjugationRules(type);
      expect(rules.map((rule) => rule.group)).toEqual(
        SHARED_CONJS.includes(type)
          ? ['godan', 'ichidan', 'suru', 'kuru', 'i-adj', 'na-adj']
          : ['godan', 'ichidan', 'suru', 'kuru']
      );
    }
  });

  it('keeps every teaching example aligned with the canonical dictionary', () => {
    for (const type of CONJUGATION_FORM_ORDER) {
      for (const rule of getConjugationRules(type)) {
        const word = baseData.words.find(
          (entry) => entry.group === rule.group && entry.dictionary_form.kana === EXAMPLE_KANA[rule.group]
        );

        expect(word, `${rule.group} example must exist`).toBeDefined();
        expect(rule.example.after).toBe(word?.conjugations[type as keyof typeof word.conjugations]);
      }
    }
  });

  it('provides readable formulas and UI copy in every supported language', () => {
    for (const copy of Object.values(conjugationGuideTranslations)) {
      expect(copy.pageTitle.length).toBeGreaterThan(0);
      expect(copy.quickStartSteps).toHaveLength(3);

      for (const type of CONJUGATION_FORM_ORDER) {
        for (const rule of getConjugationRules(type)) {
          expect(formatRuleFormula(rule.formula, copy.formula).length).toBeGreaterThan(0);
          expect(copy.groups[rule.group].length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('accepts only allowlisted formation anchors', () => {
    expect(isConjugationType('te_form')).toBe(true);
    expect(isConjugationType('../../api/tts')).toBe(false);
    expect(isConjugationType('<script>')).toBe(false);
  });
});
