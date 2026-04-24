import type { UnitProgress } from '@/lib/study/types';

function minutesSince(timestamp: string | null, now: string): number {
  if (!timestamp) return 0;
  const diffMs = new Date(now).getTime() - new Date(timestamp).getTime();
  return Math.max(0, diffMs / 60000);
}

export function calculateWeaknessScore(progress: UnitProgress, now: string): number {
  const seenCount = Math.max(progress.seenCount, 1);
  const accuracy = progress.correctCount / seenCount;
  const recentWrongMinutes = minutesSince(progress.lastWrongAt, now);
  const recencyBoost = progress.lastWrongAt ? Math.max(0, 180 - recentWrongMinutes) / 30 : 0;
  const typingBoost = progress.mode === 'input' ? 1.5 : 0;

  let score = (
    progress.wrongCount * 3 +
    progress.consecutiveWrong * 4 +
    (1 - accuracy) * 5 +
    recencyBoost +
    typingBoost -
    progress.consecutiveCorrect * 2
  );

  // 24-hour cooldown: 90% reduction if seen in the last 24 hours
  const minutesSinceLastSeen = minutesSince(progress.lastSeenAt, now);
  if (progress.lastSeenAt && minutesSinceLastSeen < 24 * 60) {
    score *= 0.1;
  }

  return score;
}
