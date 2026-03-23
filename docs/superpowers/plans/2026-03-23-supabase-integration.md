# Supabase Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase authentication (Google OAuth + email/password) and cloud data sync to Katachi, while keeping guest/localStorage mode working with zero regression.

**Architecture:** `@supabase/ssr` with cookie-based sessions managed by Next.js middleware. Zustand remains the in-memory state owner; a debounced sync layer pushes dirty state to Supabase. Supabase is the source of truth when logged in; localStorage is the fallback for guests and offline scenarios.

**Tech Stack:** Next.js 16 App Router, `@supabase/supabase-js`, `@supabase/ssr`, Zustand, Vitest (new, for merge logic tests), TypeScript

**Spec:** `docs/superpowers/specs/2026-03-23-supabase-integration-design.md`

> **Known store typo:** `src/lib/store.ts` uses `leves` (not `levels`) for the JLPT level array. All sync code must map `leves` ↔ `levels` explicitly when reading/writing from Supabase.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/supabase/client.ts` | Create | Browser Supabase client factory |
| `src/lib/supabase/server.ts` | Create | Server Supabase client factory (route handlers) |
| `src/lib/supabase/sync.ts` | Create | Fetch, merge, migrate, debounced upsert |
| `src/lib/supabase/sync.test.ts` | Create | Unit tests for merge logic |
| `src/middleware.ts` | Create | Cookie session refresh + route matcher |
| `src/app/auth/callback/route.ts` | Create | OAuth PKCE code exchange |
| `src/components/AuthProvider.tsx` | Create | Session context: user, signOut, isLoading |
| `src/components/LoginForm.tsx` | Create | Email/password + Google OAuth UI |
| `src/lib/store.ts` | Modify | Add `resetStore` action |
| `src/app/layout.tsx` | Modify | Wrap children in `<AuthProvider>` |
| `src/app/page.tsx` | Modify | Show nav skeleton while `isLoading`, auth error toast |
| `src/components/SetupMenu.tsx` | Modify | Add dismissible sign-in nudge banner |
| `src/components/ReportDashboard.tsx` | Modify | Show `<LoginForm>` for guests, user info for logged-in |
| `supabase/migrations/001_initial.sql` | Create | Full schema SQL (run once in Supabase dashboard) |
| `.env.local` | Create | Supabase URL + anon key (not committed) |
| `vitest.config.ts` | Create | Vitest config with path alias matching tsconfig |

---

## Task 1: Install packages and configure environment

**Files:**
- Create: `.env.local`
- Create: `vitest.config.ts`
- Modify: `package.json` (via yarn add)

- [ ] **Step 1: Install Supabase packages and Vitest**

```bash
yarn add @supabase/supabase-js @supabase/ssr
yarn add -D vitest@^2 @vitejs/plugin-react@^4.3 vite
```

> Pin `@vitejs/plugin-react` to `^4.3` minimum — earlier versions don't support React 19.

Expected: no errors, packages appear in `package.json`

- [ ] **Step 2: Add test script to package.json**

Open `package.json` and add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.ts with path alias**

The `@/` alias must match `tsconfig.json` so test imports resolve:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 4: Create .env.local**

```bash
# .env.local  (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the placeholder values with your actual project credentials from Supabase dashboard → Settings → API.

- [ ] **Step 5: Verify .env.local is gitignored**

```bash
grep '\.env\.local' .gitignore
```

Expected: `.env.local` is listed. If not, add it.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json yarn.lock
git commit -m "chore: add Supabase packages and Vitest"
```

---

## Task 2: Create Supabase database schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`

> Run this SQL **once** in the Supabase dashboard SQL editor (Dashboard → SQL Editor → New query → paste → Run). It is not auto-applied.

> **SQL ordering is critical:** Define trigger functions first, then tables, then triggers, then RLS. PostgreSQL validates trigger targets at creation time.

- [ ] **Step 1: Create migration file**

```bash
mkdir -p supabase/migrations
```

Create `supabase/migrations/001_initial.sql`:

