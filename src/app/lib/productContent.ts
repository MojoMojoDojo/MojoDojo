import type { Language } from '../i18n';
import type { Product } from '../../lib/supabase';

export type AllergenTag = 'dairy' | 'eggs' | 'gluten' | 'nuts' | 'caffeine';

interface LocalizedField {
  en: string;
  fr: string;
}

interface ProductContent {
  name: LocalizedField;
  longDescription: LocalizedField;
  category: LocalizedField;
  servingSize: LocalizedField;
  allergens: AllergenTag[];
}

const PRODUCT_CONTENT: Record<string, ProductContent> = {
  prod_1: {
    name: {
      en: 'Biscoff Cheesecake',
      fr: 'Gâteau au fromage Biscoff',
    },
    longDescription: {
      en: 'A rich and creamy cheesecake layered over a buttery Biscoff cookie crust, finished with a smooth caramelized Biscoff spread and a signature cookie topping. Each bite combines velvety cheesecake texture with the warm, spiced sweetness of Biscoff for a dessert that feels both comforting and premium. Smooth, indulgent, and beautifully balanced, it is perfect for anyone who loves a sweet dessert with a deep biscuit flavor.',
      fr: 'Un gâteau au fromage Biscoff riche et onctueux, avec une garniture lisse aux notes de vanille, une croûte biscuitée épicée et une finition caramélisée. Le résultat est généreux, équilibré et élégant, sans être trop sucré.',
    },
    category: {
      en: 'Cheesecake',
      fr: 'Gâteau au fromage',
    },
    servingSize: {
      en: 'Individual slice',
      fr: 'Portion individuelle',
    },
    allergens: ['dairy', 'gluten', 'eggs'],
  },
  prod_2: {
    name: {
      en: 'Cheesecake Brownie Tray',
      fr: 'Plateau brownie au fromage',
    },
    longDescription: {
      en: 'A decadent brownie tray made with fudgy chocolate brownie layers and swirls of smooth cheesecake throughout. The deep cocoa richness of the brownie is balanced by the creamy, slightly tangy cheesecake, creating a dessert that is dense, satisfying, and full of flavor. Perfect for sharing, celebrations, or simply treating yourself, this tray delivers a bold and indulgent dessert experience in every piece.',
      fr: 'Un plateau de brownie au chocolat dense, marbré de crème au fromage, pour un dessert à la fois fondant et velouté. Il se prête parfaitement au partage, aux cadeaux gourmands et aux tables de dessert plus soignées.',
    },
    category: {
      en: 'Tray dessert',
      fr: 'Dessert en plateau',
    },
    servingSize: {
      en: '12 pieces',
      fr: '12 morceaux',
    },
    allergens: ['dairy', 'gluten', 'eggs'],
  },
  prod_3: {
    name: {
      en: 'Tiramisu Tray',
      fr: 'Plateau tiramisu',
    },
    longDescription: {
      en: 'A classic Italian-inspired dessert made with delicate layers of coffee-soaked ladyfingers and smooth mascarpone cream, finished with a generous dusting of cocoa. Light yet rich, it offers a balanced combination of creamy texture, bold coffee notes, and a refined sweetness that never feels too heavy. Elegant, flavorful, and made for sharing, this tiramisu tray is a timeless dessert with a premium homemade touch.',
      fr: 'Un tiramisu classique en plateau, composé de biscuits imbibés d espresso, de crème mascarpone et d une finition légère au cacao. La texture reste aérienne et bien structurée, avec un profil café doux, rond et net.',
    },
    category: {
      en: 'Tray dessert',
      fr: 'Dessert en plateau',
    },
    servingSize: {
      en: '12 pieces',
      fr: '12 morceaux',
    },
    allergens: ['dairy', 'gluten', 'eggs', 'caffeine'],
  },
};

function normalizeAllergen(raw: string): AllergenTag | null {
  const value = raw.toLowerCase();

  if (value.includes('dairy') || value.includes('lait') || value.includes('milk')) return 'dairy';
  if (value.includes('egg') || value.includes('oeuf') || value.includes('oeufs') || value.includes('eggs')) return 'eggs';
  if (/(gluten|wheat|ble|blé)/.test(value)) return 'gluten';
  if (value.includes('nut') || value.includes('noix') || value.includes('almond')) return 'nuts';
  if (value.includes('caffeine') || value.includes('cafe') || value.includes('espresso')) return 'caffeine';

  return null;
}

function parseAllergenInfo(allergyInfo?: string): AllergenTag[] {
  if (!allergyInfo) return [];

  const tokens = allergyInfo
    .split(',')
    .map(item => item.replace(/contains|contient|traces?|trace/gi, '').trim())
    .filter(Boolean)
    .map(normalizeAllergen)
    .filter((tag): tag is AllergenTag => !!tag);

  return Array.from(new Set(tokens));
}

function localized(field: LocalizedField, language: Language): string {
  return language === 'fr' ? field.fr : field.en;
}

const TIRAMISU_SIZE_SERVING: Record<'small' | 'large', LocalizedField> = {
  small: {
    en: '6 pieces',
    fr: '6 morceaux',
  },
  large: {
    en: '12 pieces',
    fr: '12 morceaux',
  },
};

export function getLocalizedProductName(product: Product, language: Language): string {
  if (language === 'fr' && product.name_fr) return product.name_fr;
  if (language === 'en' && product.name) return product.name;

  const config = PRODUCT_CONTENT[product.id];
  if (config) return localized(config.name, language);

  return product.name;
}

export function getLocalizedProductDescription(product: Product, language: Language): string {
  if (language === 'fr' && product.description_fr) return product.description_fr;
  if (language === 'en' && product.description) return product.description;

  const config = PRODUCT_CONTENT[product.id];
  if (config) return localized(config.longDescription, language);

  return product.description;
}

export function getLocalizedProductLongDescription(product: Product, language: Language): string {
  const config = PRODUCT_CONTENT[product.id];
  if (config) return localized(config.longDescription, language);

  if (language === 'fr' && product.description_fr) return product.description_fr;
  if (language === 'en' && product.description) return product.description;

  return product.description;
}

export function getLocalizedCategory(product: Product, language: Language): string | undefined {
  if (language === 'fr' && product.category_fr) return product.category_fr;
  if (language === 'en' && product.category) return product.category;

  const config = PRODUCT_CONTENT[product.id];
  return config ? localized(config.category, language) : product.category;
}

export function getLocalizedServingSize(product: Product, language: Language, sizeOptionId?: string): string | undefined {
  if (
    (product.id === 'prod_3' || product.name.toLowerCase().includes('tiramisu') || product.name_fr?.toLowerCase().includes('tiramisu')) &&
    (sizeOptionId === 'small' || sizeOptionId === 'large')
  ) {
    return localized(TIRAMISU_SIZE_SERVING[sizeOptionId], language);
  }

  if (language === 'fr' && product.serving_size_fr) return product.serving_size_fr;
  if (language === 'en' && product.serving_size) return product.serving_size;

  const config = PRODUCT_CONTENT[product.id];
  return config ? localized(config.servingSize, language) : product.serving_size;
}

export function getAllergenTags(product: Product): AllergenTag[] {
  const fromProduct = parseAllergenInfo(product.allergy_info);
  if (fromProduct.length > 0) return fromProduct;

  return PRODUCT_CONTENT[product.id]?.allergens ?? [];
}
