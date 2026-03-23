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
src/middleware.ts                  — cookie session refresh on every request (with matcher)
src/app/auth/callback/route.ts     — OAuth code exchange handler
src/components/AuthProvider.tsx    — session context: user, signOut, isLoading
src/components/LoginForm.tsx       — email/password form + Google OAuth button
```

### Auth Provider

`AuthProvider` wraps the app in `layout.tsx` and exposes `{ user, signOut, isLoading }` via React context.

- Calls `supabase.auth.getSession()` on mount
- Subscribes to `onAuthStateChange` to handle sign-out/token refresh from other tabs
- While session resolves, `isLoading = true` — the nav bar skeleton renders instead of the full nav to prevent guest/logged-in flash. The main content area is unaffected.

### OAuth Callback

`/auth/callback` route handler:
- Reads the `code` query param
- Exchanges it for a session via `supabase.auth.exchangeCodeForSession(code)`
- On success: redirects to `/`
- On failure (missing code, exchange error): redirects to `/?error=auth_failed` with a visible error toast

**Required Supabase project settings:**
- PKCE flow must be enabled (default for new projects)
- Redirect URL `http://localhost:4399/auth/callback` must be allowlisted for local dev
- Production URL must also be allowlisted before deploy

### Middleware Matcher

`src/middleware.ts` applies only to app routes, not static assets:

```ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Email/Password Sign-Up

Email confirmation is **disabled** in Supabase project settings for simplicity. Users are signed in immediately after sign-up. This can be enabled later without code changes.

---

## 3. Data Sync Strategy

### Source of Truth

| State | Source of Truth |
|-------|----------------|
| Guest | `localStorage` |
| Logged in | Supabase |

### On Sign-In

1. Fetch `profiles`, `user_stats`, `word_stats`, `user_config` from Supabase
2. If the fetch itself fails (network error), abort — do NOT overwrite Zustand store with empty data. Keep current local state and retry on next sign-in or navigation.
3. If fetch succeeds and `profiles.migrated_at` is null and `localStorage` has data, run migration:
   - Per word: take higher `seen`/`correct`, latest `last_reviewed`
   - `daily_streak`: take the higher value *(intentionally forgiving — avoids punishing users who lost a streak due to a device gap)*
   - `global_stats`: take the higher `total_answered`/`total_correct`
   - `config`: prefer Supabase config if it exists, else local
4. Write `migrated_at = now()` to `profiles` — never migrate again after this
5. Overwrite Zustand store (and `localStorage`) with the fetched/merged data

**Multi-account scenario:** On sign-out, `localStorage` is cleared of all Katachi state. This prevents a second user signing in on the same device from having their account populated with the first user's local data. The signed-out user loses their local guest state — this is acceptable because their data is already in Supabase.

### Write Path (Logged-In Users)

- Zustand writes to in-memory state → `localStorage` as before (no change to existing actions)
- `sync.ts` subscribes to Zustand store changes, marks state dirty, and debounces a Supabase upsert (2-second delay after last change)
- Also flushes on `document.visibilitychange` (`hidden`) and `beforeunload`
- `last_login_date` and `daily_streak` are written during the existing `checkDailyStreak` call — picked up by the debounced sync automatically
- **Sync failures:** log to console, do not show UI errors. Dirty flag remains set; next write attempt retries. No retry queue — the next user action triggers another debounce. Data is safe in `localStorage`.
- **Concurrent writes (two devices/tabs):** last-write-wins. `word_stats.updated_at` records when each row was last written but is not used for conflict resolution. This is acceptable for a practice app — the worst case is a few answer counts being slightly off.

### On Sign-Out

- Clear all Katachi `localStorage` state (call Zustand `resetStore`) to prevent data leaking to the next user on the same device
- User returns to guest mode with an empty local state

---

## 4. Database Schema

```sql
-- Trigger: auto-create profile row on new user sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: auto-update updated_at on word_stats
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger word_stats_updated_at
  before update on word_stats
  for each row execute procedure public.set_updated_at();

-- profiles
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  migrated_at timestamptz  -- null = not yet migrated from localStorage
);

-- user_stats (one row per user)
create table user_stats (
  user_id         uuid primary key references profiles(id) on delete cascade,
  daily_streak    int  default 0 not null,
  last_login_date date,
  total_answered  int  default 0 not null,
  total_correct   int  default 0 not null
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
  -- 'choice' and 'input' are the only values in the existing Zustand store
);
```

### Row Level Security

All four tables have RLS enabled. Policy pattern (performance-safe — avoids per-row function evaluation):

```sql
alter table profiles   enable row level security;
alter table user_stats enable row level security;
alter table word_stats enable row level security;
alter table user_config enable row level security;

-- Apply to each table, substituting the correct user_id column name
create policy "own rows only" on profiles
  for all using ((select auth.uid()) = id);

create policy "own rows only" on user_stats
  for all using ((select auth.uid()) = user_id);

create policy "own rows only" on word_stats
  for all using ((select auth.uid()) = user_id);

create policy "own rows only" on user_config
  for all using ((select auth.uid()) = user_id);
```

`FOR ALL` covers SELECT, INSERT, UPDATE, and DELETE. The profiles trigger handles INSERT for new users — no separate INSERT policy needed on `profiles`.

### Indexes

```sql
-- PK indexes on user_stats, user_config, and word_stats composite PK cover all RLS lookups.
-- No additional indexes needed for current query patterns.
-- word_stats (user_id, last_reviewed) index deferred — add if spaced repetition is built later.
```

---

## 5. UI Changes

| Location | Change |
|----------|--------|
| `src/app/layout.tsx` | Wrap `{children}` in `<AuthProvider>` |
| `src/app/page.tsx` | Read `isLoading` from context; render nav bar skeleton while resolving |
| `src/components/SetupMenu.tsx` | Add dismissible sign-in nudge banner at top (guests only; dismiss state in `localStorage`) |
| `src/components/ReportDashboard.tsx` | Render `<LoginForm>` inline at top of page when guest; show user email + sign-out button when logged in |
| New: `src/components/LoginForm.tsx` | Email/password fields + "Sign in with Google" button — inline component, not modal |

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
- Email confirmation (disabled for now; can be enabled in Supabase settings without code changes)
- Social sharing or leaderboards
- Any changes to the practice session logic or distractor engine
