'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ModeBreakdownPanel } from '@/components/progress/ModeBreakdownPanel';
import { OverviewPanel } from '@/components/progress/OverviewPanel';
import { RecentActivityPanel } from '@/components/progress/RecentActivityPanel';
import { WeaknessPanels } from '@/components/progress/WeaknessPanels';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/components/AuthProvider';
import { loadDictionary } from '@/lib/dictionaryLoader';
import { getConjugationLabel, getPracticeModeLabel, getWordDisplayText } from '@/lib/displayText';
import { useTranslation } from '@/lib/i18n';
import { buildPracticeSession } from '@/lib/sessionBuilder';
import { getLocalDateString, useStore } from '@/lib/store';
import type { ConjugationType } from '@/lib/distractorEngine';
import {
  getModeBreakdown,
  getOverviewStats,
  getRecentActivity,
  getWeakestConjugations,
  getWeakestItems,
} from '@/lib/study/progress';

export default function ProgressPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { config, language, startSession, studyState, updateConfig } = useStore();
  const { t } = useTranslation(language);
  const [error, setError] = useState<string | null>(null);
  const today = getLocalDateString();
  const overview = getOverviewStats(studyState, today);
  const weakestConjugations = getWeakestConjugations(studyState, 4);
  const weakestItems = getWeakestItems(studyState, 4);
  const modeBreakdown = getModeBreakdown(studyState);
  const wordLabels = Object.fromEntries(
    loadDictionary(language).map((word) => [word.id, getWordDisplayText(word)])
  );
  const recentActivity = getRecentActivity(
    studyState,
    7,
    today
  );
  const focusItem = weakestItems[0];
  const focusConjugation = weakestConjugations[0];

  const launchDrill = (
    nextConfig = config,
    options: {
      focusUnitKey?: string;
    } = {}
  ) => {
    const result = buildPracticeSession(nextConfig, studyState, language, options);
    if ('error' in result) {
      setError(result.error);
      return;
    }

    setError(null);
    startSession(result.words);
    router.push('/');
  };

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[color:var(--bg)] px-4 py-10 selection:bg-[color:var(--accent-soft)] selection:text-[color:var(--accent)] sm:px-6 lg:px-8">
      <div className="blob-bg" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="hero-panel rounded-[2rem] border-[3px] border-[color:var(--ink)] p-6 shadow-[8px_8px_0px_0px_var(--ink)] sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">{t('viewProgress')}</p>
                  <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-[color:var(--ink)] sm:text-5xl">
                    {t('progressPageTitle')}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm font-medium text-[color:var(--muted)] sm:text-base">
                    {t('progressPageDescription')}
                  </p>
                  {!isLoading && !user && (
                    <p className="mt-3 max-w-2xl text-sm font-bold text-[color:var(--ink)]">
                      {t('syncProgressPrompt')}
                    </p>
                  )}
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 self-start rounded-full border-[2px] border-[color:var(--ink)] bg-white px-5 py-2 text-sm font-bold text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                  </svg>
                  {t('backToHome')}
                </Link>
              </div>

              {!isLoading && !user && (
                <div className="max-w-md">
                  <LoginForm />
                </div>
              )}

              <div className="rounded-[1.75rem] border-[3px] border-[color:var(--ink)] bg-[color:var(--accent)] px-5 py-5 text-white shadow-[4px_4px_0px_0px_var(--ink)]">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/80">{t('practiceNextTitle')}</p>
                {focusItem ? (
                  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-2xl font-black tracking-tight">{wordLabels[focusItem.wordId] ?? 'Unknown word'}</p>
                      <p className="mt-1 text-sm font-medium text-white/85">
                        {getConjugationLabel(focusItem.conjugationType, focusItem.wordType, language)} · {getPracticeModeLabel(focusItem.mode, language)}
                      </p>
                      <p className="mt-3 text-sm font-medium text-white/85">{t('practiceNextDescription')}</p>
                    </div>
                    <button
                      onClick={() => {
                        const focusUnitKey = `${focusItem.wordId}::${focusItem.conjugationType}::${focusItem.mode}`;
                        const nextConfig = {
                          ...config,
                          practiceType: 'weakness' as const,
                          forms: [focusItem.conjugationType as typeof config.forms[number]],
                          mode: focusItem.mode as typeof config.mode,
                        };
                        updateConfig(nextConfig);
                        launchDrill(nextConfig, { focusUnitKey });
                      }}
                      className="inline-flex items-center justify-center rounded-full border-[2px] border-[color:var(--ink)] bg-white px-5 py-3 text-sm font-bold text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)]"
                    >
                      {t('practiceThisWeakness')}
                    </button>
                  </div>
                ) : focusConjugation ? (
                  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-2xl font-black tracking-tight">
                        {getConjugationLabel(focusConjugation.conjugationType as ConjugationType, 'verb', language)}
                      </p>
                      <p className="mt-1 text-sm font-medium text-white/85">{focusConjugation.accuracy}% {t('accuracy').toLowerCase()}</p>
                      <p className="mt-3 text-sm font-medium text-white/85">{t('practiceNextDescription')}</p>
                    </div>
                    <button
                      onClick={() => {
                        const nextConfig = {
                          ...config,
                          practiceType: 'weakness' as const,
                          forms: [focusConjugation.conjugationType as typeof config.forms[number]],
                        };
                        updateConfig(nextConfig);
                        launchDrill(nextConfig);
                      }}
                      className="inline-flex items-center justify-center rounded-full border-[2px] border-[color:var(--ink)] bg-white px-5 py-3 text-sm font-bold text-[color:var(--ink)] shadow-[3px_3px_0px_0px_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--ink)]"
                    >
                      {t('practiceThisWeakness')}
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-xl font-black tracking-tight">{t('focusFallbackHeading')}</p>
                    <p className="mt-2 max-w-xl text-sm font-medium text-white/85">{t('focusWeaknessEmpty')}</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-[1.5rem] border-2 border-[#b42318] bg-[#fff1f2] px-4 py-3 text-sm font-bold text-[#b42318] shadow-[3px_3px_0px_0px_#b42318]">
                  {error}
                </div>
              )}
            </div>
        </section>

        <section>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">{t('weakPointsSectionLabel')}</p>
          <div className="mt-3">
            <WeaknessPanels
              weakestConjugations={weakestConjugations}
              weakestItems={weakestItems}
              language={language}
              wordLabels={wordLabels}
              titles={{
                conjugations: t('weakestConjugations'),
                items: t('weakestItems'),
              }}
              practiceLabel={t('practiceThisWeakness')}
              emptyStateLabel={t('noWeaknessData')}
              accuracyLabel={t('accuracy')}
              onDrillConjugation={(conjugationType) => {
                const nextConfig = {
                  ...config,
                  practiceType: 'weakness' as const,
                  forms: [conjugationType as typeof config.forms[number]],
                };
                updateConfig(nextConfig);
                launchDrill(nextConfig);
              }}
              onDrillItem={(wordId, conjugationType, mode) => {
                const focusUnitKey = `${wordId}::${conjugationType}::${mode}`;
                const nextConfig = {
                  ...config,
                  practiceType: 'weakness' as const,
                  forms: [conjugationType as typeof config.forms[number]],
                  mode: mode as typeof config.mode,
                };
                updateConfig(nextConfig);
                launchDrill(nextConfig, { focusUnitKey });
              }}
            />
          </div>
        </section>

        <section>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--muted)]">{t('supportingStatsLabel')}</p>
          <div className="mt-3 grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <OverviewPanel
              title={t('compactOverviewTitle')}
              compact
              cards={[
                { label: t('answered'), value: String(overview.totalAnswered), helper: t('totalAnswered') },
                { label: t('accuracy'), value: `${overview.accuracy}%`, helper: t('acrossAllSessions') },
                { label: t('dailyStreak'), value: `${overview.dailyStreak}`, helper: t('practiceOnConsecutiveDays') },
                { label: t('studiedToday'), value: `${overview.studiedToday}`, helper: t('todaysPractice') },
              ]}
            />
            <ModeBreakdownPanel
              title={t('modeComparison')}
              rows={modeBreakdown}
              emptyLabel={t('noWeaknessData')}
              answeredLabel={t('answeredLower')}
              language={language}
            />
            <RecentActivityPanel
              title={t('recentActivity')}
              rows={recentActivity}
              emptyLabel={t('noRecentActivity')}
              answeredLabel={t('answeredLower')}
              correctLabel={t('correctLower')}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
