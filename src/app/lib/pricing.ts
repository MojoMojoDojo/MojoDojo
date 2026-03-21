import { CORE_VARIANTS } from './operationsDataModel';

export const TIRAMISU_VARIANT_IDS = {
  small: 'variant_tiramisu_small',
  large: 'variant_tiramisu_large',
  small_alcohol: 'variant_tiramisu_small_alcohol',
  large_alcohol: 'variant_tiramisu_large_alcohol',
} as const;

const VARIANT_PRICE_BY_ID = new Map(CORE_VARIANTS.map((variant) => [variant.id, variant.price]));

export function getVariantUnitPrice(variantId: string, fallback = 0): number {
  return VARIANT_PRICE_BY_ID.get(variantId) ?? fallback;
}

export function getTiramisuAbsolutePrice(sizeId: 'small' | 'large', fallbackLargePrice: number): number {
  const variantId = sizeId === 'small' ? TIRAMISU_VARIANT_IDS.small : TIRAMISU_VARIANT_IDS.large;
  return getVariantUnitPrice(variantId, fallbackLargePrice);
}

export function getTiramisuSizeExtraPrice(sizeId: 'small' | 'large', baseProductPrice: number): number {
  return getTiramisuAbsolutePrice(sizeId, baseProductPrice) - baseProductPrice;
}
