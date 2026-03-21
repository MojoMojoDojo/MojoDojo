export interface LocalizedText {
  en: string;
  fr: string;
}

export interface ProductModel {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  category: LocalizedText;
  imageUrls: string[];
  active: boolean;
}

export interface ProductVariantModel {
  id: string;
  productId: string;
  code: string;
  name: LocalizedText;
  servingSize: LocalizedText;
  price: number;
  imageUrl?: string;
  active: boolean;
}

export interface IngredientModel {
  id: string;
  name: LocalizedText;
  unit: string;
  unitCost: number;
  active: boolean;
}

export interface RecipeModel {
  id: string;
  productId: string;
  variantId: string;
  notes?: string;
}

export interface RecipeIngredientModel {
  recipeId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
}

export type OrderStatus = 'request_received' | 'under_review' | 'accepted' | 'rejected';

export const ORDER_STATUS_LABELS: Record<OrderStatus, LocalizedText> = {
  request_received: {
    en: 'Request received',
    fr: 'Demande recue',
  },
  under_review: {
    en: 'Under review',
    fr: 'En cours de revision',
  },
  accepted: {
    en: 'Accepted',
    fr: 'Acceptee',
  },
  rejected: {
    en: 'Rejected',
    fr: 'Refusee',
  },
};

export interface OrderItemModel {
  variantId: string;
  quantity: number;
  unitPrice: number;
}

export interface CostSummaryModel {
  totalIngredientCost: number;
  totalRevenue: number;
  estimatedGrossProfit: number;
}

