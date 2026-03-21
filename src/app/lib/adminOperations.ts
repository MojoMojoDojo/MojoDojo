import type { Product } from '../../lib/supabase';

export type MainOrderStatus = 'all' | 'request_received' | 'under_review' | 'accepted' | 'rejected';

export const MAIN_ORDER_STATUS_LABELS: Record<MainOrderStatus, string> = {
  all: 'All',
  request_received: 'Request received',
  under_review: 'Under review',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const LEGACY_TO_MAIN_STATUS: Record<string, Exclude<MainOrderStatus, 'all'>> = {
  request_received: 'request_received',
  under_review: 'under_review',
  accepted: 'accepted',
  rejected: 'rejected',
  pending: 'under_review',
  confirmed: 'accepted',
  in_preparation: 'accepted',
  ready_for_pickup: 'accepted',
  out_for_delivery: 'accepted',
  completed: 'accepted',
  cancelled: 'rejected',
};

export function toMainOrderStatus(status: string): Exclude<MainOrderStatus, 'all'> {
  return LEGACY_TO_MAIN_STATUS[status] ?? 'under_review';
}

export function statusDisplayLabel(status: string): string {
  const main = toMainOrderStatus(status);
  return MAIN_ORDER_STATUS_LABELS[main];
}

export interface OperationalIngredient {
  id: string;
  name: string;
  unit: string;
  unitCost: number;
}

export interface OperationalSku {
  id: string;
  label: string;
  revenuePerUnit: number;
  recipe: Record<string, number>;
}

export const OPERATIONAL_INGREDIENTS: OperationalIngredient[] = [
  { id: 'cream_cheese', name: 'Cream cheese', unit: 'g', unitCost: 0.014 },
  { id: 'biscoff_spread', name: 'Biscoff spread', unit: 'g', unitCost: 0.018 },
  { id: 'eggs', name: 'Eggs', unit: 'pcs', unitCost: 0.42 },
  { id: 'sugar', name: 'Sugar', unit: 'g', unitCost: 0.0015 },
  { id: 'cocoa', name: 'Cocoa powder', unit: 'g', unitCost: 0.032 },
  { id: 'ladyfingers', name: 'Ladyfingers', unit: 'g', unitCost: 0.011 },
  { id: 'mascarpone', name: 'Mascarpone', unit: 'g', unitCost: 0.02 },
  { id: 'espresso', name: 'Espresso', unit: 'ml', unitCost: 0.01 },
  { id: 'brownie_mix', name: 'Brownie base mix', unit: 'g', unitCost: 0.009 },
  { id: 'butter', name: 'Butter', unit: 'g', unitCost: 0.012 },
];

export const QUICK_ADD_SKUS: OperationalSku[] = [
  {
    id: 'biscoff_cheesecake',
    label: 'Biscoff Cheesecake',
    revenuePerUnit: 48,
    recipe: {
      cream_cheese: 700,
      biscoff_spread: 220,
      eggs: 5,
      sugar: 140,
      butter: 120,
    },
  },
  {
    id: 'cheesecake_brownie_tray',
    label: 'Cheesecake Brownie Tray',
    revenuePerUnit: 52,
    recipe: {
      cream_cheese: 420,
      brownie_mix: 460,
      eggs: 4,
      sugar: 180,
      butter: 160,
    },
  },
  {
    id: 'tiramisu_small',
    label: 'Tiramisu Small',
    revenuePerUnit: 30,
    recipe: {
      mascarpone: 300,
      ladyfingers: 190,
      espresso: 220,
      sugar: 80,
      cocoa: 8,
    },
  },
  {
    id: 'tiramisu_large',
    label: 'Tiramisu Large',
    revenuePerUnit: 55,
    recipe: {
      mascarpone: 580,
      ladyfingers: 360,
      espresso: 400,
      sugar: 150,
      cocoa: 14,
    },
  },
];

export interface IngredientWorksheetRow {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  quantityRequired: number;
  unitCost: number;
  extendedCost: number;
}

export interface WorksheetTotals {
  totalIngredientCost: number;
  totalRevenue: number;
  estimatedGrossProfit: number;
}

export function buildIngredientWorksheet(counts: Record<string, number>) {
  const ingredientMap = new Map(
    OPERATIONAL_INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]),
  );

  const usageByIngredient = new Map<string, number>();
  let totalRevenue = 0;

  for (const sku of QUICK_ADD_SKUS) {
    const quantity = counts[sku.id] ?? 0;
    if (quantity <= 0) continue;

    totalRevenue += sku.revenuePerUnit * quantity;

    for (const [ingredientId, amountPerUnit] of Object.entries(sku.recipe)) {
      const current = usageByIngredient.get(ingredientId) ?? 0;
      usageByIngredient.set(ingredientId, current + amountPerUnit * quantity);
    }
  }

  const rows: IngredientWorksheetRow[] = [];
  let totalIngredientCost = 0;

  for (const [ingredientId, quantityRequired] of usageByIngredient.entries()) {
    const ingredient = ingredientMap.get(ingredientId);
    if (!ingredient) continue;

    const extendedCost = quantityRequired * ingredient.unitCost;
    totalIngredientCost += extendedCost;

    rows.push({
      ingredientId,
      ingredientName: ingredient.name,
      unit: ingredient.unit,
      quantityRequired,
      unitCost: ingredient.unitCost,
      extendedCost,
    });
  }

  rows.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));

  return {
    rows,
    totals: {
      totalIngredientCost,
      totalRevenue,
      estimatedGrossProfit: totalRevenue - totalIngredientCost,
    } satisfies WorksheetTotals,
  };
}

export interface ProductVariantSetup {
  id: string;
  label: string;
  priceModifier: number;
}

export interface AdminProductSetup {
  productId: string;
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  price: number;
  available: boolean;
  recipeProfile: string;
  variants: ProductVariantSetup[];
}

function isTiramisuProduct(product: Product) {
  const combined = `${product.name} ${product.name_fr ?? ''}`.toLowerCase();
  return combined.includes('tiramisu') || product.id === 'prod_3';
}

function inferRecipeProfile(product: Product): string {
  const name = product.name.toLowerCase();
  if (name.includes('biscoff')) return 'biscoff-cheesecake';
  if (name.includes('brownie')) return 'cheesecake-brownie';
  if (name.includes('tiramisu')) return 'tiramisu';
  return 'custom';
}

export function createInitialProductSetups(products: Product[]): AdminProductSetup[] {
  return products.map((product) => {
    const variants: ProductVariantSetup[] = isTiramisuProduct(product)
      ? [
          { id: 'small', label: 'Small', priceModifier: 0 },
          { id: 'large', label: 'Large', priceModifier: 25 },
        ]
      : [];

    return {
      productId: product.id,
      nameEn: product.name,
      nameFr: product.name_fr ?? '',
      descriptionEn: product.description,
      descriptionFr: product.description_fr ?? '',
      price: product.price,
      available: product.visible && product.status !== 'sold_out',
      recipeProfile: inferRecipeProfile(product),
      variants,
    };
  });
}
