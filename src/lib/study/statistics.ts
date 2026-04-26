import type { StudyState } from './types';
import type { WordEntry } from '@/lib/distractorEngine';

export interface DailyStats {
  dueReview: number;
  mistakes: number;
  unstable: number;
  newQuestions: number;
}

export function getDailyPlanStats(
  studyState: StudyState,
  availableWords: WordEntry[],
  now: string
): DailyStats {
  let dueReview = 0;
  let mistakes = 0;
  let unstable = 0;

  const nowMs = new Date(now).getTime();

  // Find unused words
  const seenKeys = new Set(Object.keys(studyState.unitProgress).map(k => k.split('::')[0]));
  const unusedWords = availableWords.filter(w => !seenKeys.has(w.id));
  const newQuestions = Math.min(unusedWords.length, studyState.preferences.dailyNewLimit);

  for (const progress of Object.values(studyState.unitProgress)) {
    // Skip if it doesn't match the current level/type config
    // Actually, progress holds what the user HAS studied. We should probably count everything due.
    // Or we only count words that are in `availableWords`? Usually, reviews are independent of current level config.
    
    // Is Due
    const isDue = new Date(progress.nextReviewDate).getTime() <= nowMs;
    
    // Mistakes (e.g. wrong recently and not yet graduated)
    const isMistake = progress.consecutiveWrong > 0 || (progress.wrongCount > 0 && progress.status === 'learning');

    // Unstable (accuracy < 0.8)
    const seenCount = Math.max(progress.seenCount, 1);
    const accuracy = progress.correctCount / seenCount;
    const isUnstable = accuracy < 0.8 && !isMistake && progress.status !== 'graduated';

    if (isMistake && isDue) {
      mistakes++;
    } else if (isUnstable && isDue) {
      unstable++;
    } else if (isDue) {
      dueReview++;
    }
  }

  return { dueReview, mistakes, unstable, newQuestions };
}
