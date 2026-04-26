import type { UnitProgress } from './types';

export function getInitialSRS(now?: string) {
  return {
    status: 'learning' as const,
    interval: 0,
    ease: 2.5,
    nextReviewDate: now ?? new Date().toISOString(),
  };
}

export function updateSRS(progress: UnitProgress, isCorrect: boolean, now: string) {
  let { status, interval, ease } = progress;

  if (isCorrect) {
    if (status === 'learning') {
      status = 'review';
      interval = 1; // 1 day
    } else {
      interval = Math.max(1, Math.round(interval * ease));
      ease = Math.min(3.0, ease + 0.1);
      if (interval >= 21) {
        status = 'graduated';
      }
    }
  } else {
    status = 'learning';
    interval = 0; // Immediate review
    ease = Math.max(1.3, ease - 0.2);
  }

  // Calculate nextReviewDate
  const nextDate = new Date(now);
  if (interval === 0) {
    nextDate.setMinutes(nextDate.getMinutes() + 10); // 10 minutes for learning
  } else {
    nextDate.setHours(nextDate.getHours() + interval * 24);
  }

  return {
    status,
    interval,
    ease,
    nextReviewDate: nextDate.toISOString(),
  };
}
