-- MojoDojo core entities and compatibility migration (additive / non-destructive)
-- Purpose:
-- 1) Keep existing public.orders + public.order_items compatible with current app fields.
-- 2) Add normalized core tables for products, variants, ingredients, recipes, inventory, and login events.
-- 3) Preserve existing data and avoid destructive renames.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Core normalized tables (additive)
-- -----------------------------------------------------------------------------

create table if not exists public.products (
  id text primary key,
  name text not null,
  name_fr text,
  description text,
  description_fr text,
  category text,
  category_fr text,
  price numeric(12,2) not null default 0,
  status text not null default 'available',
  visible boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  code text,
  name text not null,
  name_fr text,
  price numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx on public.product_variants(product_id);

create table if not exists public.ingredients (
  id text primary key,
  name text not null,
  unit text not null,
  cost_per_unit numeric(12,4) not null default 0,
  stock_quantity numeric(12,3) not null default 0,
  threshold_alert numeric(12,3) not null default 0,
  supplier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipe_ingredients (
  product_id text not null references public.products(id) on delete cascade,
  ingredient_id text not null references public.ingredients(id) on delete restrict,
  quantity numeric(12,4) not null,
  unit text not null,
  created_at timestamptz not null default now(),
  primary key (product_id, ingredient_id)
);

create table if not exists public.inventory_items (
  id text primary key references public.ingredients(id) on delete cascade,
  name text not null,
  unit text not null,
  cost_per_unit numeric(12,4) not null default 0,
  stock_quantity numeric(12,3) not null default 0,
  threshold_alert numeric(12,3) not null default 0,
  supplier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_items_name_idx on public.inventory_items(name);

create table if not exists public.admin_login_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  role text not null check (role in ('admin', 'worker')),
  logged_in_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists admin_login_events_user_id_idx on public.admin_login_events(user_id);
create index if not exists admin_login_events_logged_in_at_idx on public.admin_login_events(logged_in_at desc);

-- -----------------------------------------------------------------------------
-- Backfill from legacy kv_store_44229999 (if present)
-- -----------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.kv_store_44229999') is not null then
    execute $kv_products$
      insert into public.products (id, name, name_fr, description, description_fr, category, category_fr, price, status, visible, image_url, created_at, updated_at)
      select
        coalesce(nullif(value->>'id', ''), replace(key, 'product:', '')) as id,
        coalesce(nullif(value->>'name', ''), 'Unnamed product') as name,
        nullif(value->>'name_fr', '') as name_fr,
        nullif(value->>'description', '') as description,
        nullif(value->>'description_fr', '') as description_fr,
        nullif(value->>'category', '') as category,
        nullif(value->>'category_fr', '') as category_fr,
        coalesce(nullif(value->>'price', '')::numeric, 0) as price,
        coalesce(nullif(value->>'status', ''), 'available') as status,
        coalesce(nullif(value->>'visible', '')::boolean, true) as visible,
        nullif(value->>'image_url', '') as image_url,
        coalesce(nullif(value->>'created_at', '')::timestamptz, now()) as created_at,
        now() as updated_at
      from public.kv_store_44229999
      where key like 'product:%'
      on conflict (id) do update
      set name = excluded.name,
          name_fr = coalesce(excluded.name_fr, public.products.name_fr),
          description = coalesce(excluded.description, public.products.description),
          description_fr = coalesce(excluded.description_fr, public.products.description_fr),
          category = coalesce(excluded.category, public.products.category),
          category_fr = coalesce(excluded.category_fr, public.products.category_fr),
          price = excluded.price,
          status = excluded.status,
          visible = excluded.visible,
          image_url = coalesce(excluded.image_url, public.products.image_url),
          updated_at = now();
    $kv_products$;

    execute $kv_ingredients$
      insert into public.ingredients (id, name, unit, cost_per_unit, stock_quantity, threshold_alert, supplier, created_at, updated_at)
      select
        coalesce(nullif(value->>'id', ''), replace(replace(key, 'ingredient:', ''), 'ingredienting_', 'ing_')) as id,
        coalesce(nullif(value->>'name', ''), 'Unnamed ingredient') as name,
        coalesce(nullif(value->>'unit', ''), 'unit') as unit,
        coalesce(nullif(value->>'cost_per_unit', '')::numeric, 0) as cost_per_unit,
        coalesce(nullif(value->>'stock_quantity', '')::numeric, 0) as stock_quantity,
        coalesce(nullif(value->>'threshold_alert', '')::numeric, 0) as threshold_alert,
        nullif(value->>'supplier', '') as supplier,
        coalesce(nullif(value->>'created_at', '')::timestamptz, now()) as created_at,
        now() as updated_at
      from public.kv_store_44229999
      where key like 'ingredient:%' or key like 'ingredienting_%'
      on conflict (id) do update
      set name = excluded.name,
          unit = excluded.unit,
          cost_per_unit = excluded.cost_per_unit,
          stock_quantity = excluded.stock_quantity,
          threshold_alert = excluded.threshold_alert,
          supplier = coalesce(excluded.supplier, public.ingredients.supplier),
          updated_at = now();
    $kv_ingredients$;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- orders / order_items compatibility (preserve existing rows)
-- -----------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.orders') is not null then
    alter table public.orders
      add column if not exists customer_name text,
      add column if not exists customer_email text,
      add column if not exists customer_phone text,
      add column if not exists delivery_type text,
      add column if not exists delivery_address text,
      add column if not exists preferred_datetime timestamptz,
      add column if not exists notes text,
      add column if not exists internal_notes text,
      add column if not exists payment_method text,
      add column if not exists payment_status text,
      add column if not exists fulfillment_status text not null default 'not_started';

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'orders' and column_name = 'email'
    ) then
      execute 'update public.orders set customer_email = coalesce(customer_email, email) where customer_email is null';
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'orders' and column_name = 'customer_email'
    ) and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'orders' and column_name = 'email'
    ) then
      execute 'update public.orders set email = coalesce(email, customer_email) where email is null';
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'orders' and column_name = 'full_name'
    ) then
      execute 'update public.orders set customer_name = coalesce(customer_name, full_name) where customer_name is null';
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'orders' and column_name = 'phone'
    ) then
      execute 'update public.orders set customer_phone = coalesce(customer_phone, phone) where customer_phone is null';
    end if;

    update public.orders
    set payment_status = 'pending'
    where payment_status is null;

    update public.orders
    set payment_method = 'arranged_after_approval'
    where payment_method is null;

    update public.orders
    set delivery_type = 'pickup'
    where delivery_type is null;

    update public.orders
    set status = 'request_received'
    where status is null;

    alter table public.orders
      alter column payment_status set default 'pending',
      alter column payment_method set default 'arranged_after_approval',
      alter column delivery_type set default 'pickup';

    create index if not exists orders_status_idx on public.orders(status);
    create index if not exists orders_created_at_idx on public.orders(created_at desc);
    create index if not exists orders_payment_status_idx on public.orders(payment_status);
    create index if not exists orders_fulfillment_status_idx on public.orders(fulfillment_status);
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.order_items') is not null then
    alter table public.order_items
      add column if not exists order_id text,
      add column if not exists product_id text,
      add column if not exists product_name text,
      add column if not exists quantity integer,
      add column if not exists price numeric(12,2),
      add column if not exists customization jsonb;

    update public.order_items set quantity = 1 where quantity is null;
    update public.order_items set price = 0 where price is null;

    alter table public.order_items
      alter column quantity set default 1,
      alter column price set default 0;

    create index if not exists order_items_order_id_idx on public.order_items(order_id);
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Seed/sync inventory_items from ingredients (idempotent)
-- -----------------------------------------------------------------------------

