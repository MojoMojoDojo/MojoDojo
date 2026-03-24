import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import type { Order } from '../../../lib/supabase';
import { TrendingUp, DollarSign, CreditCard, CircleMinus, CirclePlus, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toMainOrderStatus } from '../../lib/adminOperations';
import { buildIngredientWorksheet, QUICK_ADD_SKUS } from '../../lib/adminOperations';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

type Timeframe = 'day' | 'last_7_days' | 'month' | 'year' | 'all_time';

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
  const [quickAddCounts, setQuickAddCounts] = useState<Record<string, number>>({});
  const [quickAddDrafts, setQuickAddDrafts] = useState<Record<string, string>>({});

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

  const acceptedPaidOrders = orders.filter(
    (order) => toMainOrderStatus(order.status) === 'accepted' && (order.payment_status ?? 'pending') === 'paid',
  );

  function getFinancialOrderDate(order: Order): Date | null {
    const parsed = new Date(order.preferred_datetime ?? order.created_at);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

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

  for (const order of acceptedPaidOrders) {
    const orderDate = getFinancialOrderDate(order);
    if (!orderDate) continue;

    if (timeframe === 'day') {
      const dayKey = now.toISOString().slice(0, 10);
      if (orderDate.toISOString().slice(0, 10) !== dayKey) continue;
      addPoint(dayKey, 'Today', order);
      continue;
    }

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
  const selectedOrders = acceptedPaidOrders.filter((order) => {
    if (!selectedKey) return false;
    const orderDate = getFinancialOrderDate(order);
    if (!orderDate) return false;

    if (timeframe === 'day') {
      return orderDate.toISOString().slice(0, 10) === selectedKey;
    }

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
    timeframe === 'day'
      ? 'Today'
      : timeframe === 'last_7_days'
      ? 'Last 7 days'
      : timeframe === 'month'
        ? 'This month'
        : timeframe === 'year'
          ? 'This year'
          : 'All time';

  const worksheet = useMemo(() => buildIngredientWorksheet(quickAddCounts), [quickAddCounts]);

  function incrementSku(skuId: string, amount: number) {
    setQuickAddCounts((current) => {
      const next = Math.max(0, (current[skuId] ?? 0) + amount);
      return {
        ...current,
        [skuId]: next,
      };
    });
  }

  function updateQuickAddDraft(skuId: string, value: string) {
    if (!/^\d*$/.test(value)) return;

    setQuickAddDrafts((current) => ({
      ...current,
      [skuId]: value,
    }));
  }

  function applyQuickAddDraft(skuId: string) {
    const raw = quickAddDrafts[skuId] ?? '';
    const amount = Number(raw);
    if (!Number.isInteger(amount) || amount <= 0) return;

    incrementSku(skuId, amount);
    setQuickAddDrafts((current) => ({
      ...current,
      [skuId]: '',
    }));
  }

  function resetWorksheet() {
    setQuickAddCounts({});
    setQuickAddDrafts({});
  }

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold mb-2 golden-line pl-4">Revenue by Period</h2>
            <p className="text-sm text-brand-light-gray">Click a bar to drill into orders for that period.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'day', label: 'Day' },
              { key: 'last_7_days', label: '7 days' },
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
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  timeframe === option.key
                    ? 'bg-brand-gold text-brand-black'
                    : 'bg-brand-charcoal text-brand-light-gray hover:text-brand-gold'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
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
            <p className="text-center text-brand-light-gray py-8">No accepted and paid orders for the selected period</p>
          ) : (
            selectedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-brand-charcoal rounded-lg">
                <div>
                  <p className="font-semibold">{order.items.map((item) => item.product_name).join(', ')}</p>
                  <p className="text-sm text-brand-light-gray">{order.customer_name}</p>
                  <p className="text-xs text-brand-light-gray">
                    {new Date(order.preferred_datetime ?? order.created_at).toLocaleString()} • Payment: {order.payment_status ?? 'pending'} • Fulfillment: {order.fulfillment_status ?? 'not_started'}
                  </p>
                </div>
                <p className="font-bold gold-accent">{formatCurrency(order.total)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="premium-card p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold golden-line pl-4">Quick Add Production</h2>
            <Button variant="outline" className="btn-outline-gold" onClick={resetWorksheet}>
              Reset
            </Button>
          </div>

          <div className="space-y-3">
            {QUICK_ADD_SKUS.map((sku) => (
              <div
                key={sku.id}
                className="p-4 bg-brand-charcoal rounded-lg border border-brand-dark-gray"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">{sku.label}</p>
                    <p className="text-xs text-brand-light-gray">Revenue/unit: ${sku.revenuePerUnit.toFixed(2)}</p>
                  </div>
                  <p className="text-lg font-bold gold-accent">{quickAddCounts[sku.id] ?? 0}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="btn-outline-gold"
                    onClick={() => incrementSku(sku.id, -1)}
                    aria-label={`decrease ${sku.label}`}
                  >
                    <CircleMinus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="btn-primary-gold"
                    onClick={() => incrementSku(sku.id, 1)}
                    aria-label={`increase ${sku.label}`}
                  >
                    <CirclePlus className="w-4 h-4" />
                  </Button>

                  <div className="ml-auto flex items-center gap-2 min-w-0">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={quickAddDrafts[sku.id] ?? ''}
                      onChange={(event) => updateQuickAddDraft(sku.id, event.target.value)}
                      placeholder="Add number"
                      className="h-9 w-28 rounded-md border border-brand-dark-gray bg-black/30 px-2 text-sm text-white placeholder:text-brand-light-gray/70 focus:border-brand-gold focus:outline-none"
                      aria-label={`${sku.label} add number`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="btn-outline-gold"
                      onClick={() => applyQuickAddDraft(sku.id)}
                      disabled={!quickAddDrafts[sku.id] || Number(quickAddDrafts[sku.id]) <= 0}
                      aria-label="apply quantity"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card p-6 xl:col-span-3">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold golden-line pl-4">Ingredient Worksheet</h2>
            <p className="text-sm text-brand-light-gray mt-2">
              Live estimate from quick-add quantities. Replace with real recipe/cost tables when backend is connected.
            </p>
          </div>

          {worksheet.rows.length === 0 ? (
            <div className="text-center py-12 text-brand-light-gray">
              <p>Add products with quick-add to generate ingredient requirements.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-brand-dark-gray hover:bg-transparent">
                  <TableHead>Ingredient</TableHead>
                  <TableHead className="text-right">Qty Required</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Extended Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {worksheet.rows.map((row) => (
                  <TableRow key={row.ingredientId} className="border-brand-dark-gray hover:bg-brand-charcoal">
                    <TableCell>{row.ingredientName}</TableCell>
                    <TableCell className="text-right">{row.quantityRequiredDisplay}</TableCell>
                    <TableCell className="text-right">${row.unitCost.toFixed(4)}</TableCell>
                    <TableCell className="text-right">${row.extendedCost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-brand-charcoal border border-brand-dark-gray">
              <p className="text-sm text-brand-light-gray mb-1">Total Ingredient Cost</p>
              <p className="text-2xl font-bold">${worksheet.totals.totalIngredientCost.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-brand-charcoal border border-brand-dark-gray">
              <p className="text-sm text-brand-light-gray mb-1">Total Revenue</p>
              <p className="text-2xl font-bold gold-accent">${worksheet.totals.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-brand-charcoal border border-brand-dark-gray">
              <p className="text-sm text-brand-light-gray mb-1">Estimated Gross Profit</p>
              <p className={`text-2xl font-bold ${worksheet.totals.estimatedGrossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${worksheet.totals.estimatedGrossProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
