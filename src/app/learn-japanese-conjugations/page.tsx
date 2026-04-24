import type { Metadata } from 'next';
import Link from 'next/link';
import LandingLanguageSwitcher from '@/components/LandingLanguageSwitcher';
import Logo from '@/components/Logo';
import { getLandingCopy, type LandingLanguage } from '@/lib/landing-i18n';

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

function resolveLandingLanguage(lang?: string): LandingLanguage {
  return lang === 'zh' ? 'zh' : lang === 'vi' ? 'vi' : lang === 'ne' ? 'ne' : 'en';
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const lang = resolveLandingLanguage(params.lang);
  const copy = getLandingCopy(lang);

  const canonical = lang === 'en'
    ? '/learn-japanese-conjugations'
    : `/learn-japanese-conjugations?lang=${lang}`;

  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: {
      canonical,
      languages: {
        en: '/learn-japanese-conjugations',
        zh: '/learn-japanese-conjugations?lang=zh',
        vi: '/learn-japanese-conjugations?lang=vi',
        ne: '/learn-japanese-conjugations?lang=ne',
      },
    },
    openGraph: {
      title: copy.meta.title,
      description: copy.meta.description,
      url: canonical,
      type: 'website',
      locale: lang === 'zh' ? 'zh_CN' : lang === 'ne' ? 'ne_NP' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.meta.title,
      description: copy.meta.description,
    },
  };
}

