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
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  MAIN_ORDER_STATUS_LABELS,
  toMainOrderStatus,
  type MainOrderStatus,
} from '../../lib/adminOperations';

const ORDER_FILTERS: MainOrderStatus[] = ['all', 'request_received', 'under_review', 'accepted', 'rejected'];
const DELIVERY_FILTERS: Array<'all' | 'pickup' | 'delivery'> = ['all', 'pickup', 'delivery'];

const PAYMENT_STATUS_OPTIONS: NonNullable<Order['payment_status']>[] = ['pending', 'paid'];
const PAYMENT_STATUS_LABELS: Record<NonNullable<Order['payment_status']>, string> = {
  pending: 'Pending',
  paid: 'Paid',
  arranged: 'Arranged',
};

type SelectableFulfillmentStatus = 'not_started' | 'in_progress' | 'fulfilled';

const FULFILLMENT_STATUS_OPTIONS: SelectableFulfillmentStatus[] = [
  'not_started',
  'in_progress',
  'fulfilled',
];
const FULFILLMENT_STATUS_LABELS: Record<SelectableFulfillmentStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  fulfilled: 'Completed',
};

function normalizeFulfillmentStatus(status?: Order['fulfillment_status']): SelectableFulfillmentStatus {
  if (status === 'fulfilled') return 'fulfilled';
  if (status === 'in_progress' || status === 'ready') return 'in_progress';
  return 'not_started';
}

