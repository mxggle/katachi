'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Dumbbell,
  Flame,
  Gauge,
  RotateCcw,
  Shuffle,
  Sparkles,
  Target,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import SetupMenu from '@/components/SetupMenu';
import PracticeSession from '@/components/PracticeSession';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { HtmlLangSync } from '@/components/HtmlLangSync';
import AuthStatus from '@/components/AuthStatus';
import { buildSetupSummary } from '@/components/setupMenu.helpers';
import { buildPracticeSession } from '@/lib/sessionBuilder';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { APP_VERSION } from '@/lib/appVersion';
import DynamicStatusBar from '@/components/DynamicStatusBar';
import { loadDictionary } from '@/lib/dictionaryLoader';
import { getDailyPlanStats } from '@/lib/study/statistics';

import Logo from '@/components/Logo';


export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { activeSession, config, dailyStreak, startSession, updateConfig, language, studyState } = useStore();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(language);
  const authError = searchParams.get('error');
  const authErrorMessage =
    authError === 'auth_failed'
      ? t('authCallbackFailed')
      : authError === 'auth_unconfigured'
        ? t('authUnavailable')
        : null;

  const setupSummary = useMemo(() => buildSetupSummary(config, language), [config, language]);

  const dictionaryData = useMemo(() => ({ words: loadDictionary(language ?? 'en') }), [language]);
  const availableWords = useMemo(
    () =>
      dictionaryData.words.filter(
        (word) =>
          config.levels.includes(word.level as 'N5' | 'N4' | 'N3') && config.wordTypes.includes(word.word_type)
      ),
    [dictionaryData, config]
  );

  const dailyStats = useMemo(
    () => getDailyPlanStats(studyState, availableWords, new Date().toISOString()),
    [studyState, availableWords]
  );

  const dailyPlan = [
    { label: t('wrongReview'), count: dailyStats.mistakes, icon: AlertCircle, color: 'text-[#ef6f6c]', bg: 'bg-[#fff1f2]' },
    { label: t('unstableItems'), count: dailyStats.unstable, icon: Gauge, color: 'text-[#b7791f]', bg: 'bg-[#fffbeb]' },
    { label: t('dueReview'), count: dailyStats.dueReview, icon: RotateCcw, color: 'text-[#647acb]', bg: 'bg-[#eef2ff]' },
    { label: t('newQuestions'), count: dailyStats.newQuestions, icon: Sparkles, color: 'text-[#3b82a0]', bg: 'bg-[#eef9ff]' },
  ];

  const handleStart = (practiceType: typeof config.practiceType, questionCount = config.questionCount) => {
    const nextConfig = { ...config, practiceType, questionCount };
    updateConfig(nextConfig);
    const result = buildPracticeSession(nextConfig, studyState, language);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    setError(null);
    startSession(result.words);
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
                    <span className="text-4xl font-black text-[color:var(--ink)] sm:text-5xl lg:text-6xl">{config.questionCount}</span>
                    <span className="text-sm font-bold text-[color:var(--muted)]">{t('prompts')}</span>
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
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <CalendarCheck className="h-6 w-6 text-[color:var(--accent)]" strokeWidth={3} aria-hidden="true" />
                        <h2 className="text-2xl font-black text-[color:var(--ink)] sm:text-3xl">{t('todayPractice')}</h2>
                      </div>
                      <p className="text-center text-sm font-bold text-[color:var(--muted)]">{t('todayPracticeDescription')}</p>
                    </div>

                    <div className="mx-auto flex w-full max-w-sm flex-col gap-3 py-2">
                      {dailyPlan.map((item) => {
                        const PlanIcon = item.icon;

                        return (
                          <div
                            key={item.label}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                                <PlanIcon className={`h-4 w-4 ${item.color}`} strokeWidth={3} aria-hidden="true" />
                              </span>
                              <span className="text-sm font-bold text-[color:var(--ink)]">{item.label}</span>
                            </div>
                            <div className="mx-3 h-px flex-1 border-b-[2px] border-dotted border-[color:var(--ink)] opacity-20" />
                            <span className="text-base font-black text-[color:var(--ink)]">{item.count}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handleStart('daily', config.questionCount)}
                      className="group relative inline-flex w-full items-center justify-center gap-4 rounded-[1.75rem] border-[4px] border-[color:var(--ink)] bg-[color:var(--accent)] px-6 py-4 text-xl font-black text-white shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none sm:px-8 sm:py-5 sm:text-2xl lg:text-3xl"
                    >
                      <span className="whitespace-nowrap">{t('startTodayPractice')}</span>
                      <ArrowRight className="h-7 w-7 shrink-0 transition-transform group-hover:translate-x-2 sm:h-8 sm:w-8" strokeWidth={3.5} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleStart('weakness', 5)}
                      className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-[1.75rem] border-[3px] border-[color:var(--ink)] bg-[#fffbeb] px-5 py-5 text-center shadow-[5px_5px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_var(--ink)]"
                    >
                      <Dumbbell className="h-8 w-8 text-[color:var(--accent)]" strokeWidth={3} aria-hidden="true" />
                      <span className="text-xl font-black text-[color:var(--ink)]">{t('weaknessConsolidation')}</span>
                      <span className="text-xs font-bold text-[color:var(--muted)]">{t('weaknessConsolidationDescription')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStart('free')}
                      className="group flex min-h-28 flex-col items-center justify-center gap-2 rounded-[1.75rem] border-[3px] border-[color:var(--ink)] bg-[#fffbeb] px-5 py-5 text-center shadow-[5px_5px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_var(--ink)]"
                    >
                      <Shuffle className="h-8 w-8 text-[color:var(--accent)]" strokeWidth={3} aria-hidden="true" />
                      <span className="text-xl font-black text-[color:var(--ink)]">{t('freePractice')}</span>
                      <span className="text-xs font-bold text-[color:var(--muted)]">{t('freePracticeDescription')}</span>
                    </button>
                  </div>

                  <Link
                    href="/progress"
                    className="group flex w-full items-center justify-between gap-4 rounded-2xl border-[2px] border-[color:var(--ink)] bg-[#f4f4ea] px-5 py-4 text-left transition-colors hover:bg-[color:var(--accent-soft)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                        <BarChart3 className="h-5 w-5 text-[color:var(--ink)]" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">{t('currentlyPracticing')}</p>
                        <p className="truncate text-sm font-black text-[color:var(--ink)]">{setupSummary}</p>
                      </div>
                    </div>
                    <span className="hidden shrink-0 text-sm font-black text-[color:var(--ink)] sm:inline">
                      {t('viewProgress')}
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-[color:var(--ink)] transition-transform group-hover:translate-x-1 sm:hidden" strokeWidth={3} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <SetupMenu />
        </section>

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
