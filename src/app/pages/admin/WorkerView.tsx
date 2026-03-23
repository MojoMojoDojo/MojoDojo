import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import type { Order } from '../../../lib/supabase';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import { toMainOrderStatus } from '../../lib/adminOperations';

export function WorkerView() {
  const { user, accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [accessToken]);

  async function loadOrders() {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const { orders: data } = await api.orders.getAll(accessToken);
      setOrders(
        data.filter((order) => {
          const status = toMainOrderStatus(order.status);
          return status !== 'rejected' && (order.fulfillment_status ?? 'not_started') !== 'fulfilled';
        }),
      );
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
  const pendingCount = todayOrders.filter((order) => {
    const status = toMainOrderStatus(order.status);
    return status === 'request_received' || status === 'under_review';
  }).length;
  const inProgressCount = todayOrders.filter((order) => {
    const fulfillment = order.fulfillment_status ?? 'not_started';
    return fulfillment === 'in_progress' || fulfillment === 'ready';
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Worker <span className="gold-accent">Dashboard</span>
        </h1>
        <p className="text-brand-light-gray">Welcome, {user?.name}! Here's today's prep list</p>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardList className="w-8 h-8 text-brand-gold" />
            <h3 className="font-semibold">Today's Orders</h3>
          </div>
          <p className="text-4xl font-bold">{todayOrders.length}</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <h3 className="font-semibold">Pending</h3>
          </div>
          <p className="text-4xl font-bold">{pendingCount}</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h3 className="font-semibold">In Progress</h3>
          </div>
          <p className="text-4xl font-bold">{inProgressCount}</p>
        </div>
      </div>

      {/* Production List */}
      <div className="premium-card p-6">
        <h2 className="text-2xl font-semibold mb-6 golden-line pl-4">Production Queue</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer-effect h-24 rounded-lg"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-brand-light-gray">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active orders to prepare</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 bg-brand-charcoal rounded-lg border border-brand-dark-gray"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Order #{order.id.slice(-8)}</h3>
                    <p className="text-sm text-brand-light-gray">
                      {order.delivery_type === 'pickup' ? 'Pickup' : `Delivery to ${order.delivery_address}`}
                    </p>
                    {order.preferred_datetime && (
                      <p className="text-sm text-yellow-500 mt-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Due: {new Date(order.preferred_datetime).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className={`status-badge ${
                    toMainOrderStatus(order.status) === 'accepted' ? 'status-available' : 'status-pending'
                  }`}>
                    {toMainOrderStatus(order.status).replace('_', ' ')}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-brand-gold">Items to Prepare:</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-3 bg-brand-black rounded">
                        <div className="w-8 h-8 rounded-full bg-brand-gold text-brand-black flex items-center justify-center font-bold">
                          {item.quantity}
                        </div>
                        <span className="font-medium">{item.product_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.notes && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-sm">
                      <span className="font-semibold text-yellow-500">Special Instructions:</span>{' '}
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
