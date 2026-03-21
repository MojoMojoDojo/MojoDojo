import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '../../lib/supabase';
import { resolveCustomization, type ProductCustomizationInput, isDefaultCustomizationKey } from '@/app/lib/productCustomization';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  customizationKey: string;
  customization: {
    preparationOptionId: string;
    premiumAddOnId?: string;
    sizeOptionId?: string;
    // Legacy fields kept for compatibility with previously persisted carts.
    dietaryOptionId?: string;
    alcoholChoiceId?: string;
    tiramisuSizeId?: string;
    pureAlcoholMl?: number;
    estimatedFinalAbvPercent?: number;
  };
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, customization?: ProductCustomizationInput) => void;
  updateQuantity: (itemIdOrProductId: string, delta: number) => void;
  removeFromCart: (itemIdOrProductId: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mojodojo.cart';

function normalizeCart(stored: unknown): CartItem[] {
  if (!Array.isArray(stored)) return [];

  return stored
    .filter((item): item is Partial<CartItem> & { product: Product; quantity: number } => {
      return !!item && typeof item === 'object' && !!(item as CartItem).product && typeof (item as CartItem).quantity === 'number';
    })
    .map((item) => {
      const fallbackResolved = resolveCustomization(item.product, {
        preparationOptionId: item.customization?.preparationOptionId ?? item.customization?.dietaryOptionId,
        premiumAddOnId: item.customization?.premiumAddOnId ?? item.customization?.alcoholChoiceId,
        sizeOptionId: item.customization?.sizeOptionId ?? item.customization?.tiramisuSizeId,
      });

      const customizationKey = item.customizationKey ?? fallbackResolved.key;
      const id = item.id ?? customizationKey;
      const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : item.product.price + fallbackResolved.extraPrice;

      return {
        id,
        product: item.product,
        quantity: Math.max(0, item.quantity),
        unitPrice,
        customizationKey,
        customization: {
          preparationOptionId:
            item.customization?.preparationOptionId ?? item.customization?.dietaryOptionId ?? fallbackResolved.preparationOption.id,
          premiumAddOnId: item.customization?.premiumAddOnId ?? item.customization?.alcoholChoiceId,
          sizeOptionId: item.customization?.sizeOptionId ?? item.customization?.tiramisuSizeId ?? fallbackResolved.sizeOptionId,
          dietaryOptionId: item.customization?.dietaryOptionId,
          alcoholChoiceId: item.customization?.alcoholChoiceId,
          tiramisuSizeId: item.customization?.tiramisuSizeId,
          pureAlcoholMl: item.customization?.pureAlcoholMl ?? fallbackResolved.pureAlcoholMl,
          estimatedFinalAbvPercent:
            item.customization?.estimatedFinalAbvPercent ?? fallbackResolved.estimatedFinalAbvPercent,
        },
      };
    })
    .filter(item => item.quantity > 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? normalizeCart(JSON.parse(stored)) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(product: Product, customization?: ProductCustomizationInput) {
    const resolved = resolveCustomization(product, customization);
    const itemId = resolved.key;
    const unitPrice = product.price + resolved.extraPrice;

    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          quantity: 1,
          unitPrice,
          customizationKey: resolved.key,
          customization: {
            preparationOptionId: resolved.preparationOption.id,
            premiumAddOnId: resolved.premiumAddOn?.id,
            sizeOptionId: resolved.sizeOptionId,
            dietaryOptionId: resolved.preparationOption.id,
            alcoholChoiceId: resolved.premiumAddOn?.id,
            tiramisuSizeId: resolved.sizeOptionId,
            pureAlcoholMl: resolved.pureAlcoholMl || undefined,
            estimatedFinalAbvPercent: resolved.estimatedFinalAbvPercent || undefined,
          },
        },
      ];
    });
  }

  function resolveTargetItemId(prev: CartItem[], itemIdOrProductId: string): string | null {
    const byId = prev.find(item => item.id === itemIdOrProductId);
    if (byId) return byId.id;

    const defaultForProduct = prev.find(
      item => item.product.id === itemIdOrProductId && isDefaultCustomizationKey(item.customizationKey)
    );
    if (defaultForProduct) return defaultForProduct.id;

    const firstForProduct = prev.find(item => item.product.id === itemIdOrProductId);
    return firstForProduct ? firstForProduct.id : null;
  }

  function updateQuantity(itemIdOrProductId: string, delta: number) {
    setCart(prev => {
      const targetId = resolveTargetItemId(prev, itemIdOrProductId);
      if (!targetId) return prev;

      return prev
        .map(item =>
          item.id === targetId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0);
    });
  }

  function removeFromCart(itemIdOrProductId: string) {
    setCart(prev => {
      const targetId = resolveTargetItemId(prev, itemIdOrProductId);
      if (!targetId) return prev;
      return prev.filter(item => item.id !== targetId);
    });
  }

  function clearCart() {
    setCart([]);
  }

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
