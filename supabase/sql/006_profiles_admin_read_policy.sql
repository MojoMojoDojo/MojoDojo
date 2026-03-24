-- Allow admins to list team profiles in User Management.
-- Run in Supabase SQL editor.

alter table if exists public.profiles enable row level security;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );