# Katachi (形) - Project Context

Katachi is a modern, localized web application designed for mastering Japanese conjugations (JLPT N5 & N4). It features a robust distractor engine that mimics common learner errors and provides a "Zen" inspired study experience.

## Project Overview

- **Purpose:** Help Japanese learners practice and master verb and adjective conjugations through active recall and recognition.
- **Main Technologies:**
    - **Frontend:** Next.js 15 (App Router), React 19.
    - **Styling:** Tailwind CSS 4, CSS Modules.
    - **State Management:** Zustand with persistence to `localStorage`.
    - **Authentication & Backend:** Supabase (Auth & Database for progress syncing).
    - **Utilities:** WanaKana (Romaji-to-Hiragana), Serwist (PWA support).
- **Architecture:**
    - **Local-First:** Core practice logic and progress tracking work offline via `localStorage`.
    - **Modular Logic:** Distractor generation and session building are decoupled from UI components.
    - **i18n:** Multi-language support (English, Chinese, Vietnamese, Nepali, Burmese) handled via a custom hook and translation objects.

## Building and Running

### Key Commands

- **Development:** `npm run dev` (runs on port 4399).
- **Production Build:** `npm run build` (uses `--webpack` flag to support Serwist).
- **Start Production:** `npm run start`.
- **Linting:** `npm run lint`.
- **Testing:** `npm run test` (uses Vitest).
- **Supabase Sync Check:** `npm run check:supabase`.

### PWA Note
The project is configured as a PWA. Service worker generation requires a production build with Webpack.

## Development Conventions

- **State Management:**
    - Use `src/lib/store.ts` for global application state.
    - Prefer `studyState` for persistence and `activeSession` for transient practice state.
- **i18n:**
    - All user-facing text should be added to `src/lib/i18n.ts` across all supported languages.
    - Use the `useTranslation` hook for localized strings.
- **Component Structure:**
    - Small, reusable components in `src/components/`.
    - Page-level components in `src/app/`.
    - Logic-heavy hooks or helpers in `src/lib/`.
- **Testing:**
    - Write unit tests for library logic and helpers (e.g., `*.test.ts`).
    - Use `vitest` for running tests.
- **Icons & Visuals:**
    - Use `Logo.tsx` for consistent branding.
    - Icons are primarily from `lucide-react` (via `README.md` info).
- **Styling:**
    - Use Tailwind CSS 4 utility classes.
    - Theme variables are defined in `src/app/globals.css`.

## Key Files & Directories

- `src/lib/distractorEngine.ts`: Core logic for generating incorrect answer choices.
- `src/lib/store.ts`: Zustand store for application state and persistence.
- `src/lib/i18n.ts`: Main translation file for all supported languages.
- `src/app/sw.ts`: Serwist service worker configuration.
- `docs/superpowers/`: Contains design specs and implementation plans.
- `src/data/dictionaries/`: JSON files containing the word database for different levels and languages.
