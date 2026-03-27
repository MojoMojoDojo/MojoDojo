-- Fix RPC function signature to accept UUID order IDs (not text)
-- The orders table uses uuid for id, so functions must accept uuid

-- Drop old function (wrong signature)
drop function if exists public.apply_inventory_for_fulfilled_order(text, uuid) cascade;

-- Create with correct UUID signature
create or replace function public.apply_inventory_for_fulfilled_order(
  p_order_id uuid,
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
    p_order_id::text,
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
      where m.order_id = p_order_id::text
        and m.ingredient_id = i.id
        and m.movement_type = 'order_fulfillment'
    );
end;
$$;

-- Also update trigger to pass UUID
drop trigger if exists trg_orders_apply_inventory_on_fulfilled on public.orders;
drop function if exists public.trg_orders_apply_inventory_on_fulfilled_fn() cascade;

-- Create trigger function wrapper
create function public.trg_orders_apply_inventory_on_fulfilled_fn()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.apply_inventory_for_fulfilled_order(new.id, auth.uid());
  return new;
end;
$$;

-- Create trigger using the wrapper function
create trigger trg_orders_apply_inventory_on_fulfilled
after update on public.orders
for each row
when (
  old.fulfillment_status is distinct from new.fulfillment_status
  and new.fulfillment_status = 'fulfilled'
)
execute function public.trg_orders_apply_inventory_on_fulfilled_fn();

-- Fix manual adjustment to also accept UUID for consistency
drop function if exists public.admin_set_inventory_quantity(text, numeric, text) cascade;

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
