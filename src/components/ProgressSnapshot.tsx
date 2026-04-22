'use client';

import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

export default function ProgressSnapshot() {
  const { dailyStreak, progress, language } = useStore();
  const { t } = useTranslation(language);
  const accuracy =
    progress.totalAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : 0;

  return (
    <section className="card border border-[color:var(--border-strong)] p-6 space-y-4">
      <div className="space-y-1">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--muted)]">
          {t('progressSnapshot')}
        </p>
        <h2 className="text-2xl font-black tracking-tight text-[color:var(--ink)]">
          {t('progressHeading')}
        </h2>
      </div>

      {progress.totalAnswered === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-soft)] px-5 py-6">
          <p className="text-sm font-semibold text-[color:var(--ink)]">
            {t('noProgress')}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <SnapshotCard label={t('dailyStreak')} value={`${dailyStreak} ${t('days')}`} helper={t('practiceOnConsecutiveDays')} />
          <SnapshotCard label={t('answered')} value={String(progress.totalAnswered)} helper={t('totalAnswered')} />
          <SnapshotCard label={t('accuracy')} value={`${accuracy}%`} helper={t('acrossAllSessions')} />
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
