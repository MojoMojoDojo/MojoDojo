import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import type { Product } from '../../../lib/supabase';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import {
  createInitialProductSetups,
  type AdminProductSetup,
} from '../../lib/adminOperations';

const RECIPE_OPTIONS = [
  { value: 'biscoff-cheesecake', label: 'Biscoff Cheesecake Recipe' },
  { value: 'cheesecake-brownie', label: 'Cheesecake Brownie Recipe' },
  { value: 'tiramisu', label: 'Tiramisu Recipe' },
  { value: 'custom', label: 'Custom Recipe' },
];

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [setups, setSetups] = useState<AdminProductSetup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { products: data } = await api.products.getAll();
      setProducts(data);
      setSetups(createInitialProductSetups(data));
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  function updateSetup(productId: string, updates: Partial<AdminProductSetup>) {
    setSetups((current) =>
      current.map((setup) =>
        setup.productId === productId
          ? {
              ...setup,
              ...updates,
            }
          : setup,
      ),
    );
  }

  function updateVariantPrice(productId: string, variantId: string, value: number) {
    setSetups((current) =>
      current.map((setup) => {
        if (setup.productId !== productId) return setup;

        return {
          ...setup,
          variants: setup.variants.map((variant) =>
            variant.id === variantId
              ? {
                  ...variant,
                  priceModifier: value,
                }
              : variant,
          ),
        };
      }),
    );
  }

  function saveSetups() {
    toast.success('Product setup saved locally. Connect this action to your admin API next.');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Products <span className="gold-accent">Management</span>
        </h1>
        <Button className="btn-primary-gold" onClick={saveSetups}>
          Save Product Setup
        </Button>
      </div>

      <div className="premium-card p-6">
        <div className="mb-6 p-4 rounded-lg bg-brand-charcoal border border-brand-dark-gray text-sm text-brand-light-gray">
          Keep this page practical: names and descriptions (EN/FR), price, availability, recipe mapping, and variants where needed.
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer-effect h-24 rounded-lg"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-brand-light-gray">No products found.</p>
        ) : (
          <div className="space-y-6">
            {setups.map((setup) => {
              const product = products.find((p) => p.id === setup.productId);
              if (!product) return null;

              return (
                <div key={setup.productId} className="p-6 bg-brand-charcoal rounded-lg border border-brand-dark-gray">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{setup.nameEn || product.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-brand-light-gray">Available</span>
                      <Switch
                        checked={setup.available}
                        onCheckedChange={(checked) => updateSetup(setup.productId, { available: checked })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-brand-light-gray mb-2">Name (EN)</label>
                      <Input
                        value={setup.nameEn}
                        onChange={(event) => updateSetup(setup.productId, { nameEn: event.target.value })}
                        className="bg-brand-black border-brand-dark-gray"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-light-gray mb-2">Name (FR)</label>
                      <Input
                        value={setup.nameFr}
                        onChange={(event) => updateSetup(setup.productId, { nameFr: event.target.value })}
                        className="bg-brand-black border-brand-dark-gray"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-light-gray mb-2">Description (EN)</label>
                      <Input
                        value={setup.descriptionEn}
                        onChange={(event) => updateSetup(setup.productId, { descriptionEn: event.target.value })}
                        className="bg-brand-black border-brand-dark-gray"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-light-gray mb-2">Description (FR)</label>
                      <Input
                        value={setup.descriptionFr}
                        onChange={(event) => updateSetup(setup.productId, { descriptionFr: event.target.value })}
                        className="bg-brand-black border-brand-dark-gray"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-light-gray mb-2">Base Price</label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={setup.price}
                        onChange={(event) => updateSetup(setup.productId, { price: Number(event.target.value || 0) })}
                        className="bg-brand-black border-brand-dark-gray"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-light-gray mb-2">Recipe Association</label>
                      <Select
                        value={setup.recipeProfile}
                        onValueChange={(value) => updateSetup(setup.productId, { recipeProfile: value })}
                      >
                        <SelectTrigger className="bg-brand-black border-brand-dark-gray text-brand-off-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-brand-charcoal border-brand-dark-gray text-brand-off-white">
                          {RECIPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {setup.variants.length > 0 && (
                    <div className="mt-3 p-4 rounded-lg bg-brand-black border border-brand-dark-gray">
                      <p className="text-sm font-medium mb-3">Variants / Sizes</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {setup.variants.map((variant) => (
                          <div key={variant.id}>
                            <label className="block text-xs text-brand-light-gray mb-2">
                              {variant.label} price modifier
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.priceModifier}
                              onChange={(event) =>
                                updateVariantPrice(
                                  setup.productId,
                                  variant.id,
                                  Number(event.target.value || 0),
                                )
                              }
                              className="bg-brand-charcoal border-brand-dark-gray"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
