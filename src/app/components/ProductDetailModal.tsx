import { useEffect, useState } from 'react';
import { X, AlertTriangle, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Product } from '../../lib/supabase';
import { useCart } from '../contexts/CartContext';
import {
  getPremiumAddOns,
  resolveCustomization,
} from '@/app/lib/productCustomization';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getAllergenTags,
  getLocalizedProductLongDescription,
  getLocalizedProductName,
  getLocalizedServingSize,
} from '../lib/productContent';
import { getProductImage } from '../lib/productImages';
import { Checkbox } from './ui/checkbox';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [preparationOptionId, setPreparationOptionId] = useState<string>('standard');
  const [premiumAddOnId, setPremiumAddOnId] = useState<string | undefined>(undefined);
  const [hasAcceptedAlcoholNotice, setHasAcceptedAlcoholNotice] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setQuantity(1);
    setPreparationOptionId('standard');
    setPremiumAddOnId(undefined);
    setHasAcceptedAlcoholNotice(false);
  }, [isOpen, product?.id]);

  const allergenLabelMap = {
    dairy: t.order.allergenTags.dairy,
    eggs: t.order.allergenTags.eggs,
    gluten: t.order.allergenTags.gluten,
    nuts: t.order.allergenTags.nuts,
    caffeine: t.order.allergenTags.caffeine,
  };

  if (!product) return null;
  const currentProduct = product;

  const premiumAddOns = getPremiumAddOns(currentProduct);
  const resolved = resolveCustomization(currentProduct, { preparationOptionId, premiumAddOnId });
  const productImage = getProductImage(currentProduct);

  const unitPrice = currentProduct.price + resolved.extraPrice;
  const totalPrice = unitPrice * quantity;

  const localizedName = getLocalizedProductName(currentProduct, language);
  const localizedDescription = getLocalizedProductLongDescription(currentProduct, language);
  const localizedServingSize = getLocalizedServingSize(currentProduct, language);
  const allergenTags = getAllergenTags(currentProduct);

  function optionLabel(labelKey: string): string {
    return t.order.options[labelKey as keyof typeof t.order.options] ?? labelKey;
  }

  function optionDescription(descriptionKey: string): string {
    return t.order.optionDescriptions[descriptionKey as keyof typeof t.order.optionDescriptions] ?? descriptionKey;
  }

  function handleAddToCart() {
    for (let i = 0; i < quantity; i += 1) {
      addToCart(currentProduct, { preparationOptionId, premiumAddOnId });
    }
    onClose();
  }

  function handlePremiumAddOnSelect(addOnId: string) {
    setPremiumAddOnId(addOnId);
    setHasAcceptedAlcoholNotice(false);
  }

  function clearPremiumAddOn() {
    setPremiumAddOnId(undefined);
    setHasAcceptedAlcoholNotice(false);
  }

  const isAddToCartDisabled = !!premiumAddOnId && !hasAcceptedAlcoholNotice;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 z-50 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-5xl w-full relative overflow-hidden max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                <div className="relative min-h-[280px] md:min-h-[620px] bg-zinc-950">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={localizedName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      {t.order.noImage}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
                </div>

                <div className="max-h-[92vh] overflow-y-auto">
                  <div className="p-5 sm:p-6">
                    <h2 className="text-3xl font-semibold text-white leading-tight">{localizedName}</h2>
                    <p className="text-2xl font-semibold text-brand-gold mt-2">${unitPrice.toFixed(2)}</p>

                    <p className="text-gray-300 leading-relaxed mt-4">{localizedDescription}</p>

                    <div className="mt-5 grid grid-cols-1 gap-3">
                      <div className="rounded-xl border border-zinc-700 bg-black/25 p-3">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide">{t.order.modal.servingSize}</p>
                        <p className="text-sm text-white mt-1">{localizedServingSize ?? t.order.modal.notSpecified}</p>
                      </div>
                    </div>

                    <section className="mt-5 rounded-xl border border-yellow-500/55 bg-yellow-500/10 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4.5 h-4.5 text-yellow-300" />
                        <h3 className="text-base font-semibold text-yellow-200">{t.order.modal.allergenInfo}</h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {allergenTags.length > 0 ? (
                          allergenTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full border border-yellow-500/70 bg-yellow-900/40 text-yellow-100 px-2.5 py-1 text-xs font-medium"
                            >
                              {allergenLabelMap[tag]}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-200">{t.order.modal.noSpecificAllergens}</span>
                        )}
                      </div>
                    </section>

                    {premiumAddOns.length > 0 && (
                      <section className="mt-5 rounded-xl border border-zinc-700 bg-black/20 p-4">
                        <h3 className="text-base font-semibold text-white mb-3">{t.order.modal.premiumAddOns}</h3>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={clearPremiumAddOn}
                            className={`w-full text-left rounded-lg border p-3 transition-colors ${
                              !premiumAddOnId
                                ? 'border-brand-gold bg-brand-gold-subtle'
                                : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
                            }`}
                          >
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-white">{t.order.modal.noAddOn}</p>
                            </div>
                          </button>

                          {premiumAddOns.map((choice) => (
                            <button
                              key={choice.id}
                              type="button"
                              onClick={() => handlePremiumAddOnSelect(choice.id)}
                              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                                premiumAddOnId === choice.id
                                  ? 'border-brand-gold bg-brand-gold-subtle'
                                  : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-white">{optionLabel(choice.labelKey)}</p>
                                <p className="text-xs text-brand-gold">+${choice.extraPrice.toFixed(2)}</p>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{optionDescription(choice.descriptionKey)}</p>
                            </button>
                          ))}
                        </div>

                        {premiumAddOnId && (
                          <div
                            className={`mt-2 rounded border p-2 text-[11px] leading-relaxed space-y-2 transition-colors ${
                              hasAcceptedAlcoholNotice
                                ? 'border-zinc-700 bg-zinc-900/60 text-gray-200'
                                : 'border-red-500/35 bg-red-500/8 text-red-100'
                            }`}
                          >
                            <p>{t.order.modal.alcoholNoticeInline(resolved.estimatedFinalAbvPercent.toFixed(1))}</p>
                            <label className="flex items-start gap-2 text-gray-200 cursor-pointer">
                              <Checkbox
                                checked={hasAcceptedAlcoholNotice}
                                onCheckedChange={(checked) => setHasAcceptedAlcoholNotice(checked === true)}
                                className="mt-0.5 border-red-400/50 data-[state=checked]:bg-brand-gold data-[state=checked]:text-brand-black data-[state=checked]:border-brand-gold"
                              />
                              <span>
                                {t.order.modal.alcoholConfirm}{' '}
                                <a href="/terms" className="text-brand-gold hover:underline">
                                  {t.order.modal.termsLinkLabel}
                                </a>
                              </span>
                            </label>
                          </div>
                        )}
                      </section>
                    )}

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 bg-black border border-brand-gold rounded-lg px-2 py-1">
                        <button
                          type="button"
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="w-7 h-7 flex items-center justify-center rounded bg-brand-gold text-brand-black hover:opacity-80 transition-opacity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-white w-6 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(prev => prev + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-brand-gold text-brand-black hover:opacity-80 transition-opacity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isAddToCartDisabled}
                        className="inline-flex items-center gap-2 bg-brand-gold text-brand-black font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {t.order.modal.addToCartTotal(totalPrice.toFixed(2))}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </>
      )}
    </AnimatePresence>
  );
}
