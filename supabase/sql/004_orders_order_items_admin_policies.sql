-- Admin/staff policies for orders + order_items
-- Run this in Supabase SQL editor for production database.

alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;

-- Allow authenticated staff (admin/worker) to read orders.
drop policy if exists "orders_select_staff" on public.orders;
create policy "orders_select_staff"
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'worker')
    )
  );

-- Allow admin users to update order workflow fields.
drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
  on public.orders
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Keep checkout working for anonymous users.
drop policy if exists "orders_insert_anon" on public.orders;
create policy "orders_insert_anon"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

-- Allow authenticated staff to read order items.
drop policy if exists "order_items_select_staff" on public.order_items;
create policy "order_items_select_staff"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'worker')
    )
  );

-- Keep checkout writing order items working for anonymous users.
drop policy if exists "order_items_insert_anon" on public.order_items;
create policy "order_items_insert_anon"
  on public.order_items
  for insert
  to anon, authenticated
  with check (true);
