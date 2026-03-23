export interface LocalizedText {
  en: string;
  fr: string;
}

export type VerificationStatus = 'verified' | 'estimated_draft' | 'needs_manual_verification';

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

export interface AddOnModel {
  id: string;
  productId: string;
  variantIds?: string[];
  code: string;
  name: LocalizedText;
  description: LocalizedText;
  extraPrice: number;
  metadata?: Record<string, number | string | boolean>;
  active: boolean;
}

export interface IngredientModel {
  id: string;
  name: LocalizedText;
  defaultUnit: string;
  active: boolean;
}

export interface UnitCostModel {
  id: string;
  ingredientId: string;
  unit: string;
  costPerUnit: number;
  currency: 'CAD';
  sourceLabel: string;
  verificationStatus: VerificationStatus;
  notes?: string;
  active: boolean;
}

export interface RecipeModel {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  verificationStatus: VerificationStatus;
  notes?: string;
  sourceReference?: string;
}

export interface RecipeIngredientModel {
  recipeId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  verificationStatus: VerificationStatus;
  note?: string;
}

export interface PackagingCostModel {
  id: string;
  variantId: string;
  label: string;
  costPerUnit: number;
  currency: 'CAD';
  verificationStatus: VerificationStatus;
  note?: string;
  active: boolean;
}

export interface SupplierNoteModel {
  id: string;
  ingredientId?: string;
  title: string;
  note: string;
  editable: boolean;
}

export interface EstimatedCostAssumptionModel {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  note: string;
  editable: boolean;
}

export interface ManualVerificationNoteModel {
  id: string;
  scope: 'product' | 'variant' | 'recipe' | 'ingredient' | 'unit_cost' | 'packaging' | 'assumption';
  referenceId: string;
  note: string;
}

export interface CostSummaryModel {
  totalIngredientCost: number;
  totalPackagingCost: number;
  totalEstimatedCost: number;
  totalRevenue: number;
  estimatedGrossProfit: number;
}

export interface OperationsCatalog {
  products: ProductModel[];
  variants: ProductVariantModel[];
  addOns: AddOnModel[];
  ingredients: IngredientModel[];
  recipes: RecipeModel[];
  recipeIngredients: RecipeIngredientModel[];
  unitCosts: UnitCostModel[];
  packagingCosts: PackagingCostModel[];
  supplierNotes: SupplierNoteModel[];
  estimatedCostAssumptions: EstimatedCostAssumptionModel[];
  manualVerificationNotes: ManualVerificationNoteModel[];
  defaultVariantByProductId: Record<string, string>;
}

