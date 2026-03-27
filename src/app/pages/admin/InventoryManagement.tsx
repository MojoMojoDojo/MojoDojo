import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import type { Ingredient } from '../../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { AlertTriangle, Package2 } from 'lucide-react';
import { canManageSensitiveBusinessData } from '../../lib/accessControl';

type Movement = {
  id: number;
  ingredient_id: string;
  ingredient_name: string;
  unit: string;
  quantity_delta: number;
  movement_type: 'manual_adjustment' | 'order_fulfillment';
  reason?: string | null;
  order_id?: string | null;
  created_at: string;
};

export function InventoryManagement() {
  const { accessToken, user } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);

  const canManage = canManageSensitiveBusinessData(user?.role);

  useEffect(() => {
    loadIngredients();
  }, [accessToken]);

  async function loadIngredients() {
    if (!accessToken) return;

    try {
      const [{ ingredients: data }, { movements: movementRows }] = await Promise.all([
        api.ingredients.getAll(accessToken),
        api.ingredients.getMovements(accessToken),
      ]);
      setIngredients(data);
      setMovements(movementRows);
      setStockDrafts(
        data.reduce<Record<string, string>>((acc, item) => {
          acc[item.id] = String(item.stock_quantity);
          return acc;
        }, {}),
      );
    } catch (error) {
      console.error('Failed to load ingredients:', error);
      const message = error instanceof Error ? error.message : 'Failed to load ingredients';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStock(id: string, newQuantity: number) {
    if (!accessToken) return;
    if (!canManage) {
      toast.error('Only admins can update stock');
      return;
    }

    try {
      setSavingId(id);
      await api.ingredients.update(
        id,
        { stock_quantity: newQuantity },
        accessToken,
        reasonDrafts[id]?.trim() || 'Manual inventory adjustment from inventory page',
      );
      toast.success('Stock updated');
      await loadIngredients();
    } catch (error) {
      console.error('Failed to update stock:', error);
      const message = error instanceof Error ? error.message : 'Failed to update stock';
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  function formatMovementDate(value: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
  }

  const lowStockItems = ingredients.filter(i => i.stock_quantity <= i.threshold_alert);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Inventory <span className="gold-accent">Management</span>
        </h1>
        {!canManage ? (
          <p className="text-sm text-brand-light-gray">Worker access is read-only.</p>
        ) : null}
        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-2 text-yellow-500 mt-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{lowStockItems.length} item(s) low in stock</span>
          </div>
        )}
      </div>

      <div className="premium-card p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer-effect h-20 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {ingredients.length === 0 ? (
              <div className="text-sm text-brand-light-gray">No inventory records found.</div>
            ) : null}
            {ingredients.map((ingredient) => {
              const isLowStock = ingredient.stock_quantity <= ingredient.threshold_alert;
              
              return (
                <div
                  key={ingredient.id}
                  className={`p-6 rounded-lg border transition-colors ${
                    isLowStock 
                      ? 'bg-yellow-500/10 border-yellow-500/30' 
                      : 'bg-brand-charcoal border-brand-dark-gray'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Package2 className={`w-6 h-6 ${isLowStock ? 'text-yellow-500' : 'text-brand-gold'}`} />
                      <div>
                        <h3 className="font-semibold">{ingredient.name}</h3>
                        {ingredient.supplier && (
                          <p className="text-sm text-brand-light-gray">Supplier: {ingredient.supplier}</p>
                        )}
                      </div>
                    </div>
                    
                    {isLowStock && (
                      <div className="status-badge status-pending">
                        Low Stock
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-brand-light-gray">Current Stock:</span>
                      <p className="font-semibold text-lg">{ingredient.stock_quantity} {ingredient.unit}</p>
                    </div>
                    <div>
                      <span className="text-brand-light-gray">Alert Threshold:</span>
                      <p className="font-semibold">{ingredient.threshold_alert} {ingredient.unit}</p>
                    </div>
                    <div>
                      <span className="text-brand-light-gray">Cost per {ingredient.unit}:</span>
                      <p className="font-semibold gold-accent">${ingredient.cost_per_unit}</p>
                    </div>
                    <div>
                      <span className="text-brand-light-gray">Total Value:</span>
                      <p className="font-semibold gold-accent">
                        ${(ingredient.stock_quantity * ingredient.cost_per_unit).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {canManage ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={stockDrafts[ingredient.id] ?? String(ingredient.stock_quantity)}
                        onChange={(event) =>
                          setStockDrafts((current) => ({
                            ...current,
                            [ingredient.id]: event.target.value,
                          }))
                        }
                        className="w-40 bg-brand-black border-brand-dark-gray"
                      />
                      <Input
                        type="text"
                        placeholder="Reason (optional)"
                        value={reasonDrafts[ingredient.id] ?? ''}
                        onChange={(event) =>
                          setReasonDrafts((current) => ({
                            ...current,
                            [ingredient.id]: event.target.value,
                          }))
                        }
                        className="min-w-56 bg-brand-black border-brand-dark-gray"
                      />
                      <Button
                        type="button"
                        className="btn-primary-gold"
                        disabled={savingId === ingredient.id}
                        onClick={() => {
                          const value = Number(stockDrafts[ingredient.id]);
                          if (!Number.isFinite(value) || value < 0) {
                            toast.error('Enter a valid stock quantity');
                            return;
                          }
                          void updateStock(ingredient.id, value);
                        }}
                      >
                        Save Stock
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div className="mt-6 rounded-lg border border-brand-dark-gray bg-brand-charcoal p-4">
              <h3 className="text-lg font-semibold">Recent Inventory Movements</h3>
              {movements.length === 0 ? (
                <p className="mt-2 text-sm text-brand-light-gray">No movement history yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-brand-dark-gray bg-brand-black/50 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-brand-off-white">
                          {movement.ingredient_name}{' '}
                          <span className={movement.quantity_delta < 0 ? 'text-red-300' : 'text-green-300'}>
                            {movement.quantity_delta < 0 ? '' : '+'}{movement.quantity_delta} {movement.unit}
                          </span>
                        </p>
                        <p className="text-xs text-brand-light-gray">
                          {movement.movement_type === 'order_fulfillment' ? 'Completed order' : 'Manual adjustment'}
                          {movement.order_id ? ` • Order ${movement.order_id}` : ''}
                          {movement.reason ? ` • ${movement.reason}` : ''}
                        </p>
                      </div>
                      <p className="text-xs text-brand-light-gray">{formatMovementDate(movement.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
