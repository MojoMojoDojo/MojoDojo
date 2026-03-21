import type { Product } from '../../lib/supabase';
import { getTiramisuSizeExtraPrice } from './pricing';

export interface PreparationOption {
  id: string;
  type: 'standard' | 'accommodation';
  labelKey: 'standardPreparation';
  descriptionKey: 'standardPreparationDesc';
  extraPrice: number;
}

export interface PremiumAddOn {
  id: string;
  labelKey: 'marsalaInfusion';
  descriptionKey: 'marsalaInfusionDesc';
  abvPercent: number;
  addedMl: number;
  extraPrice: number;
}

export interface TiramisuSizeOption {
  id: 'small' | 'large';
  labelKey: 'smallTiramisu' | 'largeTiramisu';
  extraPrice: number;
}

export interface ProductCustomizationInput {
  preparationOptionId?: string;
  premiumAddOnId?: string;
  sizeOptionId?: string;
  // Legacy keys for backward compatibility with existing localStorage data.
  dietaryOptionId?: string;
  alcoholChoiceId?: string;
  tiramisuSizeId?: string;
}

export interface ResolvedCustomization {
  preparationOption: PreparationOption;
  premiumAddOn?: PremiumAddOn;
  sizeOptionId?: TiramisuSizeOption['id'];
  extraPrice: number;
  key: string;
  pureAlcoholMl: number;
  estimatedFinalAbvPercent: number;
}

const BASE_DESSERT_ML = 1800;

const STANDARD_PREPARATION: PreparationOption = {
  id: 'standard',
  type: 'standard',
  labelKey: 'standardPreparation',
  descriptionKey: 'standardPreparationDesc',
  extraPrice: 0,
};

const COMMON_PREPARATION_OPTIONS: PreparationOption[] = [
  {
    ...STANDARD_PREPARATION,
  },
];

const TIRAMISU_PREMIUM_ADDONS: PremiumAddOn[] = [
  {
    id: 'marsala_30ml',
    labelKey: 'marsalaInfusion',
    descriptionKey: 'marsalaInfusionDesc',
    abvPercent: 18,
    addedMl: 30,
    extraPrice: 5,
  },
];

function isTiramisu(product: Product): boolean {
  const lowerName = product.name.toLowerCase();
  const lowerNameFr = product.name_fr?.toLowerCase() ?? '';
  return product.id === 'prod_3' || lowerName.includes('tiramisu') || lowerNameFr.includes('tiramisu');
}

export function isTiramisuProduct(product: Product): boolean {
  return isTiramisu(product);
}

export function getPreparationOptions(_product: Product): PreparationOption[] {
  return COMMON_PREPARATION_OPTIONS;
}

export function getPremiumAddOns(product: Product): PremiumAddOn[] {
  return isTiramisu(product) ? TIRAMISU_PREMIUM_ADDONS : [];
}

export function getTiramisuSizeOptions(product: Product): TiramisuSizeOption[] {
  if (!isTiramisu(product)) return [];

  return [
    {
      id: 'small',
      labelKey: 'smallTiramisu',
      extraPrice: getTiramisuSizeExtraPrice('small', product.price),
    },
    {
      id: 'large',
      labelKey: 'largeTiramisu',
      extraPrice: getTiramisuSizeExtraPrice('large', product.price),
    },
  ];
}

function normalizeSelection(input?: ProductCustomizationInput): {
  preparationOptionId?: string;
  premiumAddOnId?: string;
  sizeOptionId?: string;
} {
  return {
    preparationOptionId: input?.preparationOptionId ?? input?.dietaryOptionId,
    premiumAddOnId: input?.premiumAddOnId ?? input?.alcoholChoiceId,
    sizeOptionId: input?.sizeOptionId ?? input?.tiramisuSizeId,
  };
}

export function resolveCustomization(
  product: Product,
  input?: ProductCustomizationInput
): ResolvedCustomization {
  const normalized = normalizeSelection(input);
  const preparationOptions = getPreparationOptions(product);
  const selectedPreparation =
    preparationOptions.find(option => option.id === normalized.preparationOptionId) ?? preparationOptions[0];

  const premiumAddOns = getPremiumAddOns(product);
  const selectedPremiumAddOn = premiumAddOns.find(addOn => addOn.id === normalized.premiumAddOnId);

  const sizeOptions = getTiramisuSizeOptions(product);
  const selectedSizeOption = sizeOptions.find(option => option.id === normalized.sizeOptionId) ?? sizeOptions.find(option => option.id === 'large');

  const pureAlcoholMl = selectedPremiumAddOn
    ? (selectedPremiumAddOn.addedMl * selectedPremiumAddOn.abvPercent) / 100
    : 0;
  const estimatedFinalAbvPercent = selectedPremiumAddOn
    ? Number(((pureAlcoholMl / BASE_DESSERT_ML) * 100).toFixed(2))
    : 0;

  const extraPrice = selectedPreparation.extraPrice + (selectedPremiumAddOn?.extraPrice ?? 0) + (selectedSizeOption?.extraPrice ?? 0);
  const key = `${product.id}|prep:${selectedPreparation.id}|addon:${selectedPremiumAddOn?.id ?? 'none'}|size:${selectedSizeOption?.id ?? 'default'}`;

  return {
    preparationOption: selectedPreparation,
    premiumAddOn: selectedPremiumAddOn,
    sizeOptionId: selectedSizeOption?.id,
    extraPrice,
    key,
    pureAlcoholMl,
    estimatedFinalAbvPercent,
  };
}

export function isDefaultCustomizationKey(key: string): boolean {
  return (
    key.endsWith('|prep:standard|addon:none|size:large') ||
    key.endsWith('|prep:standard|addon:none|size:default') ||
    key.endsWith('|prep:standard|addon:none') ||
    key.endsWith('|diet:standard|alc:none')
  );
}
