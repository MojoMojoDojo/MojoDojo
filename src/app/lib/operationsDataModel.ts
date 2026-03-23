import type { LocalizedText } from './operationsCatalog';

export {
  OPERATIONS_CATALOG as CORE_OPERATIONS_DATA,
  OPERATIONS_INGREDIENTS as CORE_INGREDIENTS,
  OPERATIONS_PRODUCTS as CORE_PRODUCTS,
  OPERATIONS_RECIPES as CORE_RECIPES,
  OPERATIONS_RECIPE_INGREDIENTS as CORE_RECIPE_INGREDIENTS,
  OPERATIONS_VARIANTS as CORE_VARIANTS,
  TIRAMISU_VARIANT_IDS,
  getProductBasePriceFromCatalog,
  getProductById,
  getVariantById,
  getVariantUnitPriceFromCatalog,
  type AddOnModel,
  type EstimatedCostAssumptionModel,
  type IngredientModel,
  type ManualVerificationNoteModel,
  type OperationsCatalog as OperationsDataStore,
  type PackagingCostModel,
  type ProductModel,
  type ProductVariantModel,
  type RecipeIngredientModel,
  type RecipeModel,
  type SupplierNoteModel,
  type UnitCostModel,
  type VerificationStatus,
} from './operationsCatalog';

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
  totalPackagingCost: number;
  totalEstimatedCost: number;
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

export type { LocalizedText };

