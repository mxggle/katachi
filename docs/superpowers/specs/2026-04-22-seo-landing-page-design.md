# SEO Landing Page 设计文档

## 1. 概述

为 Katachi 创建一个 SEO 优化的 Landing Page，路由为 `/learn-japanese-conjugations`，支持通过 `Accept-Language` header 自动切换中英文，并保留手动切换能力。页面以开发者的个人学习经历为核心叙事，建立真实感和信任度，同时针对日语变形练习相关关键词进行优化。

## 2. 路由结构

- `/learn-japanese-conjugations` — 英文版（默认，当 Accept-Language 不包含 zh 时）
- `/learn-japanese-conjugations?lang=zh` — 中文版（手动切换或通过 header 自动跳转）
- `/` — 现有练习界面保持不变

## 3. SEO 策略

### 3.1 核心关键词
- Primary: Japanese conjugation practice, 日语变形练习
- Secondary: JLPT N5 N4 grammar, Japanese verb conjugation, Japanese adjective conjugation, te-form practice, Japanese grammar drill

### 3.2 Meta 信息

**英文版：**
- Title: Katachi — Master Japanese Conjugations Through Daily Practice | JLPT N5 & N4
- Description: A focused Japanese conjugation practice tool built by a learner, for learners. Drill verbs and adjectives with smart distractors and weakness tracking. Covers JLPT N5 & N4 grammar forms.
- Canonical: `/learn-japanese-conjugations`

**中文版：**
- Title: Katachi — 日语变形练习工具 | 专注动词・形容词变形训练 | JLPT N5 & N4
- Description: 由日语学习者开发的变形练习工具。专注反复训练，智能识别薄弱环节（如て形、被动形），针对性强化。覆盖 JLPT N5 & N4 核心语法。
- Canonical: `/learn-japanese-conjugations?lang=zh`

### 3.3 Open Graph / Twitter Card
- og:title / twitter:title: 对应语言版本的 Title
- og:description / twitter:description: 对应语言版本的 Description
- og:type: website
- og:url: 当前页面完整 URL

### 3.4 结构化数据（JSON-LD）

**英文版：**
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Katachi",
  "applicationCategory": "EducationApplication",
  "description": "A Japanese conjugation practice tool for JLPT N5 & N4 learners",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "inLanguage": ["en", "zh"],
  "educationalLevel": "Beginner to Intermediate",
  "about": {
    "@type": "Thing",
    "name": "Japanese Language Grammar"
  }
}
```

**中文版：**
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Katachi — 日语变形练习",
  "applicationCategory": "EducationApplication",
  "description": "日语 JLPT N5 & N4 变形练习工具，专注动词和形容词的语法变形训练",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "inLanguage": ["zh", "en"],
  "educationalLevel": "初级到中级",
  "about": {
    "@type": "Thing",
    "name": "日语语法"
  }
}
```

## 4. 页面结构与文案

### Section 1: Hero

**英文版：**
- H1: Stop freezing on Japanese conjugations. Start drilling them.
- Subtitle: I built Katachi because I kept getting stuck — mixing up tenses, forgetting passive forms, hesitating on te-form. This tool strips away the noise and focuses on one thing: repetition until it sticks.
- CTA: Start Practicing →
- CTA Link: /

**中文版：**
- H1: 日语变形总卡壳？那就练到形成肌肉记忆。
- Subtitle: 我在学日语时，时态总是搞混、被动形记不住、て形变到一半就愣住。所以我做了 Katachi —— 去掉一切干扰，只专注一件事：反复练习，直到变形成为本能。
- CTA: 开始练习 →
- CTA Link: /

### Section 2: The Problem（开发者故事）

**英文版：**
- Heading: The frustration that started it all
- Body: When you're reading Japanese and hit a verb conjugation, the flow breaks. Is this past polite or plain? Did they use passive or causative? For me, it happened constantly — te-form was my biggest weakness. I'd know the dictionary form, but the moment I needed to connect it, I'd freeze.
- Body: Textbooks explain the rules. Flashcards show the answers. But neither gives you the repetition you actually need to make conjugation automatic.

**中文版：**
- Heading: 一切源于一个让人抓狂的瞬间
- Body: 读日语的时候，遇到一个动词变形，整个节奏就断了。这是过去式还是现在式？是被动还是使役？对我来说，这种卡顿太常见了——尤其是て形，明明认识原形，一到变形就愣在那里。
- Body: 课本会讲规则，单词卡会给你答案，但都没有提供真正让你形成本能的重复训练。

### Section 3: How Katachi Works（核心卖点）

**英文版：**
- Heading: No setup. No distraction. Just practice.
- Feature 1 — Zero-friction drilling: Pick a level (N5, N4, or N3), choose verb types or adjectives, and start. The system handles the rest.
- Feature 2 — Smart weakness detection: Struggle with te-form? The system notices and surfaces more te-form practice. You don't have to track your weaknesses — Katachi does it for you.
- Feature 3 — Dual practice modes: Multiple Choice for quick recognition, Typing Mode for active recall. Switch anytime.
- Feature 4 — Daily streaks: Short, focused sessions you can actually maintain. Consistency beats intensity.

**中文版：**
- Heading: 零配置、零干扰，只管练
- Feature 1 — 一键开始：选择等级（N5、N4 或 N3），勾选动词或形容词类型，立刻开始。系统会自动整理题目。
- Feature 2 — 弱点智能追踪：て形总变错？系统会察觉并自动推送更多て形练习。你不用记录自己的薄弱环节——Katachi 帮你做。
- Feature 3 — 双模式训练：选择题用于快速识别，输入题用于主动回忆。随时切换。
- Feature 4 — 每日连胜：短时高效的练习，让你能真正坚持下去。持续胜过强度。

### Section 4: Coverage（覆盖范围）

**英文版：**
- Heading: Every form you need for N5 & N4
- List:
  - Verbs: Polite (masu), Plain negative, Past plain/polite, Te-form, Potential, Passive, Causative, Imperative, Volitional, Conditional (ba/tara)
  - Adjectives: i-adjective & na-adjective forms for polite, negative, past, and conditional

**中文版：**
- Heading: 覆盖 N5 & N4 全部核心变形
- List:
  - 动词：ます形、ない形、た形/ました形、て形、可能形、受身形、使役形、命令形、意向形、条件形（ば/たら）
  - 形容词：い形容词与な形容词的丁宁形、否定形、过去形、条件形

### Section 5: Final CTA

**英文版：**
- Heading: Ready to make conjugations automatic?
- Subtitle: Join thousands of learners drilling Japanese grammar every day. Free. No sign-up required.
- CTA: Start Practicing Now →
- Secondary link: Switch to 中文

**中文版：**
- Heading: 让变形成为你的本能
- Subtitle: 和数千名学习者一起，每天进行高效的日语变形训练。免费，无需注册。
- CTA: 立即开始练习 →
- Secondary link: Switch to English

### Section 6: Footer

**英文版：**
- © 2026 Katachi. Built by a Japanese learner, for Japanese learners.
- Links: Practice App / GitHub (if applicable)

**中文版：**
- © 2026 Katachi. 由日语学习者打造，为日语学习者服务。
- Links: 练习应用 / GitHub

## 5. 技术方案

### 5.1 页面类型
- Next.js App Router Server Component（`/app/learn-japanese-conjugations/page.tsx`）
- 服务端读取 `headers()` 中的 `accept-language` 确定默认语言
- 客户端通过 query param `?lang=zh` 覆盖默认语言
- 手动切换通过 `window.location.href = '?lang=zh'` 或 `'?lang=en'` 实现

### 5.2 SEO Meta 实现
- `generateMetadata` 函数根据语言参数返回对应的 title/description/og/twitter/jsonld
- 服务端渲染确保搜索引擎能抓取完整 HTML

### 5.3 现有 `/` 页面增强
- `layout.tsx` 改为使用 `generateMetadata` 动态返回基于 Accept-Language 的 metadata
- 保持现有客户端逻辑不变

### 5.4 i18n 文案存储
- Landing Page 文案存储在独立文件 `src/lib/landing-i18n.ts` 中，不与现有应用 i18n 混合
- 结构：{ en: { ... }, zh: { ... } }

## 6. 设计规范

### 6.1 视觉风格
- 延续现有新粗野主义（Neo-Brutalism）风格
- 粗边框（3px）、硬阴影偏移（4-8px）、圆角卡片（1.5-2rem）
- 色彩：米白背景 `#f4f4ea`、深灰文字 `#1f2937`、珊瑚红强调 `#ff6b6b`、黄色高亮 `#fde68a`

### 6.2 布局
- 最大宽度：max-w-3xl（与主应用一致）
- Section 间距：gap-16 ~ gap-20
- 移动端优先，响应式适配

### 6.3 动画
- 延续现有 fadeIn 动画
- 新增 Section 进入视口时的 stagger 动画（使用 CSS scroll-driven 或 Intersection Observer）

## 7. 性能考量

- Server Component 减少客户端 JS bundle
- 图片使用 Next.js Image 组件（如有截图）
- 字体延续 Outfit 变量字体，无需额外加载

## 8. 文件清单

- `src/app/learn-japanese-conjugations/page.tsx` — Landing Page 主文件
- `src/lib/landing-i18n.ts` — Landing Page 多语言文案
- `src/app/layout.tsx` — 修改：动态 metadata
- `src/app/page.tsx` — 不修改（现有练习界面）
