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
  name_fr?: string;
  description: string;
  description_fr?: string;
  price: number;
  image_url?: string;
  status: 'available' | 'low_stock' | 'preorder' | 'sold_out';
  category?: string;
  category_fr?: string;
  serving_size?: string;
  serving_size_fr?: string;
  allergy_info?: string;
  allergy_info_fr?: string;
  visible: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status:
    | 'request_received'
    | 'under_review'
    | 'accepted'
    | 'rejected'
    | 'ready_for_pickup'
    | 'out_for_delivery'
    | 'completed'
    | 'pending'
    | 'confirmed'
    | 'in_preparation'
    | 'cancelled';
  total: number;
  payment_method?: 'cash' | 'etranser' | 'arranged_after_approval' | 'online';
  payment_status?: 'pending' | 'paid' | 'arranged';
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
  customization?: {
    preparationOptionId?: string;
    premiumAddOnId?: string;
    dietaryOptionId?: string;
    alcoholChoiceId?: string;
    pureAlcoholMl?: number;
    estimatedFinalAbvPercent?: number;
  };
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
