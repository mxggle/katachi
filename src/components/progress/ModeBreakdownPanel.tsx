'use client';

import { getPracticeModeLabel } from '@/lib/displayText';
import type { Language } from '@/lib/i18n';
import type { PracticeMode } from '@/lib/study/types';

export function ModeBreakdownPanel({
  title,
  rows,
  emptyLabel,
  answeredLabel,
  language,
}: {
  title: string;
  rows: { mode: PracticeMode; answered: number; accuracy: number }[];
  emptyLabel: string;
  answeredLabel: string;
  language: Language;
}) {
  return (
    <section className="rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-6 shadow-[6px_6px_0px_0px_var(--ink)]">
      <h2 className="text-xl font-bold text-[color:var(--ink)]">{title}</h2>
      <div className="mt-5 space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-[1.25rem] border-[2px] border-dashed border-[color:var(--ink)] px-4 py-4 text-sm font-medium text-[color:var(--muted)]">
            {emptyLabel}
          </p>
        ) : rows.map((item) => (
          <div
            key={item.mode}
            className="rounded-[1.25rem] border-[2px] border-[color:var(--ink)] bg-[color:var(--surface-soft)] px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold capitalize text-[color:var(--ink)]">{getPracticeModeLabel(item.mode, language)}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">{item.answered} {answeredLabel}</p>
              </div>
              <p className="text-xl font-black text-[color:var(--accent)]">{item.accuracy}%</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
