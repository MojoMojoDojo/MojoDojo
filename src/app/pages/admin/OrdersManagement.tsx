import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import type { Order } from '../../../lib/supabase';
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

export function OrdersManagement() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MainOrderStatus>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    if (!accessToken) return;

    try {
      const { orders: data } = await api.orders.getAll(accessToken);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: Exclude<MainOrderStatus, 'all'>) {
    if (!accessToken) return;

    try {
      await api.orders.update(orderId, { status: newStatus }, accessToken);
      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order');
    }
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((order) => toMainOrderStatus(order.status) === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Orders <span className="gold-accent">Management</span>
        </h1>
      </div>

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

                <div className="flex items-center gap-4">
                  <Select
                    value={toMainOrderStatus(order.status)}
                    onValueChange={(value) => updateOrderStatus(order.id, value as Exclude<MainOrderStatus, 'all'>)}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
