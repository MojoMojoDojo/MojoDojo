import {
  CORE_OPERATIONS_DATA,
  type CostSummaryModel,
  type IngredientModel,
  type OperationsDataStore,
  type ProductVariantModel,
  type RecipeIngredientModel,
  type RecipeModel,
} from './operationsDataModel';

export interface VariantQuantityInput {
  variantId: string;
  quantity: number;
}

export interface IngredientUsageRow {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  quantityRequired: number;
  unitCost: number;
  extendedCost: number;
}

export interface OperationsCalculationResult {
  rows: IngredientUsageRow[];
  totals: CostSummaryModel;
}

export interface OrderCostCalculation {
  orderItems: VariantQuantityInput[];
  summary: CostSummaryModel;
  ingredientUsage: IngredientUsageRow[];
}

function activeVariantMap(variants: ProductVariantModel[]) {
  return new Map(variants.filter((variant) => variant.active).map((variant) => [variant.id, variant]));
}

function activeIngredientMap(ingredients: IngredientModel[]) {
  return new Map(
    ingredients
      .filter((ingredient) => ingredient.active)
      .map((ingredient) => [ingredient.id, ingredient]),
  );
}

function recipeByVariantMap(recipes: RecipeModel[]) {
  return new Map(recipes.map((recipe) => [recipe.variantId, recipe]));
}

function ingredientsByRecipeMap(recipeIngredients: RecipeIngredientModel[]) {
  const byRecipe = new Map<string, RecipeIngredientModel[]>();

  for (const row of recipeIngredients) {
    const list = byRecipe.get(row.recipeId) ?? [];
    list.push(row);
    byRecipe.set(row.recipeId, list);
  }

  return byRecipe;
}

export function toVariantQuantityInput(counts: Record<string, number>): VariantQuantityInput[] {
  return Object.entries(counts)
    .map(([variantId, quantity]) => ({ variantId, quantity }))
    .filter((item) => item.quantity > 0);
}

export function calculateOperationsSummary(
  input: VariantQuantityInput[],
  data: OperationsDataStore = CORE_OPERATIONS_DATA,
): OperationsCalculationResult {
  const variants = activeVariantMap(data.variants);
  const ingredients = activeIngredientMap(data.ingredients);
  const recipeByVariant = recipeByVariantMap(data.recipes);
  const ingredientsByRecipe = ingredientsByRecipeMap(data.recipeIngredients);

  const ingredientUsage = new Map<string, number>();
  let totalRevenue = 0;

  for (const line of input) {
    if (line.quantity <= 0) continue;

    const variant = variants.get(line.variantId);
    if (!variant) continue;

    totalRevenue += variant.price * line.quantity;

    const recipe = recipeByVariant.get(variant.id);
    if (!recipe) continue;

    const recipeRows = ingredientsByRecipe.get(recipe.id) ?? [];
    for (const recipeIngredient of recipeRows) {
      const current = ingredientUsage.get(recipeIngredient.ingredientId) ?? 0;
      ingredientUsage.set(
        recipeIngredient.ingredientId,
        current + recipeIngredient.quantity * line.quantity,
      );
    }
  }

  const rows: IngredientUsageRow[] = [];
  let totalIngredientCost = 0;

  for (const [ingredientId, quantityRequired] of ingredientUsage.entries()) {
    const ingredient = ingredients.get(ingredientId);
    if (!ingredient) continue;

    const extendedCost = quantityRequired * ingredient.unitCost;
    totalIngredientCost += extendedCost;

    rows.push({
      ingredientId: ingredient.id,
      ingredientName: ingredient.name.en,
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
    },
  };
}

export function calculateOrderCost(
  orderItems: VariantQuantityInput[],
  data: OperationsDataStore = CORE_OPERATIONS_DATA,
): OrderCostCalculation {
  const summary = calculateOperationsSummary(orderItems, data);

  return {
    orderItems,
    summary: summary.totals,
    ingredientUsage: summary.rows,
  };
}
