import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import type { Order } from '../../../lib/supabase';
import { canManageSensitiveBusinessData } from '../../lib/accessControl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import {
  MAIN_ORDER_STATUS_LABELS,
  toMainOrderStatus,
  type MainOrderStatus,
} from '../../lib/adminOperations';

const ORDER_FILTERS: MainOrderStatus[] = ['all', 'request_received', 'under_review', 'accepted', 'rejected'];

const MAIN_STATUS_OPTIONS: Exclude<MainOrderStatus, 'all'>[] = [
  'request_received',
  'under_review',
  'accepted',
  'rejected',
];

const PAYMENT_STATUS_OPTIONS: NonNullable<Order['payment_status']>[] = ['arranged', 'pending', 'paid'];
const PAYMENT_STATUS_LABELS: Record<NonNullable<Order['payment_status']>, string> = {
  arranged: 'Arranged',
  pending: 'Pending',
  paid: 'Paid',
};

const FULFILLMENT_STATUS_OPTIONS: NonNullable<Order['fulfillment_status']>[] = [
  'not_started',
  'in_progress',
  'ready',
  'fulfilled',
];
const FULFILLMENT_STATUS_LABELS: Record<NonNullable<Order['fulfillment_status']>, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  ready: 'Ready',
  fulfilled: 'Fulfilled',
};

