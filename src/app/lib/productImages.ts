import type { Product } from '../../lib/supabase';
import biscoffCheesecakeImage from '../../assets/BiscoffCheescake.png';
import brownieCheesecakeImage from '../../assets/BrownieCheescake.png';
import tiramisuTrayImage from '../../assets/TiramisuTray.png';

const PRODUCT_FALLBACK_IMAGES: Record<string, string> = {
  prod_1: biscoffCheesecakeImage,
  prod_2: brownieCheesecakeImage,
  prod_3: tiramisuTrayImage,
};

export function getProductImage(product: Product): string {
  if (product.image_url) return product.image_url;

  const lowerName = product.name.toLowerCase();
  const lowerNameFr = product.name_fr?.toLowerCase() ?? '';

  if (PRODUCT_FALLBACK_IMAGES[product.id]) return PRODUCT_FALLBACK_IMAGES[product.id];
  if (lowerName.includes('biscoff') || lowerName.includes('cheesecake')) return biscoffCheesecakeImage;
  if (lowerName.includes('brownie')) return brownieCheesecakeImage;
  if (lowerName.includes('tiramisu') || lowerNameFr.includes('tiramisu')) return tiramisuTrayImage;

  return '';
}
