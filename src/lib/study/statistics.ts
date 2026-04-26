import type { StudyState, StudySessionConfig } from './types';
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
  now: string,
  config: StudySessionConfig
): DailyStats {
  let dueReview = 0;
  let mistakes = 0;
  let unstable = 0;

  const nowMs = new Date(now).getTime();
  const availableWordIds = new Set(availableWords.map((w) => w.id));
  const configForms = new Set(config.forms);

  // Only count progress for units that match the current session config
  for (const progress of Object.values(studyState.unitProgress)) {
    if (!availableWordIds.has(progress.wordId)) continue;
    if (progress.mode !== config.mode) continue;
    if (!configForms.has(progress.conjugationType)) continue;

    const isDue = new Date(progress.nextReviewDate).getTime() <= nowMs;

    // Mistakes (e.g. wrong recently and not yet graduated)
    const isMistake =
      progress.consecutiveWrong > 0 || (progress.wrongCount > 0 && progress.status === 'learning');

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

  // New questions: words in availableWords that have NO progress at all for the current config
  const seenWordIds = new Set(
    Object.values(studyState.unitProgress)
      .filter(
        (progress) =>
          availableWordIds.has(progress.wordId) &&
          progress.mode === config.mode &&
          configForms.has(progress.conjugationType)
      )
      .map((progress) => progress.wordId)
  );
  const unusedWords = availableWords.filter((w) => !seenWordIds.has(w.id));
  const newQuestions = Math.min(unusedWords.length, studyState.preferences.dailyNewLimit);

  return { dueReview, mistakes, unstable, newQuestions };
}
