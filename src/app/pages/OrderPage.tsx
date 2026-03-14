import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, ShoppingBag, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import type { Product } from '../../lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllergenTags, getLocalizedProductDescription, getLocalizedProductName } from '../lib/productContent';
import { getProductImage } from '../lib/productImages';

export function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { cart, updateQuantity, total, itemCount } = useCart();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const cartProducts = products
    .map(product => ({
      product,
      quantity: cart
        .filter(item => item.product.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0),
    }))
    .filter(entry => entry.quantity > 0);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { products: data } = await api.products.getAll();
      setProducts(data.filter(p => p.visible && p.status !== 'sold_out'));
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error(t.order.failedToLoad);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-32 bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12 mb-10 flex items-end justify-between"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold premium-heading">
              {t.order.title} <span className="gold-accent">{t.order.titleAccent}</span>
            </h1>
            <p className="text-lg text-brand-light-gray elegant-text mt-2">
              {t.order.subtitle}
            </p>
          </div>

          {itemCount > 0 && (
            <button
              onClick={() => navigate('/checkout')}
              className="hidden md:flex items-center gap-2 bg-brand-gold text-brand-black font-semibold px-5 py-3 rounded-lg hover:opacity-90 transition-all text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              {t.order.checkout} ({itemCount})
            </button>
          )}
        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="shimmer-effect h-80 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-brand-light-gray">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">{t.order.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => {
              const productImage = getProductImage(product);
              const hasAllergens = getAllergenTags(product).length > 0;
              const localizedName = getLocalizedProductName(product, language);
              const localizedDescription = getLocalizedProductDescription(product, language);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900 border-2 border-zinc-800 rounded-xl overflow-hidden hover:border-brand-gold/40 transition-all duration-300 group"
                >
                  {/* Product Image */}
                  <div
                    className="aspect-[4/3] w-full bg-zinc-800 overflow-hidden cursor-pointer relative"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={localizedName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        {t.order.noImage}
                      </div>
                    )}

                    {/* Allergen badge */}
                    {hasAllergens && (
                      <div
                        className="absolute top-2 right-2 flex items-center gap-1.5
                                   bg-yellow-900/80 border border-yellow-500/60 rounded-full
                                   px-2 py-1.5 cursor-pointer overflow-hidden
                                   max-w-[2rem] group-hover:max-w-[12rem] hover:max-w-[12rem]
                                   transition-[max-width] duration-300 ease-in-out"
                        onClick={e => { e.stopPropagation(); setSelectedProduct(product); }}
                      >
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span className="text-xs text-yellow-300 font-medium whitespace-nowrap">
                          {t.order.allergens}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3
                      className="font-semibold text-lg mb-1 text-white cursor-pointer hover:text-brand-gold transition-colors"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {localizedName}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {localizedDescription || t.order.fallbackDescription}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-brand-gold">
                        ${product.price.toFixed(2)}
                      </span>

                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="flex items-center gap-1.5 bg-brand-gold text-brand-black font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-all text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        {t.order.viewDetails}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky bottom cart bar */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 glass-effect border-t border-brand-gold/30"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-3 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingBag className="w-6 h-6 text-brand-gold" />
                    <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-brand-light-gray">
                      {t.order.items(itemCount)}
                    </p>
                    <p className="font-bold text-brand-gold text-lg">${total.toFixed(2)}</p>
                  </div>
                </div>

                {cartProducts.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {cartProducts.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-black/40 px-2.5 py-1.5 flex-shrink-0"
                      >
                        <span className="text-xs text-gray-200 max-w-[110px] truncate">
                          {getLocalizedProductName(product, language)}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-zinc-700 text-white hover:bg-brand-gold hover:text-brand-black transition-all"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-white min-w-4 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-zinc-700 text-white hover:bg-brand-gold hover:text-brand-black transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate('/checkout')}
                  className="bg-brand-gold text-brand-black font-semibold flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-90 transition-all text-sm flex-shrink-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t.order.proceedToCheckout}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
