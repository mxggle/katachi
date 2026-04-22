# SEO Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an SEO-optimized Landing Page at `/learn-japanese-conjugations` with auto language detection, personal developer story, and comprehensive meta tags.

**Architecture:** Server Component page reads `accept-language` header to choose default language (en/zh), renders structured HTML with JSON-LD, Open Graph, and dynamic metadata. Manual language switch via query param. Design follows existing Neo-Brutalist style.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript

---

### File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/landing-i18n.ts` | Create | Landing page copy in en/zh |
| `src/app/learn-japanese-conjugations/page.tsx` | Create | Landing page server component |
| `src/app/layout.tsx` | Modify | Dynamic metadata based on Accept-Language |

---

### Task 1: Create Landing Page i18n Copy

**Files:**
- Create: `src/lib/landing-i18n.ts`

- [ ] **Step 1: Write the i18n file**

```typescript
export const landingCopy = {
  en: {
    meta: {
      title: 'Katachi — Master Japanese Conjugations Through Daily Practice | JLPT N5 & N4',
      description: 'A focused Japanese conjugation practice tool built by a learner, for learners. Drill verbs and adjectives with smart distractors and weakness tracking. Covers JLPT N5 & N4 grammar forms.',
    },
    hero: {
      h1: 'Stop freezing on Japanese conjugations. Start drilling them.',
      subtitle: 'I built Katachi because I kept getting stuck — mixing up tenses, forgetting passive forms, hesitating on te-form. This tool strips away the noise and focuses on one thing: repetition until it sticks.',
      cta: 'Start Practicing',
      ctaLink: '/',
    },
    problem: {
      heading: 'The frustration that started it all',
      body1: "When you're reading Japanese and hit a verb conjugation, the flow breaks. Is this past polite or plain? Did they use passive or causative? For me, it happened constantly — te-form was my biggest weakness. I'd know the dictionary form, but the moment I needed to connect it, I'd freeze.",
      body2: 'Textbooks explain the rules. Flashcards show the answers. But neither gives you the repetition you actually need to make conjugation automatic.',
    },
    features: {
      heading: 'No setup. No distraction. Just practice.',
      items: [
        {
          title: 'Zero-friction drilling',
          description: 'Pick a level (N5, N4, or N3), choose verb types or adjectives, and start. The system handles the rest.',
        },
        {
          title: 'Smart weakness detection',
          description: 'Struggle with te-form? The system notices and surfaces more te-form practice. You don\'t have to track your weaknesses — Katachi does it for you.',
        },
        {
          title: 'Dual practice modes',
          description: 'Multiple Choice for quick recognition, Typing Mode for active recall. Switch anytime.',
        },
        {
          title: 'Daily streaks',
          description: 'Short, focused sessions you can actually maintain. Consistency beats intensity.',
        },
      ],
    },
    coverage: {
      heading: 'Every form you need for N5 & N4',
      verbs: {
        label: 'Verbs',
        list: 'Polite (masu), Plain negative, Past plain/polite, Te-form, Potential, Passive, Causative, Imperative, Volitional, Conditional (ba/tara)',
      },
      adjectives: {
        label: 'Adjectives',
        list: 'i-adjective & na-adjective forms for polite, negative, past, and conditional',
      },
    },
    finalCta: {
      heading: 'Ready to make conjugations automatic?',
      subtitle: 'Join thousands of learners drilling Japanese grammar every day. Free. No sign-up required.',
      cta: 'Start Practicing Now',
    },
    footer: {
      copyright: '© 2026 Katachi. Built by a Japanese learner, for Japanese learners.',
      practiceLink: 'Practice App',
    },
    langSwitch: 'Switch to 中文',
    langParam: 'zh',
  },
  zh: {
    meta: {
      title: 'Katachi — 日语变形练习工具 | 专注动词・形容词变形训练 | JLPT N5 & N4',
      description: '由日语学习者开发的变形练习工具。专注反复训练，智能识别薄弱环节（如て形、被动形），针对性强化。覆盖 JLPT N5 & N4 核心语法。',
    },
    hero: {
      h1: '日语变形总卡壳？那就练到形成肌肉记忆。',
      subtitle: '我在学日语时，时态总是搞混、被动形记不住、て形变到一半就愣住。所以我做了 Katachi —— 去掉一切干扰，只专注一件事：反复练习，直到变形成为本能。',
      cta: '开始练习',
      ctaLink: '/',
    },
    problem: {
      heading: '一切源于一个让人抓狂的瞬间',
      body1: '读日语的时候，遇到一个动词变形，整个节奏就断了。这是过去式还是现在式？是被动还是使役？对我来说，这种卡顿太常见了——尤其是て形，明明认识原形，一到变形就愣在那里。',
      body2: '课本会讲规则，单词卡会给你答案，但都没有提供真正让你形成本能的重复训练。',
    },
    features: {
      heading: '零配置、零干扰，只管练',
      items: [
        {
          title: '一键开始',
          description: '选择等级（N5、N4 或 N3），勾选动词或形容词类型，立刻开始。系统会自动整理题目。',
        },
        {
          title: '弱点智能追踪',
          description: 'て形总变错？系统会察觉并自动推送更多て形练习。你不用记录自己的薄弱环节——Katachi 帮你做。',
        },
        {
          title: '双模式训练',
          description: '选择题用于快速识别，输入题用于主动回忆。随时切换。',
        },
        {
          title: '每日连胜',
          description: '短时高效的练习，让你能真正坚持下去。持续胜过强度。',
        },
      ],
    },
    coverage: {
      heading: '覆盖 N5 & N4 全部核心变形',
      verbs: {
        label: '动词',
        list: 'ます形、ない形、た形/ました形、て形、可能形、受身形、使役形、命令形、意向形、条件形（ば/たら）',
      },
      adjectives: {
        label: '形容词',
        list: 'い形容词与な形容词的丁宁形、否定形、过去形、条件形',
      },
    },
    finalCta: {
      heading: '让变形成为你的本能',
      subtitle: '和数千名学习者一起，每天进行高效的日语变形训练。免费，无需注册。',
      cta: '立即开始练习',
    },
    footer: {
      copyright: '© 2026 Katachi. 由日语学习者打造，为日语学习者服务。',
      practiceLink: '练习应用',
    },
    langSwitch: 'Switch to English',
    langParam: 'en',
  },
} as const;

export type LandingLanguage = 'en' | 'zh';
export type LandingCopy = typeof landingCopy.en;

export function getLandingCopy(lang: LandingLanguage): LandingCopy {
  return landingCopy[lang];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/landing-i18n.ts
git commit -m "feat(landing): add i18n copy for SEO landing page"
```