export function OrdersManagement() {
  const { accessToken, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MainOrderStatus>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const canManage = canManageSensitiveBusinessData(user?.role);

  useEffect(() => {
    loadOrders();
  }, [accessToken]);

  async function loadOrders() {
    if (!accessToken) return;

    try {
      const { orders: data } = await api.orders.getAll(accessToken);
      setOrders(data);
      setNoteDrafts(
        data.reduce<Record<string, string>>((acc, order) => {
          acc[order.id] = order.internal_notes ?? '';
          return acc;
        }, {}),
      );
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  function replaceOrder(updatedOrder: Order) {
    setOrders((current) => current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
    setNoteDrafts((current) => ({
      ...current,
      [updatedOrder.id]: updatedOrder.internal_notes ?? '',
    }));
  }

  async function updateOrder(orderId: string, updates: Partial<Order>, successMessage: string) {
    if (!accessToken) return;
    if (!canManage) {
      toast.error('Workers can review orders but cannot change order data');
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      const { order } = await api.orders.update(orderId, updates, accessToken);
      replaceOrder(order);
      toast.success(successMessage);
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function saveInternalNote(orderId: string) {
    await updateOrder(orderId, { internal_notes: noteDrafts[orderId] ?? '' }, 'Internal note saved');
  }

  async function markAsReviewed(orderId: string) {
    await updateOrder(orderId, { status: 'under_review' }, 'Order moved to review');
  }

  async function acceptOrder(orderId: string) {
    await updateOrder(orderId, { status: 'accepted' }, 'Order accepted');
  }

  async function rejectOrder(orderId: string) {
    await updateOrder(orderId, { status: 'rejected' }, 'Order rejected');
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((order) => toMainOrderStatus(order.status) === filter);

  function formatPreferredDateTime(value?: string) {
    if (!value) return '—';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Orders <span className="gold-accent">Management</span>
        </h1>
      </div>

      {!canManage ? (
        <div className="rounded-lg border border-brand-dark-gray bg-brand-charcoal p-4 text-sm text-brand-light-gray">
          Worker access: review-only. Admin-only actions (status updates, payment, fulfillment, internal notes) are disabled.
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex gap-4">
        {ORDER_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === status
                ? 'bg-brand-gold text-brand-black'
                : 'bg-brand-dark-gray text-brand-light-gray hover:bg-brand-gray hover:text-brand-gold'
            }`}
          >
            {MAIN_ORDER_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="premium-card p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer-effect h-24 rounded-lg"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-brand-light-gray">
            <p>No {filter !== 'all' ? MAIN_ORDER_STATUS_LABELS[filter].toLowerCase() : ''} orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 bg-brand-charcoal rounded-lg border border-brand-dark-gray"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{order.customer_name}</h3>
                    <p className="text-sm text-brand-light-gray">{order.customer_email}</p>
                    <p className="text-sm text-brand-light-gray">{order.customer_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold gold-accent">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-brand-light-gray mt-1">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-brand-light-gray">Delivery Type:</span>{' '}
                    <span className="capitalize">{order.delivery_type}</span>
                  </div>
                  <div>
                    <span className="text-brand-light-gray">Preferred Date/Time:</span>{' '}
                    <span>{formatPreferredDateTime(order.preferred_datetime)}</span>
                  </div>
                  <div>
                    <span className="text-brand-light-gray">Payment:</span>{' '}
                    <span className="capitalize">{order.payment_method ?? 'arranged_after_approval'}</span>
                  </div>
                  {order.delivery_address && (
                    <div className="md:col-span-2">
                      <span className="text-brand-light-gray">Address:</span>{' '}
                      <span>{order.delivery_address}</span>
                    </div>
                  )}
                  {order.notes && (
                    <div className="md:col-span-2">
                      <span className="text-brand-light-gray">Notes:</span>{' '}
                      <span>{order.notes}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <ul className="space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-brand-light-gray">
                        {item.quantity}x {item.product_name} - ${(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Internal Notes</h4>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start">
                    <textarea
                      value={noteDrafts[order.id] ?? ''}
                      onChange={(event) =>
                        setNoteDrafts((current) => ({
                          ...current,
                          [order.id]: event.target.value,
                        }))
                      }
                      disabled={!canManage}
                      placeholder="Add internal notes for this order"
                      className="min-h-20 w-full rounded-lg border border-brand-dark-gray bg-brand-black px-3 py-2 text-sm text-brand-off-white focus:border-brand-gold focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={!canManage || updatingOrderId === order.id}
                      onClick={() => saveInternalNote(order.id)}
                      className="h-10 rounded-lg bg-brand-gold px-4 text-sm font-semibold text-brand-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save note
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Select
                    value={toMainOrderStatus(order.status)}
                    onValueChange={(value) =>
                      updateOrder(order.id, { status: value as Exclude<MainOrderStatus, 'all'> }, 'Order status updated')
                    }
                    disabled={!canManage || updatingOrderId === order.id}
                  >
                    <SelectTrigger className="w-48 bg-brand-charcoal border-brand-dark-gray text-brand-off-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-charcoal border-brand-dark-gray text-brand-off-white">
                      {MAIN_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {MAIN_ORDER_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className={`status-badge ${
                    ['request_received', 'under_review'].includes(toMainOrderStatus(order.status))
                      ? 'status-pending'
                      : toMainOrderStatus(order.status) === 'accepted'
                        ? 'status-available'
                        : 'status-sold-out'
                  }`}>
                    {MAIN_ORDER_STATUS_LABELS[toMainOrderStatus(order.status)]}
                  </div>

                  {toMainOrderStatus(order.status) !== order.status && (
                    <div className="text-xs text-brand-light-gray">
                      Sub-status: {order.status.replaceAll('_', ' ')}
                    </div>
                  )}

                  <Select
                    value={order.payment_status ?? 'arranged'}
                    onValueChange={(value) =>
                      updateOrder(order.id, { payment_status: value as Order['payment_status'] }, 'Payment status updated')
                    }
                    disabled={!canManage || updatingOrderId === order.id}
                  >
                    <SelectTrigger className="w-48 bg-brand-charcoal border-brand-dark-gray text-brand-off-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-charcoal border-brand-dark-gray text-brand-off-white">
                      {PAYMENT_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          Payment: {PAYMENT_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={order.fulfillment_status ?? 'not_started'}
                    onValueChange={(value) =>
                      updateOrder(order.id, { fulfillment_status: value as Order['fulfillment_status'] }, 'Fulfillment status updated')
                    }
                    disabled={!canManage || updatingOrderId === order.id}
                  >
                    <SelectTrigger className="w-52 bg-brand-charcoal border-brand-dark-gray text-brand-off-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-brand-charcoal border-brand-dark-gray text-brand-off-white">
                      {FULFILLMENT_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          Fulfillment: {FULFILLMENT_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => markAsReviewed(order.id)}
                      disabled={!canManage || updatingOrderId === order.id}
                      className="h-9 rounded-lg border border-brand-dark-gray bg-brand-dark-gray px-3 text-sm text-brand-off-white transition-all hover:border-brand-gold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Review
                    </button>
                    <button
                      type="button"
                      onClick={() => acceptOrder(order.id)}
                      disabled={!canManage || updatingOrderId === order.id}
                      className="h-9 rounded-lg border border-green-500/40 bg-green-500/10 px-3 text-sm text-green-300 transition-all hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectOrder(order.id)}
                      disabled={!canManage || updatingOrderId === order.id}
                      className="h-9 rounded-lg border border-red-500/40 bg-red-500/10 px-3 text-sm text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
