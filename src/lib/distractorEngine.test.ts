import { describe, expect, it } from 'vitest';
import { generateDistractors, type WordEntry } from './distractorEngine';

const sampleVerb: WordEntry = {
  id: 'taberu',
  level: 'N5',
  group: 'ichidan',
  word_type: 'verb',
  dictionary_form: {
    kanji: '食べる',
    kana: 'たべる',
    romaji: 'taberu',
  },
  meaning: 'to eat',
  conjugations: {
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
};

describe('generateDistractors', () => {
  it('returns exactly three distractors when enough options exist', () => {
    expect(generateDistractors(sampleVerb, 'te_form')).toHaveLength(3);
  });

  it('never returns the correct answer as a distractor', () => {
    const distractors = generateDistractors(sampleVerb, 'polite');
    expect(distractors).not.toContain(sampleVerb.conjugations.polite);
  });
});
