'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import SetupMenu from '@/components/SetupMenu';
import PracticeSession from '@/components/PracticeSession';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { HtmlLangSync } from '@/components/HtmlLangSync';
import { buildSetupSummary } from '@/components/setupMenu.helpers';
import { buildPracticeSession } from '@/lib/sessionBuilder';
import { useStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

import Logo from '@/components/Logo';

export default function Home() {
  const { activeSession, config, dailyStreak, startSession, language, studyState } = useStore();
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation(language);

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
      <HtmlLangSync />
      <div className="blob-bg" />
      
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center gap-10 px-4 py-12 sm:px-6 lg:px-8">
        
        <header className="w-full text-center space-y-6 animate-fade-in flex flex-col items-center">
          <Logo size={120} className="text-[color:var(--ink)]" />
          
          <h1 className="text-4xl font-bold tracking-tight text-[color:var(--ink)] sm:text-7xl leading-[1.1] text-balance">
            {t('heroTitleLine2') ? (
              <>
                {t('heroTitleLine1')} {t('heroTitleLine2')}
              </>
            ) : (
              t('heroTitleLine1')
            )}
          </h1>
        </header>

        <section className="w-full animate-fade-in [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="relative rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_var(--ink)]">
            <div className="flex flex-col items-center gap-8">
              
              <div className="flex w-full flex-wrap justify-center gap-4 sm:gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--muted)]">{t('streak')}</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[color:var(--accent)]">{dailyStreak}</span>
                    <span className="text-lg font-bold text-[color:var(--ink)]">{t('days')}</span>
                  </div>
                </div>
                <div className="hidden sm:block w-[3px] bg-[color:var(--ink)] rounded-full" />
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--muted)]">{t('goal')}</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[color:var(--ink)]">{config.questionCount}</span>
                    <span className="text-lg font-bold text-[color:var(--muted)]">{t('prompts')}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="w-full rounded-xl border-2 border-[#b42318] bg-[#fff1f2] px-4 py-3 text-center text-sm font-bold text-[#b42318]">
                  {error}
                </div>
              )}

              <button
                onClick={handleStart}
                className="group relative inline-flex w-full items-center justify-center gap-3 rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-[color:var(--accent)] px-8 py-5 text-xl sm:text-2xl font-bold text-white shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none sm:w-auto sm:px-16"
              >
                <span className="text-pretty text-center">{t('startPractice')}</span>
                <svg className="h-7 w-7 shrink-0 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <Link
                href="/progress"
                className="flex w-full flex-col gap-4 rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-[color:var(--accent-soft)] px-5 py-5 text-left shadow-[5px_5px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_var(--ink)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    {t('itemsStudied')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight text-[color:var(--ink)]">
                      {studyState.learnerSummary.totalAnswered}
                    </span>
                    <span className="text-sm font-semibold text-[color:var(--muted)]">
                      {t('totalAnswered')}
                    </span>
                  </div>
                </div>
                <span className="inline-flex min-h-11 items-center justify-center rounded-full border-[2px] border-[color:var(--ink)] bg-white px-5 py-2 text-sm font-bold text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)] transition-all sm:shrink-0">
                  {t('viewProgress')}
                </span>
              </Link>
              
              <p className="text-sm font-medium text-[color:var(--muted)] text-center max-w-md">
                {t('currentlyPracticing')} <span className="font-bold text-[color:var(--ink)]">{setupSummary}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="w-full animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <SetupMenu />
        </section>

        <footer className="mt-8 flex w-full justify-center animate-fade-in [animation-delay:300ms] opacity-0 [animation-fill-mode:forwards]">
          <LanguageSwitcher />
        </footer>
      </div>
    </main>
  );
}
