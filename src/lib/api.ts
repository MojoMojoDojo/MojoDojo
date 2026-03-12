import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { Product, Order, Ingredient, GalleryItem } from './supabase';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-44229999`;

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${options.token || publicAnonKey}`,
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
      return apiCall('/orders', { token });
    },

    async create(order: Partial<Order>) {
      return apiCall('/orders', {
        method: 'POST',
        body: order
      });
    },

    async update(id: string, updates: Partial<Order>, token: string) {
      return apiCall(`/orders/${id}`, {
        method: 'PUT',
        body: updates,
        token
      });
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
