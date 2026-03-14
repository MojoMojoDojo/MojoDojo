import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Product } from '../../lib/supabase';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border-2 border-zinc-800 rounded-lg max-w-2xl w-full relative overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Product Image */}
              {product.image_url && (
                <div className="aspect-video w-full overflow-hidden bg-brand-dark-gray">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800';
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
                <p className="text-2xl font-semibold text-[#D4AF37] mb-4">
                  ${product.price.toFixed(2)}
                </p>

                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Allergen Warning - prominent */}
                {product.allergy_info && (
                  <div className="mb-6 p-4 bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <h3 className="text-base font-semibold text-yellow-400">Allergen Information</h3>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{product.allergy_info}</p>
                  </div>
                )}

                {product.serving_size && (
                  <div className="text-sm text-gray-400 mt-2">
                    <span className="font-medium text-gray-300">Serving size:</span> {product.serving_size}
                  </div>
                )}

                {product.category && (
                  <div className="text-sm text-gray-400 mt-2">
                    <span className="font-medium text-gray-300">Category:</span> {product.category}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