insert into public.inventory_items (id, name, unit, cost_per_unit, stock_quantity, threshold_alert, supplier, created_at, updated_at)
select i.id, i.name, i.unit, i.cost_per_unit, i.stock_quantity, i.threshold_alert, i.supplier, i.created_at, i.updated_at
from public.ingredients i
on conflict (id) do update
set name = excluded.name,
    unit = excluded.unit,
    cost_per_unit = excluded.cost_per_unit,
    stock_quantity = excluded.stock_quantity,
    threshold_alert = excluded.threshold_alert,
    supplier = excluded.supplier,
    updated_at = now();

-- -----------------------------------------------------------------------------
-- Lightweight RLS for admin_login_events and inventory_items
-- -----------------------------------------------------------------------------

alter table public.admin_login_events enable row level security;
alter table public.inventory_items enable row level security;

drop policy if exists "admin_login_events_insert_own" on public.admin_login_events;
create policy "admin_login_events_insert_own"
  on public.admin_login_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "admin_login_events_select_admin" on public.admin_login_events;
create policy "admin_login_events_select_admin"
  on public.admin_login_events
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

drop policy if exists "inventory_items_select_staff" on public.inventory_items;
create policy "inventory_items_select_staff"
  on public.inventory_items
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

drop policy if exists "inventory_items_update_admin" on public.inventory_items;
create policy "inventory_items_update_admin"
  on public.inventory_items
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

drop policy if exists "inventory_items_insert_admin" on public.inventory_items;
create policy "inventory_items_insert_admin"
  on public.inventory_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