```sql
-- ============================================================
-- 1. Trigger functions (define before tables that reference them)
-- ============================================================

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Auto-update updated_at column
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 2. Tables
-- ============================================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  migrated_at timestamptz  -- null = not yet migrated from localStorage
);

create table public.user_stats (
  user_id         uuid primary key references public.profiles(id) on delete cascade,
  daily_streak    int  default 0 not null,
  last_login_date date,
  total_answered  int  default 0 not null,
  total_correct   int  default 0 not null
);

create table public.word_stats (
  user_id       uuid references public.profiles(id) on delete cascade,
  word_id       text,
  seen          int         default 0 not null check (seen >= 0),
  correct       int         default 0 not null check (correct >= 0),
  last_reviewed timestamptz,
  updated_at    timestamptz default now(),
  primary key (user_id, word_id),
  check (correct <= seen)
);

create table public.user_config (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  levels     text[],   -- maps to store field 'leves' (intentional typo in codebase)
  word_types text[],
  categories text[],
  batch_size int  default 10 not null check (batch_size > 0),
  mode       text default 'choice' not null check (mode in ('choice', 'input'))
);

-- ============================================================
-- 3. Triggers (after tables exist)
-- ============================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger word_stats_updated_at
  before update on public.word_stats
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- 4. Row Level Security
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.user_stats  enable row level security;
alter table public.word_stats  enable row level security;
alter table public.user_config enable row level security;

create policy "own rows only" on public.profiles
  for all using ((select auth.uid()) = id);

create policy "own rows only" on public.user_stats
  for all using ((select auth.uid()) = user_id);

create policy "own rows only" on public.word_stats
  for all using ((select auth.uid()) = user_id);

create policy "own rows only" on public.user_config
  for all using ((select auth.uid()) = user_id);
```

- [ ] **Step 2: Run the SQL in Supabase dashboard**

Dashboard → SQL Editor → New query → paste → Run.
Verify: four tables appear under Table Editor.

- [ ] **Step 3: Configure Supabase Auth settings**

In Supabase Dashboard:
- Authentication → Providers → **Email**: enable, turn **OFF** "Confirm email"
- Authentication → Providers → **Google**: enable, enter Google OAuth Client ID + Secret
- Authentication → URL Configuration → add to **Redirect URLs**:
  - `http://localhost:4399/auth/callback`
  - `https://your-production-domain.com/auth/callback`

- [ ] **Step 4: Commit migration file**

```bash
git add supabase/migrations/001_initial.sql
git commit -m "feat: add Supabase schema migrations"
```

---

## Task 3: Create Supabase client files

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`

- [ ] **Step 1: Create browser client**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server client**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie writes are ignored here
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/client.ts src/lib/supabase/server.ts
git commit -m "feat: add Supabase browser and server clients"
```

---

## Task 4: Create middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware**

Create `src/middleware.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not remove — required to refresh the session cookie
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add Supabase session middleware"
```

---

## Task 5: Add resetStore to Zustand store

**Files:**
- Modify: `src/lib/store.ts`

`resetStore` resets in-memory state AND clears the persisted localStorage key. Called on sign-out to prevent data leaking to the next user.

- [ ] **Step 1: Add resetStore to AppState interface**

Open `src/lib/store.ts`. In the `AppState` interface, add:

```ts
resetStore: () => void;
```

- [ ] **Step 2: Implement resetStore**

In the store implementation, add after `checkDailyStreak`:

```ts
resetStore: () => {
  set({
    dailyStreak: 0,
    lastLoginDate: null,
    globalStats: { totalAnswered: 0, totalCorrect: 0 },
    wordStats: {},
    config: {
      leves: ['N5'],
      wordTypes: ['verb', 'i-adj', 'na-adj'],
      categories: ['te_form', 'polite', 'negative_plain'],
      batchSize: 10,
      mode: 'choice'
    },
    activeSession: null,
  })
  // Clear the persisted localStorage key so stale data doesn't rehydrate
  useStore.persist.clearStorage()
},
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/store.ts
git commit -m "feat: add resetStore action to Zustand store"
```

---

## Task 6: Write and test sync merge logic

**Files:**
- Create: `src/lib/supabase/sync.ts` (partial — merge types and function only)
- Create: `src/lib/supabase/sync.test.ts`

This task creates a partial `sync.ts` with just the `mergeStats` function. Task 7 will append the remaining functions.

- [ ] **Step 1: Create partial sync.ts with LocalWordStat type and mergeStats**

Create `src/lib/supabase/sync.ts`:

