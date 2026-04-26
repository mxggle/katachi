import { describe, expect, it } from 'vitest';
import { getRulePattern, getAllPatternsForForm, TE_FORM_PATTERNS } from '@/lib/study/patterns';
import type { WordEntry } from '@/lib/distractorEngine';

function buildWord(
  id: string,
  group: WordEntry['group'],
  kana: string,
  wordType: WordEntry['word_type'] = 'verb'
): WordEntry {
  return {
    id,
    level: 'N5',
    group,
    word_type: wordType,
    dictionary_form: { kanji: id, kana, romaji: id },
    meaning: id,
    conjugations: { te_form: `${id}-te`, polite: `${id}-polite` },
  };
}

describe('getRulePattern', () => {
  describe('te_form patterns', () => {
    it('returns te_form::ichidan for ichidan verbs', () => {
      const word = buildWord('taberu', 'ichidan', 'たべる');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::ichidan');
    });

    it('returns te_form::godan-ku for godan verbs ending in く', () => {
      const word = buildWord('kaku', 'godan', 'かく');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::godan-ku');
    });

    it('returns te_form::godan-gu for godan verbs ending in ぐ', () => {
      const word = buildWord('oyogu', 'godan', 'およぐ');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::godan-gu');
    });

    it('returns te_form::godan-u-tsu-ru for godan verbs ending in う', () => {
      const word = buildWord('kau', 'godan', 'かう');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::godan-u-tsu-ru');
    });

    it('returns te_form::godan-u-tsu-ru for godan verbs ending in つ', () => {
      const word = buildWord('matsu', 'godan', 'まつ');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::godan-u-tsu-ru');
    });

    it('returns te_form::godan-u-tsu-ru for godan verbs ending in る', () => {
      const word = buildWord('kaeru', 'godan', 'かえる');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::godan-u-tsu-ru');
    });

    it('returns te_form::godan-mu-bu-nu for godan verbs ending in む', () => {
      const word = buildWord('yomu', 'godan', 'よむ');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::godan-mu-bu-nu');
    });

    it('returns te_form::godan-mu-bu-nu for godan verbs ending in ぶ', () => {
      const word = buildWord('asobu', 'godan', 'あそぶ');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::godan-mu-bu-nu');
    });

    it('returns te_form::godan-mu-bu-nu for godan verbs ending in ぬ', () => {
      const word = buildWord('shinu', 'godan', 'しぬ');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::godan-mu-bu-nu');
    });

    it('returns te_form::godan-su for godan verbs ending in す', () => {
      const word = buildWord('hanasu', 'godan', 'はなす');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::godan-su');
    });

    it('returns te_form::iku-exception for 行く by kana', () => {
      const word = buildWord('iku', 'godan', 'いく');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::iku-exception');
    });

    it('returns te_form::iku-exception for iku by id fallback', () => {
      const word = buildWord('iku', 'godan', 'イク');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::iku-exception');
    });

    it('returns te_form::suru for suru verbs', () => {
      const word = buildWord('benkyousuru', 'suru', 'べんきょうする');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::suru');
    });

    it('returns te_form::kuru for kuru verbs', () => {
      const word = buildWord('kuru', 'kuru', 'くる');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::kuru');
    });

    it('returns te_form::i-adj for i-adjectives', () => {
      const word = buildWord('atsui', 'i-adj', 'あつい', 'i-adj');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::i-adj');
    });

    it('returns te_form::na-adj for na-adjectives', () => {
      const word = buildWord('kirei', 'na-adj', 'きれい', 'na-adj');
      expect(getRulePattern(word, 'te_form')).toBe('te_form::na-adj');
    });
  });

  describe('non-te-form patterns', () => {
    it('returns polite::ichidan for ichidan polite', () => {
      const word = buildWord('taberu', 'ichidan', 'たべる');
      expect(getRulePattern(word, 'polite')).toBe('polite::ichidan');
    });

    it('returns negative_plain::godan for godan negative', () => {
      const word = buildWord('kaku', 'godan', 'かく');
      expect(getRulePattern(word, 'negative_plain')).toBe('negative_plain::godan');
    });

    it('returns past_plain::i-adj for i-adj past', () => {
      const word = buildWord('atsui', 'i-adj', 'あつい', 'i-adj');
      expect(getRulePattern(word, 'past_plain')).toBe('past_plain::i-adj');
    });

    it('returns negative_plain::na-adj for na-adj negative', () => {
      const word = buildWord('kirei', 'na-adj', 'きれい', 'na-adj');
      expect(getRulePattern(word, 'negative_plain')).toBe('negative_plain::na-adj');
    });

    it('returns polite::suru for suru polite', () => {
      const word = buildWord('benkyousuru', 'suru', 'べんきょうする');
      expect(getRulePattern(word, 'polite')).toBe('polite::suru');
    });

    it('returns polite::kuru for kuru polite', () => {
      const word = buildWord('kuru', 'kuru', 'くる');
      expect(getRulePattern(word, 'polite')).toBe('polite::kuru');
    });
  });
});

describe('getAllPatternsForForm', () => {
  it('returns all te_form sub-patterns for verb groups', () => {
    const patterns = getAllPatternsForForm('te_form', ['godan', 'ichidan', 'suru', 'kuru']);
    expect(patterns).toContain('te_form::ichidan');
    expect(patterns).toContain('te_form::godan-ku');
    expect(patterns).toContain('te_form::godan-gu');
    expect(patterns).toContain('te_form::godan-u-tsu-ru');
    expect(patterns).toContain('te_form::godan-mu-bu-nu');
    expect(patterns).toContain('te_form::godan-su');
    expect(patterns).toContain('te_form::iku-exception');
    expect(patterns).toContain('te_form::suru');
    expect(patterns).toContain('te_form::kuru');
  });

  it('returns te_form patterns for adj types', () => {
    const patterns = getAllPatternsForForm('te_form', ['i-adj', 'na-adj']);
    expect(patterns).toContain('te_form::i-adj');
    expect(patterns).toContain('te_form::na-adj');
    expect(patterns).not.toContain('te_form::godan-ku');
  });

  it('returns one pattern per group for non-te-form', () => {
    const patterns = getAllPatternsForForm('polite', ['godan', 'ichidan']);
    expect(patterns).toEqual(['polite::godan', 'polite::ichidan']);
  });

  it('deduplicates when the same group appears multiple times', () => {
    const patterns = getAllPatternsForForm('polite', ['godan', 'godan', 'ichidan']);
    expect(patterns).toEqual(['polite::godan', 'polite::ichidan']);
  });
});

describe('TE_FORM_PATTERNS constant', () => {
  it('includes all 9 te-form verb patterns', () => {
    expect(TE_FORM_PATTERNS).toHaveLength(9);
  });
});
