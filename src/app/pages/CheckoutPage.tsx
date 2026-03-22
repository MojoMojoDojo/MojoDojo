import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2, ShoppingBag, Trash2, ArrowLeft, Plus, Minus, CalendarClock, CalendarDays, MapPin } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { api } from '../../lib/api';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { resolveCustomization } from '@/app/lib/productCustomization';
import { getLocalizedProductName } from '../lib/productContent';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { AddressAutocompleteInput } from '../components/AddressAutocompleteInput';

function formatDateDigits(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean);
  return parts.join('/');
}

function parseDateInputToCanonical(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const withSeparators = trimmed.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})$/);
  const compact = trimmed.match(/^(\d{4})(\d{2})(\d{2})$/);

  const groups = withSeparators ?? compact;
  if (!groups) return undefined;

  const year = Number(groups[1]);
  const month = Number(groups[2]);
  const day = Number(groups[3]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return undefined;

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function canonicalToLocalDate(canonicalDate: string): Date | undefined {
  const [yearRaw, monthRaw, dayRaw] = canonicalDate.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return undefined;

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }

  return parsed;
}

function combineLocalDateAndTime(canonicalDate: string, timeValue: string): Date | undefined {
  const date = canonicalToLocalDate(canonicalDate);
  if (!date) return undefined;

  const parts = timeValue.split(':');
  if (parts.length !== 2) return undefined;

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return undefined;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
}

const PICKUP_ADDRESS = '90 rue Prince';

function buildHourOptions(startHour24: number, endHour24: number) {
  return Array.from({ length: endHour24 - startHour24 }, (_, index) => {
    const hour24 = startHour24 + index;
    const nextHour24 = hour24 + 1;
    
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24;
    const nextHour12 = nextHour24 > 12 ? nextHour24 - 12 : nextHour24;
    
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const nextPeriod = nextHour24 >= 12 ? 'PM' : 'AM';
    
    // Use same period for both hours if they're in the same half-day
    const singlePeriod = period === nextPeriod ? period : ` ${period} - ${nextHour12} ${nextPeriod}`;
    const label = period === nextPeriod 
      ? `${hour12}–${nextHour12} ${period}`
      : `${hour12} ${period} – ${nextHour12} ${nextPeriod}`;
    
    return {
      value: `${String(hour24).padStart(2, '0')}:00`,
      label,
    };
  });
}

const PICKUP_HOUR_OPTIONS = buildHourOptions(8, 20);
const DELIVERY_HOUR_OPTIONS = buildHourOptions(16, 23);

