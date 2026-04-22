'use client';

export function RecentActivityPanel({
  title,
  rows,
  emptyLabel,
  answeredLabel,
  correctLabel,
}: {
  title: string;
  rows: { date: string; answered: number; correct: number }[];
  emptyLabel: string;
  answeredLabel: string;
  correctLabel: string;
}) {
  return (
    <section className="rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-6 shadow-[6px_6px_0px_0px_var(--ink)]">
      <h2 className="text-xl font-bold text-[color:var(--ink)]">{title}</h2>
      <div className="mt-5 space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-[1.25rem] border-[2px] border-dashed border-[color:var(--ink)] px-4 py-4 text-sm font-medium text-[color:var(--muted)]">
            {emptyLabel}
          </p>
        ) : rows.map((row) => (
          <div
            key={row.date}
            className="grid grid-cols-[1fr_auto] gap-3 rounded-[1.25rem] border-[2px] border-[color:var(--ink)] bg-[color:var(--surface-soft)] px-4 py-3 sm:grid-cols-[1fr_auto_auto]"
          >
            <span className="font-bold text-[color:var(--ink)]">{row.date}</span>
            <span className="text-sm text-[color:var(--muted)]">{row.answered} {answeredLabel}</span>
            <span className="text-sm font-bold text-[color:var(--accent)] sm:text-right">{row.correct} {correctLabel}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
