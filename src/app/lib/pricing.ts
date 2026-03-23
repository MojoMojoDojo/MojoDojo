import { getVariantUnitPriceFromCatalog, TIRAMISU_VARIANT_IDS } from './operationsCatalog';

export { TIRAMISU_VARIANT_IDS };

export function getVariantUnitPrice(variantId: string, fallback = 0): number {
  return getVariantUnitPriceFromCatalog(variantId, fallback);
}

export function getTiramisuAbsolutePrice(sizeId: 'small' | 'large', fallbackLargePrice: number): number {
  const variantId = sizeId === 'small' ? TIRAMISU_VARIANT_IDS.small : TIRAMISU_VARIANT_IDS.large;
  return getVariantUnitPrice(variantId, fallbackLargePrice);
}

export function getTiramisuSizeExtraPrice(sizeId: 'small' | 'large', baseProductPrice: number): number {
  return getTiramisuAbsolutePrice(sizeId, baseProductPrice) - baseProductPrice;
}
