import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../lib/api';
import type { Ingredient } from '../../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { AlertTriangle, Package2 } from 'lucide-react';

export function InventoryManagement() {
  const { accessToken } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIngredients();
  }, [accessToken]);

  async function loadIngredients() {
    if (!accessToken) return;

    try {
      const { ingredients: data } = await api.ingredients.getAll(accessToken);
      setIngredients(data);
    } catch (error) {
      console.error('Failed to load ingredients:', error);
      toast.error('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  }

  async function updateStock(id: string, newQuantity: number) {
    if (!accessToken) return;

    try {
      await api.ingredients.update(id, { stock_quantity: newQuantity }, accessToken);
      toast.success('Stock updated');
      loadIngredients();
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast.error('Failed to update stock');
    }
  }

  const lowStockItems = ingredients.filter(i => i.stock_quantity <= i.threshold_alert);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Inventory <span className="gold-accent">Management</span>
        </h1>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