---

### Task 2: Create Landing Page Component

**Files:**
- Create: `src/app/learn-japanese-conjugations/page.tsx`

- [ ] **Step 1: Write the landing page**

```typescript
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { getLandingCopy, type LandingLanguage } from '@/lib/landing-i18n';

function detectLanguage(): LandingLanguage {
  const headersList = headers();
  const acceptLang = headersList.get('accept-language') || '';
  if (acceptLang.includes('zh')) return 'zh';
  return 'en';
}

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const lang: LandingLanguage = params.lang === 'zh' ? 'zh' : detectLanguage();
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
  const lang: LandingLanguage = params.lang === 'zh' ? 'zh' : detectLanguage();
  const copy = getLandingCopy(lang);
  const alternateLang = lang === 'en' ? 'zh' : 'en';
  const alternateUrl = alternateLang === 'zh'
    ? '/learn-japanese-conjugations?lang=zh'
    : '/learn-japanese-conjugations';

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
```

- [ ] **Step 2: Verify build compiles**

Run: `yarn build`
Expected: Build succeeds (may have existing warnings but no new errors)

- [ ] **Step 3: Commit**

```bash
git add src/app/learn-japanese-conjugations/page.tsx
git commit -m "feat(landing): create SEO landing page with auto language detection"
```

---

### Task 3: Enhance Root Layout with Dynamic Metadata

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Read current layout.tsx**

```bash
cat src/app/layout.tsx
```

- [ ] **Step 2: Replace layout.tsx with dynamic metadata**

```typescript
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { translations } from "@/lib/i18n";

const font = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

function detectLanguage(): 'en' | 'zh' {
  const headersList = headers();
  const acceptLang = headersList.get('accept-language') || '';
  if (acceptLang.includes('zh')) return 'zh';
  return 'en';
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = detectLanguage();
  const t = translations[lang];

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: '/',
      type: 'website',
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.metaTitle,
      description: t.metaDescription,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build compiles**

Run: `yarn build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(meta): add dynamic metadata based on Accept-Language"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Landing Page at `/learn-japanese-conjugations` — Task 2
- ✅ Auto language detection via Accept-Language — Task 2 (detectLanguage function)
- ✅ Manual language switch via query param — Task 2 (searchParams.lang)
- ✅ Developer story (Problem section) — Task 1/2 (problem.heading, problem.body1, problem.body2)
- ✅ Core benefits (Features section) — Task 1/2 (features.items)
- ✅ Coverage section — Task 1/2 (coverage)
- ✅ SEO meta (title, description, OG, Twitter, JSON-LD) — Task 2 (generateMetadata, jsonLd)
- ✅ Dynamic metadata for existing `/` page — Task 3
- ✅ Neo-Brutalist design with existing styles — Task 2 (blob-bg, border-[3px], shadow offsets)
- ✅ i18n support (en/zh) — Task 1 (landingCopy)

**2. Placeholder scan:**
- No TBD/TODO placeholders found
- All code is complete and executable
- All text content is fully written

**3. Type consistency:**
- `LandingLanguage` type used consistently across landing-i18n.ts and page.tsx
- `detectLanguage` returns `'en' | 'zh'` matching `LandingLanguage`
- `searchParams.lang` checked against `'zh'` string literal consistently

No issues found. Plan is complete.
