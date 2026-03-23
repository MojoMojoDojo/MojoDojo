import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import { motion } from 'motion/react';
import { 
  ShoppingCart, 
  DollarSign,
  AlertCircle,
  CirclePlus,
  CircleMinus,
  ClipboardList,
  Check,
} from 'lucide-react';
import type { Order } from '../../../lib/supabase';
import { Link } from 'react-router';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  buildIngredientWorksheet,
  MAIN_ORDER_STATUS_LABELS,
  QUICK_ADD_SKUS,
  toMainOrderStatus,
} from '../../lib/adminOperations';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

export function AdminDashboard() {
  const { user, accessToken } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickAddCounts, setQuickAddCounts] = useState<Record<string, number>>({});
  const [quickAddDrafts, setQuickAddDrafts] = useState<Record<string, string>>({});

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
      .filter((o) => toMainOrderStatus(o.status) === 'accepted')
      .reduce((sum, o) => sum + o.total, 0),
  };

  const worksheet = useMemo(() => buildIngredientWorksheet(quickAddCounts), [quickAddCounts]);

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
      title: 'Accepted Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-brand-gold',
      bgColor: 'bg-brand-gold-subtle'
    }
  ];

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
                      placeholder={t.adminDashboard.quickAdd.addNumberPlaceholder}
                      className="h-9 w-28 rounded-md border border-brand-dark-gray bg-black/30 px-2 text-sm text-white placeholder:text-brand-light-gray/70 focus:border-brand-gold focus:outline-none"
                      aria-label={`${sku.label} ${t.adminDashboard.quickAdd.addNumberPlaceholder}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="btn-outline-gold"
                      onClick={() => applyQuickAddDraft(sku.id)}
                      disabled={!quickAddDrafts[sku.id] || Number(quickAddDrafts[sku.id]) <= 0}
                      aria-label={t.adminDashboard.quickAdd.applyQuantity}
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
              <p className="text-2xl font-bold ${worksheet.totals.estimatedGrossProfit >= 0 ? 'text-green-400' : 'text-red-400'}">
                ${worksheet.totals.estimatedGrossProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

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
