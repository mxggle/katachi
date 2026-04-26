import type { StudyState, StudySessionConfig, FormStats, PatternStats } from './types';
import type { WordEntry } from '@/lib/distractorEngine';
import { isSameLocalDate } from '@/lib/store';
import { getAllPatternsForForm } from '@/lib/study/patterns';

// ---------------------------------------------------------------------------
// Diagnostic Dashboard (replaces old getDailyPlanStats)
// ---------------------------------------------------------------------------

export interface DiagnosticDashboard {
  /** Questions completed today that count toward daily goal (non-retry, daily only) */
  dailyProgress: number;
  /** Target question count per day */
  dailyGoal: number;
  /** Weakest form by accuracy (null if no data) */
  weakestForm: FormStats | null;
  /** Weakest pattern by accuracy (null if no data) */
  weakestPattern: PatternStats | null;
  /** Forms the user has never practiced */
  undiagnosedForms: string[];
  /** Patterns the user has never practiced */
  undiagnosedPatterns: string[];
  /** Human-readable recommendation */
  recommendedFocus: string;
}

export function getDiagnosticDashboard(
  studyState: StudyState,
  availableWords: WordEntry[],
  config: StudySessionConfig,
  today: string,
): DiagnosticDashboard {
  // Daily progress: count attempts that count toward daily goal
  const dailyProgress = studyState.attemptHistory.filter(
    (a) => isSameLocalDate(a.answeredAt, today) && a.countsTowardDailyGoal === true
  ).length;

  const dailyGoal = studyState.preferences.dailyQuestionGoal;

  // Find weakest form among diagnosed forms
  const diagnosedForms = Object.values(studyState.formStats).filter(
    (fs) => fs.totalAttempts > 0 && config.forms.includes(fs.form) && fs.accuracy < 1.0
  );
  const weakestForm = diagnosedForms.length > 0
    ? diagnosedForms.reduce((worst, fs) =>
        fs.accuracy < worst.accuracy ? fs : worst
      )
    : null;

  // Find weakest pattern among diagnosed patterns
  const diagnosedPatterns = Object.values(studyState.patternStats).filter(
    (ps) => ps.totalAttempts > 0 && config.forms.includes(ps.form) && ps.accuracy < 1.0
  );
  const weakestPattern = diagnosedPatterns.length > 0
    ? diagnosedPatterns.reduce((worst, ps) =>
        ps.accuracy < worst.accuracy ? ps : worst
      )
    : null;

  // Discover undiagnosed forms
  const wordGroups = [...new Set(availableWords.map((w) => w.group))];
  const undiagnosedForms = config.forms.filter(
    (form) => !studyState.formStats[form] || studyState.formStats[form].totalAttempts === 0
  );

  // Discover undiagnosed patterns
  const allPatterns = config.forms.flatMap((form) => getAllPatternsForForm(form, wordGroups));
  const undiagnosedPatterns = allPatterns.filter(
    (pattern) => !studyState.patternStats[pattern] || studyState.patternStats[pattern].totalAttempts === 0
  );

  // Generate recommendation
  const recommendedFocus = generateRecommendation(weakestForm, weakestPattern, undiagnosedForms, undiagnosedPatterns);

  return {
    dailyProgress,
    dailyGoal,
    weakestForm,
    weakestPattern,
    undiagnosedForms,
    undiagnosedPatterns,
    recommendedFocus,
  };
}

function generateRecommendation(
  weakestForm: FormStats | null,
  weakestPattern: PatternStats | null,
  undiagnosedForms: string[],
  undiagnosedPatterns: string[],
): string {
  if (weakestPattern && weakestPattern.accuracy < 0.5) {
    return `focus_pattern:${weakestPattern.pattern}`;
  }
  if (weakestForm && weakestForm.accuracy < 0.6) {
    return `focus_form:${weakestForm.form}`;
  }
  if (undiagnosedForms.length > 0) {
    return `explore_form:${undiagnosedForms[0]}`;
  }
  if (undiagnosedPatterns.length > 0) {
    return `explore_pattern:${undiagnosedPatterns[0]}`;
  }
  if (weakestPattern) {
    return `reinforce_pattern:${weakestPattern.pattern}`;
  }
  return 'all_mastered';
}

// ---------------------------------------------------------------------------
// Legacy compatibility: getDailyPlanStats
// Still exported for any code that hasn't migrated yet.
// ---------------------------------------------------------------------------

export interface DailyStats {
  dueReview: number;
  mistakes: number;
  unstable: number;
  newQuestions: number;
}

/** @deprecated Use getDiagnosticDashboard instead */
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

  for (const progress of Object.values(studyState.unitProgress)) {
    if (!availableWordIds.has(progress.wordId)) continue;
    if (progress.mode !== config.mode) continue;
    if (!configForms.has(progress.conjugationType)) continue;

    const isDue = new Date(progress.nextReviewDate).getTime() <= nowMs;

    const isMistake =
      progress.consecutiveWrong > 0 || (progress.wrongCount > 0 && progress.status === 'learning');

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
