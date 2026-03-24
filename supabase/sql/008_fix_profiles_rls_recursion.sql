-- Fix recursive RLS policy on public.profiles.
-- This migration removes self-referencing policies and uses JWT role claims for admin-wide profile access.

alter table if exists public.profiles enable row level security;

drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
drop policy if exists "profiles_insert_service" on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_select_admin_jwt"
  on public.profiles
  for select
  to authenticated
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_update_admin_jwt"
  on public.profiles
  for update
  to authenticated
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  )
  with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );