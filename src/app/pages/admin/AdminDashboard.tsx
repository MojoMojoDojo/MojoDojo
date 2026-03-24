import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { canManageSensitiveBusinessData } from '../../lib/accessControl';
import { motion } from 'motion/react';
import { 
  ShoppingCart, 
  DollarSign,
  AlertCircle,
  ClipboardList,
} from 'lucide-react';
import type { Order } from '../../../lib/supabase';
import { Link } from 'react-router';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  MAIN_ORDER_STATUS_LABELS,
  toMainOrderStatus,
} from '../../lib/adminOperations';

export function AdminDashboard() {
  const { user, accessToken } = useAuth();
  const { t } = useLanguage();
  const canManageSensitive = canManageSensitiveBusinessData(user?.role);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [accessToken]);

  async function loadData() {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const { orders: ordersData } = await api.orders.getAll(accessToken);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    totalOrders: orders.length,
    requestReceived: orders.filter((o) => toMainOrderStatus(o.status) === 'request_received').length,
    underReview: orders.filter((o) => toMainOrderStatus(o.status) === 'under_review').length,
    accepted: orders.filter((o) => toMainOrderStatus(o.status) === 'accepted').length,
    totalRevenue: orders
      .filter((o) => toMainOrderStatus(o.status) === 'accepted' && (o.payment_status ?? 'pending') === 'paid')
      .reduce((sum, o) => sum + o.total, 0),
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-brand-gold',
      bgColor: 'bg-brand-gold-subtle'
    },
    {
      title: 'Request Received',
      value: stats.requestReceived,
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Under Review',
      value: stats.underReview,
      icon: ClipboardList,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Paid Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-brand-gold',
      bgColor: 'bg-brand-gold-subtle'
    }
  ];

  const visibleStatCards = canManageSensitive
    ? statCards
    : statCards.filter((card) => card.title !== 'Accepted Revenue');

  function formatPreferredDateTime(value?: string) {
    if (!value) return '—';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, <span className="gold-accent">{user?.name}</span>
        </h1>
        <p className="text-brand-light-gray">Run today&apos;s operations from one place</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleStatCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="premium-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-brand-light-gray text-sm font-medium">{stat.title}</h3>
                <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {canManageSensitive ? (
        <div className="premium-card p-6">
          <h2 className="text-2xl font-semibold golden-line pl-4">Financial Operations</h2>
          <p className="mt-3 text-sm text-brand-light-gray">
            Quick Add Production and Ingredient Worksheet moved to Financial for centralized cost and profit tracking.
          </p>
          <Link to="/admin/dashboard/financial" className="mt-4 inline-block text-sm text-brand-gold hover:underline">
            Open Financial Overview
          </Link>
        </div>
      ) : (
        <div className="premium-card p-6">
          <h2 className="text-2xl font-semibold golden-line pl-4">Operations Access</h2>
          <p className="mt-3 text-sm text-brand-light-gray">
            Worker access hides product costing and revenue planning controls. Use Orders, Products, and Inventory for day-to-day processing.
          </p>
        </div>
      )}

      {/* Recent Orders */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold golden-line pl-4">Recent Orders</h2>
          <Link to="/admin/dashboard/orders" className="text-brand-gold hover:underline text-sm">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer-effect h-16 rounded-lg"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-brand-light-gray">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-brand-charcoal rounded-lg border border-brand-dark-gray hover:border-brand-gold transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold">{order.customer_name}</p>
                  <p className="text-sm text-brand-light-gray">
                    {order.delivery_type} • {formatPreferredDateTime(order.preferred_datetime)}
                  </p>
                  <p className="text-xs text-brand-light-gray mt-1">
                    Payment: {order.payment_status ?? 'arranged'} • Fulfillment: {order.fulfillment_status ?? 'not_started'}
                  </p>
                  <p className="text-xs text-brand-light-gray mt-1">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold gold-accent">${order.total.toFixed(2)}</p>
                </div>
                <div className={`status-badge ${
                  ['request_received', 'under_review'].includes(toMainOrderStatus(order.status))
                    ? 'status-pending'
                    : toMainOrderStatus(order.status) === 'accepted'
                      ? 'status-available'
                      : 'status-sold-out'
                }`}>
                  {MAIN_ORDER_STATUS_LABELS[toMainOrderStatus(order.status)]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
