import { createClient } from '@supabase/supabase-js';
import type { Product, Order, Ingredient, GalleryItem } from './supabase';
import { supabase, supabaseAnonKey, supabaseFunctionAnonKey, supabaseUrl } from './supabase';

const API_BASE = `${supabaseUrl}/functions/v1/make-server-44229999`;

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

type OrderCreatePayload = Partial<Order> & {
  fulfillment_type?: 'pickup' | 'delivery';
  requested_date?: string;
  requested_time?: string;
  preferred_date?: string;
  preferred_time?: string;
  special_instructions?: string;
  subtotal?: number;
};

type OrderRow = {
  id: string;
  display_id?: number | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: Order['status'];
  total: number;
  payment_method?: Order['payment_method'];
  payment_status?: Order['payment_status'];
  fulfillment_status?: Order['fulfillment_status'];
  delivery_type: Order['delivery_type'];
  delivery_address?: string | null;
  preferred_datetime?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function withFallbackValue(row: Record<string, unknown>, column: string, orderId: string): Record<string, unknown> {
  const quantity = Number(row.quantity ?? 1) || 1;
  const unitPrice = Number(row.unit_price ?? row.price ?? 0) || 0;
  const productName = String(row.product_name_en ?? row.product_name ?? row.product_id ?? 'Item');
  const baseSlug = String(row.product_slug ?? row.product_id ?? productName);

  switch (column) {
    case 'order_id':
      return { ...row, order_id: orderId };
    case 'product_slug':
      return { ...row, product_slug: slugify(baseSlug) };
    case 'product_name':
      return { ...row, product_name: productName };
    case 'product_name_en':
      return { ...row, product_name_en: productName };
    case 'product_name_fr':
      return { ...row, product_name_fr: productName };
    case 'product_id':
      return { ...row, product_id: String(row.product_id ?? slugify(baseSlug)) };
    case 'quantity':
      return { ...row, quantity: 1 };
    case 'price':
      return { ...row, price: unitPrice };
    case 'unit_price':
      return { ...row, unit_price: unitPrice };
    case 'line_total':
      return { ...row, line_total: Number((unitPrice * quantity).toFixed(2)) };
    case 'variant_key':
      return { ...row, variant_key: 'default' };
    case 'variant_name_en':
      return { ...row, variant_name_en: 'Default' };
    case 'variant_name_fr':
      return { ...row, variant_name_fr: 'Default' };
    default:
      return { ...row, [column]: '' };
  }
}

async function insertOrderItemsWithCompatibility(orderId: string, items: Order['items']) {
  let payload: Array<Record<string, unknown>> = items.map((item) => {
    const quantity = Number(item.quantity ?? 1) || 1;
    const unitPrice = Number(item.price ?? 0) || 0;
    const name = String(item.product_name ?? 'Item');
    const productSlug = slugify(item.product_id || name);

    return {
      order_id: orderId,
      product_id: item.product_id,
      product_slug: productSlug,
      product_name: name,
      product_name_en: name,
      product_name_fr: name,
      variant_key: 'default',
      variant_name_en: 'Default',
      variant_name_fr: 'Default',
      quantity,
      price: unitPrice,
      unit_price: unitPrice,
      line_total: Number((unitPrice * quantity).toFixed(2)),
      customization: item.customization ?? null,
    };
  });

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { error } = await supabase.from('order_items').insert(payload);

    if (!error) {
      return;
    }

    const message = error.message ?? '';
    const missingColumn = message.match(/column "([a-zA-Z0-9_]+)" of relation "order_items" does not exist/i)?.[1];
    if (missingColumn) {
      payload = payload.map((row) => {
        const { [missingColumn]: _removed, ...rest } = row;
        return rest;
      });
      continue;
    }

    const nullColumn = message.match(/null value in column "([a-zA-Z0-9_]+)"/i)?.[1];
    if (nullColumn) {
      payload = payload.map((row) => withFallbackValue(row, nullColumn, orderId));
      continue;
    }

    throw new Error(message || 'Failed to save order items');
  }

  throw new Error('Failed to save order items after compatibility retries');
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
      display_id: row.display_id ?? undefined,
      customer_name: row.customer_name ?? row.full_name ?? '',
      customer_email: row.customer_email ?? row.email ?? '',
      customer_phone: row.customer_phone ?? row.phone ?? '',
      status: row.status,
      total: Number(row.total ?? 0),
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      fulfillment_status: row.fulfillment_status,
      delivery_type: row.delivery_type,
      delivery_address: row.delivery_address ?? undefined,
      preferred_datetime: row.preferred_datetime ?? undefined,
      notes: row.notes ?? undefined,
      internal_notes: row.internal_notes ?? undefined,
      items: (itemsByOrder.get(row.id) ?? []).map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: Number(item.quantity ?? 0),
        price: Number(item.price ?? 0),
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

function getSupabaseForToken(token?: string) {
  if (!token) {
    return supabase;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export const api = {
  // Initialization
  async initialize() {
    return apiCall('/init', { method: 'POST' });
  },

  // Auth
  auth: {
    async getUser(token: string) {
      return apiCall('/auth/user', { token });
    }
  },

  users: {
    async getAll(token: string): Promise<{
      users: Array<{ id: string; email: string; full_name?: string; role: 'admin' | 'worker'; created_at?: string }>;
    }> {
      const db = getSupabaseForToken(token);

      const { data, error } = await db
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch users. Check profiles select policy for admin users.');
      }

      const users = (data ?? []).map((row) => ({
        id: String(row.id ?? ''),
        email: String(row.email ?? ''),
        full_name: row.full_name ? String(row.full_name) : undefined,
        role: (row.role === 'admin' ? 'admin' : 'worker') as 'admin' | 'worker',
        created_at: row.created_at ? String(row.created_at) : undefined,
      }));

      return { users };
    },

    async create(payload: { email: string; password: string; name?: string; role: 'admin' | 'worker' }, token: string) {
      return apiCall('/auth/signup', {
        method: 'POST',
        body: payload,
        token,
      });
    },
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
      const db = getSupabaseForToken(token);

      let orderRows: any[] | null = null;
      let ordersError: { message?: string } | null = null;

      const response = await db
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      orderRows = response.data;
      ordersError = response.error;

      if (ordersError) {
        throw new Error(ordersError.message || 'Failed to fetch orders');
      }

      const ids = (orderRows ?? []).map((row) => row.id);
      if (ids.length === 0) {
        return { orders: [] };
      }

      const { data: itemRows, error: itemsError } = await db
        .from('order_items')
        .select('order_id, product_id, product_name, quantity, price, customization')
        .in('order_id', ids);

      if (itemsError) {
        throw new Error(itemsError.message || 'Failed to fetch order items');
      }

      const orders = mapOrderRowsToOrders((orderRows ?? []) as OrderRow[], (itemRows ?? []) as OrderItemRow[]);
      return { orders };
    },

    async create(order: OrderCreatePayload) {
      const now = new Date().toISOString();
      const generatedOrderId = crypto.randomUUID();
      const fulfillmentType = order.fulfillment_type ?? order.delivery_type ?? 'pickup';
      const requestedDate = order.requested_date ?? order.preferred_date ?? order.preferred_datetime?.slice(0, 10) ?? null;
      const requestedTime = order.requested_time ?? order.preferred_time ?? order.preferred_datetime?.slice(11, 16) ?? null;
      const specialInstructions = order.special_instructions ?? order.notes ?? null;
      const subtotal = order.subtotal ?? order.total ?? 0;

      const modernOrderPayload = {
        id: generatedOrderId,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        status: order.status ?? 'request_received',
        subtotal,
        total: order.total ?? 0,
        payment_method: order.payment_method ?? 'arranged_after_approval',
        payment_status: order.payment_status ?? 'pending',
        fulfillment_status: order.fulfillment_status ?? 'not_started',
        fulfillment_type: fulfillmentType,
        delivery_type: fulfillmentType,
        delivery_address: order.delivery_address ?? null,
        requested_date: requestedDate,
        preferred_date: requestedDate,
        requested_time: requestedTime,
        preferred_time: requestedTime,
        preferred_datetime: order.preferred_datetime ?? null,
        special_instructions: specialInstructions,
        notes: specialInstructions,
        internal_notes: order.internal_notes ?? null,
        created_at: now,
        updated_at: now,
      };

      let insertedOrder: Record<string, unknown> | null = null;
      let orderInsertError: { message?: string } | null = null;

      const modernInsert = await supabase
        .from('orders')
        .insert(modernOrderPayload);

      insertedOrder = modernOrderPayload as Record<string, unknown>;
      orderInsertError = modernInsert.error;

      if (
        orderInsertError &&
        /customer_email|customer_name|customer_phone|fulfillment_status|internal_notes|fulfillment_type|requested_date|requested_time|special_instructions|subtotal/i.test(orderInsertError.message ?? '')
      ) {
        const legacyOrderPayload = {
          id: generatedOrderId,
          full_name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
          status: order.status ?? 'request_received',
          subtotal,
          total: order.total ?? 0,
          payment_method: order.payment_method ?? 'arranged_after_approval',
          payment_status: order.payment_status ?? 'pending',
          fulfillment_type: fulfillmentType,
          delivery_type: fulfillmentType,
          delivery_address: order.delivery_address ?? null,
          requested_date: requestedDate,
          preferred_date: requestedDate,
          requested_time: requestedTime,
          preferred_time: requestedTime,
          preferred_datetime: order.preferred_datetime ?? null,
          special_instructions: specialInstructions,
          notes: specialInstructions,
          created_at: now,
          updated_at: now,
        };

        const legacyInsert = await supabase
          .from('orders')
          .insert(legacyOrderPayload);

        insertedOrder = legacyOrderPayload as Record<string, unknown>;
        orderInsertError = legacyInsert.error;
      }

      if (orderInsertError || !insertedOrder) {
        throw new Error(orderInsertError?.message || 'Failed to save order');
      }

      const orderItems = Array.isArray(order.items) ? order.items : [];
      if (orderItems.length > 0) {
        try {
          await insertOrderItemsWithCompatibility(insertedOrder.id, orderItems);
        } catch (itemsError) {
          await supabase.from('orders').delete().eq('id', insertedOrder.id);
          throw itemsError;
        }
      }

      const createdOrder: Order = {
        id: String(insertedOrder.id ?? generatedOrderId),
        customer_name: String(insertedOrder.customer_name ?? insertedOrder.full_name ?? order.customer_name ?? ''),
        customer_email: String(insertedOrder.customer_email ?? insertedOrder.email ?? order.customer_email ?? ''),
        customer_phone: String(insertedOrder.customer_phone ?? insertedOrder.phone ?? order.customer_phone ?? ''),
        status: (insertedOrder.status as Order['status']) ?? 'request_received',
        total: Number(insertedOrder.total ?? order.total ?? 0),
        payment_method: (insertedOrder.payment_method as Order['payment_method']) ?? order.payment_method,
        payment_status: (insertedOrder.payment_status as Order['payment_status']) ?? order.payment_status,
        fulfillment_status: (insertedOrder.fulfillment_status as Order['fulfillment_status']) ?? order.fulfillment_status,
        delivery_type: (insertedOrder.delivery_type as Order['delivery_type']) ?? (order.delivery_type as Order['delivery_type']) ?? 'pickup',
        delivery_address: (insertedOrder.delivery_address as string | null | undefined) ?? undefined,
        preferred_datetime: (insertedOrder.preferred_datetime as string | null | undefined) ?? undefined,
        notes: (insertedOrder.notes as string | null | undefined) ?? undefined,
        internal_notes: (insertedOrder.internal_notes as string | null | undefined) ?? undefined,
        items: orderItems,
        created_at: String(insertedOrder.created_at ?? now),
        updated_at: String(insertedOrder.updated_at ?? now),
      } as Order;

      return { order: createdOrder, success: true };
    },

    async update(id: string, updates: Partial<Order>, token: string) {
      const db = getSupabaseForToken(token);

      const status = updates.status;
      if (status && !['request_received', 'under_review', 'accepted', 'rejected'].includes(status)) {
        throw new Error('Invalid status update');
      }

      const paymentStatus = updates.payment_status;
      if (paymentStatus && !['pending', 'paid', 'arranged'].includes(paymentStatus)) {
        throw new Error('Invalid payment status update');
      }

      const fulfillmentStatus = updates.fulfillment_status;
      if (fulfillmentStatus && !['not_started', 'in_progress', 'ready', 'fulfilled'].includes(fulfillmentStatus)) {
        throw new Error('Invalid fulfillment status update');
      }

      const updatePayload = {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { payment_status: paymentStatus } : {}),
        ...(fulfillmentStatus ? { fulfillment_status: fulfillmentStatus } : {}),
        ...(Object.prototype.hasOwnProperty.call(updates, 'internal_notes')
          ? { internal_notes: updates.internal_notes ?? null }
          : {}),
        updated_at: new Date().toISOString(),
      };

      const richResponse = await db
        .from('orders')
        .update(updatePayload)
        .eq('id', id)
        .select('*');

      let updatedRows = richResponse.data;
      let updateError = richResponse.error;

      if (updateError && /fulfillment_status|internal_notes/i.test(updateError.message ?? '')) {
        const legacyPayload = {
          ...(status ? { status } : {}),
          ...(paymentStatus ? { payment_status: paymentStatus } : {}),
          updated_at: new Date().toISOString(),
        };

        const legacyResponse = await db
          .from('orders')
          .update(legacyPayload)
          .eq('id', id)
          .select('*');

        updatedRows = legacyResponse.data;
        updateError = legacyResponse.error;
      }

      if (updateError) {
        if ((updateError.message ?? '').includes('orders_payment_status_check')) {
          throw new Error('Database payment status constraint is outdated. Run supabase/sql/005_orders_display_id_and_payment_status_fix.sql and retry.');
        }
        throw new Error(updateError?.message || 'Failed to update order');
      }

      let updatedOrder = (updatedRows ?? [])[0];
      if (!updatedOrder) {
        const verification = await db
          .from('orders')
          .select('*')
          .eq('id', id)
          .limit(1);

        if (verification.error) {
          throw new Error(verification.error.message || 'Order update affected 0 rows. Check admin permissions or RLS policies.');
        }

        updatedOrder = (verification.data ?? [])[0];
      }

      if (!updatedOrder) {
        throw new Error('Order update affected 0 rows. Check admin permissions or RLS policies.');
      }

      const { data: itemRows, error: itemsError } = await db
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
      const inventoryResponse = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (!inventoryResponse.error && inventoryResponse.data) {
        const ingredients = (inventoryResponse.data as Array<Record<string, unknown>>).map((row) => ({
          id: String(row.id ?? ''),
          name: String(row.name ?? ''),
          unit: String(row.unit ?? ''),
          cost_per_unit: Number(row.cost_per_unit ?? 0),
          stock_quantity: Number(row.stock_quantity ?? 0),
          threshold_alert: Number(row.threshold_alert ?? 0),
          supplier: row.supplier ? String(row.supplier) : undefined,
          created_at: String(row.created_at ?? new Date().toISOString()),
        }));

        return { ingredients };
      }

      const ingredientsResponse = await supabase
        .from('ingredients')
        .select('*')
        .order('name', { ascending: true });

      if (!ingredientsResponse.error && ingredientsResponse.data) {
        const ingredients = (ingredientsResponse.data as Array<Record<string, unknown>>).map((row) => ({
          id: String(row.id ?? ''),
          name: String(row.name ?? ''),
          unit: String(row.unit ?? ''),
          cost_per_unit: Number(row.cost_per_unit ?? 0),
          stock_quantity: Number(row.stock_quantity ?? 0),
          threshold_alert: Number(row.threshold_alert ?? 0),
          supplier: row.supplier ? String(row.supplier) : undefined,
          created_at: String(row.created_at ?? new Date().toISOString()),
        }));

        return { ingredients };
      }

      return apiCall('/ingredients', { token });
    },

    async update(id: string, updates: Partial<Ingredient>, token: string) {
      const inventoryUpdate = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select('id')
        .maybeSingle();

      if (!inventoryUpdate.error) {
        return { success: true };
      }

      const ingredientUpdate = await supabase
        .from('ingredients')
        .update(updates)
        .eq('id', id)
        .select('id')
        .maybeSingle();

      if (!ingredientUpdate.error) {
        return { success: true };
      }

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
