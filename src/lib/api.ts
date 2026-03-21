import type { Product, Order, Ingredient, GalleryItem } from './supabase';
import { supabase, supabaseFunctionAnonKey, supabaseUrl } from './supabase';

const API_BASE = `${supabaseUrl}/functions/v1/make-server-44229999`;

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

type OrderRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: Order['status'];
  total: number;
  payment_method?: Order['payment_method'];
  payment_status?: Order['payment_status'];
  delivery_type: Order['delivery_type'];
  delivery_address?: string | null;
  preferred_datetime?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  customization?: unknown;
};

function sortOrdersNewestFirst(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function mapOrderRowsToOrders(orderRows: OrderRow[], itemRows: OrderItemRow[]): Order[] {
  const itemsByOrder = new Map<string, OrderItemRow[]>();

  for (const item of itemRows) {
    const existing = itemsByOrder.get(item.order_id) ?? [];
    existing.push(item);
    itemsByOrder.set(item.order_id, existing);
  }

  return sortOrdersNewestFirst(
    orderRows.map((row) => ({
      id: row.id,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      status: row.status,
      total: row.total,
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      delivery_type: row.delivery_type,
      delivery_address: row.delivery_address ?? undefined,
      preferred_datetime: row.preferred_datetime ?? undefined,
      notes: row.notes ?? undefined,
      items: (itemsByOrder.get(row.id) ?? []).map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        customization: (item.customization as Order['items'][number]['customization']) ?? undefined,
      })),
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
  );
}

async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${options.token || supabaseFunctionAnonKey}`,
  };

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API call error for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Initialization
  async initialize() {
    return apiCall('/init', { method: 'POST' });
  },

  // Auth
  auth: {
    async signup(email: string, password: string, name: string, role: string) {
      return apiCall('/auth/signup', {
        method: 'POST',
        body: { email, password, name, role }
      });
    },

    async getUser(token: string) {
      return apiCall('/auth/user', { token });
    }
  },

  // Products
  products: {
    async getAll(): Promise<{ products: Product[] }> {
      return apiCall('/products');
    },

    async getById(id: string): Promise<{ product: Product }> {
      return apiCall(`/products/${id}`);
    },

    async create(product: Partial<Product>, token: string) {
      return apiCall('/products', {
        method: 'POST',
        body: product,
        token
      });
    }
  },

  // Orders
  orders: {
    async getAll(token?: string): Promise<{ orders: Order[] }> {
      const authClient = token ? supabase.auth.setSession : null;
      if (authClient) {
        // Keep API compatible without forcing session changes.
      }

      const { data: orderRows, error: ordersError } = await supabase
        .from('orders')
        .select(
          'id, customer_name, customer_email, customer_phone, status, total, payment_method, payment_status, delivery_type, delivery_address, preferred_datetime, notes, created_at, updated_at',
        )
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw new Error(ordersError.message || 'Failed to fetch orders');
      }

      const ids = (orderRows ?? []).map((row) => row.id);
      if (ids.length === 0) {
        return { orders: [] };
      }

      const { data: itemRows, error: itemsError } = await supabase
        .from('order_items')
        .select('order_id, product_id, product_name, quantity, price, customization')
        .in('order_id', ids);

      if (itemsError) {
        throw new Error(itemsError.message || 'Failed to fetch order items');
      }

      const orders = mapOrderRowsToOrders((orderRows ?? []) as OrderRow[], (itemRows ?? []) as OrderItemRow[]);
      return { orders };
    },

    async create(order: Partial<Order>) {
      const now = new Date().toISOString();
      const orderPayload = {
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        status: order.status ?? 'request_received',
        total: order.total ?? 0,
        payment_method: order.payment_method ?? 'arranged_after_approval',
        payment_status: order.payment_status ?? 'arranged',
        delivery_type: order.delivery_type ?? 'pickup',
        delivery_address: order.delivery_address ?? null,
        preferred_datetime: order.preferred_datetime ?? null,
        notes: order.notes ?? null,
        created_at: now,
        updated_at: now,
      };

      const { data: insertedOrder, error: orderInsertError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select(
          'id, customer_name, customer_email, customer_phone, status, total, payment_method, payment_status, delivery_type, delivery_address, preferred_datetime, notes, created_at, updated_at',
        )
        .single();

      if (orderInsertError || !insertedOrder) {
        throw new Error(orderInsertError?.message || 'Failed to save order');
      }

      const orderItems = Array.isArray(order.items) ? order.items : [];
      const itemPayload = orderItems.map((item) => ({
        order_id: insertedOrder.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization ?? null,
      }));

      if (itemPayload.length > 0) {
        const { error: itemsInsertError } = await supabase.from('order_items').insert(itemPayload);

        if (itemsInsertError) {
          await supabase.from('orders').delete().eq('id', insertedOrder.id);
          throw new Error(itemsInsertError.message || 'Failed to save order items');
        }
      }

      const createdOrder: Order = {
        ...insertedOrder,
        delivery_address: insertedOrder.delivery_address ?? undefined,
        preferred_datetime: insertedOrder.preferred_datetime ?? undefined,
        notes: insertedOrder.notes ?? undefined,
        items: orderItems,
      } as Order;

      return { order: createdOrder, success: true };
    },

    async update(id: string, updates: Partial<Order>, token: string) {
      const status = updates.status;
      if (status && !['request_received', 'under_review', 'accepted', 'rejected'].includes(status)) {
        throw new Error('Invalid status update');
      }

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          ...(status ? { status } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          'id, customer_name, customer_email, customer_phone, status, total, payment_method, payment_status, delivery_type, delivery_address, preferred_datetime, notes, created_at, updated_at',
        )
        .single();

      if (updateError || !updatedOrder) {
        throw new Error(updateError?.message || 'Failed to update order');
      }

      const { data: itemRows, error: itemsError } = await supabase
        .from('order_items')
        .select('order_id, product_id, product_name, quantity, price, customization')
        .eq('order_id', id);

      if (itemsError) {
        throw new Error(itemsError.message || 'Failed to fetch updated order items');
      }

      const mapped = mapOrderRowsToOrders([updatedOrder as OrderRow], (itemRows ?? []) as OrderItemRow[]);
      return { order: mapped[0], success: true, tokenUsed: !!token };
    }
  },

  // Ingredients
  ingredients: {
    async getAll(token: string): Promise<{ ingredients: Ingredient[] }> {
      return apiCall('/ingredients', { token });
    },

    async update(id: string, updates: Partial<Ingredient>, token: string) {
      return apiCall(`/ingredients/${id}`, {
        method: 'PUT',
        body: updates,
        token
      });
    }
  },

  // Gallery
  gallery: {
    async getAll(): Promise<{ items: GalleryItem[] }> {
      return apiCall('/gallery');
    }
  }
};