export default async function LandingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const lang = resolveLandingLanguage(params.lang);
  const copy = getLandingCopy(lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: lang === 'zh' ? 'Katachi — 日语变形练习' : (lang === 'ne' ? 'काटाची — जापानी रूपान्तरण अभ्यास' : 'Katachi'),
    applicationCategory: 'EducationApplication',
    description: copy.meta.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    inLanguage: lang === 'zh' ? ['zh', 'en'] : (lang === 'ne' ? ['ne', 'en'] : ['en', 'zh']),
    educationalLevel: lang === 'zh' ? '初级到中级' : (lang === 'ne' ? 'प्रारम्भिक देखि माध्यमिक' : 'Beginner to Intermediate'),
    about: {
      '@type': 'Thing',
      name: lang === 'zh' ? '日语语法' : (lang === 'ne' ? 'जापानी भाषा व्याकरण' : 'Japanese Language Grammar'),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main
        aria-label="Conjugation Lab landing"
        className="min-h-dvh overflow-x-hidden bg-[#f7f2e8] text-[#20242b] selection:bg-[#ffd7cc] selection:text-[#20242b]"
      >
        <div className="border-b border-[#ded6c3] bg-[#fbf8f0]/90">
          <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link href="/" className="group flex items-center gap-3">
              <Logo size={34} className="shrink-0" />
              <div className="leading-none">
                <span className="block text-base font-black tracking-tight">Katachi</span>
                <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.22em] text-[#8a5b49]">
                  {copy.hero.eyebrow}
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden rounded-full border border-[#20242b] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#20242b] shadow-[3px_3px_0_0_#20242b] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#20242b] sm:inline-flex"
              >
                {copy.hero.cta}
              </Link>
              <LandingLanguageSwitcher currentLang={lang} />
            </div>
          </header>
        </div>

        <section className="relative border-b border-[#ded6c3]">
          <div className="motion-drift-grid absolute inset-0 bg-[linear-gradient(90deg,rgba(32,36,43,0.055)_1px,transparent_1px),linear-gradient(rgba(32,36,43,0.055)_1px,transparent_1px)] bg-[size:36px_36px]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:py-20">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#9b4f3f]">
                {copy.hero.eyebrow}
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[0.94] tracking-tight text-[#20242b] sm:text-7xl lg:text-8xl">
                {copy.hero.h1}
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-[#625848] sm:text-xl">
                {copy.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={copy.hero.ctaLink}
                  className="motion-cta-pulse group inline-flex min-h-14 items-center justify-center rounded-full border-2 border-[#20242b] bg-[#f36f5c] px-7 py-4 text-base font-black text-white shadow-[5px_5px_0_0_#20242b] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#20242b] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none"
                >
                  <span>{copy.hero.cta}</span>
                  <span className="ml-3 transition group-hover:translate-x-1">→</span>
                </Link>
                <div className="flex flex-wrap gap-2">
                  {copy.hero.proof.map((proof) => (
                    <span
                      key={proof}
                      className="rounded-full border border-[#d6cbb9] bg-[#fffaf0] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#6b6256]"
                    >
                      {proof}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="motion-drill-panel rounded-[18px] border-2 border-[#20242b] bg-[#fffaf0] p-4 shadow-[8px_8px_0_0_#20242b]">
              <div className="rounded-[14px] border border-[#ded6c3] bg-white p-5">
                <div className="flex items-center justify-between gap-4 border-b border-[#ece5d7] pb-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#9b4f3f]">
                    {copy.drillPanel.label}
                  </p>
                  <span className="motion-live-chip rounded-full bg-[#e8f1d2] px-3 py-1 text-[11px] font-black text-[#3f5b21]">
                    JLPT
                  </span>
                </div>
                <div className="py-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7a7165]">
                    {copy.drillPanel.promptLabel}
                  </p>
                  <p className="motion-prompt-pop mt-2 text-6xl font-black tracking-tight text-[#20242b]">
                    {copy.drillPanel.prompt}
                  </p>
                  <div className="mt-6 rounded-xl border border-[#ded6c3] bg-[#fbf8f0] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9b4f3f]">
                      {copy.drillPanel.targetLabel}
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#625848]">
                      {copy.drillPanel.target}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {copy.drillPanel.choices.map((choice, index) => (
                      <div
                        key={choice}
                        className={`motion-answer-option flex items-center justify-between rounded-xl border px-4 py-3 text-lg font-black ${
                          index === 0
                            ? 'motion-answer-correct border-[#20242b] bg-[#20242b] text-white'
                            : 'border-[#ded6c3] bg-white text-[#625848]'
                        }`}
                        style={{ animationDelay: `${360 + index * 100}ms` }}
                      >
                        <span>{choice}</span>
                        <span className="text-xs opacity-70">{String.fromCharCode(65 + index)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-[#ece5d7] pt-4">
                  {copy.drillPanel.stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className="motion-stagger-item rounded-xl bg-[#f7f2e8] p-3"
                      style={{ animationDelay: `${620 + index * 90}ms` }}
                    >
                      <p className="text-2xl font-black text-[#20242b]">{stat.value}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#7a7165]">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="px-2 pt-4 text-sm font-semibold leading-6 text-[#625848]">
                {copy.drillPanel.helper}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 border-b border-[#ded6c3] px-5 py-6 sm:grid-cols-3 sm:px-8">
          {copy.trainingStats.map((stat) => (
            <div key={stat.label} className="motion-stagger-item border-l-4 border-[#20242b] bg-[#fbf8f0] px-5 py-4">
              <p className="text-3xl font-black tracking-tight text-[#20242b]">{stat.value}</p>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#756b5e]">
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.86fr_1fr]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#9b4f3f]">
              {copy.sectionLabels.problem}
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              {copy.problem.heading}
            </h2>
          </div>
          <div className="space-y-5 text-lg font-semibold leading-8 text-[#625848]">
            <p>{copy.problem.body1}</p>
            <p>{copy.problem.body2}</p>
          </div>
        </section>

        <section className="bg-[#20242b] text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                {copy.features.heading}
              </h2>
              <Link
                href="/"
                className="inline-flex w-fit rounded-full border border-[#f7f2e8] bg-[#f7f2e8] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#20242b]"
              >
                {copy.finalCta.cta}
              </Link>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-[18px] border border-[#48505b] bg-[#48505b] sm:grid-cols-2 lg:grid-cols-4">
              {copy.features.items.map((item) => (
                <article key={item.title} className="bg-[#252b34] p-6">
                  <h3 className="text-xl font-black">{item.title}</h3>
                  <p className="mt-4 text-sm font-semibold leading-6 text-[#d9ded7]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#9b4f3f]">
                {copy.sectionLabels.modes}
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                {copy.modes.heading}
              </h2>
              <p className="mt-5 text-base font-semibold leading-7 text-[#625848]">
                {copy.modes.intro}
              </p>
            </div>
            <div className="grid gap-4">
              {copy.modes.items.map((item, index) => (
                <article
                  key={item.title}
                  className="motion-stagger-item grid gap-4 rounded-[16px] border border-[#ded6c3] bg-[#fffaf0] p-5 shadow-[0_16px_34px_rgba(32,36,43,0.07)] sm:grid-cols-[72px_1fr]"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#20242b] bg-[#e8f1d2] text-sm font-black text-[#20242b]">
                    {item.modeIndex}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{item.title}</h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#625848]">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[#ded6c3] bg-[#fbf8f0]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              {copy.coverage.heading}
            </h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {[copy.coverage.verbs, copy.coverage.adjectives].map((coverage) => (
                <div key={coverage.label} className="rounded-[16px] border border-[#ded6c3] bg-white p-6">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9b4f3f]">
                    {coverage.label}
                  </p>
                  <p className="mt-4 text-lg font-black leading-8 text-[#20242b]">
                    {coverage.list}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.86fr_1fr]">
          <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            {copy.whyN3.heading}
          </h2>
          <div className="space-y-5 text-lg font-semibold leading-8 text-[#625848]">
            <p>{copy.whyN3.body1}</p>
            <p>{copy.whyN3.body2}</p>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8">
          <div className="mx-auto max-w-7xl rounded-[22px] border-2 border-[#20242b] bg-[#f36f5c] p-7 text-[#20242b] shadow-[8px_8px_0_0_#20242b] sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                  {copy.finalCta.heading}
                </h2>
                <p className="mt-4 max-w-2xl text-base font-black leading-7 text-[#3d2b25]">
                  {copy.finalCta.subtitle}
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-[#20242b] bg-[#fffaf0] px-8 py-4 text-base font-black text-[#20242b] shadow-[5px_5px_0_0_#20242b] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#20242b]"
              >
                {copy.finalCta.cta}
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#ded6c3] bg-[#fbf8f0] px-5 py-8 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-bold text-[#756b5e] sm:flex-row sm:items-center sm:justify-between">
            <span>{copy.footer.copyright}</span>
            <Link href="/" className="text-[#9b4f3f] underline-offset-4 hover:underline">
              {copy.footer.practiceLink}
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
