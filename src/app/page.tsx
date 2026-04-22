'use client';

import { useEffect, useMemo, useState } from 'react';
import SetupMenu from '@/components/SetupMenu';
import PracticeSession from '@/components/PracticeSession';
import { buildSetupSummary } from '@/components/setupMenu.helpers';
import { buildPracticeSession } from '@/lib/sessionBuilder';
import { useStore } from '@/lib/store';

export default function Home() {
  const { activeSession, checkDailyStreak, config, dailyStreak, startSession } = useStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDailyStreak();
  }, [checkDailyStreak]);

  const setupSummary = useMemo(() => buildSetupSummary(config), [config]);

  const handleStart = () => {
    const result = buildPracticeSession(config);

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
        <PracticeSession />
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[color:var(--bg)] selection:bg-[color:var(--accent-soft)] selection:text-[color:var(--accent)]">
      <div className="blob-bg" />
      
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center gap-10 px-4 py-12 sm:px-6 lg:px-8">
        
        <header className="w-full text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center justify-center rounded-full border-[3px] border-[color:var(--ink)] bg-[#fde68a] px-4 py-1.5 shadow-[4px_4px_0px_0px_var(--ink)]">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[color:var(--ink)]">
              Katachi ✦ 形
            </span>
          </div>
          
          <h1 className="text-6xl font-bold tracking-tight text-[color:var(--ink)] sm:text-[5.5rem] leading-[1.1]">
            Master<br />conjugations.
          </h1>
        </header>

        <section className="w-full animate-fade-in [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="relative rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_var(--ink)]">
            <div className="flex flex-col items-center gap-8">
              
              <div className="flex w-full flex-wrap justify-center gap-4 sm:gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--muted)]">Streak</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[color:var(--accent)]">{dailyStreak}</span>
                    <span className="text-lg font-bold text-[color:var(--ink)]">days</span>
                  </div>
                </div>
                <div className="hidden sm:block w-[3px] bg-[color:var(--ink)] rounded-full" />
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--muted)]">Goal</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[color:var(--ink)]">{config.questionCount}</span>
                    <span className="text-lg font-bold text-[color:var(--muted)]">prompts</span>
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
                className="group relative inline-flex w-full items-center justify-center gap-3 rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-[color:var(--accent)] px-8 py-5 text-2xl font-bold text-white shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none sm:w-auto sm:px-16"
              >
                <span>Start Practice</span>
                <svg className="h-7 w-7 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              <p className="text-sm font-medium text-[color:var(--muted)] text-center max-w-md">
                Currently practicing: <span className="font-bold text-[color:var(--ink)]">{setupSummary}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="w-full animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <SetupMenu />
        </section>

      </div>
    </main>
  );
}