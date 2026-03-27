-- Fulfillment-driven inventory automation + idempotency + movement logging + RLS hardening
-- Safe additive migration (non-destructive)

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Orders fields for fulfillment accounting/idempotency
-- -----------------------------------------------------------------------------

alter table if exists public.orders
  add column if not exists fulfilled_at timestamptz,
  add column if not exists inventory_applied_at timestamptz,
  add column if not exists inventory_applied_by uuid references auth.users(id) on delete set null;

create index if not exists orders_fulfilled_at_idx on public.orders (fulfilled_at desc);
create index if not exists orders_inventory_applied_at_idx on public.orders (inventory_applied_at desc);

-- -----------------------------------------------------------------------------
-- Recipe targeting for variant/add-on aware deductions
-- -----------------------------------------------------------------------------

alter table if exists public.recipe_ingredients
  add column if not exists variant_id text,
  add column if not exists add_on_id text;

alter table if exists public.recipe_ingredients
  drop constraint if exists recipe_ingredients_pkey;

create unique index if not exists recipe_ingredients_scope_unique_idx
  on public.recipe_ingredients (
    product_id,
    ingredient_id,
    coalesce(variant_id, ''),
    coalesce(add_on_id, '')
  );

create index if not exists recipe_ingredients_product_idx
  on public.recipe_ingredients (product_id);

create index if not exists recipe_ingredients_variant_idx
  on public.recipe_ingredients (variant_id)
  where variant_id is not null;

create index if not exists recipe_ingredients_add_on_idx
  on public.recipe_ingredients (add_on_id)
  where add_on_id is not null;

do $$
declare
  v_marsala_ingredient_id text;
begin
  select i.id
  into v_marsala_ingredient_id
  from public.inventory_items i
  where lower(i.name) like '%marsala%'
  limit 1;

  if v_marsala_ingredient_id is not null then
    update public.recipe_ingredients
    set quantity = 30,
        unit = 'ml',
        add_on_id = 'add_on_marsala_30ml'
    where product_id = 'prod_3'
      and ingredient_id = v_marsala_ingredient_id
      and coalesce(variant_id, '') = ''
      and coalesce(add_on_id, '') = 'add_on_marsala_30ml';

    if not found then
      insert into public.recipe_ingredients (product_id, ingredient_id, quantity, unit, add_on_id)
      values ('prod_3', v_marsala_ingredient_id, 30, 'ml', 'add_on_marsala_30ml');
    end if;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Inventory movement log
-- -----------------------------------------------------------------------------

