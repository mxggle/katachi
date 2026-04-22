'use client';

import { getConjugationLabel, getPracticeModeLabel } from '@/lib/displayText';
import type { Language } from '@/lib/i18n';
import type { ConjugationType, WordType } from '@/lib/distractorEngine';
import type { PracticeMode } from '@/lib/study/types';

export function WeaknessPanels({
  weakestConjugations,
  weakestItems,
  titles,
  practiceLabel,
  emptyStateLabel,
  accuracyLabel,
  language,
  wordLabels,
  onDrillConjugation,
  onDrillItem,
}: {
  weakestConjugations: { conjugationType: ConjugationType; accuracy: number; wrong: number }[];
  weakestItems: { wordId: string; conjugationType: ConjugationType; mode: PracticeMode; wordType: WordType; accuracy: number }[];
  language: Language;
  wordLabels: Record<string, string>;
  titles: {
    conjugations: string;
    items: string;
  };
  practiceLabel: string;
  emptyStateLabel: string;
  accuracyLabel: string;
  onDrillConjugation: (conjugationType: ConjugationType) => void;
  onDrillItem: (wordId: string, conjugationType: ConjugationType, mode: PracticeMode) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-6 shadow-[6px_6px_0px_0px_var(--ink)]">
        <h2 className="text-2xl font-bold text-[color:var(--ink)]">{titles.conjugations}</h2>
        <div className="mt-5 space-y-3">
          {weakestConjugations.length === 0 ? (
            <p className="rounded-[1.25rem] border-[2px] border-dashed border-[color:var(--ink)] px-4 py-4 text-sm font-medium text-[color:var(--muted)]">
              {emptyStateLabel}
            </p>
          ) : weakestConjugations.map((item) => (
            <button
              key={item.conjugationType}
              onClick={() => onDrillConjugation(item.conjugationType)}
              className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border-[2px] border-[color:var(--ink)] bg-[#fff9db] px-4 py-4 text-left shadow-[3px_3px_0px_0px_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)]"
            >
              <div>
                <p className="font-bold text-[color:var(--ink)]">{getConjugationLabel(item.conjugationType, 'verb', language)}</p>
                <p className="text-sm text-[color:var(--muted)]">{item.accuracy}% {accuracyLabel.toLowerCase()}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-bold text-[color:var(--accent)]">{practiceLabel}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-6 shadow-[6px_6px_0px_0px_var(--ink)]">
        <h2 className="text-2xl font-bold text-[color:var(--ink)]">{titles.items}</h2>
        <div className="mt-5 space-y-3">
          {weakestItems.length === 0 ? (
            <p className="rounded-[1.25rem] border-[2px] border-dashed border-[color:var(--ink)] px-4 py-4 text-sm font-medium text-[color:var(--muted)]">
              {emptyStateLabel}
            </p>
          ) : weakestItems.map((item) => (
            <button
              key={`${item.wordId}-${item.conjugationType}-${item.mode}`}
              onClick={() => onDrillItem(item.wordId, item.conjugationType, item.mode)}
              className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border-[2px] border-[color:var(--ink)] bg-[#eef8ff] px-4 py-4 text-left shadow-[3px_3px_0px_0px_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)]"
            >
              <div>
                <p className="font-bold text-[color:var(--ink)]">{wordLabels[item.wordId] ?? 'Unknown word'}</p>
                <p className="text-sm text-[color:var(--muted)]">{getConjugationLabel(item.conjugationType, item.wordType, language)} · {getPracticeModeLabel(item.mode, language)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-bold text-[color:var(--accent)]">{practiceLabel}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
