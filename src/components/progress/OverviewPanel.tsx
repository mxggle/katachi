'use client';

export function OverviewPanel({
  title,
  cards,
  compact = false,
}: {
  title: string;
  cards: { label: string; value: string; helper: string }[];
  compact?: boolean;
}) {
  return (
    <section className="rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-6 shadow-[6px_6px_0px_0px_var(--ink)]">
      <h2 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-[color:var(--ink)]`}>{title}</h2>
      <div className={`mt-5 grid gap-3 ${compact ? 'grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[1.5rem] border-[2px] border-[color:var(--ink)] bg-[color:var(--surface-soft)] px-4 py-4"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">{card.label}</p>
            <p className={`mt-3 ${compact ? 'text-2xl' : 'text-3xl'} font-black tracking-tight text-[color:var(--ink)]`}>{card.value}</p>
            <p className={`${compact ? 'mt-1 text-xs' : 'mt-2 text-sm'} text-[color:var(--muted)]`}>{card.helper}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