```ts
import type { AppState } from '@/lib/store'

// ---------------------------------------------------------------
// Types mirroring the Supabase tables
// ---------------------------------------------------------------

export interface RemoteWordStat {
  word_id: string
  seen: number
  correct: number
  last_reviewed: string | null  // ISO timestamptz from Supabase
}

export interface RemoteUserStats {
  daily_streak: number
  last_login_date: string | null
  total_answered: number
  total_correct: number
}

export interface RemoteUserConfig {
  levels: string[]    // DB column is 'levels'; maps to store field 'leves'
  word_types: string[]
  categories: string[]
  batch_size: number
  mode: string
}

export interface RemoteProfile {
  migrated_at: string | null
}

// Internal shape matching Zustand store
export interface LocalWordStat {
  seen: number
  correct: number
  lastReviewed: number  // Unix ms timestamp (Date.now())
}

// ---------------------------------------------------------------
// mergeStats: merge local and remote word stats records.
// Strategy: take the higher seen/correct per word, latest lastReviewed.
// Intentionally forgiving — avoids punishing multi-device use.
// ---------------------------------------------------------------

export function mergeStats(
  local: Record<string, LocalWordStat>,
  remote: Record<string, LocalWordStat>
): Record<string, LocalWordStat> {
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)])
  const result: Record<string, LocalWordStat> = {}

  for (const key of allKeys) {
    const l = local[key]
    const r = remote[key]

    if (!l) { result[key] = r; continue }
    if (!r) { result[key] = l; continue }

    const seen = Math.max(l.seen, r.seen)
    // Clamp correct to seen — prevents DB constraint violations from sync bugs
    const correct = Math.min(Math.max(l.correct, r.correct), seen)
    const lastReviewed = Math.max(l.lastReviewed, r.lastReviewed)
    result[key] = { seen, correct, lastReviewed }
  }

  return result
}
```

- [ ] **Step 2: Write failing tests**

Create `src/lib/supabase/sync.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mergeStats } from './sync'

describe('mergeStats', () => {
  it('takes higher seen count per word', () => {
    const local = { 'w1': { seen: 5, correct: 3, lastReviewed: 1000 } }
    const remote = { 'w1': { seen: 3, correct: 2, lastReviewed: 500 } }
    const result = mergeStats(local, remote)
    expect(result['w1'].seen).toBe(5)
  })

  it('takes higher correct count per word', () => {
    const local = { 'w1': { seen: 5, correct: 3, lastReviewed: 1000 } }
    const remote = { 'w1': { seen: 5, correct: 4, lastReviewed: 1500 } }
    const result = mergeStats(local, remote)
    expect(result['w1'].correct).toBe(4)
  })

  it('takes latest lastReviewed timestamp', () => {
    const local = { 'w1': { seen: 3, correct: 2, lastReviewed: 2000 } }
    const remote = { 'w1': { seen: 3, correct: 2, lastReviewed: 1000 } }
    const result = mergeStats(local, remote)
    expect(result['w1'].lastReviewed).toBe(2000)
  })

  it('includes words only in local', () => {
    const local = { 'w1': { seen: 2, correct: 1, lastReviewed: 100 } }
    const remote = {}
    const result = mergeStats(local, remote)
    expect(result['w1'].seen).toBe(2)
  })

  it('includes words only in remote', () => {
    const local = {}
    const remote = { 'w1': { seen: 3, correct: 2, lastReviewed: 500 } }
    const result = mergeStats(local, remote)
    expect(result['w1'].seen).toBe(3)
  })

  it('correct is clamped to not exceed seen', () => {
    // Simulates a data corruption scenario: remote has correct > seen
    const local = { 'w1': { seen: 4, correct: 3, lastReviewed: 1000 } }
    const remote = { 'w1': { seen: 3, correct: 3, lastReviewed: 800 } }
    // merged seen=4, correct=min(max(3,3), 4)=3
    const result = mergeStats(local, remote)
    expect(result['w1'].correct).toBeLessThanOrEqual(result['w1'].seen)
    expect(result['w1'].seen).toBe(4)
    expect(result['w1'].correct).toBe(3)
  })
})
```

- [ ] **Step 3: Run tests — verify they pass**

```bash
yarn test
```

