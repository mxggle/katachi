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
