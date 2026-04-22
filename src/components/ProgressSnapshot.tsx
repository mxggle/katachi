'use client';

import { useStore } from '@/lib/store';

export default function ProgressSnapshot() {
  const { dailyStreak, progress } = useStore();
  const accuracy =
    progress.totalAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : 0;

  return (
    <section className="card border border-[color:var(--border-strong)] p-6 space-y-4">
      <div className="space-y-1">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--muted)]">
          Progress Snapshot
        </p>
        <h2 className="text-2xl font-black tracking-tight text-[color:var(--ink)]">
          Keep the streak alive with short daily reps.
        </h2>
      </div>

      {progress.totalAnswered === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-soft)] px-5 py-6">
          <p className="text-sm font-semibold text-[color:var(--ink)]">
            No progress yet. Your stats will appear after the first session.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <SnapshotCard label="Daily streak" value={`${dailyStreak} days`} helper="Practice on consecutive days." />
          <SnapshotCard label="Answered" value={String(progress.totalAnswered)} helper="Total questions completed." />
          <SnapshotCard label="Accuracy" value={`${accuracy}%`} helper="Across all saved sessions." />
        </div>
      )}
    </section>
  );
}

function SnapshotCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white px-4 py-4">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-[color:var(--ink)]">{value}</p>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{helper}</p>
    </div>
  );
}
