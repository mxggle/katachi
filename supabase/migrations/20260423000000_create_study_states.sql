create table if not exists public.study_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  study_state jsonb not null,
  updated_at timestamptz not null default now()
);

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

alter table public.study_states enable row level security;

drop policy if exists "study states are owned by user" on public.study_states;
create policy "study states are owned by user"
  on public.study_states
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
