# Supabase Integration Design — Katachi

**Date:** 2026-03-23
**Status:** Approved
**Scope:** Authentication (Google OAuth + email/password) and cloud data sync for user progress

---

## 1. Overview

Add Supabase to Katachi to enable user login and cross-device progress sync. The app currently stores all data (streaks, word stats, config) in `localStorage` via Zustand's `persist` middleware. After this change:

- Guests continue using the app with `localStorage` (no regression)
- Logged-in users have their data synced to Supabase
- Existing local data migrates to Supabase on first sign-in

---

## 2. Architecture

### Packages

- `@supabase/supabase-js`
- `@supabase/ssr`

### New Files

```
src/lib/supabase/
  client.ts                       — createBrowserClient() for React components
  server.ts                       — createServerClient() for route handlers
  sync.ts                         — debounced sync, merge logic, first-login migration
src/middleware.ts                  — cookie session refresh on every request
src/app/auth/callback/route.ts     — OAuth code exchange handler
src/components/AuthProvider.tsx    — session context: user, signOut, isLoading
src/components/LoginForm.tsx       — email/password form + Google OAuth button
```

### Auth Provider

`AuthProvider` wraps the app in `layout.tsx` and exposes `{ user, signOut, isLoading }` via React context.

- Calls `supabase.auth.getSession()` on mount
- Subscribes to `onAuthStateChange` to handle sign-out/token refresh from other tabs
- While session resolves, `isLoading = true` — the app renders a brief skeleton to prevent guest/logged-in flash

### OAuth Callback

`/auth/callback` route handler:
- Reads the `code` query param
- Exchanges it for a session via `supabase.auth.exchangeCodeForSession(code)`
- On success: redirects to `/`
- On failure (missing code, exchange error): redirects to `/?error=auth_failed` with a visible error toast

---

## 3. Data Sync Strategy

### Source of Truth

| State | Source of Truth |
|-------|----------------|
| Guest | `localStorage` |
| Logged in | Supabase |

### On Sign-In

1. Fetch user data from Supabase (`user_stats`, `word_stats`, `user_config`)
2. Check Supabase `profiles.migrated_at` — if null and localStorage has data, run migration:
   - Per word: take higher `seen`/`correct`, latest `last_reviewed`
   - `daily_streak`: take the higher value
   - `global_stats`: take the higher `total_answered`/`total_correct`
   - `config`: prefer Supabase config if it exists, else local
3. Write `migrated_at = now()` to `profiles` — never migrate again
4. Overwrite Zustand store (and `localStorage`) with fetched/merged data

### Write Path (Logged-In Users)

- Zustand writes to in-memory state → `localStorage` as before (no change to existing actions)
- `sync.ts` marks state dirty and debounces a Supabase upsert (2-second delay)
- Also flushes on `document.visibilitychange` (`hidden`) and `beforeunload`
- Sync failures are logged silently — `localStorage` is the fallback; retry on next write opportunity
- No blocking network calls in the UI during answer submission

### On Sign-Out

- Keep `localStorage` intact — user reverts to guest mode with their local data

---

## 4. Database Schema

```sql
-- profiles (created via trigger on auth.users INSERT — no open INSERT policy)
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  migrated_at timestamptz  -- set after first localStorage migration; null = not yet migrated
);

-- user_stats (one row per user)
create table user_stats (
  user_id         uuid primary key references profiles(id) on delete cascade,
  daily_streak    int         default 0 not null,
  last_login_date date,
  total_answered  int         default 0 not null,
  total_correct   int         default 0 not null
);

-- word_stats (one row per user+word)
create table word_stats (
  user_id       uuid references profiles(id) on delete cascade,
  word_id       text,
  seen          int         default 0 not null check (seen >= 0),
  correct       int         default 0 not null check (correct >= 0),
  last_reviewed timestamptz,
  updated_at    timestamptz default now(),
  primary key (user_id, word_id),
  check (correct <= seen)
);

-- user_config (one row per user)
create table user_config (
  user_id    uuid primary key references profiles(id) on delete cascade,
  levels     text[],
  word_types text[],
  categories text[],
  batch_size int  default 10 not null check (batch_size > 0),
  mode       text default 'choice' not null check (mode in ('choice', 'input'))
);
```

### Row Level Security

All four tables have RLS enabled. Policy pattern (performance-safe — avoids per-row function evaluation):

```sql
create policy "own rows only" on <table>
  for all using ((select auth.uid()) = <user_id_column>);
```

INSERT is covered by `FOR ALL`. Profiles are created via a database trigger on `auth.users INSERT`, not via an open client-side INSERT policy.

### Indexes

```sql
-- Supports "words not reviewed in N days" queries
create index on word_stats (user_id, last_reviewed);
-- PK indexes on user_stats, user_config, and word_stats composite PK cover all RLS lookups
```

---

## 5. UI Changes

| Location | Change |
|----------|--------|
| `src/app/layout.tsx` | Wrap `{children}` in `<AuthProvider>` |
| `src/app/page.tsx` | Read `isLoading` from context; show skeleton during session resolve |
| `src/components/SetupMenu.tsx` | Add dismissible sign-in nudge banner at top (guests only; dismiss state in `localStorage`) |
| `src/components/ReportDashboard.tsx` | Show `<LoginForm>` when guest; show user email + sign-out when logged in |
| New: `src/components/LoginForm.tsx` | Email/password fields + "Sign in with Google" button |

---

## 6. Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Both are public (safe to expose in the browser). No service role key needed — all data access goes through RLS-protected client queries.

---

## 7. Out of Scope

- Real-time sync (Supabase Realtime subscriptions)
- Account deletion UI
- Social sharing or leaderboards
- Any changes to the practice session logic or distractor engine
