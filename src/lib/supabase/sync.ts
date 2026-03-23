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

import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------
// fetchUserData: load all user data from Supabase.
// Returns null if profile is not found (network error or new user).
// Caller must handle null safely — do NOT overwrite store on null.
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
