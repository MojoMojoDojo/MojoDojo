import {
  CORE_OPERATIONS_DATA,
  type OperationsDataStore,
  type OrderModel,
  type ProductModel,
  type ProductVariantModel,
} from './operationsDataModel';

export interface OperationsRepository {
  getProducts(): Promise<ProductModel[]>;
  getVariants(): Promise<ProductVariantModel[]>;
  getDataStore(): Promise<OperationsDataStore>;
  getOrders(): Promise<OrderModel[]>;
  createOrder(order: Omit<OrderModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderModel>;
  updateOrder(orderId: string, updates: Partial<OrderModel>): Promise<OrderModel | null>;
}

function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

export class InMemoryOperationsRepository implements OperationsRepository {
  private readonly data: OperationsDataStore;
  private readonly orders: OrderModel[];

  constructor(seedData: OperationsDataStore = CORE_OPERATIONS_DATA, seedOrders: OrderModel[] = []) {
    this.data = {
      products: [...seedData.products],
      variants: [...seedData.variants],
      addOns: [...seedData.addOns],
      ingredients: [...seedData.ingredients],
      recipes: [...seedData.recipes],
      recipeIngredients: [...seedData.recipeIngredients],
      unitCosts: [...seedData.unitCosts],
      packagingCosts: [...seedData.packagingCosts],
      supplierNotes: [...seedData.supplierNotes],
      estimatedCostAssumptions: [...seedData.estimatedCostAssumptions],
      manualVerificationNotes: [...seedData.manualVerificationNotes],
      defaultVariantByProductId: { ...seedData.defaultVariantByProductId },
    };
    this.orders = [...seedOrders];
  }

  async getProducts(): Promise<ProductModel[]> {
    return [...this.data.products];
  }

  async getVariants(): Promise<ProductVariantModel[]> {
    return [...this.data.variants];
  }

  async getDataStore(): Promise<OperationsDataStore> {
    return {
      products: [...this.data.products],
      variants: [...this.data.variants],
      addOns: [...this.data.addOns],
      ingredients: [...this.data.ingredients],
      recipes: [...this.data.recipes],
      recipeIngredients: [...this.data.recipeIngredients],
      unitCosts: [...this.data.unitCosts],
      packagingCosts: [...this.data.packagingCosts],
      supplierNotes: [...this.data.supplierNotes],
      estimatedCostAssumptions: [...this.data.estimatedCostAssumptions],
      manualVerificationNotes: [...this.data.manualVerificationNotes],
      defaultVariantByProductId: { ...this.data.defaultVariantByProductId },
    };
  }

  async getOrders(): Promise<OrderModel[]> {
    return [...this.orders];
  }

  async createOrder(order: Omit<OrderModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderModel> {
    const now = new Date().toISOString();
    const created: OrderModel = {
      ...order,
      id: createId('ord'),
      createdAt: now,
      updatedAt: now,
    };

    this.orders.push(created);
    return created;
  }

  async updateOrder(orderId: string, updates: Partial<OrderModel>): Promise<OrderModel | null> {
    const index = this.orders.findIndex((order) => order.id === orderId);
    if (index < 0) return null;

    const current = this.orders[index];
    const next: OrderModel = {
      ...current,
      ...updates,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    this.orders[index] = next;
    return next;
  }
}

export const operationsRepository: OperationsRepository = new InMemoryOperationsRepository();
