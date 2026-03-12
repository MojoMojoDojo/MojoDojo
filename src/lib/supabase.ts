import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

export type UserRole = 'owner' | 'admin' | 'worker';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  status: 'available' | 'low_stock' | 'preorder' | 'sold_out';
  category?: string;
  serving_size?: string;
  allergy_info?: string;
  visible: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'pending' | 'confirmed' | 'in_preparation' | 'completed' | 'cancelled';
  total: number;
  payment_method: 'cash' | 'online';
  payment_status: 'pending' | 'paid';
  delivery_type: 'pickup' | 'delivery';
  delivery_address?: string;
  preferred_datetime?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
  stock_quantity: number;
  threshold_alert: number;
  supplier?: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  product_id: string;
  ingredient_id: string;
  quantity: number;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption?: string;
  category: 'product' | 'behind_scenes' | 'customer' | 'tray' | 'branding';
  visible: boolean;
  created_at: string;
}
