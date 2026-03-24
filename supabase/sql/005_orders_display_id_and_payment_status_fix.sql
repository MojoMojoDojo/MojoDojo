-- Add a stable numeric display ID for orders and normalize payment_status check.
-- Run in Supabase SQL editor.

do $$
begin
  if to_regclass('public.orders') is null then
    return;
  end if;

  alter table public.orders
    add column if not exists display_id bigint;

  create sequence if not exists public.orders_display_id_seq;
  alter sequence public.orders_display_id_seq owned by public.orders.display_id;

  alter table public.orders
    alter column display_id set default nextval('public.orders_display_id_seq');

  with ranked as (
    select id, row_number() over (order by created_at asc, id asc) as rn
    from public.orders
    where display_id is null
  )
  update public.orders o
  set display_id = ranked.rn
  from ranked
  where o.id = ranked.id;

  perform setval(
    'public.orders_display_id_seq',
    coalesce((select max(display_id) from public.orders), 0) + 1,
    false
  );

  if exists (select 1 from public.orders where display_id is null) then
    update public.orders
    set display_id = nextval('public.orders_display_id_seq')
    where display_id is null;
  end if;

  alter table public.orders
    alter column display_id set not null;

  create unique index if not exists orders_display_id_key
    on public.orders(display_id);
end
$$;

do $$
declare
  con_name text;
begin
  if to_regclass('public.orders') is null then
    return;
  end if;

  for con_name in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.orders'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%payment_status%'
  loop
    execute format('alter table public.orders drop constraint if exists %I', con_name);
  end loop;

  update public.orders
  set payment_status = 'pending'
  where payment_status is null;

  alter table public.orders
    alter column payment_status set default 'pending';

  alter table public.orders
    add constraint orders_payment_status_check
    check (payment_status in ('pending', 'paid', 'arranged'));
end
$$;