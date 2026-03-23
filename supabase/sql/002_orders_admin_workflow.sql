-- MojoDojo order workflow extensions for admin operations
-- Adds fields required for review/notes/payment/fulfillment workflow in admin pages.

alter table if exists public.orders
  add column if not exists internal_notes text,
  add column if not exists fulfillment_status text not null default 'not_started';

-- Ensure fulfillment status remains in allowed workflow states.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_fulfillment_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_fulfillment_status_check
      check (fulfillment_status in ('not_started', 'in_progress', 'ready', 'fulfilled'));
  end if;
end;
$$;

-- Helpful index for admin queue views.
create index if not exists orders_fulfillment_status_idx
  on public.orders (fulfillment_status);
