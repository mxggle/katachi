# AGENTS.md

## Project Snapshot

Katachi is a Next.js App Router application for Japanese conjugation practice. It is local-first, installable as a PWA, and can optionally sync study progress through Supabase.

Core stack:

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- Zustand with `localStorage` persistence
- Supabase Auth and `study_states` sync
- Serwist for the service worker and PWA caching
- Vitest for tests

## Commands

- `npm run dev` starts the app on port `4399`.
- `npm run build` creates a production build and generates the Serwist service worker.
- `npm run start` starts the production server.
- `npm run lint` runs ESLint.
- `npm run test` runs Vitest once.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run check:supabase` checks whether the Supabase `study_states` table exists.
- `npm run generate:icons` regenerates PNG app icons from `public/icon.svg`.

Use the npm scripts rather than calling `next` directly. The scripts include project-specific flags.

## PWA Requirements

This branch adds PWA support. Treat PWA behavior as a first-class constraint when changing routing, build config, layout metadata, static assets, or persistence.

Important files:

- `next.config.ts`: wraps Next with `@serwist/next`.
- `src/app/sw.ts`: Serwist service worker source.
- `public/sw.js`: generated service worker output. Do not hand-edit it.
- `public/manifest.json`: web app manifest.
- `src/app/layout.tsx`: manifest, mobile web app, Apple web app, icon, viewport, splash, and install prompt wiring.
- `src/components/IOSInstallPrompt.tsx`: iOS Safari install guidance.
- `src/components/SplashScreen.tsx`: first-session splash overlay.
- `src/app/pwa-config.test.ts`: protects important PWA build assumptions.
- `src/components/IOSInstallPrompt.test.ts`: protects iOS prompt behavior and localization.

PWA-specific rules:

- Keep `npm run dev` and `npm run build` on Webpack. Serwist service worker generation is protected by `--webpack`; do not switch these scripts to Turbopack unless Serwist support is revalidated and tests are updated.
- `next.config.ts` disables Serwist outside production. Do not expect a generated service worker in normal development mode.
- `public/sw.js` is ignored by ESLint because it is generated. If service worker behavior changes, edit `src/app/sw.ts`, then run a production build.
- Keep manifest and Apple icon metadata in sync between `public/manifest.json` and `src/app/layout.tsx`.
- Preserve iOS-specific install behavior. iOS does not support a normal browser install prompt, so `IOSInstallPrompt` shows localized Share/Add to Home Screen instructions and suppresses itself in standalone mode.
- `SplashScreen` and `IOSInstallPrompt` are client components and use `sessionStorage`. Guard browser-only APIs behind client components/effects.
- When changing PWA UI copy, update all supported languages in `src/lib/i18n.ts` and keep the tests that count prompt translations passing.
- Offline behavior depends on local-first data and cached static assets. Avoid adding required network calls to the practice path.

## State, Persistence, and Sync

The app is local-first. Guest mode must remain fully usable without Supabase credentials or network access.

Important files:

- `src/lib/store.ts`: Zustand app store and `katachi-storage` persistence.
- `src/lib/study/types.ts`: canonical study state shape.
- `src/lib/study/migrate.ts`: migration from older persisted state shapes.
- `src/lib/supabase/studySync.ts`: remote merge and sync logic.
- `src/components/StudySync.tsx`: sync side effects.
- `supabase/migrations/20260423000000_create_study_states.sql`: database schema.

Rules:

- Do not break existing `localStorage` users. If `StudyState` changes, add or update migrations and tests.
- `activeSession` is transient; durable learning progress belongs in `studyState`.
- Keep legacy aliases in `store.ts` coherent: `dailyStreak`, `lastPracticeDate`, `progress`, `language`, and `config` mirror values inside `studyState`.
- Supabase config is optional. `getSupabaseConfig()` returns `null` when env vars are absent; UI must keep working.
- Google auth is opt-in through `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true`. Email/password remains the default universal path.
- Sync merge is conservative: counts generally use max values, history is merged by id, and remote state is not allowed to erase local guest progress.

## Practice Logic

Important files:

- `src/components/PracticeSession.tsx`: practice UI and answer flow.
- `src/lib/sessionBuilder.ts`: session construction and daily budget behavior.
- `src/lib/distractorEngine.ts`: plausible incorrect answer generation.
- `src/lib/practiceChoiceInteraction.ts`: multiple-choice interaction rules.
- `src/lib/audioPlayback.ts` and `src/lib/audioPreload.ts`: TTS/audio behavior.

Rules:

- Incorrect answers are re-queued. A session finishes only after every initial item has eventually been answered correctly.
- Answer attempts update unit progress, attempt history, session history, daily streaks, and summary counts. Test store changes carefully.
- Distractors must never include the correct answer.
- Keep audio and TTS failures non-blocking for practice.

## Internationalization

Supported app languages live in `src/lib/i18n.ts`: English, Chinese, Vietnamese, Nepali, and Burmese.

Rules:

- Add every user-facing string to all supported languages.
- Use `useTranslation(language)` in client UI that depends on the persisted language.
- Server metadata currently selects a default language from `accept-language`; do not assume it matches the client store after hydration.
- Landing-page text may use `src/lib/landing-i18n.ts`; app UI uses `src/lib/i18n.ts`.

## Data and Dictionaries

Important files:

- `src/data/dictionaries/dictionary.json`: main conjugation data.
- `src/data/dictionaries/{en,zh,vi,ne,my}.json`: localized meanings.
- `generate_dictionary.py`, `generate_dictionary_jisho.py`, and `translate_test.py`: dictionary generation helpers.
- `jlpt-all.zip`: source/archive data.

Rules:

- Prefer structured JSON generation or parsing over manual edits to large dictionary files.
- Keep word ids stable; progress and sync use ids and unit keys.
- If dictionary shape changes, update loaders, tests, and any persisted-state assumptions.

## Styling and UI

- Tailwind CSS 4 is the default styling approach.
- Global theme variables and motion classes live in `src/app/globals.css`.
- Branding should go through `src/components/Logo.tsx` and the public icon assets.
- Icons should use `lucide-react` when an icon is needed.
- Keep mobile layouts and installable standalone mode in mind. The app may run without browser chrome, with safe-area constraints, and offline.

## Testing Expectations

Run focused tests for the area you change, plus broader checks when touching shared state, PWA config, routing, or persistence.

High-value test targets:

- `npm run test -- src/app/pwa-config.test.ts`
- `npm run test -- src/components/IOSInstallPrompt.test.ts`
- `npm run test -- src/lib/store.test.ts`
- `npm run test -- src/lib/sessionBuilder.test.ts`
- `npm run test -- src/lib/supabase/studySync.test.ts`
- `npm run test -- src/lib/study/migrate.test.ts`
- `npm run lint`
- `npm run build` for PWA, metadata, service worker, or asset changes

When touching PWA or service worker behavior, a passing unit test run is not enough; run `npm run build` to verify Serwist generation.

## Environment

Expected public env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=false
```

These are public browser env vars. Do not introduce service-role keys or private credentials into client code.

## Generated and Ignored Artifacts

- `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `.worktrees/**`, and `public/sw.js` are ignored by ESLint.
- PNG icons under `public/` are generated from the SVG icon workflow. Regenerate them rather than editing binary assets manually when possible.
- Do not commit local `.env` files or machine-specific workspace artifacts.

## Existing Project Context

- `GEMINI.md` has a compact project overview and should stay consistent with this file.
- `docs/superpowers/specs/` and `docs/superpowers/plans/` contain design specs and implementation plans for major features.
- `docs/learning-architecture.md` explains learning-flow decisions such as interleaving and re-queueing.

When an implementation conflicts with these docs, either update the relevant doc in the same change or call out the mismatch explicitly.
