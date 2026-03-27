-- Financial expenses/profit hardening + backfill for already-fulfilled orders

-- 1) Track unit cost snapshot per inventory movement for stable profit reporting.
alter table if exists public.inventory_movements
  add column if not exists unit_cost numeric(12,4),
  add column if not exists extended_cost numeric(12,4);

-- Backfill existing movement rows using current inventory cost.
update public.inventory_movements m
set
  unit_cost = coalesce(m.unit_cost, inv.cost_per_unit),
  extended_cost = coalesce(m.extended_cost, abs(m.quantity_delta) * inv.cost_per_unit)
from public.inventory_items inv
where inv.id = m.ingredient_id
  and (m.unit_cost is null or m.extended_cost is null);

-- 2) Update fulfillment deduction function to persist cost snapshot.
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
    select ol.item_quantity, ri.ingredient_id, ri.unit, ri.quantity
    from order_lines ol
    join public.recipe_ingredients ri
      on ri.product_id = ol.product_id
     and ri.variant_id is null
     and ri.add_on_id is null

    union all

    select ol.item_quantity, ri.ingredient_id, ri.unit, ri.quantity
    from order_lines ol
    join public.recipe_ingredients ri
      on ri.product_id = ol.product_id
     and ri.variant_id = ol.variant_id
     and ri.add_on_id is null

    union all

    select ol.item_quantity, ri.ingredient_id, ri.unit, ri.quantity
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
    select ol.item_quantity, ri.ingredient_id, ri.unit, ri.quantity
    from order_lines ol
    join public.recipe_ingredients ri
      on ri.product_id = ol.product_id
     and ri.variant_id is null
     and ri.add_on_id is null

    union all

    select ol.item_quantity, ri.ingredient_id, ri.unit, ri.quantity
    from order_lines ol
    join public.recipe_ingredients ri
      on ri.product_id = ol.product_id
     and ri.variant_id = ol.variant_id
     and ri.add_on_id is null

    union all

    select ol.item_quantity, ri.ingredient_id, ri.unit, ri.quantity
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
    returning inv.id, inv.name, inv.unit, inv.cost_per_unit, req.needed_qty
  )
  insert into public.inventory_movements (
    order_id,
    ingredient_id,
    ingredient_name,
    unit,
    quantity_delta,
    movement_type,
    reason,
    created_by,
    unit_cost,
    extended_cost
  )
  select
    p_order_id,
    us.id,
    us.name,
    us.unit,
    -us.needed_qty,
    'order_fulfillment',
    'Automatic deduction on order completion',
    coalesce(p_actor, auth.uid()),
    us.cost_per_unit,
    abs(-us.needed_qty) * us.cost_per_unit
  from updated_stock us;

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

-- 3) Update manual adjustment function to persist cost snapshot.
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
      created_by,
      unit_cost,
      extended_cost
    )
    values (
      null,
      v_updated.id,
      v_updated.name,
      v_updated.unit,
      v_delta,
      'manual_adjustment',
      nullif(p_reason, ''),
      auth.uid(),
      v_updated.cost_per_unit,
      abs(v_delta) * v_updated.cost_per_unit
    );
  end if;

  return v_updated;
end;
$$;

-- 4) Backfill already fulfilled orders that were never inventory-applied.
do $$
declare
  r record;
begin
  for r in
    select o.id
    from public.orders o
    where o.fulfillment_status = 'fulfilled'
      and o.inventory_applied_at is null
  loop
    begin
      perform public.apply_inventory_for_fulfilled_order(r.id, null);
      update public.orders
      set
        inventory_applied_at = coalesce(inventory_applied_at, now()),
        fulfilled_at = coalesce(fulfilled_at, now())
      where id = r.id;
    exception when others then
      raise notice 'Skipped order % during backfill: %', r.id, SQLERRM;
    end;
  end loop;
end;
$$;
