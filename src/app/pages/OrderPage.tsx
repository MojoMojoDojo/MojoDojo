import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, ShoppingBag, AlertCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import type { Product } from '../../lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { useCart } from '../contexts/CartContext';
import biscoffCheesecakeImage from '../../assets/BiscoffCheescake.png';
import brownieCheesecakeImage from '../../assets/BrownieCheescake.png';
import tiramisuTrayImage from '../../assets/TiramisuTray.png';

export function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { cart, addToCart, updateQuantity, total, itemCount } = useCart();
  const navigate = useNavigate();

  const productFallbackImages: Record<string, string> = {
    prod_1: biscoffCheesecakeImage,
    prod_2: brownieCheesecakeImage,
    prod_3: tiramisuTrayImage,
  };

  const requiresDeposit = total > 100;

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { products: data } = await api.products.getAll();
      setProducts(data.filter(p => p.visible && p.status !== 'sold_out'));
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  function getProductImage(product: Product) {
    if (product.image_url) return product.image_url;
    const name = product.name.toLowerCase();
    if (productFallbackImages[product.id]) return productFallbackImages[product.id];
    if (name.includes('biscoff') || name.includes('cheesecake')) return biscoffCheesecakeImage;
    if (name.includes('brownie')) return brownieCheesecakeImage;
    if (name.includes('tiramisu')) return tiramisuTrayImage;
    return '';
  }

  return (
    <div className="min-h-screen pt-20 pb-32 bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12 mb-10 flex items-end justify-between"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold premium-heading">
              Select <span className="gold-accent">Products</span>
            </h1>
            <p className="text-lg text-brand-light-gray elegant-text mt-2">
              Add items to your cart, then proceed to checkout
            </p>
          </div>

          {itemCount > 0 && (
            <button
              onClick={() => navigate('/checkout')}
              className="hidden md:flex items-center gap-2 bg-brand-gold text-brand-black font-semibold px-5 py-3 rounded-lg hover:opacity-90 transition-all text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Checkout ({itemCount})
            </button>
          )}
        </motion.div>

        {/* Deposit Notice */}
        <AnimatePresence>
          {requiresDeposit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 bg-brand-gold-subtle border-2 border-brand-gold rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-6 h-6 text-brand-gold flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-brand-gold mb-1">Deposit Required</h3>
                <p className="text-sm text-gray-300">
                  Orders over $100 require a $20 deposit. We'll contact you after order placement to arrange payment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            <p className="text-lg">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => {
              const cartItem = cart.find(item => item.product.id === product.id);
              const quantity = cartItem?.quantity || 0;
              const productImage = getProductImage(product);
              const hasAllergens = !!product.allergy_info;

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
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No Image
                      </div>
                    )}

                    {/* Allergen badge: icon only → expands on hover to show text */}
                    {hasAllergens && (
                      <div
                        className="absolute top-2 right-2 flex items-center gap-1.5
                                   bg-yellow-900/80 border border-yellow-500/60 rounded-full
                                   px-2 py-1.5 cursor-pointer overflow-hidden
                                   max-w-[2rem] hover:max-w-[12rem]
                                   transition-[max-width] duration-300 ease-in-out"
                        onClick={e => { e.stopPropagation(); setSelectedProduct(product); }}
                      >
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span className="text-xs text-yellow-300 font-medium whitespace-nowrap">
                          Allergens / Dietary
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
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {product.description || 'Premium handcrafted dessert'}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-brand-gold">
                        ${product.price.toFixed(2)}
                      </span>

                      {/* Quantity Controls / Add to Cart */}
                      {quantity > 0 ? (
                        <div className="flex items-center gap-2 bg-black border-2 border-brand-gold rounded-lg px-2 py-1">
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-brand-gold text-brand-black hover:opacity-80 transition-opacity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-white w-5 text-center">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-brand-gold text-brand-black hover:opacity-80 transition-opacity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            addToCart(product);
                            toast.success(`${product.name} added!`);
                          }}
                          className="flex items-center gap-1.5 bg-brand-gold text-brand-black font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-all text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add to Cart
                        </button>
                      )}
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6 text-brand-gold" />
                  <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-brand-light-gray">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </p>
                  <p className="font-bold text-brand-gold text-lg">${total.toFixed(2)}</p>
                </div>
              </div>

              {requiresDeposit && (
                <p className="hidden sm:block text-xs text-yellow-400 text-center">
                  $20 deposit required
                </p>
              )}

              <button
                onClick={() => navigate('/checkout')}
                className="bg-brand-gold text-brand-black font-semibold flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-90 transition-all text-sm flex-shrink-0"
              >
                <ShoppingBag className="w-4 h-4" />
                Proceed to Checkout
              </button>
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


    if (cart.length === 0) {
      toast.error('Please add items to your cart');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress) {
      toast.error('Please provide a delivery address');
      return;
    }

    setSubmitting(true);

    try {
      await api.orders.create({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : undefined,
        preferred_datetime: preferredDatetime || undefined,
        payment_method: paymentMethod,
        notes: notes || undefined,
        total: getTotal(),
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      });

      setOrderPlaced(true);
      toast.success('Order placed successfully!');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setCart([]);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setDeliveryAddress('');
        setPreferredDatetime('');
        setNotes('');
        setOrderPlaced(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-brand-black">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-2xl mx-auto px-4"
        >
          <div className="w-24 h-24 bg-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-brand-black" />
          </div>
          <h1 className="text-4xl font-bold mb-4 premium-heading">
            <span className="gold-accent">Order Placed!</span>
          </h1>
          <p className="text-xl text-brand-light-gray elegant-text mb-8">
            Thank you for your order. We'll confirm your order details shortly via email or phone.
            {requiresDeposit && (
              <span className="block mt-4 text-[#D4AF37] font-semibold">
                A ${depositAmount} deposit is required for orders over $100. We'll contact you with payment details.
              </span>
            )}
          </p>
          <Button onClick={() => navigate('/')} className="btn-primary-gold">
            Return to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 premium-heading">
            Place Your <span className="gold-accent">Order</span>
          </h1>
          <p className="text-lg text-brand-light-gray elegant-text">
            Select your items and complete your order details
          </p>
        </motion.div>

        {/* Deposit Notice */}
        <AnimatePresence>
          {requiresDeposit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 bg-[#D4AF37]/10 border-2 border-[#D4AF37] rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-6 h-6 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#D4AF37] mb-1">Deposit Required</h3>
                <p className="text-sm text-gray-300">
                  Orders over $100 require a ${depositAmount} deposit. We'll contact you after order placement to arrange payment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="premium-card p-6">
              <h2 className="text-2xl font-semibold mb-6 golden-line pl-4">Select Products</h2>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="shimmer-effect h-64 rounded-lg"></div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No products available at the moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(product => {
                    const cartItem = cart.find(item => item.product.id === product.id);
                    const quantity = cartItem?.quantity || 0;
                    const productImage = getProductImage(product);

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 border-2 border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all duration-300 group"
                      >
                        {/* Product Image */}
                        <div 
                          className="aspect-video w-full bg-zinc-800 overflow-hidden cursor-pointer relative"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              No Image
                            </div>
                          )}
                          {/* Info Button Overlay */}
                          <div className="absolute top-2 right-2 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Info className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <h3 
                            className="font-semibold text-lg mb-1 text-white cursor-pointer hover:text-[#D4AF37] transition-colors"
                            onClick={() => setSelectedProduct(product)}
                          >
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description || 'Premium handcrafted dessert'}</p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xl font-bold text-[#D4AF37]">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.ingredients && product.ingredients.length > 0 && (
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="text-xs text-gray-400 hover:text-[#D4AF37] transition-colors flex items-center gap-1"
                              >
                                <Info className="w-3 h-3" />
                                Ingredients
                              </button>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          {quantity > 0 ? (
                            <div className="flex items-center justify-between bg-black border-2 border-[#D4AF37] rounded-lg p-2">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="w-8 h-8 flex items-center justify-center rounded bg-[#D4AF37] text-black hover:bg-[#B8941F] transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-semibold text-white px-4">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="w-8 h-8 flex items-center justify-center rounded bg-[#D4AF37] text-black hover:bg-[#B8941F] transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="w-full bg-[#D4AF37] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#B8941F] transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary & Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Cart Summary */}
              <div className="premium-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                  Order Summary
                </h2>

                {cart.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex justify-between items-start text-sm bg-zinc-900 p-3 rounded border border-zinc-800">
                          <div className="flex-1">
                            <p className="font-medium text-white">{item.product.name}</p>
                            <p className="text-gray-400">
                              {item.quantity} × ${item.product.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-semibold text-[#D4AF37]">
                            ${(item.quantity * item.product.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-zinc-800 pt-4 space-y-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-[#D4AF37] text-2xl">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                      {requiresDeposit && (
                        <div className="bg-[#D4AF37]/10 border border-[#D4AF37] rounded p-2 text-xs text-center">
                          <span className="text-[#D4AF37] font-semibold">
                            ${depositAmount} deposit required
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Order Form */}
              {cart.length > 0 && (
                <form onSubmit={handleSubmitOrder} className="premium-card p-6 space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Your Details</h2>

                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="bg-black border-2 border-zinc-700 text-white focus:border-[#D4AF37]"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="bg-black border-2 border-zinc-700 text-white focus:border-[#D4AF37]"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      className="bg-black border-2 border-zinc-700 text-white focus:border-[#D4AF37]"
                      placeholder="(514) 555-0123"
                    />
                  </div>

                  <div>
                    <Label>Delivery Type *</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('pickup')}
                        className={`p-3 rounded-lg border-2 font-medium transition-all ${
                          deliveryType === 'pickup'
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                            : 'bg-zinc-900 border-zinc-700 text-white hover:border-zinc-600'
                        }`}
                      >
                        Pickup
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`p-3 rounded-lg border-2 font-medium transition-all ${
                          deliveryType === 'delivery'
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                            : 'bg-zinc-900 border-zinc-700 text-white hover:border-zinc-600'
                        }`}
                      >
                        Delivery
                      </button>
                    </div>
                  </div>

                  {deliveryType === 'delivery' && (
                    <div>
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Input
                        id="address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        className="bg-black border-2 border-zinc-700 text-white focus:border-[#D4AF37]"
                        placeholder="123 Main St, Montreal, QC"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="datetime">Preferred Date/Time</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={preferredDatetime}
                      onChange={(e) => setPreferredDatetime(e.target.value)}
                      className="bg-black border-2 border-zinc-700 text-white focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Special Instructions</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="bg-black border-2 border-zinc-700 text-white focus:border-[#D4AF37] resize-none"
                      placeholder="Any allergies or special requests..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#D4AF37] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#B8941F] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>

                  {requiresDeposit && (
                    <p className="text-xs text-gray-400 text-center">
                      We'll contact you regarding the ${depositAmount} deposit payment
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
