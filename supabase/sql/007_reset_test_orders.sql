-- TESTING ONLY: clears all orders/order_items and restarts display ID numbering from 1.
-- Do not run in production unless you intentionally want to delete order history.

begin;

delete from public.order_items;
delete from public.orders;

alter sequence if exists public.orders_display_id_seq restart with 1;

commit;