create table if not exists public.inventory_movements (
  id bigint generated always as identity primary key,
  order_id text,
  ingredient_id text not null references public.inventory_items(id) on delete restrict,
  ingredient_name text not null,
  unit text not null,
  quantity_delta numeric(12,4) not null,
  movement_type text not null check (movement_type in ('manual_adjustment', 'order_fulfillment')),
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists inventory_movements_order_id_idx
  on public.inventory_movements (order_id)
  where order_id is not null;

create index if not exists inventory_movements_ingredient_id_idx
  on public.inventory_movements (ingredient_id);

create index if not exists inventory_movements_created_at_idx
  on public.inventory_movements (created_at desc);

-- -----------------------------------------------------------------------------
-- Helpers for customization -> variant/add-on mapping
-- -----------------------------------------------------------------------------

create or replace function public.resolve_order_variant_id(
  p_product_id text,
  p_customization jsonb
)
returns text
language plpgsql
immutable
as $$
declare
  size_id text;
  add_on_id text;
begin
  if p_customization is null then
    return null;
  end if;

  size_id := coalesce(
    nullif(p_customization->>'sizeOptionId', ''),
    nullif(p_customization->>'tiramisuSizeId', ''),
    'large'
  );

  add_on_id := lower(coalesce(
    nullif(p_customization->>'premiumAddOnId', ''),
    nullif(p_customization->>'alcoholChoiceId', ''),
    ''
  ));

  if p_product_id = 'prod_3' then
    if size_id = 'small' and add_on_id in ('marsala_30ml', 'add_on_marsala_30ml') then
      return 'variant_tiramisu_small_alcohol';
    end if;

    if size_id = 'small' then
      return 'variant_tiramisu_small';
    end if;

    if add_on_id in ('marsala_30ml', 'add_on_marsala_30ml') then
      return 'variant_tiramisu_large_alcohol';
    end if;

    return 'variant_tiramisu_large';
  end if;

  return null;
end;
$$;

create or replace function public.resolve_order_add_on_id(p_customization jsonb)
returns text
language sql
immutable
as $$
  select case
    when lower(coalesce(nullif(p_customization->>'premiumAddOnId', ''), nullif(p_customization->>'alcoholChoiceId', ''), ''))
      in ('marsala_30ml', 'add_on_marsala_30ml')
    then 'add_on_marsala_30ml'
    else null
  end;
$$;

-- -----------------------------------------------------------------------------
-- Core inventory deduction function (idempotent + stock-safe)
-- -----------------------------------------------------------------------------

create or replace function public.apply_inventory_for_fulfilled_order(
  p_order_id text,
  p_actor uuid default auth.uid()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_already_applied timestamptz;
  v_shortage text;
begin
  select o.inventory_applied_at
  into v_already_applied
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'Order % not found', p_order_id;
  end if;

  if v_already_applied is not null then
    return;
  end if;

  with order_lines as (
    select
      oi.product_id,
      greatest(coalesce(oi.quantity, 1), 1)::numeric as item_quantity,
      public.resolve_order_variant_id(oi.product_id, oi.customization) as variant_id,
      public.resolve_order_add_on_id(oi.customization) as add_on_id
    from public.order_items oi
    where oi.order_id = p_order_id
  ),
  recipe_rows as (
    -- Base recipe rows for product
    select
      ol.item_quantity,
      ri.ingredient_id,
      ri.unit,
      ri.quantity
    from order_lines ol
    join public.recipe_ingredients ri
      on ri.product_id = ol.product_id
     and ri.variant_id is null
     and ri.add_on_id is null

    union all

    -- Variant-specific rows
    select
      ol.item_quantity,
      ri.ingredient_id,
      ri.unit,
      ri.quantity
    from order_lines ol
    join public.recipe_ingredients ri
      on ri.product_id = ol.product_id
     and ri.variant_id = ol.variant_id
     and ri.add_on_id is null

    union all

    -- Add-on-specific rows
    select
      ol.item_quantity,
      ri.ingredient_id,
      ri.unit,
      ri.quantity
    from order_lines ol
    join public.recipe_ingredients ri
      on ri.product_id = ol.product_id
     and ri.add_on_id = ol.add_on_id
  ),
  required as (
    select
      rr.ingredient_id,
      max(rr.unit) as unit,
      sum(rr.quantity * rr.item_quantity)::numeric(12,4) as needed_qty
    from recipe_rows rr
    group by rr.ingredient_id
  )
  select string_agg(
    format('%s needs %s but has %s', inv.name, req.needed_qty, inv.stock_quantity),
    '; '
  )
  into v_shortage
  from required req
  join public.inventory_items inv on inv.id = req.ingredient_id
  where inv.stock_quantity < req.needed_qty;

  if v_shortage is not null then
    raise exception 'Cannot complete order % due to insufficient inventory: %', p_order_id, v_shortage;
  end if;

  with order_lines as (
    select
      oi.product_id,
      greatest(coalesce(oi.quantity, 1), 1)::numeric as item_quantity,
      public.resolve_order_variant_id(oi.product_id, oi.customization) as variant_id,
      public.resolve_order_add_on_id(oi.customization) as add_on_id
    from public.order_items oi
    where oi.order_id = p_order_id
  ),
  recipe_rows as (
    select
      ol.item_quantity,
      ri.ingredient_id,
      ri.unit,
      ri.quantity
    from order_lines ol
    join public.recipe_ingredients ri
      on ri.product_id = ol.product_id
     and ri.variant_id is null
     and ri.add_on_id is null

    union all

    select
      ol.item_quantity,
      ri.ingredient_id,
      ri.unit,
      ri.quantity
    from order_lines ol
    join public.recipe_ingredients ri
      on ri.product_id = ol.product_id
     and ri.variant_id = ol.variant_id
     and ri.add_on_id is null

    union all

    select
      ol.item_quantity,
      ri.ingredient_id,
      ri.unit,
      ri.quantity
    from order_lines ol
    join public.recipe_ingredients ri
      on ri.product_id = ol.product_id
     and ri.add_on_id = ol.add_on_id
  ),
  required as (
    select
      rr.ingredient_id,
      max(rr.unit) as unit,
      sum(rr.quantity * rr.item_quantity)::numeric(12,4) as needed_qty
    from recipe_rows rr
    group by rr.ingredient_id
  ),
  updated_stock as (
    update public.inventory_items inv
    set
      stock_quantity = inv.stock_quantity - req.needed_qty,
      updated_at = now()
    from required req
    where inv.id = req.ingredient_id
    returning inv.id, inv.name, inv.unit, req.needed_qty
  )
  insert into public.inventory_movements (
    order_id,
    ingredient_id,
    ingredient_name,
    unit,
    quantity_delta,
    movement_type,
    reason,
    created_by
  )
  select
    p_order_id,
    us.id,
    us.name,
    us.unit,
    -us.needed_qty,
    'order_fulfillment',
    'Automatic deduction on order completion',
    coalesce(p_actor, auth.uid())
  from updated_stock us;

  -- Keep legacy ingredients stock synchronized for compatibility.
  update public.ingredients i
  set
    stock_quantity = inv.stock_quantity,
    updated_at = now()
  from public.inventory_items inv
  where inv.id = i.id
    and exists (
      select 1
      from public.inventory_movements m
      where m.order_id = p_order_id
        and m.ingredient_id = i.id
        and m.movement_type = 'order_fulfillment'
    );
end;
$$;

create or replace function public.trg_orders_apply_inventory_on_fulfilled()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.fulfillment_status = 'fulfilled'
     and coalesce(old.fulfillment_status, '') <> 'fulfilled'
     and old.inventory_applied_at is null
  then
    perform public.apply_inventory_for_fulfilled_order(new.id, auth.uid());
    new.inventory_applied_at := now();
    new.inventory_applied_by := coalesce(new.inventory_applied_by, auth.uid());
    new.fulfilled_at := coalesce(new.fulfilled_at, now());
  elsif new.fulfillment_status = 'fulfilled'
     and old.inventory_applied_at is not null
  then
    -- idempotent guard: do not deduct twice
    new.inventory_applied_at := old.inventory_applied_at;
    new.inventory_applied_by := coalesce(old.inventory_applied_by, new.inventory_applied_by);
    new.fulfilled_at := coalesce(old.fulfilled_at, new.fulfilled_at, now());
  end if;

  return new;
end;
$$;

drop trigger if exists trg_orders_apply_inventory_on_fulfilled on public.orders;
create trigger trg_orders_apply_inventory_on_fulfilled
before update of fulfillment_status on public.orders
for each row
execute function public.trg_orders_apply_inventory_on_fulfilled();

-- -----------------------------------------------------------------------------
-- Manual inventory adjustment RPC (with movement log)
-- -----------------------------------------------------------------------------

create or replace function public.admin_set_inventory_quantity(
  p_item_id text,
  p_new_quantity numeric,
  p_reason text default 'Manual inventory adjustment'
)
returns public.inventory_items
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_current public.inventory_items%rowtype;
  v_delta numeric(12,4);
  v_updated public.inventory_items%rowtype;
begin
  select p.role into v_role
  from public.profiles p
  where p.id = auth.uid();

  if v_role <> 'admin' then
    raise exception 'Only admins can adjust inventory quantities';
  end if;

  if p_new_quantity is null or p_new_quantity < 0 then
    raise exception 'New quantity must be a non-negative number';
  end if;

  select * into v_current
  from public.inventory_items
  where id = p_item_id
  for update;

  if not found then
    raise exception 'Inventory item % was not found', p_item_id;
  end if;

  v_delta := p_new_quantity - v_current.stock_quantity;

  update public.inventory_items
  set stock_quantity = p_new_quantity,
      updated_at = now()
  where id = p_item_id
  returning * into v_updated;

  update public.ingredients
  set stock_quantity = p_new_quantity,
      updated_at = now()
  where id = p_item_id;

  if v_delta <> 0 then
    insert into public.inventory_movements (
      order_id,
      ingredient_id,
      ingredient_name,
      unit,
      quantity_delta,
      movement_type,
      reason,
      created_by
    )
    values (
      null,
      v_updated.id,
      v_updated.name,
      v_updated.unit,
      v_delta,
      'manual_adjustment',
      nullif(p_reason, ''),
      auth.uid()
    );
  end if;

  return v_updated;
end;
$$;

grant execute on function public.admin_set_inventory_quantity(text, numeric, text) to authenticated;
grant execute on function public.apply_inventory_for_fulfilled_order(text, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- RLS hardening for currently open tables
-- -----------------------------------------------------------------------------

alter table if exists public.products enable row level security;
alter table if exists public.product_variants enable row level security;
alter table if exists public.ingredients enable row level security;
alter table if exists public.recipe_ingredients enable row level security;
alter table if exists public.inventory_movements enable row level security;

-- products: public readable (website), admin write

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
  on public.products
  for select
  to anon, authenticated
  using (visible = true);

drop policy if exists "products_select_staff_all" on public.products;
create policy "products_select_staff_all"
  on public.products
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'worker')
    )
  );

drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin"
  on public.products
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- product variants: public readable, admin write

drop policy if exists "product_variants_select_public" on public.product_variants;
create policy "product_variants_select_public"
  on public.product_variants
  for select
  to anon, authenticated
  using (active = true);

drop policy if exists "product_variants_select_staff_all" on public.product_variants;
create policy "product_variants_select_staff_all"
  on public.product_variants
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'worker')
    )
  );

drop policy if exists "product_variants_write_admin" on public.product_variants;
create policy "product_variants_write_admin"
  on public.product_variants
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ingredients + recipe_ingredients: staff read, admin write

drop policy if exists "ingredients_select_staff" on public.ingredients;
create policy "ingredients_select_staff"
  on public.ingredients
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'worker')
    )
  );

drop policy if exists "ingredients_write_admin" on public.ingredients;
create policy "ingredients_write_admin"
  on public.ingredients
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "recipe_ingredients_select_staff" on public.recipe_ingredients;
create policy "recipe_ingredients_select_staff"
  on public.recipe_ingredients
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'worker')
    )
  );

drop policy if exists "recipe_ingredients_write_admin" on public.recipe_ingredients;
create policy "recipe_ingredients_write_admin"
  on public.recipe_ingredients
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- inventory movement visibility: staff read only

drop policy if exists "inventory_movements_select_staff" on public.inventory_movements;
create policy "inventory_movements_select_staff"
  on public.inventory_movements
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'worker')
    )
  );

-- movement inserts happen through security definer functions only.
drop policy if exists "inventory_movements_insert_none" on public.inventory_movements;
create policy "inventory_movements_insert_none"
  on public.inventory_movements
  for insert
  to authenticated
  with check (false);
