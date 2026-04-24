import { describe, expect, it } from 'vitest';
import type { ConjugationType } from './distractorEngine';
import { collectTtsPreloadTexts } from './audioPreload';

const makeItem = (kanji: string, conjugated: string) => ({
  unitKey: kanji,
  word: {
    dictionary_form: { kanji },
    conjugations: { polite: conjugated },
  },
  type: 'polite' satisfies ConjugationType,
});

describe('collectTtsPreloadTexts', () => {
  it('limits preloading to a small window from the current item', () => {
    const texts = collectTtsPreloadTexts(
      [
        makeItem('食べる', '食べます'),
        makeItem('飲む', '飲みます'),
        makeItem('行く', '行きます'),
        makeItem('見る', '見ます'),
      ],
      1,
      2
    );

    expect(texts).toEqual(['飲む', '飲みます', '行く', '行きます']);
  });
});
