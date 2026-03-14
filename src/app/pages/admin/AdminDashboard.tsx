import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { motion } from 'motion/react';
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  AlertCircle,
  TrendingUp 
} from 'lucide-react';
import type { Order } from '../../../lib/supabase';

export function AdminDashboard() {
  const { user, accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!accessToken) return;

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
    pendingOrders: orders.filter(o => ['request_received', 'under_review', 'pending'].includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0)
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
      title: 'Pending',
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Completed',
      value: stats.completedOrders,
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-brand-gold',
      bgColor: 'bg-brand-gold-subtle'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, <span className="gold-accent">{user?.name}</span>
        </h1>
        <p className="text-brand-light-gray">Here's what's happening with MojoDojo today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
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

      {/* Recent Orders */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold golden-line pl-4">Recent Orders</h2>
          <a href="/admin/dashboard/orders" className="text-brand-gold hover:underline text-sm">
            View All
          </a>
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
                    {order.items.length} item(s) • {order.delivery_type}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold gold-accent">${order.total.toFixed(2)}</p>
                  <p className="text-xs text-brand-light-gray">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className={`status-badge ${
                  ['request_received', 'under_review', 'pending'].includes(order.status) ? 'status-pending' :
                  order.status === 'completed' ? 'status-available' :
                  'status-pending'
                }`}>
                  {order.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/admin/dashboard/orders" className="premium-card p-6 hover:border-brand-gold transition-colors group">
          <ShoppingCart className="w-8 h-8 text-brand-gold mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold mb-1">Manage Orders</h3>
          <p className="text-sm text-brand-light-gray">View and update order status</p>
        </a>

        <a href="/admin/dashboard/products" className="premium-card p-6 hover:border-brand-gold transition-colors group">
          <Package className="w-8 h-8 text-brand-gold mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold mb-1">Products</h3>
          <p className="text-sm text-brand-light-gray">Manage menu and inventory</p>
        </a>

        <a href="/admin/dashboard/financial" className="premium-card p-6 hover:border-brand-gold transition-colors group">
          <TrendingUp className="w-8 h-8 text-brand-gold mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold mb-1">Financial Overview</h3>
          <p className="text-sm text-brand-light-gray">Revenue and analytics</p>
        </a>
      </div>
    </div>
  );
}
