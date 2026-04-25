'use client';

import Link from 'next/link';
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

import Logo from '@/components/Logo';

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { activeSession, config, dailyStreak, startSession, language, studyState } = useStore();
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

  const handleStart = () => {
    const result = buildPracticeSession(config, studyState, language);

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
      
      {/* Top Utility Bar */}
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

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-start gap-12 px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        
        <header className="relative w-full text-center space-y-4 animate-fade-in flex flex-col items-center">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[color:var(--muted)] opacity-60">
            {t('heroSubtitle')}
          </p>
          <h1 className="text-5xl font-black tracking-tight text-[color:var(--ink)] sm:text-8xl leading-[0.9] text-balance">
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
          <div className="relative rounded-[2.5rem] border-[4px] border-[color:var(--ink)] bg-white shadow-[8px_8px_0px_0px_var(--ink)] overflow-hidden">
            <div className="flex flex-col">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 divide-x-[4px] divide-[color:var(--ink)] border-b-[4px] border-[color:var(--ink)]">
                <div className="p-6 sm:p-8 flex flex-col items-center justify-center bg-[#fffbeb]">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">{t('streak')}</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-5xl sm:text-6xl font-black text-[color:var(--accent)]">{dailyStreak}</span>
                    <span className="text-sm font-bold text-[color:var(--ink)]">{t('days')}</span>
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">{t('goal')}</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-5xl sm:text-6xl font-black text-[color:var(--ink)]">{config.questionCount}</span>
                    <span className="text-sm font-bold text-[color:var(--muted)]">{t('prompts')}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-10 space-y-10">
                {(error || authErrorMessage) && (
                  <div className="w-full rounded-2xl border-2 border-[#b42318] bg-[#fff1f2] px-6 py-4 text-center text-sm font-bold text-[#b42318] animate-shake">
                    {error ?? authErrorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-8">
                  <div className="space-y-4">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      {t('currentlyPracticing')} <span className="text-[color:var(--ink)]">{setupSummary}</span>
                    </p>
                    <button
                      onClick={handleStart}
                      className="group relative inline-flex w-full items-center justify-center gap-4 rounded-[1.75rem] border-[4px] border-[color:var(--ink)] bg-[color:var(--accent)] px-8 py-6 text-2xl sm:text-3xl font-black text-white shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
                    >
                      <span className="whitespace-nowrap">{t('startPractice')}</span>
                      <svg className="h-8 w-8 shrink-0 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>

                  <Link
                    href="/progress"
                    className="group flex w-full flex-col gap-4 rounded-[1.75rem] border-[3px] border-[color:var(--ink)] bg-[#f4f4ea] px-6 py-6 text-left shadow-[5px_5px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_var(--ink)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        {t('itemsStudied')}
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black tracking-tight text-[color:var(--ink)]">
                          {studyState.learnerSummary.totalAnswered}
                        </span>
                        <span className="text-xs font-bold text-[color:var(--muted)]">
                          {t('totalAnswered')}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex min-h-12 items-center justify-center rounded-full border-[3px] border-[color:var(--ink)] bg-white px-6 py-2 text-sm font-black text-[color:var(--ink)] shadow-[4px_4px_0px_0px_var(--ink)] group-hover:bg-[color:var(--accent-soft)] transition-colors sm:shrink-0">
                      {t('viewProgress')}
                    </span>
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
