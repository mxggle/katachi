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
