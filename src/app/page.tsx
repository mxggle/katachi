'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Dumbbell,
  Flame,
  PartyPopper,
  Shuffle,
  Target,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import SetupMenu from '@/components/SetupMenu';
import PracticeSession from '@/components/PracticeSession';
import PracticeCountDialog from '@/components/PracticeCountDialog';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { HtmlLangSync } from '@/components/HtmlLangSync';
import AuthStatus from '@/components/AuthStatus';
import { buildPracticeSession } from '@/lib/sessionBuilder';
import { getLocalDateString, useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { APP_VERSION } from '@/lib/appVersion';
import DynamicStatusBar from '@/components/DynamicStatusBar';
import { loadDictionary } from '@/lib/dictionaryLoader';
import { getDiagnosticDashboard } from '@/lib/study/statistics';
import type { PracticeType } from '@/lib/study/types';

import Logo from '@/components/Logo';


export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { activeSession, dailyStreak, startSession, updateDailyConfig, updateFreeConfig, language, studyState } = useStore();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingPracticeType, setPendingPracticeType] = useState<PracticeType | null>(null);
  const { t } = useTranslation(language);
  const authError = searchParams.get('error');
  const authErrorMessage =
    authError === 'auth_failed'
      ? t('authCallbackFailed')
      : authError === 'auth_unconfigured'
        ? t('authUnavailable')
        : null;

  const dictionaryData = useMemo(() => ({ words: loadDictionary(language ?? 'en') }), [language]);
  const availableWords = useMemo(
    () =>
      dictionaryData.words.filter(
        (word) =>
          studyState.preferences.dailySessionConfig.levels.includes(word.level as 'N5' | 'N4' | 'N3') && 
          studyState.preferences.dailySessionConfig.wordTypes.includes(word.word_type)
      ),
    [dictionaryData, studyState.preferences.dailySessionConfig]
  );

  const today = useMemo(() => getLocalDateString(), []);
  const dashboard = useMemo(
    () => getDiagnosticDashboard(studyState, availableWords, studyState.preferences.dailySessionConfig, today),
    [studyState, availableWords, today]
  );

  const progressPercent = dashboard.dailyGoal > 0
    ? Math.min(100, Math.round((dashboard.dailyProgress / dashboard.dailyGoal) * 100))
    : 0;

  const handleStart = (practiceType: PracticeType, questionCount: number) => {
    const baseConfig = practiceType === 'free' ? studyState.preferences.freeSessionConfig : studyState.preferences.dailySessionConfig;
    const nextConfig = { ...baseConfig, questionCount };
    
    if (practiceType === 'daily' || practiceType === 'weakness') {
      updateDailyConfig({ questionCount: practiceType === 'daily' ? questionCount : baseConfig.questionCount });
    } else {
      updateFreeConfig({ questionCount });
    }
    
    const result = buildPracticeSession({ ...nextConfig, practiceType }, studyState, language);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    setError(null);
    startSession(result.words, nextConfig, practiceType);
  };

  const handleStartDaily = () => {
    handleStart('daily', studyState.preferences.dailyQuestionGoal);
  };

  const handleOpenDialog = (practiceType: PracticeType) => {
    setPendingPracticeType(practiceType);
    setDialogOpen(true);
  };

  const handleDialogConfirm = (count: number) => {
    if (pendingPracticeType) {
      handleStart(pendingPracticeType, count);
      setPendingPracticeType(null);
    }
  };

  if (activeSession) {
    return (
      <main className="min-h-dvh bg-[color:var(--bg)]">
        <HtmlLangSync />
        <PracticeSession />
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[color:var(--bg)] selection:bg-[color:var(--accent-soft)] selection:text-[color:var(--accent)]">
      <DynamicStatusBar color="#f4f4ea" />
      <HtmlLangSync />
      <div className="blob-bg" />
      
      <div className="absolute left-0 top-0 z-30 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-4 shrink-0">
            <Logo size={40} className="shrink-0 text-[color:var(--ink)]" />
            <div className="flex flex-col">
              <span className="whitespace-nowrap text-lg font-black uppercase tracking-tighter leading-none">{t('appName')}</span>
            </div>
          </div>
          <AuthStatus />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-start gap-5 px-4 pb-24 pt-20 sm:px-6 sm:pt-[5.5rem] lg:px-8">
        
        <header className="relative flex w-full flex-col items-center gap-2 text-center animate-fade-in sm:gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[color:var(--muted)] opacity-60 sm:text-xs">
            {t('heroSubtitle')}
          </p>
          <h1 className="max-w-2xl text-4xl font-black tracking-tight text-[color:var(--ink)] sm:text-5xl lg:text-6xl leading-[0.95] text-balance">
            {t('heroTitleLine2') ? (
              <>
                {t('heroTitleLine1')}{language !== 'zh' && ' '}
                <span className="text-[color:var(--accent)]">{t('heroTitleLine2')}</span>
              </>
            ) : (
              t('heroTitleLine1')
            )}
          </h1>
        </header>

        <section className="w-full animate-fade-in [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="relative overflow-hidden rounded-[2rem] border-[4px] border-[color:var(--ink)] bg-white shadow-[8px_8px_0px_0px_var(--ink)] sm:rounded-[2.5rem]">
            <div className="flex flex-col">
              <div className="grid grid-cols-2 divide-x-[4px] divide-[color:var(--ink)] border-b-[4px] border-[color:var(--ink)]">
                <div className="flex flex-col items-center justify-center bg-[#fffbeb] p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    <Flame className="h-3.5 w-3.5 text-[color:var(--accent)]" strokeWidth={3} />
                    <span>{t('streak')}</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[color:var(--accent)] sm:text-5xl lg:text-6xl">{dailyStreak}</span>
                    <span className="text-sm font-bold text-[color:var(--ink)]">{t('days')}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    <Target className="h-3.5 w-3.5 text-[color:var(--accent)]" strokeWidth={3} />
                    <span>{t('goal')}</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[color:var(--ink)] sm:text-5xl lg:text-6xl">{dashboard.dailyProgress}</span>
                    <span className="text-sm font-bold text-[color:var(--muted)]">/ {dashboard.dailyGoal}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-4 sm:p-6 lg:p-8">
                {(error || authErrorMessage) && (
                  <div className="w-full rounded-2xl border-2 border-[#b42318] bg-[#fff1f2] px-6 py-4 text-center text-sm font-bold text-[#b42318] animate-shake">
                    {error ?? authErrorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {progressPercent >= 100 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-6 text-center animate-fade-in">
                      <PartyPopper className="h-14 w-14 text-[color:var(--accent)]" strokeWidth={2.5} aria-hidden="true" />
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black text-[color:var(--ink)] sm:text-3xl">{t('todayGoalComplete')}</h2>
                        <p className="text-sm font-bold text-[color:var(--muted)]">{t('dailyBudgetReached')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <CalendarCheck className="h-6 w-6 text-[color:var(--accent)]" strokeWidth={3} aria-hidden="true" />
                          <h2 className="text-2xl font-black text-[color:var(--ink)] sm:text-3xl">{t('todayPractice')}</h2>
                        </div>
                        <p className="text-center text-sm font-bold text-[color:var(--muted)]">{t('todayPracticeDescription')}</p>
                      </div>

                      {/* Daily progress bar */}
                      <div className="mx-auto w-full max-w-sm">
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-[color:var(--ink)]/10">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-[color:var(--accent)] transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-center text-xs font-bold text-[color:var(--muted)]">
                          {progressPercent}%
                        </p>
                      </div>

                      <button
                        onClick={handleStartDaily}
                        className="group relative inline-flex w-full items-center justify-center gap-4 rounded-[1.75rem] border-[4px] border-[color:var(--ink)] bg-[color:var(--accent)] px-6 py-4 text-xl font-black text-white shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none sm:px-8 sm:py-5 sm:text-2xl lg:text-3xl"
                      >
                        <span className="whitespace-nowrap">{t('startTodayPractice')}</span>
                        <ArrowRight className="h-7 w-7 shrink-0 transition-transform group-hover:translate-x-2 sm:h-8 sm:w-8" strokeWidth={3.5} aria-hidden="true" />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => handleOpenDialog('weakness')}
                      className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-[1.75rem] border-[3px] border-[color:var(--ink)] bg-[#fffbeb] px-3 py-4 text-center shadow-[5px_5px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_var(--ink)] sm:min-h-28 sm:px-5 sm:py-5"
                    >
                      <Dumbbell className="h-7 w-7 text-[color:var(--accent)] sm:h-8 sm:w-8" strokeWidth={3} aria-hidden="true" />
                      <span className="text-lg font-black leading-tight text-[color:var(--ink)] sm:text-xl">{t('weaknessConsolidation')}</span>
                      <span className="text-[10px] font-bold leading-tight text-[color:var(--muted)] sm:text-xs">{t('weaknessConsolidationDescription')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDialog('free')}
                      className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-[1.75rem] border-[3px] border-[color:var(--ink)] bg-[#fffbeb] px-3 py-4 text-center shadow-[5px_5px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_var(--ink)] sm:min-h-28 sm:px-5 sm:py-5"
                    >
                      <Shuffle className="h-7 w-7 text-[color:var(--accent)] sm:h-8 sm:w-8" strokeWidth={3} aria-hidden="true" />
                      <span className="text-lg font-black leading-tight text-[color:var(--ink)] sm:text-xl">{t('freePractice')}</span>
                      <span className="text-[10px] font-bold leading-tight text-[color:var(--muted)] sm:text-xs">{t('freePracticeDescription')}</span>
                    </button>
                  </div>

                  <Link
                    href="/progress"
                    className="group flex w-full items-center justify-between gap-4 rounded-[1.25rem] border-[3px] border-[color:var(--ink)] bg-[#f4f4ea] px-5 py-4 text-left transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-[#fffbeb] shadow-[4px_4px_0px_0px_var(--ink)]"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[0.85rem] bg-white border-[3px] border-[color:var(--ink)]">
                        <BarChart3 className="h-6 w-6 text-[color:var(--accent)]" strokeWidth={2.5} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[15px] font-black text-[color:var(--ink)] sm:text-base">{t('progressSnapshot')}</p>
                        <p className="truncate text-[11px] font-bold text-[color:var(--muted)] sm:text-xs">{t('progressPageTitle')}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 shrink-0 text-[color:var(--ink)] transition-transform group-hover:translate-x-1" strokeWidth={3} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <SetupMenu />
        </section>

        <PracticeCountDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={handleDialogConfirm}
          language={language}
          defaultCount={pendingPracticeType === 'free' ? studyState.preferences.freeSessionConfig.questionCount : studyState.preferences.dailySessionConfig.questionCount}
        />

        <footer className="mt-12 flex w-full flex-col items-center gap-8 animate-fade-in [animation-delay:300ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[color:var(--ink)]/20">
              {t('appName')} &copy; {new Date().getFullYear()} · v{APP_VERSION}
            </p>
            <div className="h-px w-12 bg-[color:var(--ink)]/10" />
            <LanguageSwitcher />
          </div>
        </footer>
      </div>
    </main>
  );
}
