'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, Check, ChevronDown } from 'lucide-react';
import { useEffect } from 'react';
import ConjugationRulePanel from '@/components/ConjugationRulePanel';
import DynamicStatusBar from '@/components/DynamicStatusBar';
import { HtmlLangSync } from '@/components/HtmlLangSync';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Logo from '@/components/Logo';
import {
  CONJUGATION_FORM_ORDER,
  isConjugationType,
} from '@/lib/conjugationGuide';
import { getConjugationGuideCopy } from '@/lib/conjugationGuideI18n';
import { getConjugationLabel } from '@/lib/displayText';
import { SHARED_CONJS } from '@/lib/distractorEngine';
import { useStore } from '@/lib/store';

export default function ConjugationGuidePage() {
  const language = useStore((state) => state.language);
  const copy = getConjugationGuideCopy(language);

  useEffect(() => {
    const openLinkedFormation = () => {
      const hash = window.location.hash.slice(1);
      if (!isConjugationType(hash)) return;

      const target = document.getElementById(hash);
      if (target instanceof HTMLDetailsElement) {
        target.open = true;
      }
    };

    openLinkedFormation();
    window.addEventListener('hashchange', openLinkedFormation);
    return () => window.removeEventListener('hashchange', openLinkedFormation);
  }, []);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[color:var(--bg)] text-[color:var(--ink)]">
      <DynamicStatusBar color="#f4f4ea" />
      <HtmlLangSync />

      <div className="border-b-[3px] border-[color:var(--ink)] bg-white">
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label={copy.backToPractice}>
            <Logo size={38} className="shrink-0" />
            <span className="hidden text-base font-black uppercase tracking-tight sm:inline">Katachi</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border-[3px] border-[color:var(--ink)] bg-[#fde68a] px-3 py-2 text-xs font-black shadow-[3px_3px_0_0_var(--ink)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--ink)] sm:px-4"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
              <span className="hidden sm:inline">{copy.backToPractice}</span>
            </Link>
            <LanguageSwitcher placement="down" align="end" />
          </div>
        </header>
      </div>

      <div className="relative">
        <div className="blob-bg" />
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
          <header className="max-w-4xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[color:var(--accent)] sm:text-xs">
              <BookOpen className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
              {copy.pageEyebrow}
            </div>
            <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              {copy.pageTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-[color:var(--muted)] sm:text-lg sm:leading-8">
              {copy.pageIntro}
            </p>
          </header>

          <section className="mt-8 rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-[#fffbeb] p-5 shadow-[6px_6px_0_0_var(--ink)] sm:p-7">
            <h2 className="text-xl font-black sm:text-2xl">{copy.quickStartTitle}</h2>
            <ol className="mt-4 grid gap-3 md:grid-cols-3">
              {copy.quickStartSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 rounded-xl bg-white p-3 text-sm font-bold leading-6">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-black text-white">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <nav aria-labelledby="formation-index-title" className="mt-10 rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-5 sm:p-7">
            <h2 id="formation-index-title" className="text-2xl font-black">{copy.chooseForm}</h2>
            <div className="mt-5 space-y-5">
              <FormationLinkGroup
                title={copy.verbForms}
                forms={CONJUGATION_FORM_ORDER}
                language={language}
              />
              <FormationLinkGroup
                title={copy.adjectiveForms}
                forms={SHARED_CONJS}
                language={language}
                adjective
              />
            </div>
          </nav>

          <div className="mt-10 space-y-5">
            {CONJUGATION_FORM_ORDER.map((type, index) => {
              const verbLabel = getConjugationLabel(type, 'verb', language);
              const adjectiveLabel = getConjugationLabel(type, 'i-adj', language);
              const hasAdjectiveRules = SHARED_CONJS.includes(type);
              const title = hasAdjectiveRules && adjectiveLabel !== verbLabel
                ? `${verbLabel} / ${adjectiveLabel}`
                : verbLabel;

              return (
                <details
                  key={type}
                  id={type}
                  open={index === 0 ? true : undefined}
                  className="group scroll-mt-4 overflow-hidden rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white shadow-[5px_5px_0_0_var(--ink)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-white px-5 py-5 marker:hidden transition hover:bg-[#fffbeb] sm:px-7 [&::-webkit-details-marker]:hidden">
                    <h2 className="text-xl font-black sm:text-2xl">{title}</h2>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[2px] border-[color:var(--ink)] bg-[#fde68a]">
                      <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" strokeWidth={3} aria-hidden="true" />
                    </span>
                  </summary>
                  <div className="border-t-[3px] border-[color:var(--ink)] bg-[color:var(--surface-soft)] p-4 sm:p-6">
                    <ConjugationRulePanel type={type} language={language} />
                  </div>
                </details>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border-[3px] border-[color:var(--ink)] bg-[color:var(--accent)] px-6 py-3 text-base font-black text-white shadow-[5px_5px_0_0_var(--ink)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_var(--ink)]"
            >
              <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
              {copy.backToPractice}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

interface FormationLinkGroupProps {
  title: string;
  forms: readonly (typeof CONJUGATION_FORM_ORDER)[number][];
  language: ReturnType<typeof useStore.getState>['language'];
  adjective?: boolean;
}

function FormationLinkGroup({ title, forms, language, adjective = false }: FormationLinkGroupProps) {
  return (
    <div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--muted)]">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {forms.map((type) => (
          <a
            key={type}
            href={`#${type}`}
            className="rounded-lg border-2 border-[color:var(--ink)] bg-[#fde68a] px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:bg-white"
          >
            {getConjugationLabel(type, adjective ? 'i-adj' : 'verb', language)}
          </a>
        ))}
      </div>
    </div>
  );
}
