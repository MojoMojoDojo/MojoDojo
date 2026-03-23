import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import type { Order } from '../../../lib/supabase';
import { TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function FinancialOverview() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [accessToken]);

  async function loadOrders() {
    if (!accessToken) return;

    try {
      const { orders: data } = await api.orders.getAll(accessToken);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const cashOrders = completedOrders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + o.total, 0);
  const onlineOrders = completedOrders.filter(o => o.payment_method === 'online').reduce((sum, o) => sum + o.total, 0);
  const averageOrder = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Simple daily revenue chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayOrders = completedOrders.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate.toDateString() === date.toDateString();
    });
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0)
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Financial <span className="gold-accent">Overview</span>
        </h1>
        <p className="text-brand-light-gray mt-2">Owner-only access • Revenue and performance metrics</p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-light-gray text-sm">Total Revenue</h3>
            <DollarSign className="w-8 h-8 text-brand-gold" />
          </div>
          <p className="text-3xl font-bold gold-accent">${totalRevenue.toFixed(2)}</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-light-gray text-sm">Cash Payments</h3>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold">${cashOrders.toFixed(2)}</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-light-gray text-sm">Online Payments</h3>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">${onlineOrders.toFixed(2)}</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-light-gray text-sm">Average Order</h3>
            <TrendingUp className="w-8 h-8 text-brand-gold" />
          </div>
          <p className="text-3xl font-bold">${averageOrder.toFixed(2)}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="premium-card p-6">
        <h2 className="text-2xl font-semibold mb-6 golden-line pl-4">Last 7 Days Revenue</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" stroke="#9a9a9a" />
              <YAxis stroke="#9a9a9a" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#f5f5f0'
                }}
              />
              <Bar dataKey="revenue" fill="#f4c430" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Performance */}
      <div className="premium-card p-6">
        <h2 className="text-2xl font-semibold mb-6 golden-line pl-4">Product Performance</h2>
        <div className="space-y-3">
          {completedOrders.length === 0 ? (
            <p className="text-center text-brand-light-gray py-8">No completed orders yet</p>
          ) : (
            completedOrders.slice(0, 5).map((order, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-brand-charcoal rounded-lg">
                <div>
                  <p className="font-semibold">{order.items.map(i => i.product_name).join(', ')}</p>
                  <p className="text-sm text-brand-light-gray">{order.customer_name}</p>
                </div>
                <p className="font-bold gold-accent">${order.total.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