Expected: 6 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/sync.ts src/lib/supabase/sync.test.ts
git commit -m "feat: add mergeStats with passing tests"
```

---

## Task 7: Complete sync.ts — fetch, migrate, upsert

**Files:**
- Modify: `src/lib/supabase/sync.ts` (append to existing file)

> `leves` ↔ `levels` mapping: the Zustand store uses `leves` (a typo) for the JLPT level array. The DB column is `levels`. All read/write code must translate between them explicitly.

> `lastReviewed` ↔ `last_reviewed` conversion: the store uses a Unix ms number; the DB uses `timestamptz`. Convert with `new Date(ms).toISOString()` on write and `new Date(isoString).getTime()` on read.

- [ ] **Step 1: Append fetchUserData**

Append to `src/lib/supabase/sync.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------
// fetchUserData: load all user data from Supabase.
// Returns null if profile is not found (network error or new user
// whose trigger hasn't fired yet). Caller must handle null safely.
// ---------------------------------------------------------------

export interface FetchedUserData {
  profile: RemoteProfile
  userStats: RemoteUserStats | null
  wordStats: RemoteWordStat[]
  userConfig: RemoteUserConfig | null
}

export async function fetchUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<FetchedUserData | null> {
  const [profileRes, statsRes, wordRes, configRes] = await Promise.all([
    supabase.from('profiles').select('migrated_at').eq('id', userId).single(),
    supabase.from('user_stats').select('*').eq('user_id', userId).single(),
    supabase.from('word_stats').select('*').eq('user_id', userId),
    supabase.from('user_config').select('*').eq('user_id', userId).single(),
  ])

  if (profileRes.error) return null

  return {
    profile: profileRes.data,
    userStats: statsRes.data ?? null,
    wordStats: wordRes.data ?? [],
    userConfig: configRes.data ?? null,
  }
}
```

- [ ] **Step 2: Append convertRemoteToLocal**

Append to `src/lib/supabase/sync.ts`:

```ts
// ---------------------------------------------------------------
// convertRemoteToLocal: transform Supabase rows into Zustand shape.
// Note: DB 'levels' → store 'leves' (intentional codebase typo)
// Note: DB 'last_reviewed' (timestamptz) → store 'lastReviewed' (Unix ms)
// ---------------------------------------------------------------

export function convertRemoteToLocal(data: FetchedUserData): Partial<AppState> {
  const wordStats: Record<string, LocalWordStat> = {}
  for (const row of data.wordStats) {
    wordStats[row.word_id] = {
      seen: row.seen,
      correct: row.correct,
      lastReviewed: row.last_reviewed ? new Date(row.last_reviewed).getTime() : 0,
    }
  }

  return {
    dailyStreak: data.userStats?.daily_streak ?? 0,
    lastLoginDate: data.userStats?.last_login_date ?? null,
    globalStats: {
      totalAnswered: data.userStats?.total_answered ?? 0,
      totalCorrect: data.userStats?.total_correct ?? 0,
    },
    wordStats,
    ...(data.userConfig ? {
      config: {
        leves: (data.userConfig.levels ?? ['N5']) as AppState['config']['leves'],
        wordTypes: (data.userConfig.word_types ?? ['verb', 'i-adj', 'na-adj']) as AppState['config']['wordTypes'],
        categories: data.userConfig.categories ?? [],
        batchSize: data.userConfig.batch_size,
        mode: data.userConfig.mode as 'choice' | 'input',
      }
    } : {}),
  }
}
```

- [ ] **Step 3: Append upsertUserData**

Append to `src/lib/supabase/sync.ts`:

```ts
// ---------------------------------------------------------------
// upsertUserData: push current Zustand state to Supabase.
// Clamps correct <= seen before writing to avoid DB constraint errors.
// Note: store 'leves' → DB 'levels'
// Note: store 'lastReviewed' (Unix ms) → DB 'last_reviewed' (timestamptz)
// ---------------------------------------------------------------

