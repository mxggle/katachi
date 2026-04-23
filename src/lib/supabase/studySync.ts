import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Json } from './json';
import type { TranslationKey } from '@/lib/i18n';
import type { AttemptRecord, SessionRecord, StudyState, UnitProgress } from '@/lib/study/types';

export const SYNC_META_STORAGE_KEY = 'katachi-sync-meta';

export interface StudySyncMeta {
  userId: string;
  remoteUpdatedAt?: string;
  syncedStateJson: string;
}

export interface RemoteStudySnapshot {
  studyState: StudyState;
  updatedAt: string | null;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));

    return `{${entries
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

export function stringifyStudyState(studyState: StudyState): string {
  return stableStringify(studyState);
}

export function getStudySyncErrorMessageKey(error: unknown): TranslationKey {
  const maybeError = error as { code?: unknown; message?: unknown };
  const code = typeof maybeError?.code === 'string' ? maybeError.code : '';
  const message = typeof maybeError?.message === 'string' ? maybeError.message : '';

  if (code === 'PGRST205' || message.includes("Could not find the table 'public.study_states'")) {
    return 'syncSetupMissingTable';
  }

  return 'syncFailed';
}

export const STUDY_STATES_TABLE_SQL = `
create table if not exists public.study_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  study_state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.study_states enable row level security;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists study_states_updated_at on public.study_states;
create trigger study_states_updated_at
  before update on public.study_states
  for each row execute procedure public.set_updated_at();

drop policy if exists "study states are owned by user" on public.study_states;
create policy "study states are owned by user"
  on public.study_states
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
`;

function latestNullableDate(left: string | null, right: string | null): string | null {
  if (!left) return right;
  if (!right) return left;
  return left > right ? left : right;
}

function mergeUnitProgress(local: UnitProgress, remote: UnitProgress): UnitProgress {
  return {
    ...remote,
    ...local,
    seenCount: Math.max(local.seenCount, remote.seenCount),
    correctCount: Math.max(local.correctCount, remote.correctCount),
    wrongCount: Math.max(local.wrongCount, remote.wrongCount),
    consecutiveCorrect: Math.max(local.consecutiveCorrect, remote.consecutiveCorrect),
    consecutiveWrong: Math.max(local.consecutiveWrong, remote.consecutiveWrong),
    lastSeenAt: latestNullableDate(local.lastSeenAt, remote.lastSeenAt),
    lastCorrectAt: latestNullableDate(local.lastCorrectAt, remote.lastCorrectAt),
    lastWrongAt: latestNullableDate(local.lastWrongAt, remote.lastWrongAt),
    sameDayExposureCount: Math.max(local.sameDayExposureCount, remote.sameDayExposureCount),
    sameSessionRetryCount: Math.max(local.sameSessionRetryCount, remote.sameSessionRetryCount),
  };
}

function mergeById<T>(local: T[], remote: T[], getId: (item: T) => string, getTimestamp: (item: T) => string): T[] {
  const merged = new Map<string, T>();

  for (const item of [...remote, ...local]) {
    merged.set(getId(item), item);
  }

  return Array.from(merged.values()).sort((left, right) => getTimestamp(left).localeCompare(getTimestamp(right)));
}

function mergeSessionHistory(local: SessionRecord[], remote: SessionRecord[]): SessionRecord[] {
  return mergeById(
    local,
    remote,
    (session) => session.sessionId,
    (session) => session.endedAt ?? session.startedAt
  );
}

function mergeAttemptHistory(local: AttemptRecord[], remote: AttemptRecord[]): AttemptRecord[] {
  return mergeById(
    local,
    remote,
    (attempt) => attempt.attemptId,
    (attempt) => attempt.answeredAt
  );
}

export function mergeStudyStates(local: StudyState, remote: StudyState | null): StudyState {
  if (!remote) {
    return local;
  }

  const unitProgress = { ...remote.unitProgress };

  for (const [unitKey, localProgress] of Object.entries(local.unitProgress)) {
    unitProgress[unitKey] = unitProgress[unitKey]
      ? mergeUnitProgress(localProgress, unitProgress[unitKey])
      : localProgress;
  }

  return {
    ...remote,
    preferences: remote.preferences,
    learnerSummary: {
      ...remote.learnerSummary,
      dailyStreak: Math.max(local.learnerSummary.dailyStreak, remote.learnerSummary.dailyStreak),
      lastPracticeDate: latestNullableDate(local.learnerSummary.lastPracticeDate, remote.learnerSummary.lastPracticeDate),
      lastSessionAt: latestNullableDate(local.learnerSummary.lastSessionAt, remote.learnerSummary.lastSessionAt),
      totalAnswered: Math.max(local.learnerSummary.totalAnswered, remote.learnerSummary.totalAnswered),
      totalCorrect: Math.max(local.learnerSummary.totalCorrect, remote.learnerSummary.totalCorrect),
      schemaVersion: Math.max(local.learnerSummary.schemaVersion, remote.learnerSummary.schemaVersion),
    },
    unitProgress,
    sessionHistory: mergeSessionHistory(local.sessionHistory, remote.sessionHistory),
    attemptHistory: mergeAttemptHistory(local.attemptHistory, remote.attemptHistory),
  };
}

export function resolveStudyStateForHydration(
  localState: StudyState,
  options: {
    userId: string;
    remoteState: StudyState | null;
    syncMeta: StudySyncMeta | null;
  }
): StudyState {
  const { userId, remoteState, syncMeta } = options;

  if (!remoteState) {
    return localState;
  }

  if (syncMeta?.userId === userId && syncMeta.syncedStateJson === stringifyStudyState(localState)) {
    return remoteState;
  }

  return mergeStudyStates(localState, remoteState);
}

export async function fetchRemoteStudyState(
  supabase: SupabaseClient<Database>,
  user: User
): Promise<StudyState | null> {
  const snapshot = await fetchRemoteStudySnapshot(supabase, user);
  return snapshot?.studyState ?? null;
}

export async function fetchRemoteStudySnapshot(
  supabase: SupabaseClient<Database>,
  user: User
): Promise<RemoteStudySnapshot | null> {
  const { data, error } = await supabase
    .from('study_states')
    .select('study_state, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.study_state) {
    return null;
  }

  return {
    studyState: data.study_state as unknown as StudyState,
    updatedAt: data.updated_at ?? null,
  };
}

export async function saveRemoteStudyState(
  supabase: SupabaseClient<Database>,
  user: User,
  studyState: StudyState
): Promise<RemoteStudySnapshot> {
  const { data, error } = await supabase
    .from('study_states')
    .upsert({
      user_id: user.id,
      study_state: studyState as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .select('study_state, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return {
    studyState: (data.study_state as unknown as StudyState | undefined) ?? studyState,
    updatedAt: data.updated_at ?? null,
  };
}

export function readStudySyncMeta(userId: string): StudySyncMeta | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(SYNC_META_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StudySyncMeta;
    return parsed.userId === userId ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStudySyncMeta(userId: string, snapshot: RemoteStudySnapshot) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    SYNC_META_STORAGE_KEY,
    JSON.stringify({
      userId,
      remoteUpdatedAt: snapshot.updatedAt ?? undefined,
      syncedStateJson: stringifyStudyState(snapshot.studyState),
    } satisfies StudySyncMeta)
  );
}

export function clearStudySyncMeta() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SYNC_META_STORAGE_KEY);
}