export function OrdersManagement() {
  const { accessToken, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<MainOrderStatus>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'pickup' | 'delivery'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'all' | SelectableFulfillmentStatus>('all');
  const [dateSortMode, setDateSortMode] = useState<'none' | 'asc' | 'desc'>('none');
  const [totalSortMode, setTotalSortMode] = useState<'none' | 'asc' | 'desc'>('none');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [openInfoByOrderId, setOpenInfoByOrderId] = useState<Record<string, boolean>>({});

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
      const message = error instanceof Error ? error.message : 'Failed to update order';
      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function saveInternalNote(orderId: string) {
    await updateOrder(orderId, { internal_notes: noteDrafts[orderId] ?? '' }, 'Internal note saved');
  }

  function buildConfirmationMessage(order: Order, action: 'accept' | 'reject'): string {
    const actionLabel = action === 'accept' ? 'ACCEPT' : 'REJECT';
    return [
      `Are you sure you want to ${action} this order?`,
      '',
      `Order: ${order.id}`,
      `Customer: ${order.customer_name}`,
      `Email: ${order.customer_email}`,
      `Phone: ${order.customer_phone}`,
      `Total: $${order.total.toFixed(2)}`,
      `Requested: ${formatPreferredDateTime(order.preferred_datetime)}`,
      '',
      `Type ${actionLabel} to continue in your workflow.`,
    ].join('\n');
  }

  async function acceptOrder(orderId: string) {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    if (!window.confirm(buildConfirmationMessage(order, 'accept'))) return;

    await updateOrder(
      orderId,
      {
        status: 'accepted',
        payment_status: order.payment_status ?? 'pending',
        fulfillment_status: 'in_progress',
      },
      'Order accepted',
    );
  }

  async function rejectOrder(orderId: string) {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;

    if (!window.confirm(buildConfirmationMessage(order, 'reject'))) return;

    await updateOrder(orderId, { status: 'rejected' }, 'Order rejected');
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && toMainOrderStatus(order.status) !== statusFilter) {
      return false;
    }

    if (deliveryFilter !== 'all' && order.delivery_type !== deliveryFilter) {
      return false;
    }

    const resolvedPayment = order.payment_status ?? 'pending';
    if (paymentFilter !== 'all' && resolvedPayment !== paymentFilter) {
      return false;
    }

    const resolvedFulfillment = normalizeFulfillmentStatus(order.fulfillment_status);
    if (fulfillmentFilter !== 'all' && resolvedFulfillment !== fulfillmentFilter) {
      return false;
    }

    return true;
  });

  const displayOrders = [...filteredOrders].sort((a, b) => {
    if (dateSortMode !== 'none') {
      const aTime = new Date(a.preferred_datetime ?? a.created_at).getTime();
      const bTime = new Date(b.preferred_datetime ?? b.created_at).getTime();
      if (aTime !== bTime) {
        return dateSortMode === 'asc' ? aTime - bTime : bTime - aTime;
      }
    }

    if (totalSortMode !== 'none' && a.total !== b.total) {
      return totalSortMode === 'asc' ? a.total - b.total : b.total - a.total;
    }

    return (a.display_id ?? Number.MAX_SAFE_INTEGER) - (b.display_id ?? Number.MAX_SAFE_INTEGER);
  });

  function cycleSort(current: 'none' | 'asc' | 'desc', requested: 'asc' | 'desc') {
    if (current === requested) return 'none';
    return requested;
  }

  function formatPreferredDateTime(value?: string) {
    if (!value) return '—';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString();
  }

  function formatRequestSent(value: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
  }

  function toggleInfo(orderId: string) {
    setOpenInfoByOrderId((current) => ({
      ...current,
      [orderId]: !current[orderId],
    }));
  }

  function renderSortArrows(
    label: string,
    mode: 'none' | 'asc' | 'desc',
    onChange: (next: 'none' | 'asc' | 'desc') => void,
  ) {
    const upClass = mode === 'none' || mode === 'asc' ? 'font-bold text-brand-off-white' : 'font-medium text-brand-light-gray/50';
    const downClass = mode === 'none' || mode === 'desc' ? 'font-bold text-brand-off-white' : 'font-medium text-brand-light-gray/50';

    return (
      <div className="flex items-center justify-between rounded-lg border border-brand-dark-gray bg-brand-dark-gray px-3 py-2">
        <span className="text-sm text-brand-light-gray">{label}</span>
        <div className="flex flex-col leading-none">
          <button
            type="button"
            onClick={() => onChange(cycleSort(mode, 'asc'))}
            className={`h-3 text-[11px] transition-all ${upClass}`}
            aria-label={`${label} ascending`}
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onChange(cycleSort(mode, 'desc'))}
            className={`h-3 text-[11px] transition-all ${downClass}`}
            aria-label={`${label} descending`}
          >
            ▼
          </button>
        </div>
      </div>
    );
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

      <div className="rounded-lg border border-brand-dark-gray bg-brand-charcoal p-4">
        <p className="text-sm font-semibold text-brand-off-white">Filters</p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MainOrderStatus)}>
            <SelectTrigger className="w-full border-brand-dark-gray bg-brand-dark-gray text-brand-off-white">
              <SelectValue placeholder="Order status" />
            </SelectTrigger>
            <SelectContent className="border-brand-dark-gray bg-brand-charcoal text-brand-off-white">
              {ORDER_FILTERS.map((status) => (
                <SelectItem key={status} value={status}>
                  Status: {MAIN_ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={deliveryFilter} onValueChange={(value) => setDeliveryFilter(value as 'all' | 'pickup' | 'delivery')}>
            <SelectTrigger className="w-full border-brand-dark-gray bg-brand-dark-gray text-brand-off-white">
              <SelectValue placeholder="Delivery type" />
            </SelectTrigger>
            <SelectContent className="border-brand-dark-gray bg-brand-charcoal text-brand-off-white">
              {DELIVERY_FILTERS.map((type) => (
                <SelectItem key={type} value={type}>
                  Delivery: {type === 'all' ? 'All' : type === 'pickup' ? 'Pickup' : 'Delivery'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as 'all' | 'pending' | 'paid')}>
            <SelectTrigger className="w-full border-brand-dark-gray bg-brand-dark-gray text-brand-off-white">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent className="border-brand-dark-gray bg-brand-charcoal text-brand-off-white">
              <SelectItem value="all">Payment: All</SelectItem>
              <SelectItem value="pending">Payment: Pending</SelectItem>
              <SelectItem value="paid">Payment: Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={fulfillmentFilter}
            onValueChange={(value) => setFulfillmentFilter(value as 'all' | SelectableFulfillmentStatus)}
          >
            <SelectTrigger className="w-full border-brand-dark-gray bg-brand-dark-gray text-brand-off-white">
              <SelectValue placeholder="Fulfillment" />
            </SelectTrigger>
            <SelectContent className="border-brand-dark-gray bg-brand-charcoal text-brand-off-white">
              <SelectItem value="all">Fulfillment: All</SelectItem>
              {FULFILLMENT_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  Fulfillment: {FULFILLMENT_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {renderSortArrows('Order Date', dateSortMode, setDateSortMode)}
          {renderSortArrows('Amount', totalSortMode, setTotalSortMode)}
        </div>
      </div>

      {/* Orders List */}
      <div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer-effect h-24 rounded-lg"></div>
            ))}
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-12 text-brand-light-gray">
            <p>No orders match the selected filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order, index) => (
              <div
                key={order.id}
                className="rounded-lg border border-brand-dark-gray border-l-4 border-l-brand-gold bg-brand-charcoal p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-brand-gold/60 bg-brand-gold/10 px-2 text-sm font-bold text-brand-gold">
                      #{order.display_id ?? index + 1}
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-semibold">{order.customer_name}</h3>
                      <p className="text-sm font-medium text-brand-off-white">
                        Order Date: <span className="gold-accent">{formatPreferredDateTime(order.preferred_datetime)}</span>
                      </p>
                      <div className={`mt-2 inline-flex status-badge ${
                        ['request_received', 'under_review'].includes(toMainOrderStatus(order.status))
                          ? 'status-pending'
                          : toMainOrderStatus(order.status) === 'accepted'
                            ? 'status-available'
                            : 'status-sold-out'
                      }`}>
                        {MAIN_ORDER_STATUS_LABELS[toMainOrderStatus(order.status)]}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold gold-accent">${order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleInfo(order.id)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-dark-gray bg-brand-dark-gray px-3 text-sm text-brand-off-white transition-all hover:border-brand-gold"
                      >
                        <Info className="h-4 w-4" />
                        Info
                      </button>
                      <button
                        type="button"
                        onClick={() => acceptOrder(order.id)}
                        disabled={!canManage || updatingOrderId === order.id || toMainOrderStatus(order.status) === 'accepted'}
                        className="h-9 rounded-lg border border-green-500/40 bg-green-500/10 px-3 text-sm text-green-300 transition-all hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectOrder(order.id)}
                        disabled={!canManage || updatingOrderId === order.id || toMainOrderStatus(order.status) === 'rejected'}
                        className="h-9 rounded-lg border border-red-500/40 bg-red-500/10 px-3 text-sm text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-brand-light-gray">Delivery Type:</span>{' '}
                    <span className="capitalize">{order.delivery_type}</span>
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

                {openInfoByOrderId[order.id] ? (
                  <div className="mb-4 rounded-lg border border-brand-dark-gray bg-brand-black/40 p-4">
                    <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                      <div className="space-y-2">
                        <p><span className="text-brand-light-gray">Order ID:</span> {order.id}</p>
                        <p><span className="text-brand-light-gray">Phone:</span> {order.customer_phone}</p>
                        <p><span className="text-brand-light-gray">Request Sent Time:</span> {formatRequestSent(order.created_at)}</p>
                      </div>
                      <div className="space-y-2">
                        <p><span className="text-brand-light-gray">Email:</span> {order.customer_email}</p>
                        <p>
                          <span className="text-brand-light-gray">Payment Method:</span>{' '}
                          <span className="capitalize">{order.payment_method ?? 'arranged_after_approval'}</span>
                        </p>
                        <p>
                          <span className="text-brand-light-gray">Fulfillment:</span>{' '}
                          {FULFILLMENT_STATUS_LABELS[normalizeFulfillmentStatus(order.fulfillment_status)]}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm">
                      <span className="text-brand-light-gray">Current Internal Note:</span>{' '}
                      <span>{(order.internal_notes ?? '').trim() || 'None yet'}</span>
                    </p>

                    <div className="mt-4">
                      <h4 className="mb-2 font-semibold">Internal Notes</h4>
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
                  </div>
                ) : null}

                <div className="mb-4">
                  <h4 className="mb-2 font-semibold">Items:</h4>
                  <ul className="space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-brand-light-gray">
                        {item.quantity}x {item.product_name} - ${(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                {toMainOrderStatus(order.status) === 'accepted' ? (
                  <div className="flex flex-wrap items-center gap-4">
                    <Select
                      value={order.payment_status ?? 'pending'}
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
                      value={normalizeFulfillmentStatus(order.fulfillment_status)}
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
                  </div>
                ) : (
                  <p className="text-xs text-brand-light-gray">
                    Payment and fulfillment controls unlock after this order is accepted.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