export async function upsertUserData(
  supabase: SupabaseClient,
  userId: string,
  state: Pick<AppState, 'dailyStreak' | 'lastLoginDate' | 'globalStats' | 'wordStats' | 'config'>
): Promise<void> {
  const wordRows = Object.entries(state.wordStats).map(([word_id, stats]) => ({
    user_id: userId,
    word_id,
    // Clamp to prevent DB constraint violation from any sync bugs
    seen: Math.max(0, stats.seen),
    correct: Math.min(Math.max(0, stats.correct), Math.max(0, stats.seen)),
    last_reviewed: stats.lastReviewed
      ? new Date(stats.lastReviewed).toISOString()
      : null,
  }))

  await Promise.all([
    supabase.from('user_stats').upsert({
      user_id: userId,
      daily_streak: state.dailyStreak,
      last_login_date: state.lastLoginDate,
      total_answered: state.globalStats.totalAnswered,
      total_correct: state.globalStats.totalCorrect,
    }),
    supabase.from('user_config').upsert({
      user_id: userId,
      levels: state.config.leves,      // store 'leves' → DB 'levels'
      word_types: state.config.wordTypes,
      categories: state.config.categories,
      batch_size: state.config.batchSize,
      mode: state.config.mode,
    }),
    wordRows.length > 0
      ? supabase.from('word_stats').upsert(wordRows, { onConflict: 'user_id,word_id' })
      : Promise.resolve(),
  ])
}
```

- [ ] **Step 4: Append createDebouncedSync**

Append to `src/lib/supabase/sync.ts`:

```ts
// ---------------------------------------------------------------
// createDebouncedSync: subscribe to Zustand store changes and
// debounce upserts. Returns a cleanup function — call on sign-out.
// ---------------------------------------------------------------

