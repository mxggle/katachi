import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { getLandingCopy, type LandingLanguage } from '@/lib/landing-i18n';

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const lang: LandingLanguage = params.lang === 'zh' ? 'zh' : 'en';
  const copy = getLandingCopy(lang);

  const canonical = lang === 'zh'
    ? '/learn-japanese-conjugations?lang=zh'
    : '/learn-japanese-conjugations';

  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: {
      canonical,
      languages: {
        'en': '/learn-japanese-conjugations',
        'zh': '/learn-japanese-conjugations?lang=zh',
      },
    },
    openGraph: {
      title: copy.meta.title,
      description: copy.meta.description,
      url: canonical,
      type: 'website',
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
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
  const lang: LandingLanguage = params.lang === 'zh' ? 'zh' : 'en';
  const copy = getLandingCopy(lang);
  const alternateLang = lang === 'en' ? 'zh' : 'en';
  const alternateUrl = `/learn-japanese-conjugations?lang=${alternateLang}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: lang === 'zh' ? 'Katachi — 日语变形练习' : 'Katachi',
    applicationCategory: 'EducationApplication',
    description: copy.meta.description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    inLanguage: lang === 'zh' ? ['zh', 'en'] : ['en', 'zh'],
    educationalLevel: lang === 'zh' ? '初级到中级' : 'Beginner to Intermediate',
    about: {
      '@type': 'Thing',
      name: lang === 'zh' ? '日语语法' : 'Japanese Language Grammar',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative min-h-dvh overflow-x-hidden bg-[color:var(--bg)] selection:bg-[color:var(--accent-soft)] selection:text-[color:var(--accent)]">
        <div className="blob-bg" />

        <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center gap-16 px-4 py-12 sm:px-6 lg:px-8">
          {/* Header / Lang Switch */}
          <header className="w-full flex items-center justify-between animate-fade-in">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo size={32} className="text-[color:var(--ink)]" />
              <span className="text-sm font-bold text-[color:var(--muted)] group-hover:text-[color:var(--ink)] transition-colors">
                Katachi
              </span>
            </Link>
            <Link
              href={alternateUrl}
              className="text-sm font-bold text-[color:var(--accent)] hover:underline"
            >
              {copy.langSwitch}
            </Link>
          </header>

          {/* Hero Section */}
          <section className="w-full text-center space-y-8 animate-fade-in [animation-delay:50ms] opacity-0 [animation-fill-mode:forwards]">
            <div className="flex flex-col items-center gap-6">
              <Logo size={100} className="text-[color:var(--ink)]" />
              <h1 className="text-4xl font-bold tracking-tight text-[color:var(--ink)] sm:text-6xl leading-[1.1] max-w-2xl">
                {copy.hero.h1}
              </h1>
              <p className="text-lg sm:text-xl font-medium text-[color:var(--muted)] max-w-xl leading-relaxed">
                {copy.hero.subtitle}
              </p>
              <Link
                href={copy.hero.ctaLink}
                className="group inline-flex items-center justify-center gap-3 rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-[color:var(--accent)] px-10 py-5 text-xl font-bold text-white shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none mt-2"
              >
                <span>{copy.hero.cta}</span>
                <svg className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </section>

          {/* Problem Section */}
          <section className="w-full animate-fade-in [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
            <div className="rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_var(--ink)] space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--ink)]">
                {copy.problem.heading}
              </h2>
              <p className="text-base sm:text-lg font-medium text-[color:var(--muted)] leading-relaxed">
                {copy.problem.body1}
              </p>
              <p className="text-base sm:text-lg font-medium text-[color:var(--muted)] leading-relaxed">
                {copy.problem.body2}
              </p>
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full animate-fade-in [animation-delay:150ms] opacity-0 [animation-fill-mode:forwards]">
            <h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--ink)] text-center mb-8">
              {copy.features.heading}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {copy.features.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)]"
                >
                  <h3 className="text-lg font-bold text-[color:var(--ink)] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm font-medium text-[color:var(--muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Modes Section */}
          <section className="w-full animate-fade-in [animation-delay:175ms] opacity-0 [animation-fill-mode:forwards]">
            <h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--ink)] text-center mb-8">
              {copy.modes.heading}
            </h2>
            <div className="grid gap-6">
              {copy.modes.items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)]"
                >
                  <h3 className="text-lg font-bold text-[color:var(--ink)] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm font-medium text-[color:var(--muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Coverage Section */}
          <section className="w-full animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
            <div className="rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_var(--ink)] space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--ink)]">
                {copy.coverage.heading}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[color:var(--accent)] mb-2">
                    {copy.coverage.verbs.label}
                  </h3>
                  <p className="text-base font-medium text-[color:var(--ink)] leading-relaxed">
                    {copy.coverage.verbs.list}
                  </p>
                </div>
                <div className="h-[2px] bg-[color:var(--border-strong)] rounded-full" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[color:var(--accent)] mb-2">
                    {copy.coverage.adjectives.label}
                  </h3>
                  <p className="text-base font-medium text-[color:var(--ink)] leading-relaxed">
                    {copy.coverage.adjectives.list}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why N3 Section */}
          <section className="w-full animate-fade-in [animation-delay:225ms] opacity-0 [animation-fill-mode:forwards]">
            <div className="rounded-[2rem] border-[3px] border-[color:var(--ink)] bg-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_var(--ink)] space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--ink)]">
                {copy.whyN3.heading}
              </h2>
              <p className="text-base sm:text-lg font-medium text-[color:var(--muted)] leading-relaxed">
                {copy.whyN3.body1}
              </p>
              <p className="text-base sm:text-lg font-medium text-[color:var(--muted)] leading-relaxed">
                {copy.whyN3.body2}
              </p>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="w-full text-center space-y-6 animate-fade-in [animation-delay:250ms] opacity-0 [animation-fill-mode:forwards]">
            <h2 className="text-3xl sm:text-4xl font-bold text-[color:var(--ink)]">
              {copy.finalCta.heading}
            </h2>
            <p className="text-lg font-medium text-[color:var(--muted)] max-w-lg mx-auto">
              {copy.finalCta.subtitle}
            </p>
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-3 rounded-[1.5rem] border-[3px] border-[color:var(--ink)] bg-[#fde68a] px-10 py-5 text-xl font-bold text-[color:var(--ink)] shadow-[6px_6px_0px_0px_var(--ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--ink)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
            >
              <span>{copy.finalCta.cta}</span>
              <svg className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </section>

          {/* Footer */}
          <footer className="w-full text-center pt-8 border-t-[2px] border-dashed border-[color:var(--border-strong)] animate-fade-in [animation-delay:300ms] opacity-0 [animation-fill-mode:forwards]">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium text-[color:var(--muted)]">
              <span>{copy.footer.copyright}</span>
              <span className="hidden sm:block">·</span>
              <Link href="/" className="text-[color:var(--accent)] hover:underline font-bold">
                {copy.footer.practiceLink}
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
