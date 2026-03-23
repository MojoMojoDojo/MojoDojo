import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import type { Order } from '../../../lib/supabase';
import { TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toMainOrderStatus } from '../../lib/adminOperations';

type Timeframe = 'last_7_days' | 'month' | 'year' | 'all_time';

type ChartPoint = {
  key: string;
  name: string;
  revenue: number;
  orders: number;
};

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function getStartOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getWeekLabelInMonth(date: Date) {
  const day = date.getDate();
  const week = Math.ceil(day / 7);
  return `W${week}`;
}

export function FinancialOverview() {
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>('last_7_days');
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string | null>(null);

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

  const acceptedOrders = orders.filter((order) => toMainOrderStatus(order.status) === 'accepted');

  const now = new Date();
  const chartMap = new Map<string, ChartPoint>();

  function addPoint(key: string, name: string, order: Order) {
    const existing = chartMap.get(key);
    if (!existing) {
      chartMap.set(key, {
        key,
        name,
        revenue: order.total,
        orders: 1,
      });
      return;
    }

    existing.revenue += order.total;
    existing.orders += 1;
  }

  for (const order of acceptedOrders) {
    const orderDate = new Date(order.created_at);
    if (Number.isNaN(orderDate.getTime())) continue;

    if (timeframe === 'last_7_days') {
      const start = getStartOfDay(new Date(now));
      start.setDate(start.getDate() - 6);
      if (orderDate < start) continue;

      const dayKey = orderDate.toISOString().slice(0, 10);
      addPoint(dayKey, orderDate.toLocaleDateString('en-US', { weekday: 'short' }), order);
      continue;
    }

    if (timeframe === 'month') {
      if (orderDate.getFullYear() !== now.getFullYear() || orderDate.getMonth() !== now.getMonth()) continue;
      const weekLabel = getWeekLabelInMonth(orderDate);
      addPoint(weekLabel, weekLabel, order);
      continue;
    }

    if (timeframe === 'year') {
      if (orderDate.getFullYear() !== now.getFullYear()) continue;
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = orderDate.toLocaleDateString('en-US', { month: 'short' });
      addPoint(monthKey, monthName, order);
      continue;
    }

    const yearKey = String(orderDate.getFullYear());
    addPoint(yearKey, yearKey, order);
  }

  let chartData = Array.from(chartMap.values());
  if (timeframe === 'last_7_days') {
    chartData = chartData.sort((a, b) => a.key.localeCompare(b.key));
  } else if (timeframe === 'month') {
    chartData = chartData.sort((a, b) => a.key.localeCompare(b.key));
  } else if (timeframe === 'year') {
    chartData = chartData.sort((a, b) => a.key.localeCompare(b.key));
  } else {
    chartData = chartData.sort((a, b) => a.key.localeCompare(b.key));
  }

  const selectedKey = selectedPeriodKey ?? chartData[0]?.key ?? null;
  const selectedOrders = acceptedOrders.filter((order) => {
    if (!selectedKey) return false;
    const orderDate = new Date(order.created_at);
    if (Number.isNaN(orderDate.getTime())) return false;

    if (timeframe === 'last_7_days') {
      return orderDate.toISOString().slice(0, 10) === selectedKey;
    }

    if (timeframe === 'month') {
      return getWeekLabelInMonth(orderDate) === selectedKey
        && orderDate.getFullYear() === now.getFullYear()
        && orderDate.getMonth() === now.getMonth();
    }

    if (timeframe === 'year') {
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedKey;
    }

    return String(orderDate.getFullYear()) === selectedKey;
  });

  const totalRevenue = selectedOrders.reduce((sum, order) => sum + order.total, 0);
  const cashOrders = selectedOrders
    .filter((order) => order.payment_method === 'cash')
    .reduce((sum, order) => sum + order.total, 0);
  const onlineOrders = selectedOrders
    .filter((order) => order.payment_method === 'online' || order.payment_method === 'etranser')
    .reduce((sum, order) => sum + order.total, 0);
  const averageOrder = selectedOrders.length > 0 ? totalRevenue / selectedOrders.length : 0;

  const timeframeLabel =
    timeframe === 'last_7_days'
      ? 'Last 7 days'
      : timeframe === 'month'
        ? 'This month'
        : timeframe === 'year'
          ? 'This year'
          : 'All time';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Financial <span className="gold-accent">Overview</span>
        </h1>
        <p className="text-brand-light-gray mt-2">Owner-only access • Revenue and performance metrics</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { key: 'last_7_days', label: 'Last 7 days' },
          { key: 'month', label: 'Month' },
          { key: 'year', label: 'Year' },
          { key: 'all_time', label: 'All time' },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => {
              setTimeframe(option.key as Timeframe);
              setSelectedPeriodKey(null);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              timeframe === option.key
                ? 'bg-brand-gold text-brand-black'
                : 'bg-brand-charcoal text-brand-light-gray hover:text-brand-gold'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-light-gray text-sm">Total Revenue ({timeframeLabel})</h3>
            <DollarSign className="w-8 h-8 text-brand-gold" />
          </div>
          <p className="text-3xl font-bold gold-accent">{formatCurrency(totalRevenue)}</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-light-gray text-sm">Cash Payments</h3>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(cashOrders)}</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-light-gray text-sm">Online Payments</h3>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(onlineOrders)}</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-light-gray text-sm">Average Order</h3>
            <TrendingUp className="w-8 h-8 text-brand-gold" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(averageOrder)}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="premium-card p-6">
        <h2 className="text-2xl font-semibold mb-2 golden-line pl-4">Revenue by Period</h2>
        <p className="mb-6 text-sm text-brand-light-gray">Click a bar to drill into orders for that period.</p>
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
              <Bar
                dataKey="revenue"
                fill="#f4c430"
                radius={[8, 8, 0, 0]}
                onClick={(data: { payload?: ChartPoint } | undefined) => setSelectedPeriodKey(data?.payload?.key ?? null)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Period Drill Down */}
      <div className="premium-card p-6">
        <h2 className="text-2xl font-semibold mb-6 golden-line pl-4">Orders for Selected Period</h2>
        <div className="space-y-3">
          {selectedOrders.length === 0 ? (
            <p className="text-center text-brand-light-gray py-8">No accepted orders for the selected period</p>
          ) : (
            selectedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-brand-charcoal rounded-lg">
                <div>
                  <p className="font-semibold">{order.items.map((item) => item.product_name).join(', ')}</p>
                  <p className="text-sm text-brand-light-gray">{order.customer_name}</p>
                  <p className="text-xs text-brand-light-gray">
                    {new Date(order.created_at).toLocaleString()} • Payment: {order.payment_status ?? 'arranged'} • Fulfillment: {order.fulfillment_status ?? 'not_started'}
                  </p>
                </div>
                <p className="font-bold gold-accent">{formatCurrency(order.total)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
