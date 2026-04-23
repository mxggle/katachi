import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Json } from './json';
import type { StudyState, UnitProgress } from '@/lib/study/types';

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
    sessionHistory: local.sessionHistory.length > remote.sessionHistory.length ? local.sessionHistory : remote.sessionHistory,
    attemptHistory: local.attemptHistory.length > remote.attemptHistory.length ? local.attemptHistory : remote.attemptHistory,
  };
}

export async function fetchRemoteStudyState(
  supabase: SupabaseClient<Database>,
  user: User
): Promise<StudyState | null> {
  const { data, error } = await supabase
    .from('study_states')
    .select('study_state')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.study_state as StudyState | undefined) ?? null;
}

export async function saveRemoteStudyState(
  supabase: SupabaseClient<Database>,
  user: User,
  studyState: StudyState
) {
  const { error } = await supabase
    .from('study_states')
    .upsert({
      user_id: user.id,
      study_state: studyState as unknown as Json,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw error;
  }
}
