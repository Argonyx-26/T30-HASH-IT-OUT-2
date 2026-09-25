create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  education text not null default '',
  skills text[] not null default '{}',
  target_career text not null default '',
  weekly_learning_hours integer not null default 0 check (weekly_learning_hours between 0 and 168),
  experience_level text not null default '',
  resume_data jsonb not null default '{}'::jsonb,
  daily_task_state jsonb not null default '{"tasks": [], "streak": 0, "lastTaskAt": null}'::jsonb,
  ai_analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists resume_data jsonb not null default '{}'::jsonb;

alter table public.profiles
  add column if not exists daily_task_state jsonb not null default '{"tasks": [], "streak": 0, "lastTaskAt": null}'::jsonb;

alter table public.profiles
  add column if not exists ai_analysis jsonb not null default '{}'::jsonb;

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select, insert, update on public.profiles to authenticated;