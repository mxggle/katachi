import type { ConjugationType } from '@/lib/distractorEngine';
import { calculateWeaknessScore } from '@/lib/study/scoring';
import type { PracticeMode, StudyState } from '@/lib/study/types';

export function getOverviewStats(studyState: StudyState, today = new Date().toISOString().split('T')[0]) {
  const totalAnswered = studyState.learnerSummary.totalAnswered;
  const totalCorrect = studyState.learnerSummary.totalCorrect;
  const studiedToday = today
    ? studyState.attemptHistory.filter((attempt) => attempt.answeredAt.startsWith(today)).length
    : 0;

  return {
    totalAnswered,
    accuracy: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    dailyStreak: studyState.learnerSummary.dailyStreak,
    studiedToday,
  };
}

export function getWeakestConjugations(studyState: StudyState, limit = 5) {
  const grouped = new Map<ConjugationType, { answered: number; correct: number; wrong: number }>();

  for (const item of Object.values(studyState.unitProgress)) {
    const current = grouped.get(item.conjugationType) ?? { answered: 0, correct: 0, wrong: 0 };
    grouped.set(item.conjugationType, {
      answered: current.answered + item.seenCount,
      correct: current.correct + item.correctCount,
      wrong: current.wrong + item.wrongCount,
    });
  }

  return Array.from(grouped.entries())
    .map(([conjugationType, stats]) => ({
      conjugationType,
      answered: stats.answered,
      accuracy: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0,
      wrong: stats.wrong,
    }))
    .sort((left, right) => left.accuracy - right.accuracy || right.wrong - left.wrong)
    .slice(0, limit);
}

export function getWeakestItems(studyState: StudyState, limit = 5) {
  const now = studyState.learnerSummary.lastSessionAt ?? new Date().toISOString();

  return Object.values(studyState.unitProgress)
    .map((item) => ({
      wordId: item.wordId,
      conjugationType: item.conjugationType,
      mode: item.mode,
      wordType: item.wordType,
      accuracy: item.seenCount > 0 ? Math.round((item.correctCount / item.seenCount) * 100) : 0,
      weaknessScore: calculateWeaknessScore(item, now),
    }))
    .sort((left, right) => right.weaknessScore - left.weaknessScore)
    .slice(0, limit);
}

export function getModeBreakdown(studyState: StudyState) {
  const grouped = new Map<PracticeMode, { answered: number; correct: number }>();

  for (const item of Object.values(studyState.unitProgress)) {
    const current = grouped.get(item.mode) ?? { answered: 0, correct: 0 };
    grouped.set(item.mode, {
      answered: current.answered + item.seenCount,
      correct: current.correct + item.correctCount,
    });
  }

  return Array.from(grouped.entries())
    .map(([mode, stats]) => ({
      mode,
      answered: stats.answered,
      accuracy: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0,
    }))
    .sort((left, right) => left.mode.localeCompare(right.mode));
}

export function getRecentActivity(studyState: StudyState, days: number, endDate: string) {
  if (studyState.attemptHistory.length === 0) {
    return [];
  }

  const results: { date: string; answered: number; correct: number }[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(`${endDate}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - index);
    const key = date.toISOString().split('T')[0];
    const attempts = studyState.attemptHistory.filter((attempt) => attempt.answeredAt.startsWith(key));

    results.push({
      date: key,
      answered: attempts.length,
      correct: attempts.filter((attempt) => attempt.isCorrect).length,
    });
  }

  return results;
}
