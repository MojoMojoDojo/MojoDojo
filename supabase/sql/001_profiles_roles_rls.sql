-- MojoDojo profiles/roles model (RLS-friendly)
-- Run in Supabase SQL editor or migration pipeline.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null check (role in ('admin', 'worker')),
  mfa_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

alter table public.profiles enable row level security;

-- Users can read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Users can update only their own basic fields (not role).
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Optional: trusted backend service key can upsert roles directly.
-- This is intentionally service-role/server side only and never from browser.

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at_timestamp();

-- Seed helper examples (edit IDs/emails before running):
-- insert into public.profiles (id, email, full_name, role, mfa_required)
-- values ('<auth_user_uuid>', 'admin@mojodojo.com', 'Admin User', 'admin', false)
-- on conflict (id) do update set role = excluded.role, mfa_required = excluded.mfa_required;