export function createDebouncedSync(
  supabase: SupabaseClient,
  userId: string,
  getState: () => AppState,
  subscribeStore: (listener: () => void) => () => void,
  delayMs = 2000
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  let dirty = false

  const flush = () => {
    const state = getState()
    upsertUserData(supabase, userId, state).catch(console.error)
    dirty = false
  }

  const onStoreChange = () => {
    dirty = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(flush, delayMs)
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && dirty) {
      if (timer) clearTimeout(timer)
      flush()
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  const unsubscribeStore = subscribeStore(onStoreChange)

  return () => {
    if (timer) clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    unsubscribeStore()
  }
}
```

- [ ] **Step 5: Append migrateLocalToSupabase**

Append to `src/lib/supabase/sync.ts`:

```ts
// ---------------------------------------------------------------
// migrateLocalToSupabase: first-sign-in migration.
// Merges local localStorage state with any existing remote data,
// upserts the merged state, and sets migrated_at on the profile.
// ---------------------------------------------------------------

export async function migrateLocalToSupabase(
  supabase: SupabaseClient,
  userId: string,
  localState: Pick<AppState, 'dailyStreak' | 'lastLoginDate' | 'globalStats' | 'wordStats' | 'config'>,
  remoteData: FetchedUserData
): Promise<Partial<AppState>> {
  const remoteLocal = convertRemoteToLocal(remoteData)

  const mergedWordStats = mergeStats(
    localState.wordStats,
    (remoteLocal.wordStats ?? {}) as Record<string, LocalWordStat>
  )

  const mergedState: Pick<AppState, 'dailyStreak' | 'lastLoginDate' | 'globalStats' | 'wordStats' | 'config'> = {
    dailyStreak: Math.max(localState.dailyStreak, remoteLocal.dailyStreak ?? 0),
    lastLoginDate: localState.lastLoginDate ?? remoteLocal.lastLoginDate ?? null,
    globalStats: {
      totalAnswered: Math.max(
        localState.globalStats.totalAnswered,
        remoteLocal.globalStats?.totalAnswered ?? 0
      ),
      totalCorrect: Math.max(
        localState.globalStats.totalCorrect,
        remoteLocal.globalStats?.totalCorrect ?? 0
      ),
    },
    wordStats: mergedWordStats,
    config: remoteData.userConfig
      ? (remoteLocal.config as AppState['config'])
      : localState.config,
  }

  await Promise.all([
    upsertUserData(supabase, userId, mergedState),
    supabase.from('profiles').update({ migrated_at: new Date().toISOString() }).eq('id', userId),
  ])

  return mergedState
}
```

- [ ] **Step 6: Verify tests still pass and TypeScript compiles**

```bash
yarn test && yarn tsc --noEmit
```

Expected: 6 tests pass, no type errors

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase/sync.ts
git commit -m "feat: add fetchUserData, upsertUserData, migrate, and debounced sync"
```

---

## Task 8: Create AuthProvider

**Files:**
- Create: `src/components/AuthProvider.tsx`

> **Important:** Use `getUser()` (not `getSession()`) for initial session check. `@supabase/ssr` docs explicitly state `getSession()` reads an unvalidated cookie and is insecure for determining auth state.

> **Important:** Only reload user data on `SIGNED_IN` and `INITIAL_SESSION` events — not on `TOKEN_REFRESHED`. Token refresh happens every ~60 minutes and should not re-fetch and re-overwrite store data.

- [ ] **Step 1: Create AuthProvider**

Create `src/components/AuthProvider.tsx`:

```tsx
'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store'
import {
  fetchUserData,
  convertRemoteToLocal,
  migrateLocalToSupabase,
  createDebouncedSync,
} from '@/lib/supabase/sync'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const cleanupRef = useRef<(() => void) | null>(null)

  async function loadUserData(userId: string) {
    const localState = useStore.getState()
    const remote = await fetchUserData(supabase, userId)

    if (!remote) {
      // Network error — keep current local state, do not overwrite with empty data
      console.error('[katachi] Failed to fetch user data, keeping local state')
      return
    }

    let nextState
    if (!remote.profile.migrated_at && localState.globalStats.totalAnswered > 0) {
      // First sign-in with existing local data — migrate and merge
      nextState = await migrateLocalToSupabase(supabase, userId, localState, remote)
    } else {
      nextState = convertRemoteToLocal(remote)
    }

    // Supabase is source of truth — overwrite store
    useStore.setState({ ...nextState, activeSession: null })

    // Start debounced sync for future changes
    cleanupRef.current?.()
    cleanupRef.current = createDebouncedSync(
      supabase,
      userId,
      () => useStore.getState(),
      (listener) => useStore.subscribe(listener)
    )
  }

  useEffect(() => {
    // Use getUser() not getSession() — getUser() validates against the server
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        loadUserData(u.id).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null

      if (event === 'TOKEN_REFRESHED') {
        // Token refresh — update user object but do NOT re-fetch data
        setUser(u)
        return
      }

      setUser(u)

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (u) loadUserData(u.id)
      }

      if (event === 'SIGNED_OUT') {
        cleanupRef.current?.()
        cleanupRef.current = null
        // Clear Zustand state + localStorage + non-Zustand keys
        useStore.getState().resetStore()
        localStorage.removeItem('katachi-nudge-dismissed')
      }
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    await supabase.auth.signOut()
    // onAuthStateChange SIGNED_OUT handles cleanup
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/AuthProvider.tsx
git commit -m "feat: add AuthProvider with session management and data sync"
```

---

## Task 9: Create OAuth callback route

**Files:**
- Create: `src/app/auth/callback/route.ts`

> This is a server-side Route Handler. It must use the **server** Supabase client from `src/lib/supabase/server.ts` — not the browser client. Using the wrong client will fail to set the session cookie and leave the user appearing logged out.

- [ ] **Step 1: Create auth callback route**

```bash
mkdir -p src/app/auth/callback
```

Create `src/app/auth/callback/route.ts`:

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth_failed`)
  }

  // Must use server client — it has access to response cookies
  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[katachi] OAuth callback error:', error.message)
    return NextResponse.redirect(`${origin}/?error=auth_failed`)
  }

  return NextResponse.redirect(origin)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "feat: add OAuth callback route handler"
```

---

## Task 10: Create LoginForm component

**Files:**
- Create: `src/components/LoginForm.tsx`

- [ ] **Step 1: Create LoginForm**

Create `src/components/LoginForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) setError(error.message)
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-[#8ba888] text-center uppercase tracking-wider">
        Sign in to sync your progress
      </p>

      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-[#e8eedd] bg-white font-bold text-sm text-[#2d3748] shadow-sm active:scale-95 transition-all"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#e8eedd]" />
        <span className="text-[10px] font-bold text-[#8ba888] uppercase">or</span>
        <div className="flex-1 h-px bg-[#e8eedd]" />
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-2xl border border-[#e8eedd] text-sm font-bold text-[#2d3748] placeholder:text-[#8ba888]/60 focus:outline-none focus:ring-2 focus:ring-[#9acd32]/40"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-2xl border border-[#e8eedd] text-sm font-bold text-[#2d3748] placeholder:text-[#8ba888]/60 focus:outline-none focus:ring-2 focus:ring-[#9acd32]/40"
        />

        {error && (
          <p className="text-xs font-bold text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-[#9acd32] text-white font-black text-sm shadow-sm active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? '…' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <button
        onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
        className="w-full text-xs font-bold text-[#8ba888] text-center"
      >
        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/LoginForm.tsx
git commit -m "feat: add LoginForm component with email/password and Google OAuth"
```

---

## Task 11: Wire up layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Import and add AuthProvider**

Open `src/app/layout.tsx`. Add the import:

```tsx
import AuthProvider from '@/components/AuthProvider'
```

Wrap `{children}`:

```tsx
<body className={`${font.variable} antialiased`}>
  <AuthProvider>
    {children}
  </AuthProvider>
</body>
```

- [ ] **Step 2: Start dev server and verify no crash**

```bash
yarn dev
```

Open `http://localhost:4399`. Expected: page loads, no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: wrap app in AuthProvider"
```

---

## Task 12: Add loading skeleton and error toast to page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add useAuth import**

Open `src/app/page.tsx`. Add:

```tsx
import { useAuth } from '@/components/AuthProvider'
```

Inside `Home`, add:

```tsx
const { isLoading } = useAuth()
```

- [ ] **Step 2: Replace nav contents with skeleton while loading**

Find the nav's inner `<div className="max-w-sm mx-auto flex justify-between items-center">` and replace its children with a conditional:

```tsx
<div className="max-w-sm mx-auto flex justify-between items-center">
  {isLoading ? (
    <>
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="flex flex-col items-center gap-1.5 min-w-[72px] min-h-[56px] px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-[#e8eedd] animate-pulse" />
          <div className="w-10 h-2 rounded-full bg-[#e8eedd] animate-pulse" />
        </div>
      ))}
    </>
  ) : (
    <>
      <NavButton active={activeTab === 'practice'} onClick={() => setActiveTab('practice')} label="Practice" icon="🎯" />
      <NavButton active={false} onClick={() => alert('Dictionary feature coming soon!')} label="Dict." icon="📖" isMock />
      <NavButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} label="Profile" icon="🧑‍🎨" />
      <NavButton active={false} onClick={() => alert('Settings coming soon!')} label="Settings" icon="⚙️" isMock />
    </>
  )}
</div>
```

- [ ] **Step 3: Add auth error toast**

Add this import at the top of `page.tsx`:

```tsx
import { useSearchParams } from 'next/navigation'
```

Inside `Home`, add:

```tsx
const searchParams = useSearchParams()
const authError = searchParams.get('error')
```

Add the error toast inside the `<main>` element, before the `<nav>`:

```tsx
{authError === 'auth_failed' && (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg">
    Sign in failed. Please try again.
  </div>
)}
```

> `useSearchParams` requires the component to be wrapped in a `<Suspense>` boundary in Next.js App Router. If you see a build error about this, wrap the `Home` export in `<Suspense fallback={null}>` in layout.tsx, or use `typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('error') : null` as an alternative that avoids the Suspense requirement.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add loading skeleton and auth error toast to page"
```

---

## Task 13: Add sign-in nudge banner to SetupMenu

**Files:**
- Modify: `src/components/SetupMenu.tsx`

- [ ] **Step 1: Add imports and state**

Open `src/components/SetupMenu.tsx`. Add imports at the top:

```tsx
import { useAuth } from '@/components/AuthProvider'
```

Inside `SetupMenu`, add:

```tsx
const { user } = useAuth()
const [nudgeDismissed, setNudgeDismissed] = useState(() => {
  if (typeof window === 'undefined') return true
  return localStorage.getItem('katachi-nudge-dismissed') === '1'
})

const dismissNudge = () => {
  localStorage.setItem('katachi-nudge-dismissed', '1')
  setNudgeDismissed(true)
}
```

- [ ] **Step 2: Add nudge banner at the top of SetupMenu's returned JSX**

Find the outer `<div>` of the SetupMenu return. Add this as the first child inside it:

```tsx
{!user && !nudgeDismissed && (
  <div className="mx-0 mb-2 flex items-center justify-between gap-3 bg-[#f8fcf2] border border-[#9acd32]/30 rounded-2xl px-4 py-3">
    <p className="text-xs font-bold text-[#466a3e]">
      Sign in to sync your progress across devices
    </p>
    <button
      onClick={dismissNudge}
      className="text-[#8ba888] text-sm font-black shrink-0 hover:text-[#466a3e] transition-colors"
      aria-label="Dismiss"
    >
      ✕
    </button>
  </div>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
yarn tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/SetupMenu.tsx
git commit -m "feat: add dismissible sign-in nudge banner to SetupMenu"
```

---

## Task 14: Update ReportDashboard — show LoginForm for guests

