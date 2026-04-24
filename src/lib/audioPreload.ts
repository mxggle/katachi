import type { ConjugationType, WordEntry } from '@/lib/distractorEngine';

interface TtsPreloadItem {
  word: Pick<WordEntry, 'dictionary_form' | 'conjugations'>;
  type: ConjugationType;
}

export function collectTtsPreloadTexts(
  items: TtsPreloadItem[],
  currentIndex: number,
  itemLimit = 3
): string[] {
  return Array.from(
    new Set(
      items
        .slice(currentIndex, currentIndex + itemLimit)
        .flatMap((item) => [item.word.dictionary_form.kanji, item.word.conjugations[item.type]])
        .map((text) => text.trim())
        .filter(Boolean)
    )
  );
}
