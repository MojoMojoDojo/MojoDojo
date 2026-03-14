import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, ShoppingBag, AlertCircle, Trash2, ArrowLeft, Plus, Minus } from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export function CheckoutPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, total, itemCount } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { t } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [preferredDatetime, setPreferredDatetime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [notes, setNotes] = useState('');

  const requiresDeposit = total > 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      toast.error(t.checkout.fillRequired);
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      toast.error(t.checkout.fillDeliveryAddress);
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
        total,
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      clearCart();
      setOrderPlaced(true);
      toast.success(t.checkout.orderSuccess);
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error(t.checkout.orderFailed);
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
          className="text-center max-w-xl mx-auto px-4"
        >
          <div className="w-24 h-24 bg-brand-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-brand-black" />
          </div>
          <h1 className="text-4xl font-bold mb-4 premium-heading">
            <span className="gold-accent">{t.checkout.success.title}</span>
          </h1>
          <p className="text-lg text-brand-light-gray elegant-text mb-4">
            {t.checkout.success.message}
          </p>
          {requiresDeposit && (
            <p className="text-brand-gold font-semibold mb-8">
              {t.checkout.success.depositNote}
            </p>
          )}
          <button
            onClick={() => navigate('/')}
            className="bg-brand-gold text-brand-black font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-all"
          >
            {t.checkout.success.returnHome}
          </button>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-brand-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-white mb-3">{t.checkout.emptyCart}</h2>
          <p className="text-gray-400 mb-8">{t.checkout.emptyCartSub}</p>
          <button
            onClick={() => navigate('/order')}
            className="bg-brand-gold text-brand-black font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-all"
          >
            {t.checkout.browseProducts}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 bg-brand-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12 mb-10"
        >
          <button
            onClick={() => navigate('/order')}
            className="flex items-center gap-2 text-gray-400 hover:text-brand-gold transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.checkout.backToProducts}
          </button>

          <h1 className="text-4xl md:text-5xl font-bold premium-heading">
            {t.checkout.title}{' '}<span className="gold-accent">{t.checkout.titleAccent}</span>
          </h1>
          <p className="text-lg text-brand-light-gray elegant-text mt-2">
            {t.checkout.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="premium-card p-6 space-y-5">
                <h2 className="text-xl font-semibold text-white">{t.checkout.yourDetails}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      {t.checkout.name} <span className="text-brand-gold">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      required
                      placeholder={t.checkout.namePlaceholder}
                      className="w-full bg-black border-2 border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-gold focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      {t.checkout.phone} <span className="text-brand-gold">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      required
                      placeholder={t.checkout.phonePlaceholder}
                      className="w-full bg-black border-2 border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    {t.checkout.email} <span className="text-brand-gold">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    required
                    placeholder={t.checkout.emailPlaceholder}
                    className="w-full bg-black border-2 border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="premium-card p-6 space-y-5">
                <h2 className="text-xl font-semibold text-white">{t.checkout.delivery}</h2>

                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: 'pickup' as const, label: t.checkout.pickup },
                    { value: 'delivery' as const, label: t.checkout.delivery },
                  ]).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDeliveryType(value)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all ${
                        deliveryType === value
                          ? 'bg-brand-gold border-brand-gold text-brand-black'
                          : 'bg-zinc-900 border-zinc-700 text-white hover:border-zinc-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {deliveryType === 'delivery' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        {t.checkout.deliveryAddress} <span className="text-brand-gold">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        required
                        placeholder={t.checkout.deliveryAddressPlaceholder}
                        className="w-full bg-black border-2 border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-gold focus:outline-none transition-colors"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    {t.checkout.preferredDateTime}
                  </label>
                  <input
                    type="datetime-local"
                    value={preferredDatetime}
                    onChange={e => setPreferredDatetime(e.target.value)}
                    className="w-full bg-black border-2 border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="premium-card p-6 space-y-5">
                <h2 className="text-xl font-semibold text-white">{t.checkout.paymentMethod}</h2>

                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: 'cash' as const, label: t.checkout.cash },
                    { value: 'online' as const, label: t.checkout.online },
                  ]).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPaymentMethod(value)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all ${
                        paymentMethod === value
                          ? 'bg-brand-gold border-brand-gold text-brand-black'
                          : 'bg-zinc-900 border-zinc-700 text-white hover:border-zinc-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    {t.checkout.instructions}
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder={t.checkout.instructionsPlaceholder}
                    className="w-full bg-black border-2 border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-gold focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-gold text-brand-black font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.checkout.placingOrder}
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {t.checkout.placeOrder} — ${total.toFixed(2)}
                  </>
                )}
              </button>

              {requiresDeposit && (
                <p className="text-xs text-gray-400 text-center">
                  {t.checkout.depositNote}
                </p>
              )}
            </form>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="premium-card p-6">
                <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-white">
                  <ShoppingBag className="w-5 h-5 text-brand-gold" />
                  {t.checkout.orderSummary}
                </h2>

                <div className="space-y-3 mb-5">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className="flex items-start gap-3 bg-zinc-900 p-3 rounded-lg border border-zinc-800"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{item.product.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">${item.product.price.toFixed(2)} {t.checkout.each}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-zinc-700 hover:bg-brand-gold hover:text-brand-black transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white text-sm font-semibold w-4 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-zinc-700 hover:bg-brand-gold hover:text-brand-black transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-brand-gold text-sm">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-zinc-800 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t.checkout.subtotal(itemCount)}</span>
                    <span className="font-semibold text-white">${total.toFixed(2)}</span>
                  </div>

                  <AnimatePresence>
                    {requiresDeposit && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2 bg-brand-gold-subtle border border-brand-gold/50 rounded-lg p-3"
                      >
                        <AlertCircle className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-brand-gold">
                          {t.checkout.depositCartNote}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-lg text-white">{t.checkout.total}</span>
                    <span className="font-bold text-2xl text-brand-gold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