export const OPERATIONS_PRODUCTS: ProductModel[] = [
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

export const OPERATIONS_VARIANTS: ProductVariantModel[] = [
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

export const OPERATIONS_ADD_ONS: AddOnModel[] = [
  {
    id: 'add_on_marsala_30ml',
    productId: 'prod_3',
    variantIds: ['variant_tiramisu_small', 'variant_tiramisu_large'],
    code: 'MARSALA_30ML',
    name: {
      en: 'Marsala infusion',
      fr: 'Infusion de Marsala',
    },
    description: {
      en: 'Optional Marsala wine infusion for tiramisu.',
      fr: 'Infusion facultative de vin Marsala pour tiramisu.',
    },
    extraPrice: 5,
    metadata: {
      addedMl: 30,
      abvPercent: 18,
    },
    active: true,
  },
];

export const OPERATIONS_INGREDIENTS: IngredientModel[] = [
  { id: 'cream_cheese', name: { en: 'Cream cheese', fr: 'Fromage a la creme' }, defaultUnit: 'g', active: true },
  { id: 'biscoff_spread', name: { en: 'Biscoff spread', fr: 'Tartinade Biscoff' }, defaultUnit: 'g', active: true },
  { id: 'eggs', name: { en: 'Eggs', fr: 'Oeufs' }, defaultUnit: 'pcs', active: true },
  { id: 'sugar', name: { en: 'Sugar', fr: 'Sucre' }, defaultUnit: 'g', active: true },
  { id: 'cocoa', name: { en: 'Cocoa powder', fr: 'Poudre de cacao' }, defaultUnit: 'g', active: true },
  { id: 'ladyfingers', name: { en: 'Ladyfingers', fr: 'Biscuits cuillere' }, defaultUnit: 'g', active: true },
  { id: 'mascarpone', name: { en: 'Mascarpone', fr: 'Mascarpone' }, defaultUnit: 'g', active: true },
  { id: 'espresso', name: { en: 'Espresso', fr: 'Espresso' }, defaultUnit: 'ml', active: true },
  { id: 'brownie_mix', name: { en: 'Brownie base mix', fr: 'Melange a brownie' }, defaultUnit: 'g', active: true },
  { id: 'butter', name: { en: 'Butter', fr: 'Beurre' }, defaultUnit: 'g', active: true },
  { id: 'marsala_wine', name: { en: 'Marsala wine', fr: 'Vin Marsala' }, defaultUnit: 'ml', active: true },
];

export const OPERATIONS_UNIT_COSTS: UnitCostModel[] = [
  { id: 'cost_cream_cheese', ingredientId: 'cream_cheese', unit: 'g', costPerUnit: 0.009, currency: 'CAD', sourceLabel: 'Current internal estimate', verificationStatus: 'needs_manual_verification', active: true },
  { id: 'cost_biscoff_spread', ingredientId: 'biscoff_spread', unit: 'g', costPerUnit: 0.011, currency: 'CAD', sourceLabel: 'Current internal estimate', verificationStatus: 'needs_manual_verification', active: true },
  { id: 'cost_eggs', ingredientId: 'eggs', unit: 'pcs', costPerUnit: 0.4, currency: 'CAD', sourceLabel: 'Current internal estimate', verificationStatus: 'needs_manual_verification', active: true },
  { id: 'cost_sugar', ingredientId: 'sugar', unit: 'g', costPerUnit: 0.0015, currency: 'CAD', sourceLabel: 'Current internal estimate', verificationStatus: 'needs_manual_verification', active: true },
  { id: 'cost_cocoa', ingredientId: 'cocoa', unit: 'g', costPerUnit: 0.032, currency: 'CAD', sourceLabel: 'Current internal estimate', verificationStatus: 'needs_manual_verification', active: true },
  { id: 'cost_ladyfingers', ingredientId: 'ladyfingers', unit: 'g', costPerUnit: 0.011, currency: 'CAD', sourceLabel: 'Temporary estimate from handwritten notes', verificationStatus: 'estimated_draft', notes: 'Verify ladyfinger pack size and true unit conversion.', active: true },
  { id: 'cost_mascarpone', ingredientId: 'mascarpone', unit: 'g', costPerUnit: 0.02, currency: 'CAD', sourceLabel: 'Temporary estimate from handwritten notes', verificationStatus: 'estimated_draft', notes: 'Based on maso bag/bucket estimate, requires supplier invoice confirmation.', active: true },
  { id: 'cost_espresso', ingredientId: 'espresso', unit: 'ml', costPerUnit: 0.01, currency: 'CAD', sourceLabel: 'Current internal estimate', verificationStatus: 'needs_manual_verification', active: true },
  { id: 'cost_brownie_mix', ingredientId: 'brownie_mix', unit: 'g', costPerUnit: 0.009, currency: 'CAD', sourceLabel: 'Temporary estimate from handwritten notes', verificationStatus: 'estimated_draft', notes: 'Draft conversion from tray-level handwritten values.', active: true },
  { id: 'cost_butter', ingredientId: 'butter', unit: 'g', costPerUnit: 0.012, currency: 'CAD', sourceLabel: 'Current internal estimate', verificationStatus: 'needs_manual_verification', active: true },
  { id: 'cost_marsala_wine', ingredientId: 'marsala_wine', unit: 'ml', costPerUnit: 0.08, currency: 'CAD', sourceLabel: 'Current internal estimate', verificationStatus: 'needs_manual_verification', active: true },
];

export const OPERATIONS_RECIPES: RecipeModel[] = [
  {
    id: 'recipe_biscoff_standard',
    productId: 'prod_1',
    variantId: 'variant_biscoff_standard',
    name: 'Biscoff Cheesecake Standard',
    verificationStatus: 'needs_manual_verification',
    notes: 'Working recipe baseline pending final kitchen confirmation.',
  },
  {
    id: 'recipe_brownie_tray_standard',
    productId: 'prod_2',
    variantId: 'variant_brownie_tray_standard',
    name: 'Cheesecake Brownie Tray Standard',
    verificationStatus: 'estimated_draft',
    sourceReference: 'Handwritten ops notes (draft)',
    notes: 'Seeded from handwritten notes and marked as draft until weighed batch is verified.',
  },
  {
    id: 'recipe_tiramisu_small',
    productId: 'prod_3',
    variantId: 'variant_tiramisu_small',
    name: 'Tiramisu Small',
    verificationStatus: 'estimated_draft',
    sourceReference: 'Handwritten ops notes (draft)',
    notes: 'Estimated draft values only. Confirm mascarpone/ladyfinger conversion before finalizing.',
  },
  {
    id: 'recipe_tiramisu_large',
    productId: 'prod_3',
    variantId: 'variant_tiramisu_large',
    name: 'Tiramisu Large',
    verificationStatus: 'estimated_draft',
    sourceReference: 'Handwritten ops notes (draft)',
    notes: 'Estimated draft values only. Confirm with production batch sheet.',
  },
  {
    id: 'recipe_tiramisu_small_alcohol',
    productId: 'prod_3',
    variantId: 'variant_tiramisu_small_alcohol',
    name: 'Tiramisu Small + Marsala',
    verificationStatus: 'estimated_draft',
    sourceReference: 'Handwritten ops notes (draft)',
    notes: 'Same as small tiramisu plus marsala draft amount. Verify alcohol prep workflow.',
  },
  {
    id: 'recipe_tiramisu_large_alcohol',
    productId: 'prod_3',
    variantId: 'variant_tiramisu_large_alcohol',
    name: 'Tiramisu Large + Marsala',
    verificationStatus: 'estimated_draft',
    sourceReference: 'Handwritten ops notes (draft)',
    notes: 'Same as large tiramisu plus marsala draft amount. Verify with next production run.',
  },
];

export const OPERATIONS_RECIPE_INGREDIENTS: RecipeIngredientModel[] = [
  { recipeId: 'recipe_biscoff_standard', ingredientId: 'cream_cheese', quantity: 700, unit: 'g', verificationStatus: 'needs_manual_verification' },
  { recipeId: 'recipe_biscoff_standard', ingredientId: 'biscoff_spread', quantity: 220, unit: 'g', verificationStatus: 'needs_manual_verification' },
  { recipeId: 'recipe_biscoff_standard', ingredientId: 'eggs', quantity: 5, unit: 'pcs', verificationStatus: 'needs_manual_verification' },
  { recipeId: 'recipe_biscoff_standard', ingredientId: 'sugar', quantity: 140, unit: 'g', verificationStatus: 'needs_manual_verification' },
  { recipeId: 'recipe_biscoff_standard', ingredientId: 'butter', quantity: 120, unit: 'g', verificationStatus: 'needs_manual_verification' },

  { recipeId: 'recipe_brownie_tray_standard', ingredientId: 'cream_cheese', quantity: 420, unit: 'g', verificationStatus: 'estimated_draft', note: 'Draft from handwritten notes.' },
  { recipeId: 'recipe_brownie_tray_standard', ingredientId: 'brownie_mix', quantity: 460, unit: 'g', verificationStatus: 'estimated_draft', note: 'Draft from handwritten notes.' },
  { recipeId: 'recipe_brownie_tray_standard', ingredientId: 'eggs', quantity: 4, unit: 'pcs', verificationStatus: 'estimated_draft', note: 'Draft from handwritten notes.' },
  { recipeId: 'recipe_brownie_tray_standard', ingredientId: 'sugar', quantity: 180, unit: 'g', verificationStatus: 'estimated_draft', note: 'Draft from handwritten notes.' },
  { recipeId: 'recipe_brownie_tray_standard', ingredientId: 'butter', quantity: 160, unit: 'g', verificationStatus: 'estimated_draft', note: 'Draft from handwritten notes.' },

  { recipeId: 'recipe_tiramisu_small', ingredientId: 'mascarpone', quantity: 130, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_small', ingredientId: 'ladyfingers', quantity: 90, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify pack conversion.' },
  { recipeId: 'recipe_tiramisu_small', ingredientId: 'espresso', quantity: 110, unit: 'ml', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_small', ingredientId: 'sugar', quantity: 40, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_small', ingredientId: 'cocoa', quantity: 4, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },

  { recipeId: 'recipe_tiramisu_large', ingredientId: 'mascarpone', quantity: 300, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_large', ingredientId: 'ladyfingers', quantity: 190, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify pack conversion.' },
  { recipeId: 'recipe_tiramisu_large', ingredientId: 'espresso', quantity: 220, unit: 'ml', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_large', ingredientId: 'sugar', quantity: 80, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_large', ingredientId: 'cocoa', quantity: 8, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },

  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'mascarpone', quantity: 130, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'ladyfingers', quantity: 90, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify pack conversion.' },
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'espresso', quantity: 110, unit: 'ml', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'sugar', quantity: 40, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'cocoa', quantity: 4, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_small_alcohol', ingredientId: 'marsala_wine', quantity: 30, unit: 'ml', verificationStatus: 'estimated_draft', note: 'Draft add-on amount from notes; verify actual pour.' },

  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'mascarpone', quantity: 300, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'ladyfingers', quantity: 190, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify pack conversion.' },
  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'espresso', quantity: 220, unit: 'ml', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'sugar', quantity: 80, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'cocoa', quantity: 8, unit: 'g', verificationStatus: 'estimated_draft', note: 'Handwritten estimate; verify.' },
  { recipeId: 'recipe_tiramisu_large_alcohol', ingredientId: 'marsala_wine', quantity: 30, unit: 'ml', verificationStatus: 'estimated_draft', note: 'Draft add-on amount from notes; verify actual pour.' },
];

export const OPERATIONS_PACKAGING_COSTS: PackagingCostModel[] = [
  {
    id: 'pack_biscoff_standard',
    variantId: 'variant_biscoff_standard',
    label: 'Cake box + liner',
    costPerUnit: 1.1,
    currency: 'CAD',
    verificationStatus: 'needs_manual_verification',
    note: 'Update when supplier invoice is available.',
    active: true,
  },
  {
    id: 'pack_brownie_tray_standard',
    variantId: 'variant_brownie_tray_standard',
    label: 'Tray + lid + label',
    costPerUnit: 1.4,
    currency: 'CAD',
    verificationStatus: 'estimated_draft',
    note: 'Temporary Costco-style estimate. Replace with official supply quote.',
    active: true,
  },
  {
    id: 'pack_tiramisu_small',
    variantId: 'variant_tiramisu_small',
    label: 'Small tray + lid',
    costPerUnit: 0.95,
    currency: 'CAD',
    verificationStatus: 'estimated_draft',
    note: 'Temporary Costco-style estimate.',
    active: true,
  },
  {
    id: 'pack_tiramisu_large',
    variantId: 'variant_tiramisu_large',
    label: 'Large tray + lid',
    costPerUnit: 1.45,
    currency: 'CAD',
    verificationStatus: 'estimated_draft',
    note: 'Temporary Costco-style estimate.',
    active: true,
  },
  {
    id: 'pack_tiramisu_small_alcohol',
    variantId: 'variant_tiramisu_small_alcohol',
    label: 'Small tray + lid + alcohol warning sticker',
    costPerUnit: 1.05,
    currency: 'CAD',
    verificationStatus: 'estimated_draft',
    note: 'Temporary estimate. Validate sticker/label cost.',
    active: true,
  },
  {
    id: 'pack_tiramisu_large_alcohol',
    variantId: 'variant_tiramisu_large_alcohol',
    label: 'Large tray + lid + alcohol warning sticker',
    costPerUnit: 1.55,
    currency: 'CAD',
    verificationStatus: 'estimated_draft',
    note: 'Temporary estimate. Validate sticker/label cost.',
    active: true,
  },
];

export const OPERATIONS_SUPPLIER_NOTES: SupplierNoteModel[] = [
  {
    id: 'supplier_mascarpone_maso',
    ingredientId: 'mascarpone',
    title: 'Mascarpone (maso) bag/bucket cost assumption',
    note: 'Current unit cost uses draft conversion from handwritten maso bag/bucket values. Replace with exact supplier SKU, pack weight, and invoice cost.',
    editable: true,
  },
  {
    id: 'supplier_ladyfinger_pack',
    ingredientId: 'ladyfingers',
    title: 'Ladyfinger pack size and cost assumption',
    note: 'Unit conversion assumes a temporary pack size. Confirm grams per pack and final landed cost.',
    editable: true,
  },
  {
    id: 'supplier_temp_costco',
    title: 'Temporary Costco-style estimates',
    note: 'Several packaging and pantry costs are placeholders until preferred supplier pricing is finalized.',
    editable: true,
  },
];

export const OPERATIONS_ESTIMATED_COST_ASSUMPTIONS: EstimatedCostAssumptionModel[] = [
  {
    id: 'assumption_costco_bulk_markup',
    label: 'Bulk retail placeholder multiplier',
    value: 1,
    unit: 'x',
    note: 'Set above 1.0 if using temporary shelf estimates that should include handling variance.',
    editable: true,
  },
  {
    id: 'assumption_recipe_waste_factor',
    label: 'Default recipe waste factor',
    value: 0,
    unit: '%',
    note: 'Leave 0 until actual kitchen waste percentages are measured.',
    editable: true,
  },
  {
    id: 'assumption_packaging_contingency',
    label: 'Packaging contingency per unit',
    value: 0,
    unit: 'CAD',
    note: 'Optional buffer used when packaging invoices fluctuate.',
    editable: true,
  },
];

export const OPERATIONS_MANUAL_VERIFICATION_NOTES: ManualVerificationNoteModel[] = [
  {
    id: 'verify_recipe_brownie',
    scope: 'recipe',
    referenceId: 'recipe_brownie_tray_standard',
    note: 'Brownie-cheesecake tray recipe is seeded from handwritten notes and must be validated against a weighed production run.',
  },
  {
    id: 'verify_recipe_tiramisu',
    scope: 'recipe',
    referenceId: 'recipe_tiramisu_large',
    note: 'Tiramisu values are estimates. Do not treat as final until recipe card confirms quantities and yields.',
  },
  {
    id: 'verify_cost_mascarpone',
    scope: 'unit_cost',
    referenceId: 'cost_mascarpone',
    note: 'Mascarpone unit cost is a draft conversion from handwritten maso bag/bucket notes.',
  },
  {
    id: 'verify_cost_ladyfingers',
    scope: 'unit_cost',
    referenceId: 'cost_ladyfingers',
    note: 'Ladyfinger cost per gram is estimated pending pack size and supplier invoice.',
  },
  {
    id: 'verify_packaging_temp_estimates',
    scope: 'packaging',
    referenceId: 'pack_tiramisu_large',
    note: 'Packaging costs include temporary Costco-style estimates and must be updated with contracted pricing.',
  },
];

// Single source of truth for operations data.
// Update products, variants, recipes, costs, and assumptions here.
export const OPERATIONS_CATALOG: OperationsCatalog = {
  products: OPERATIONS_PRODUCTS,
  variants: OPERATIONS_VARIANTS,
  addOns: OPERATIONS_ADD_ONS,
  ingredients: OPERATIONS_INGREDIENTS,
  recipes: OPERATIONS_RECIPES,
  recipeIngredients: OPERATIONS_RECIPE_INGREDIENTS,
  unitCosts: OPERATIONS_UNIT_COSTS,
  packagingCosts: OPERATIONS_PACKAGING_COSTS,
  supplierNotes: OPERATIONS_SUPPLIER_NOTES,
  estimatedCostAssumptions: OPERATIONS_ESTIMATED_COST_ASSUMPTIONS,
  manualVerificationNotes: OPERATIONS_MANUAL_VERIFICATION_NOTES,
  defaultVariantByProductId: {
    prod_1: 'variant_biscoff_standard',
    prod_2: 'variant_brownie_tray_standard',
    prod_3: 'variant_tiramisu_large',
  },
};

export const TIRAMISU_VARIANT_IDS = {
  small: 'variant_tiramisu_small',
  large: 'variant_tiramisu_large',
  small_alcohol: 'variant_tiramisu_small_alcohol',
  large_alcohol: 'variant_tiramisu_large_alcohol',
} as const;

export function getActiveVariants(catalog: OperationsCatalog = OPERATIONS_CATALOG): ProductVariantModel[] {
  return catalog.variants.filter((variant) => variant.active);
}

export function getVariantById(
  variantId: string,
  catalog: OperationsCatalog = OPERATIONS_CATALOG,
): ProductVariantModel | undefined {
  return catalog.variants.find((variant) => variant.id === variantId && variant.active);
}

export function getProductById(
  productId: string,
  catalog: OperationsCatalog = OPERATIONS_CATALOG,
): ProductModel | undefined {
  return catalog.products.find((product) => product.id === productId && product.active);
}

export function getVariantUnitPriceFromCatalog(
  variantId: string,
  fallback = 0,
  catalog: OperationsCatalog = OPERATIONS_CATALOG,
): number {
  return getVariantById(variantId, catalog)?.price ?? fallback;
}

export function getProductBasePriceFromCatalog(
  productId: string,
  fallback = 0,
  catalog: OperationsCatalog = OPERATIONS_CATALOG,
): number {
  const defaultVariantId = catalog.defaultVariantByProductId[productId];
  if (!defaultVariantId) return fallback;
  return getVariantUnitPriceFromCatalog(defaultVariantId, fallback, catalog);
}