**Files:**
- Modify: `src/components/ReportDashboard.tsx`

- [ ] **Step 1: Add imports**

Open `src/components/ReportDashboard.tsx`. Add:

```tsx
import { useAuth } from '@/components/AuthProvider'
import LoginForm from '@/components/LoginForm'
```

Inside the component, add:

```tsx
const { user, signOut } = useAuth()
```

- [ ] **Step 2: Replace hardcoded profile header**

Find the `{/* Header / Profile section */}` block (the one with the mascot image, "Learner" text, and the level progress bar). Replace the text section below the avatar with an auth-aware version:

```tsx
<div className="text-center space-y-0.5">
  {user ? (
    <>
      <h1 className="text-xl font-black text-[#2d3748] tracking-tight">
        {user.email?.split('@')[0] ?? 'Learner'}
      </h1>
      <p className="text-xs font-bold text-[#8ba888]">{user.email}</p>
      <button
        onClick={signOut}
        className="mt-2 text-[10px] font-bold text-[#8ba888] underline hover:text-[#466a3e] transition-colors"
      >
        Sign out
      </button>
    </>
  ) : (
    <>
      <h1 className="text-xl font-black text-[#2d3748] tracking-tight">Learner</h1>
      <p className="text-xs font-bold text-[#8ba888]">Katachi Student</p>
    </>
  )}
</div>
```

- [ ] **Step 3: Add LoginForm for guests, below the profile header block**

After the closing `</div>` of the profile/header section (before the stats row), add:

```tsx
{!user && (
  <div className="bg-white border border-[#e8eedd] rounded-2xl p-4 shadow-sm">
    <LoginForm />
  </div>
)}
```

- [ ] **Step 4: Verify TypeScript compiles and dev server runs**

```bash
yarn tsc --noEmit && yarn dev
```

Expected: no errors; app loads, Profile tab shows LoginForm for guests.

- [ ] **Step 5: Commit**

```bash
git add src/components/ReportDashboard.tsx
git commit -m "feat: show LoginForm for guests in ReportDashboard, user info for logged-in"
```

---

## Task 15: Integration testing checklist

> Manual end-to-end verification. Run with `yarn dev` at `http://localhost:4399`.

- [ ] **Guest mode (no regression)**
  - App loads with no console errors
  - Complete a practice session — stats update in SetupMenu and ReportDashboard
  - Refresh page — stats persist (localStorage still works)
  - Nudge banner appears on SetupMenu; ✕ dismisses it; stays dismissed after refresh
  - Profile tab shows "Learner" and the `<LoginForm>`

- [ ] **Email sign-up**
  - Profile tab → sign up with a new email/password
  - Verify: user email appears in profile header, sign-out button visible
  - Check Supabase dashboard → Table Editor → `auth.users` (should have new row), `profiles` (trigger should have auto-created a row)

- [ ] **First sign-in migration**
  - As a guest, complete a few sessions to build up stats (total > 0)
  - Sign in — verify stats remain in the UI (migration preserved them)
  - Check Supabase: `user_stats.total_answered` > 0, `profiles.migrated_at` is set, `word_stats` has rows

- [ ] **Data sync**
  - While logged in, complete a session
  - Wait 3 seconds (debounce)
  - Check Supabase `user_stats` — `total_answered` updated

- [ ] **Sign-out**
  - Click sign out
  - Profile shows "Learner" again and `<LoginForm>`
  - Stats are cleared (SetupMenu shows total = 0)
  - Nudge banner reappears on SetupMenu (nudge-dismissed key was cleared)

- [ ] **Sign back in (no re-migration)**
  - Sign in again with the same account
  - Verify: data comes from Supabase, no migration runs again (migrated_at is still set)

- [ ] **Google OAuth**
  - Click "Continue with Google" → complete OAuth → redirected back to app
  - Verify: user email shown in profile

- [ ] **Offline resilience**
  - Sign in, then in DevTools → Network → set "Offline"
  - Complete a session — no crash, UI updates normally
  - Re-enable network — next interaction triggers a sync attempt

- [ ] **TOKEN_REFRESHED sanity check**
  - Sign in and leave the app open for 60+ minutes (or manually trigger a token refresh via Supabase dashboard)
  - Verify: store is not reset/re-fetched, user stays signed in

- [ ] **Final commit**

```bash
git add .
git commit -m "chore: complete Supabase integration"
```