export interface OrderModel {
  id: string;
  status: OrderStatus;
  items: OrderItemModel[];
  costSummary?: CostSummaryModel;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export const CORE_PRODUCTS: ProductModel[] = [
  {
    id: 'prod_1',
    slug: 'biscoff-cheesecake',
    name: {
      en: 'Biscoff Cheesecake',
      fr: 'Gateau au fromage Biscoff',
    },
    description: {
      en: 'Creamy cheesecake with Biscoff cookie flavor.',
      fr: 'Gateau au fromage cremeux au gout de biscuits Biscoff.',
    },
    category: {
      en: 'Cheesecake',
      fr: 'Gateau au fromage',
    },
    imageUrls: ['https://images.unsplash.com/photo-1542826438-bd32f43d626f'],
    active: true,
  },
  {
    id: 'prod_2',
    slug: 'cheesecake-brownie-tray',
    name: {
      en: 'Cheesecake Brownie Tray',
      fr: 'Plateau brownie au fromage',
    },
    description: {
      en: 'Chocolate brownie tray with cheesecake swirls.',
      fr: 'Plateau brownie au chocolat avec marbrure de fromage.',
    },
    category: {
      en: 'Tray dessert',
      fr: 'Dessert en plateau',
    },
    imageUrls: ['https://images.unsplash.com/photo-1606313564200-e75d5e30476c'],
    active: true,
  },
  {
    id: 'prod_3',
    slug: 'tiramisu-tray',
    name: {
      en: 'Tiramisu Tray',
      fr: 'Plateau tiramisu',
    },
    description: {
      en: 'Coffee-forward tiramisu with mascarpone cream.',
      fr: 'Tiramisu aux notes de cafe et creme mascarpone.',
    },
    category: {
      en: 'Tray dessert',
      fr: 'Dessert en plateau',
    },
    imageUrls: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9'],
    active: true,
  },
];

export const CORE_VARIANTS: ProductVariantModel[] = [
  {
    id: 'variant_biscoff_standard',
    productId: 'prod_1',
    code: 'BISCOFF_STANDARD',
    name: {
      en: 'Biscoff Cheesecake',
      fr: 'Gateau au fromage Biscoff',
    },
    servingSize: {
      en: 'Whole cake',
      fr: 'Gateau entier',
    },
    price: 15,
    imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f',
    active: true,
  },
  {
    id: 'variant_brownie_tray_standard',
    productId: 'prod_2',
    code: 'BROWNIE_TRAY_STANDARD',
    name: {
      en: 'Cheesecake Brownie Tray',
      fr: 'Plateau brownie au fromage',
    },
    servingSize: {
      en: '12 pieces',
      fr: '12 morceaux',
    },
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
    active: true,
  },
  {
    id: 'variant_tiramisu_small',
    productId: 'prod_3',
    code: 'TIRAMISU_SMALL',
    name: {
      en: 'Tiramisu Small',
      fr: 'Tiramisu petit',
    },
    servingSize: {
      en: 'Small (4 pieces)',
      fr: 'Petit (4 morceaux)',
    },
    price: 10,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
    active: true,
  },
  {
    id: 'variant_tiramisu_large',
    productId: 'prod_3',
    code: 'TIRAMISU_LARGE',
    name: {
      en: 'Tiramisu Large',
      fr: 'Tiramisu grand',
    },
    servingSize: {
      en: 'Large (12 pieces)',
      fr: 'Grand (12 morceaux)',
    },
    price: 25,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
    active: true,
  },
  {
    id: 'variant_tiramisu_small_alcohol',
    productId: 'prod_3',
    code: 'TIRAMISU_SMALL_ALCOHOL',
    name: {
      en: 'Tiramisu Small + Marsala',
      fr: 'Tiramisu petit + Marsala',
    },
    servingSize: {
      en: 'Small (4 pieces) with marsala',
      fr: 'Petit (4 morceaux) avec marsala',
    },
    price: 15,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
    active: true,
  },
  {
    id: 'variant_tiramisu_large_alcohol',
    productId: 'prod_3',
    code: 'TIRAMISU_LARGE_ALCOHOL',
    name: {
      en: 'Tiramisu Large + Marsala',
      fr: 'Tiramisu grand + Marsala',
    },
    servingSize: {
      en: 'Large (12 pieces) with marsala',
      fr: 'Grand (12 morceaux) avec marsala',
    },
    price: 30,
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
    active: true,
  },
];

export const CORE_INGREDIENTS: IngredientModel[] = [
  { id: 'cream_cheese', name: { en: 'Cream cheese', fr: 'Fromage a la creme' }, unit: 'g', unitCost: 0.009, active: true },
  { id: 'biscoff_spread', name: { en: 'Biscoff spread', fr: 'Tartinade Biscoff' }, unit: 'g', unitCost: 0.011, active: true },
  { id: 'eggs', name: { en: 'Eggs', fr: 'Oeufs' }, unit: 'pcs', unitCost: 0.40, active: true },
  { id: 'sugar', name: { en: 'Sugar', fr: 'Sucre' }, unit: 'g', unitCost: 0.0015, active: true },
  { id: 'cocoa', name: { en: 'Cocoa powder', fr: 'Poudre de cacao' }, unit: 'g', unitCost: 0.032, active: true },
  { id: 'ladyfingers', name: { en: 'Ladyfingers', fr: 'Biscuits cuillere' }, unit: 'g', unitCost: 0.011, active: true },
  { id: 'mascarpone', name: { en: 'Mascarpone', fr: 'Mascarpone' }, unit: 'g', unitCost: 0.020, active: true },
  { id: 'espresso', name: { en: 'Espresso', fr: 'Espresso' }, unit: 'ml', unitCost: 0.010, active: true },
  { id: 'brownie_mix', name: { en: 'Brownie base mix', fr: 'Melange a brownie' }, unit: 'g', unitCost: 0.009, active: true },
  { id: 'butter', name: { en: 'Butter', fr: 'Beurre' }, unit: 'g', unitCost: 0.012, active: true },
  { id: 'marsala_wine', name: { en: 'Marsala wine', fr: 'Vin Marsala' }, unit: 'ml', unitCost: 0.08, active: true },
];

export const CORE_RECIPES: RecipeModel[] = [
  {
    id: 'recipe_biscoff_standard',
    productId: 'prod_1',
    variantId: 'variant_biscoff_standard',
  },
  {
    id: 'recipe_brownie_tray_standard',
    productId: 'prod_2',
    variantId: 'variant_brownie_tray_standard',
  },
  {
    id: 'recipe_tiramisu_small',
    productId: 'prod_3',
    variantId: 'variant_tiramisu_small',
  },
  {
    id: 'recipe_tiramisu_large',
    productId: 'prod_3',
    variantId: 'variant_tiramisu_large',
  },
  {
    id: 'recipe_tiramisu_small_alcohol',
    productId: 'prod_3',
    variantId: 'variant_tiramisu_small_alcohol',
  },
  {
    id: 'recipe_tiramisu_large_alcohol',
    productId: 'prod_3',
    variantId: 'variant_tiramisu_large_alcohol',
  },
];

export const CORE_RECIPE_INGREDIENTS: RecipeIngredientModel[] = [
  { recipeId: 'recipe_biscoff_standard', ingredientId: 'cream_cheese', quantity: 700, unit: 'g' },
  { recipeId: 'recipe_biscoff_standard', ingredientId: 'biscoff_spread', quantity: 220, unit: 'g' },
  { recipeId: 'recipe_biscoff_standard', ingredientId: 'eggs', quantity: 5, unit: 'pcs' },
  { recipeId: 'recipe_biscoff_standard', ingredientId: 'sugar', quantity: 140, unit: 'g' },
  { recipeId: 'recipe_biscoff_standard', ingredientId: 'butter', quantity: 120, unit: 'g' },

  { recipeId: 'recipe_brownie_tray_standard', ingredientId: 'cream_cheese', quantity: 420, unit: 'g' },
  { recipeId: 'recipe_brownie_tray_standard', ingredientId: 'brownie_mix', quantity: 460, unit: 'g' },
  { recipeId: 'recipe_brownie_tray_standard', ingredientId: 'eggs', quantity: 4, unit: 'pcs' },
  { recipeId: 'recipe_brownie_tray_standard', ingredientId: 'sugar', quantity: 180, unit: 'g' },
  { recipeId: 'recipe_brownie_tray_standard', ingredientId: 'butter', quantity: 160, unit: 'g' },

  { recipeId: 'recipe_tiramisu_small', ingredientId: 'mascarpone', quantity: 130, unit: 'g' },
  { recipeId: 'recipe_tiramisu_small', ingredientId: 'ladyfingers', quantity: 90, unit: 'g' },
  { recipeId: 'recipe_tiramisu_small', ingredientId: 'espresso', quantity: 110, unit: 'ml' },
  { recipeId: 'recipe_tiramisu_small', ingredientId: 'sugar', quantity: 40, unit: 'g' },
  { recipeId: 'recipe_tiramisu_small', ingredientId: 'cocoa', quantity: 4, unit: 'g' },

  { recipeId: 'recipe_tiramisu_large', ingredientId: 'mascarpone', quantity: 300, unit: 'g' },
  { recipeId: 'recipe_tiramisu_large', ingredientId: 'ladyfingers', quantity: 190, unit: 'g' },
  { recipeId: 'recipe_tiramisu_large', ingredientId: 'espresso', quantity: 220, unit: 'ml' },
  { recipeId: 'recipe_tiramisu_large', ingredientId: 'sugar', quantity: 80, unit: 'g' },
  { recipeId: 'recipe_tiramisu_large', ingredientId: 'cocoa', quantity: 8, unit: 'g' },

  // Marsala add-on for tiramisu with alcohol (30ml as per premium add-on)
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'mascarpone', quantity: 130, unit: 'g' },
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'ladyfingers', quantity: 90, unit: 'g' },
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'espresso', quantity: 110, unit: 'ml' },
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'sugar', quantity: 40, unit: 'g' },
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'cocoa', quantity: 4, unit: 'g' },
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'marsala_wine', quantity: 30, unit: 'ml' },

  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'mascarpone', quantity: 300, unit: 'g' },
  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'ladyfingers', quantity: 190, unit: 'g' },
  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'espresso', quantity: 220, unit: 'ml' },
  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'sugar', quantity: 80, unit: 'g' },
  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'cocoa', quantity: 8, unit: 'g' },
  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'marsala_wine', quantity: 30, unit: 'ml' },
];

export interface OperationsDataStore {
  products: ProductModel[];
  variants: ProductVariantModel[];
  ingredients: IngredientModel[];
  recipes: RecipeModel[];
  recipeIngredients: RecipeIngredientModel[];
}

export const CORE_OPERATIONS_DATA: OperationsDataStore = {
  products: CORE_PRODUCTS,
  variants: CORE_VARIANTS,
  ingredients: CORE_INGREDIENTS,
  recipes: CORE_RECIPES,
  recipeIngredients: CORE_RECIPE_INGREDIENTS,
};
