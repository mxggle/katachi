import { ConjugationType, generateDistractors, WordEntry } from '@/lib/distractorEngine';
import { loadDictionary } from '@/lib/dictionaryLoader';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import { getLocalDateString, isSameLocalDate, type SessionConfig } from '@/lib/store';
import { selectPracticeUnits } from '@/lib/study/scheduler';
import { makeUnitKey, type StudyState } from '@/lib/study/types';

interface BuildPracticeSessionOptions {
  focusUnitKey?: string;
}

/**
 * Count daily goal progress: only daily, non-retry attempts count.
 */
function getDailyGoalProgress(studyState: StudyState, today: string): number {
  return studyState.attemptHistory.filter(
    (a) =>
      isSameLocalDate(a.answeredAt, today) &&
      a.countsTowardDailyGoal === true
  ).length;
}

function parseFocusUnitKey(focusUnitKey?: string) {
  if (!focusUnitKey) return null;
  const [wordId, conjugationType, mode] = focusUnitKey.split('::');
  if (!wordId || !conjugationType || !mode) return null;
  return {
    wordId,
    conjugationType: conjugationType as ConjugationType,
    mode,
  };
}

export function buildPracticeSession(
  config: SessionConfig,
  studyState: StudyState,
  language?: Language,
  options: BuildPracticeSessionOptions = {}
): { error: string } | { words: { unitKey: string; word: WordEntry; type: ConjugationType; choices: string[] }[] } {
  const dict = translations[language ?? 'en'];
  const t = (key: keyof typeof dict): string => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const dictionaryData = { words: loadDictionary(language ?? 'en') };
  const focusedUnit = parseFocusUnitKey(options.focusUnitKey);
  const availableWords = dictionaryData.words.filter(
    (word) =>
      word.id === focusedUnit?.wordId ||
      (config.levels.includes(word.level as 'N5' | 'N4' | 'N3') && config.wordTypes.includes(word.word_type))
  );

  if (availableWords.length === 0) {
    return { error: t('noWordsMatch') };
  }

  const today = getLocalDateString();
  const dailyProgress = getDailyGoalProgress(studyState, today);
  const remainingDailyBudget = studyState.preferences.dailyQuestionGoal - dailyProgress;

  if (config.practiceType === 'daily' && remainingDailyBudget <= 0) {
    return { error: t('dailyBudgetReached') };
  }

  const effectiveConfig = {
    ...config,
    questionCount:
      config.practiceType === 'daily'
        ? Math.min(config.questionCount, remainingDailyBudget)
        : config.questionCount,
  };

  const selectedUnits = selectPracticeUnits({
    words: availableWords,
    config: effectiveConfig,
    practiceType: config.practiceType,
    preferences: studyState.preferences,
    unitProgress: studyState.unitProgress,
    studyState,
    now: new Date().toISOString(),
  });

  let orderedUnits = selectedUnits;
  if (focusedUnit && focusedUnit.mode === config.mode) {
    const focusIndex = orderedUnits.findIndex((unit) => unit.unitKey === options.focusUnitKey);

    if (focusIndex >= 0) {
      orderedUnits = [orderedUnits[focusIndex], ...orderedUnits.filter((_, index) => index !== focusIndex)];
    } else {
      const focusWord = dictionaryData.words.find((word) => word.id === focusedUnit.wordId);
      if (focusWord && focusWord.conjugations[focusedUnit.conjugationType]) {
        orderedUnits = [
          {
            unitKey: options.focusUnitKey!,
            word: focusWord,
            conjugationType: focusedUnit.conjugationType,
            mode: config.mode,
            wordType: focusWord.word_type,
            rulePattern: '',
            nextReviewDate: new Date(0).toISOString(),
          },
          ...orderedUnits,
        ].slice(0, effectiveConfig.questionCount);
      }
    }
  }

  const sessionWords = orderedUnits.map(({ word, conjugationType }) => {
    const choices =
      config.mode === 'choice'
        ? [word.conjugations[conjugationType], ...generateDistractors(word, conjugationType)].sort(
            () => Math.random() - 0.5
          )
        : [];

    return {
      unitKey: makeUnitKey(word.id, conjugationType, config.mode),
      word,
      type: conjugationType,
      choices,
    };
  });

  if (sessionWords.length === 0) {
    return {
      error: t('couldNotBuildSession'),
    };
  }

  return { words: sessionWords };
}
