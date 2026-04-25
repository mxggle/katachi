import { describe, expect, it } from 'vitest';
import { getConjugationLabel, getPracticeModeLabel, getWordDisplayText } from '@/lib/displayText';

describe('displayText', () => {
  it('returns readable fallback text for words instead of internal ids', () => {
    expect(
      getWordDisplayText({
        id: 'v_shigotosuru',
        dictionary_form: {
          kanji: '仕事する',
          kana: 'しごとする',
          romaji: 'shigotosuru',
        },
      })
    ).toBe('仕事する');
  });

  it('returns localized conjugation labels', () => {
    expect(getConjugationLabel('te_form', 'verb', 'zh')).toBe('て形');
    expect(getConjugationLabel('negative_plain', 'verb', 'en')).toBe('ない形');
  });

  it('returns localized practice mode labels', () => {
    expect(getPracticeModeLabel('choice', 'zh')).toBe('选择题');
    expect(getPracticeModeLabel('input', 'en')).toBe('Typing');
  });
});