export function CheckoutPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, total, itemCount } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pendingRemovalItemId, setPendingRemovalItemId] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [preferredDateInput, setPreferredDateInput] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');

  const canonicalPreferredDate = useMemo(() => parseDateInputToCanonical(preferredDateInput), [preferredDateInput]);
  const selectedDate = useMemo(() => {
    if (!canonicalPreferredDate) return undefined;
    return canonicalToLocalDate(canonicalPreferredDate);
  }, [canonicalPreferredDate]);
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  const availableHourOptions = deliveryType === 'pickup' ? PICKUP_HOUR_OPTIONS : DELIVERY_HOUR_OPTIONS;

  function applyQuickDate(daysFromToday: number) {
    const nextDate = addDays(today, daysFromToday);
    setPreferredDateInput(format(nextDate, 'yyyy/MM/dd'));
  }

  function isQuickDateActive(daysFromToday: number): boolean {
    if (!canonicalPreferredDate) return false;
    return canonicalPreferredDate === format(addDays(today, daysFromToday), 'yyyy-MM-dd');
  }

  const quickDateButtons = [
    { label: t.checkout.today, offset: 0 },
    { label: t.checkout.tomorrow, offset: 1 },
    { label: t.checkout.inTwoDays, offset: 2 },
  ];

  useEffect(() => {
    if (!preferredTime) return;
    const isStillAvailable = availableHourOptions.some(option => option.value === preferredTime);
    if (!isStillAvailable) {
      setPreferredTime('');
    }
  }, [availableHourOptions, preferredTime]);

  function buildPreferredDatetime(): string | undefined {
    if (!canonicalPreferredDate || !preferredTime) return undefined;
    return `${canonicalPreferredDate}T${preferredTime}`;
  }

  function validatePreferredDatetime(): boolean {
    if (!preferredDateInput.trim() || !preferredTime.trim()) {
      toast.error(t.checkout.fillPreferredDateTime);
      return false;
    }

    if (!canonicalPreferredDate) {
      toast.error(t.checkout.invalidPreferredDate);
      return false;
    }

    if (!availableHourOptions.some((option) => option.value === preferredTime)) {
      toast.error(t.checkout.invalidPreferredDateTime);
      return false;
    }

    const requested = combineLocalDateAndTime(canonicalPreferredDate, preferredTime);
    if (!requested) {
      toast.error(t.checkout.invalidPreferredDateTime);
      return false;
    }

    // Temporary checkout datetime debug logs.
    console.debug('[checkout] selectedDateCanonical', canonicalPreferredDate);
    console.debug('[checkout] selectedTime', preferredTime);
    console.debug('[checkout] combinedDateTimeLocal', requested.toString());
    console.debug('[checkout] nowLocal', new Date().toString());

    if (requested.getTime() <= Date.now()) {
      toast.error(t.checkout.invalidPreferredDateTime);
      return false;
    }

    return true;
  }

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

    if (!validatePreferredDatetime()) return;

    setSubmitting(true);
    try {
      await api.orders.create({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress : undefined,
        preferred_datetime: buildPreferredDatetime(),
        payment_method: 'arranged_after_approval',
        notes: notes || undefined,
        total,
        status: 'request_received',
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: getLocalizedProductName(item.product, language),
          quantity: item.quantity,
          price: item.unitPrice,
          customization: item.customization,
        })),
      });

      clearCart();
      setOrderPlaced(true);
      toast.success(t.checkout.orderSuccess);
    } catch (error) {
      console.error('Failed to submit order request:', error);
      const message = error instanceof Error ? error.message : t.checkout.orderFailed;
      toast.error(`${t.checkout.orderFailed}${message ? ` (${message})` : ''}`);
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
          <p className="text-lg text-brand-light-gray elegant-text mb-6">{t.checkout.success.message}</p>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 text-sm text-gray-200 mb-8">
            <p>{t.checkout.success.emailStep1}</p>
            <p className="mt-2">{t.checkout.success.emailStep2}</p>
          </div>
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
            {t.checkout.title} <span className="gold-accent">{t.checkout.titleAccent}</span>
          </h1>
          <p className="text-lg text-brand-light-gray elegant-text mt-2">{t.checkout.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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
                <h2 className="text-xl font-semibold text-white">{t.checkout.fulfillment}</h2>

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

                <AnimatePresence mode="wait">
                  {deliveryType === 'pickup' ? (
                    <motion.div
                      key="pickup-location"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl border border-brand-gold/50 bg-brand-gold/10 px-4 py-3"
                    >
                      <p className="text-xs uppercase tracking-wide text-brand-gold">{t.checkout.pickupLocationLabel}</p>
                      <p className="text-sm text-white mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-gold" />
                        {PICKUP_ADDRESS}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="delivery-address"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        {t.checkout.deliveryAddress} <span className="text-brand-gold">*</span>
                      </label>
                      <AddressAutocompleteInput
                        value={deliveryAddress}
                        onChange={setDeliveryAddress}
                        required
                        language={language}
                        placeholder={t.checkout.deliveryAddressPlaceholder}
                        startTypingText={t.checkout.addressAutocompleteStart}
                        loadingText={t.checkout.addressAutocompleteLoading}
                        noResultsText={t.checkout.addressAutocompleteNoResults}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="block text-sm font-medium text-gray-300 mb-0.5">
                      {t.checkout.preferredDateTime} <span className="text-brand-gold">*</span>
                    </label>
                    {quickDateButtons.map((button) => (
                      <button
                        key={button.label}
                        type="button"
                        onClick={() => applyQuickDate(button.offset)}
                        className={`text-xs rounded-full border px-2.5 py-1 transition-all ${
                          isQuickDateActive(button.offset)
                            ? 'border-brand-gold bg-brand-gold/20 text-brand-gold'
                            : 'border-zinc-700 bg-zinc-900 text-gray-300 hover:border-zinc-500 hover:text-white'
                        }`}
                      >
                        {button.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_160px] gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t.checkout.preferredDate}</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={preferredDateInput}
                          onChange={e => setPreferredDateInput(formatDateDigits(e.target.value))}
                          placeholder={t.checkout.preferredDatePlaceholder}
                          className="w-full bg-black border-2 border-zinc-700 text-white rounded-lg px-4 pr-12 py-2.5 focus:border-brand-gold focus:outline-none transition-colors"
                        />
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              aria-label={t.checkout.openCalendar}
                              className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-brand-gold transition-colors"
                            >
                              <CalendarDays className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-auto p-0 bg-zinc-950 border-zinc-700 text-white">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                if (!date) return;
                                setPreferredDateInput(format(date, 'yyyy/MM/dd'));
                                setCalendarOpen(false);
                              }}
                              disabled={(date) => date < today}
                              className="text-white"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t.checkout.preferredTime}</label>
                      <select
                        value={preferredTime}
                        onChange={e => setPreferredTime(e.target.value)}
                        className="w-full bg-black border-2 border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-gold focus:outline-none transition-colors"
                      >
                        <option value="" className="bg-zinc-900 text-gray-400">
                          {t.checkout.preferredTimePlaceholder}
                        </option>
                        {availableHourOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-zinc-900 text-white">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card p-6 space-y-5">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-brand-gold" />
                  {t.checkout.paymentAndApproval}
                </h2>

                <div className="rounded-xl border border-zinc-700 bg-black/30 p-4 space-y-2 text-sm text-gray-200">
                  <p>{t.checkout.paymentInfoLine1}</p>
                  <p>{t.checkout.paymentInfoLine2}</p>
                  <p>{t.checkout.paymentInfoLine3}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{t.checkout.instructions}</label>
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
                    {t.checkout.submittingRequest}
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {t.checkout.submitOrderRequest} - ${total.toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="premium-card p-6">
                <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-white">
                  <ShoppingBag className="w-5 h-5 text-brand-gold" />
                  {t.checkout.orderSummary}
                </h2>

                <div className="space-y-3 mb-5">
                  {cart.map(item => {
                    const selected = resolveCustomization(item.product, {
                      preparationOptionId: item.customization.preparationOptionId ?? item.customization.dietaryOptionId,
                      premiumAddOnId: item.customization.premiumAddOnId ?? item.customization.alcoholChoiceId,
                      sizeOptionId: item.customization.sizeOptionId ?? item.customization.tiramisuSizeId,
                    });

                    return (
                      <div key={item.id} className="flex items-start gap-3 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">{getLocalizedProductName(item.product, language)}</p>
                          <p className="text-gray-400 text-xs mt-0.5">${item.unitPrice.toFixed(2)} {t.checkout.each}</p>
                          {selected.sizeOptionId && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              {selected.sizeOptionId === 'small' ? t.order.sizes.smallTiramisu : t.order.sizes.largeTiramisu}
                            </p>
                          )}
                          {selected.premiumAddOn && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              {t.order.options[selected.premiumAddOn.labelKey as keyof typeof t.order.options]}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 flex items-center justify-center rounded bg-zinc-700 hover:bg-brand-gold hover:text-brand-black transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white text-sm font-semibold w-4 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 flex items-center justify-center rounded bg-zinc-700 hover:bg-brand-gold hover:text-brand-black transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[72px]">
                          <span className="font-bold text-brand-gold text-sm">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                          {pendingRemovalItemId === item.id ? (
                            <button
                              type="button"
                              onClick={() => {
                                removeFromCart(item.id);
                                setPendingRemovalItemId(null);
                              }}
                              className="text-xs text-red-300 hover:text-red-200 transition-colors"
                            >
                              {t.checkout.confirmRemove}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPendingRemovalItemId(item.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                              aria-label={t.checkout.removeItem}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t-2 border-zinc-800 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t.checkout.subtotal(itemCount)}</span>
                    <span className="font-semibold text-white">${total.toFixed(2)}</span>
                  </div>

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
