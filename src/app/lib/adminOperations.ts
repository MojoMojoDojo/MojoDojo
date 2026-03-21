import type { Product } from '../../lib/supabase';
import { calculateOperationsSummary } from './operationsCalculator';
import { CORE_OPERATIONS_DATA } from './operationsDataModel';
import {
  getTiramisuSizeExtraPrice,
  getVariantUnitPrice,
  TIRAMISU_VARIANT_IDS,
} from './pricing';

export type MainOrderStatus = 'all' | 'request_received' | 'under_review' | 'accepted' | 'rejected';

export const MAIN_ORDER_STATUS_LABELS: Record<MainOrderStatus, string> = {
  all: 'All',
  request_received: 'Request received',
  under_review: 'Under review',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const MAIN_STATUS_VALUES: Exclude<MainOrderStatus, 'all'>[] = [
  'request_received',
  'under_review',
  'accepted',
  'rejected',
];

export function toMainOrderStatus(status: string): Exclude<MainOrderStatus, 'all'> {
  return MAIN_STATUS_VALUES.includes(status as Exclude<MainOrderStatus, 'all'>)
    ? (status as Exclude<MainOrderStatus, 'all'>)
    : 'under_review';
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
  variantId: string;
  label: string;
  revenuePerUnit: number;
  recipe: Record<string, number>;
}

export const OPERATIONAL_INGREDIENTS: OperationalIngredient[] = CORE_OPERATIONS_DATA.ingredients.map((ingredient) => ({
  id: ingredient.id,
  name: ingredient.name.en,
  unit: ingredient.unit,
  unitCost: ingredient.unitCost,
}));

function recipeForVariant(variantId: string): Record<string, number> {
  const recipe = CORE_OPERATIONS_DATA.recipes.find((row) => row.variantId === variantId);
  if (!recipe) return {};

  const rows = CORE_OPERATIONS_DATA.recipeIngredients.filter((row) => row.recipeId === recipe.id);
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.ingredientId] = row.quantity;
    return acc;
  }, {});
}

export const QUICK_ADD_SKUS: OperationalSku[] = [
  {
    id: 'biscoff_cheesecake',
    variantId: 'variant_biscoff_standard',
    label: 'Biscoff Cheesecake',
    revenuePerUnit: getVariantUnitPrice('variant_biscoff_standard', 15),
    recipe: recipeForVariant('variant_biscoff_standard'),
  },
  {
    id: 'cheesecake_brownie_tray',
    variantId: 'variant_brownie_tray_standard',
    label: 'Cheesecake Brownie Tray',
    revenuePerUnit: getVariantUnitPrice('variant_brownie_tray_standard', 25),
    recipe: recipeForVariant('variant_brownie_tray_standard'),
  },
  {
    id: 'tiramisu_small',
    variantId: 'variant_tiramisu_small',
    label: 'Tiramisu Small',
    revenuePerUnit: getVariantUnitPrice(TIRAMISU_VARIANT_IDS.small, 10),
    recipe: recipeForVariant('variant_tiramisu_small'),
  },
  {
    id: 'tiramisu_large',
    variantId: 'variant_tiramisu_large',
    label: 'Tiramisu Large',
    revenuePerUnit: getVariantUnitPrice(TIRAMISU_VARIANT_IDS.large, 25),
    recipe: recipeForVariant('variant_tiramisu_large'),
  },
  {
    id: 'tiramisu_small_alcohol',
    variantId: 'variant_tiramisu_small_alcohol',
    label: 'Tiramisu Small + Marsala',
    revenuePerUnit: getVariantUnitPrice(TIRAMISU_VARIANT_IDS.small_alcohol, 15),
    recipe: recipeForVariant('variant_tiramisu_small_alcohol'),
  },
  {
    id: 'tiramisu_large_alcohol',
    variantId: 'variant_tiramisu_large_alcohol',
    label: 'Tiramisu Large + Marsala',
    revenuePerUnit: getVariantUnitPrice(TIRAMISU_VARIANT_IDS.large_alcohol, 30),
    recipe: recipeForVariant('variant_tiramisu_large_alcohol'),
  },
];

export interface IngredientWorksheetRow {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  quantityRequired: number;
  quantityRequiredDisplay: string;
  unitCost: number;
  extendedCost: number;
}

export interface WorksheetTotals {
  totalIngredientCost: number;
  totalRevenue: number;
  estimatedGrossProfit: number;
}

export function buildIngredientWorksheet(counts: Record<string, number>) {
  const lines = QUICK_ADD_SKUS.map((sku) => ({
    variantId: sku.variantId,
    quantity: counts[sku.id] ?? 0,
  }));

  const summary = calculateOperationsSummary(lines, CORE_OPERATIONS_DATA);

  const rows: IngredientWorksheetRow[] = summary.rows.map((row) => ({
    ingredientId: row.ingredientId,
    ingredientName: row.ingredientName,
    unit: row.unit,
    quantityRequired: row.quantityRequired,
    quantityRequiredDisplay: `${row.quantityRequired.toFixed(2)} ${row.unit}`,
    unitCost: row.unitCost,
    extendedCost: row.extendedCost,
  }));

  return {
    rows,
    totals: {
      totalIngredientCost: summary.totals.totalIngredientCost,
      totalRevenue: summary.totals.totalRevenue,
      estimatedGrossProfit: summary.totals.estimatedGrossProfit,
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
          { id: 'small', label: 'Small', priceModifier: getTiramisuSizeExtraPrice('small', product.price) },
          { id: 'large', label: 'Large', priceModifier: getTiramisuSizeExtraPrice('large', product.price) },
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
