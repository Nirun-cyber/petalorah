import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  MapPin,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Home,
  LogIn,
  Loader2,
  Tag,
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { InstagramIcon } from './InstagramIcon';
import { useCart, calculateShippingFee, type CustomerCheckoutInfo } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCoupon } from '../context/CouponContext';
import { useSettings } from '../context/SettingsContext';

interface CartDrawerProps {
  onNavigateToLogin?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToLogin }) => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    proceedToWhatsAppOrder,
    proceedToInstagramOrder,
  } = useCart();

  const { user } = useAuth();
  const { settings } = useSettings();
  const { appliedCoupon, applyCoupon, removeCoupon, calculateDiscount } = useCoupon();

  // Mobile Checkout Step: 'cart' (Review Items & Offers) | 'details' (Delivery Info & Place Order)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLTextAreaElement>(null);
  const pincodeInputRef = useRef<HTMLInputElement>(null);

  // Guest / Customer Checkout Form State (pre-filled from user or localStorage)
  const [name, setName] = useState<string>(() => {
    if (user?.name) return user.name;
    try {
      const saved = localStorage.getItem('petalorah_guest_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.name || '';
      }
    } catch {}
    return '';
  });

  const [phone, setPhone] = useState<string>(() => {
    if (user?.phone) return user.phone;
    try {
      const saved = localStorage.getItem('petalorah_guest_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.phone || '';
      }
    } catch {}
    return '';
  });

  const [address, setAddress] = useState<string>(() => {
    if (user?.address?.street) return user.address.street;
    try {
      const saved = localStorage.getItem('petalorah_guest_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.address || '';
      }
    } catch {}
    return '';
  });

  const [city, setCity] = useState<string>(() => {
    if (user?.address?.city) return user.address.city;
    try {
      const saved = localStorage.getItem('petalorah_guest_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.city || 'Coimbatore';
      }
    } catch {}
    return 'Coimbatore';
  });

  const [state, setState] = useState<string>(() => {
    if (user?.address?.state) return user.address.state;
    try {
      const saved = localStorage.getItem('petalorah_guest_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.state || 'Tamil Nadu';
      }
    } catch {}
    return 'Tamil Nadu';
  });

  const [pincode, setPincode] = useState<string>(() => {
    if (user?.address?.pincode) return user.address.pincode;
    try {
      const saved = localStorage.getItem('petalorah_guest_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.pincode || '';
      }
    } catch {}
    return '';
  });

  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeCart]);

  // Reset to cart step when drawer closes or cart empties
  useEffect(() => {
    if (!isCartOpen) {
      setCheckoutStep('cart');
      setIsOrderSummaryExpanded(false);
      setErrorMessage(null);
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setCheckoutStep('cart');
    }
  }, [cartItems.length]);

  // Sync state if customer logs in or updates profile
  useEffect(() => {
    if (user) {
      const userName = user.name;
      const userPhone = user.phone;
      const userStreet = user.address?.street;
      const userCity = user.address?.city;
      const userState = user.address?.state;
      const userPincode = user.address?.pincode;

      if (userName) setName((prev) => prev || userName);
      if (userPhone) setPhone((prev) => prev || userPhone);
      if (userStreet) setAddress((prev) => prev || userStreet);
      if (userCity) setCity((prev) => prev || userCity);
      if (userState) setState((prev) => prev || userState);
      if (userPincode) setPincode((prev) => prev || userPincode);
    }
  }, [user]);

  if (!isCartOpen) return null;

  // Free Mini Charm Offer (Threshold: ₹200)
  const FREE_GIFT_THRESHOLD = 200;
  const isFreeGiftUnlocked = totalPrice >= FREE_GIFT_THRESHOLD;
  const amountNeededForFreeGift = Math.max(0, FREE_GIFT_THRESHOLD - totalPrice);
  const freeGiftProgressPercent = Math.min(100, Math.round((totalPrice / FREE_GIFT_THRESHOLD) * 100));

  // Dynamic Shipping Calculation based on entered Pincode, City, and Site Settings
  const shipping = calculateShippingFee(pincode, city, state, settings, totalPrice);
  const freeShippingThreshold = settings.freeShippingThreshold ?? 799;
  const isFreeShippingQualified = shipping.isFreeDelivery;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);
  const freeShippingProgressPercent = Math.min(100, Math.round((totalPrice / freeShippingThreshold) * 100));

  // Coupon Discount
  const couponDiscount = calculateDiscount(appliedCoupon, totalPrice);
  const grandTotal = Math.max(0, totalPrice - couponDiscount) + shipping.fee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput, totalPrice);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponInput('');
    }
    setTimeout(() => setCouponMsg(null), 5000);
  };

  const handleProceedToLogin = () => {
    closeCart();
    if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  const handleGoToDetailsStep = () => {
    setCheckoutStep('details');
    setErrorMessage(null);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCartStep = () => {
    setCheckoutStep('cart');
    setErrorMessage(null);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateAndGetCustomerInfo = (allowQuickCheckout = false): CustomerCheckoutInfo | null => {
    setErrorMessage(null);
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/[^0-9+]/g, '').trim();
    const cleanAddress = address.trim();
    const cleanPincode = pincode.replace(/[^0-9]/g, '').trim();

    if (!allowQuickCheckout) {
      if (!cleanName) {
        setErrorMessage('Please enter your Name.');
        nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameInputRef.current?.focus();
        return null;
      }
      if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 10) {
        setErrorMessage('Please enter a valid 10-digit WhatsApp or mobile number.');
        phoneInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneInputRef.current?.focus();
        return null;
      }
      if (!cleanAddress) {
        setErrorMessage('Please enter your Delivery Address (House/Street/Area).');
        addressInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        addressInputRef.current?.focus();
        return null;
      }
      if (!cleanPincode || cleanPincode.length < 6) {
        setErrorMessage('Please enter a valid 6-digit Delivery Pincode.');
        pincodeInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        pincodeInputRef.current?.focus();
        return null;
      }
    }

    const info: CustomerCheckoutInfo = {
      name: cleanName || 'Guest Customer',
      phone: cleanPhone || '[To be provided in chat]',
      address: cleanAddress || '[To be provided in chat]',
      city: city.trim() || 'Coimbatore',
      state: state.trim() || 'Tamil Nadu',
      pincode: cleanPincode || '[Pending]',
      notes: notes.trim() || undefined,
    };

    // Save for guest convenience on subsequent visits
    try {
      localStorage.setItem('petalorah_guest_info', JSON.stringify(info));
    } catch {}

    return info;
  };

  const handleWhatsAppCheckout = (allowQuickCheckout = false) => {
    if (isPlacingOrder) return;
    const customerInfo = validateAndGetCustomerInfo(allowQuickCheckout);
    if (!customerInfo) return;

    setIsPlacingOrder(true);
    try {
      const couponPayload = appliedCoupon ? { code: appliedCoupon.code, discount: couponDiscount } : undefined;
      const orderId = proceedToWhatsAppOrder(shipping.fee, shipping.region, customerInfo, couponPayload);
      setPlacedOrderId(orderId);
    } finally {
      setTimeout(() => setIsPlacingOrder(false), 800);
    }
  };

  const handleInstagramCheckout = async (allowQuickCheckout = false) => {
    if (isPlacingOrder) return;
    const customerInfo = validateAndGetCustomerInfo(allowQuickCheckout);
    if (!customerInfo) return;

    setIsPlacingOrder(true);
    try {
      const couponPayload = appliedCoupon ? { code: appliedCoupon.code, discount: couponDiscount } : undefined;
      const orderId = await proceedToInstagramOrder(shipping.fee, shipping.region, customerInfo, couponPayload);
      setPlacedOrderId(orderId);
    } finally {
      setTimeout(() => setIsPlacingOrder(false), 800);
    }
  };

  const handleClosePlacedModal = () => {
    setPlacedOrderId(null);
    clearCart();
    closeCart();
  };

  const isPhoneValid = phone.replace(/[^0-9]/g, '').length >= 10;
  const isPincodeValid = pincode.replace(/[^0-9]/g, '').length === 6;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0" onClick={closeCart} />

      {/* Cart Panel Drawer */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-navy-light border-l border-primary/10 dark:border-white/10 shadow-2xl z-10 flex flex-col justify-between overflow-hidden">
        
        {/* HEADER & STEP PROGRESS INDICATOR */}
        <div className="border-b border-primary/10 dark:border-white/10 bg-white/95 dark:bg-navy-light/95 backdrop-blur-md flex-shrink-0 z-20">
          <div className="p-3.5 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {checkoutStep === 'details' ? (
                <button
                  type="button"
                  onClick={handleBackToCartStep}
                  className="p-1.5 -ml-1 rounded-full text-primary dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1 text-xs font-bold"
                  aria-label="Back to bag"
                >
                  <ArrowLeft size={18} />
                  <span className="hidden xs:inline">Bag</span>
                </button>
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <ShoppingBag size={17} />
                </div>
              )}

              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-primary dark:text-white leading-tight">
                  {checkoutStep === 'details' ? 'Delivery & Checkout' : 'Your Shopping Bag'}
                </h2>
                <span className="text-[11px] font-medium text-primary/60 dark:text-gray-400">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in order
                </span>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-primary dark:text-gray-200 transition-colors"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepped Tab Indicator (Only when cart has items and order not placed) */}
          {cartItems.length > 0 && !placedOrderId && (
            <div className="px-3.5 pb-2.5 flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleBackToCartStep}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-bold transition-all text-[11px] sm:text-xs ${
                  checkoutStep === 'cart'
                    ? 'bg-primary text-white dark:bg-secondary dark:text-navy shadow-xs'
                    : 'bg-primary/5 dark:bg-white/5 text-primary/70 dark:text-gray-300 hover:bg-primary/10'
                }`}
              >
                <ShoppingBag size={12} />
                <span>1. Review Bag</span>
              </button>

              <div className="text-primary/30 dark:text-white/20 text-xs">→</div>

              <button
                type="button"
                onClick={handleGoToDetailsStep}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-bold transition-all text-[11px] sm:text-xs ${
                  checkoutStep === 'details'
                    ? 'bg-primary text-white dark:bg-secondary dark:text-navy shadow-xs'
                    : 'bg-primary/5 dark:bg-white/5 text-primary/70 dark:text-gray-300 hover:bg-primary/10'
                }`}
              >
                <Truck size={12} />
                <span>2. Delivery &amp; Pay</span>
              </button>
            </div>
          )}
        </div>

        {/* ORDER SUCCESS SCREEN */}
        {placedOrderId ? (
          <div
            data-lenis-prevent
            className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4 overflow-y-auto"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in duration-200">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-primary dark:text-white">
                Order Placed!
              </h3>
              <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 py-1 px-3 rounded-full inline-block border border-rose-200 dark:border-rose-900/40">
                Order #{placedOrderId}
              </p>
            </div>

            <p className="text-xs text-primary/70 dark:text-gray-300 leading-relaxed max-w-xs mx-auto">
              Your order is registered! Please tap below to open WhatsApp and send your pre-formatted order details to confirm payment &amp; dispatch.
            </p>

            <div className="w-full space-y-2.5 pt-3">
              <button
                onClick={() => handleWhatsAppCheckout(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
              >
                <WhatsAppIcon size={18} />
                <span>Open WhatsApp Chat</span>
              </button>

              <button
                onClick={handleClosePlacedModal}
                className="w-full py-2.5 px-4 rounded-2xl bg-gray-100 dark:bg-navy text-primary dark:text-gray-200 font-bold text-xs hover:bg-gray-200 dark:hover:bg-navy-dark transition-colors"
              >
                Done &amp; Clear Bag
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* EMPTY CART VIEW */
          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 py-16 px-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-100 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/30 flex items-center justify-center text-3xl shadow-sm border border-rose-200/60 dark:border-rose-900/40">
              🌸
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-primary dark:text-white">
                Your cart is feeling a little empty 🌸
              </h3>
              <p className="text-xs text-primary/70 dark:text-gray-300 leading-relaxed">
                Explore our handcrafted satin flower pots, keychains, and custom gifts.
              </p>
            </div>
            <button
              onClick={closeCart}
              className="mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Explore Collection</span>
            </button>
          </div>
        ) : (
          /* MAIN SCROLLABLE CONTENT (STEP 1: BAG REVIEW vs STEP 2: DELIVERY DETAILS) */
          <div
            ref={scrollContainerRef}
            data-lenis-prevent
            className="flex-grow min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3.5"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {checkoutStep === 'cart' ? (
              /* ================== STEP 1: REVIEW BAG ================== */
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* FREE MINI CHARM PROGRESS CARD */}
                <div
                  className={`p-3 rounded-2xl border transition-all duration-300 ${
                    isFreeGiftUnlocked
                      ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 shadow-2xs'
                      : 'bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50/50 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-amber-950/20 border-rose-200/80 dark:border-rose-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm shrink-0">🎁</span>
                      <span
                        className={`text-xs font-bold truncate ${
                          isFreeGiftUnlocked
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-rose-900 dark:text-rose-200'
                        }`}
                      >
                        {isFreeGiftUnlocked ? (
                          <span>Unlocked <strong>FREE mini surprise charm!</strong></span>
                        ) : (
                          <span>
                            Add <strong>₹{amountNeededForFreeGift}</strong> more for <strong>FREE mini gift 🎁</strong>
                          </span>
                        )}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        isFreeGiftUnlocked
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isFreeGiftUnlocked ? 'Unlocked ✨' : `₹${totalPrice}/₹200`}
                    </span>
                  </div>

                  {/* Progress track bar */}
                  <div className="w-full bg-white/80 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-black/5 dark:border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFreeGiftUnlocked
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-rose-500 to-pink-500'
                      }`}
                      style={{ width: `${freeGiftProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* FREE SHIPPING TRACKER BAR */}
                {settings.isFreeShippingEnabled && (
                  <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-indigo-950 dark:text-indigo-200 truncate">
                        <Truck size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                        {isFreeShippingQualified ? (
                          <span>🎉 You&apos;ve unlocked <strong>FREE Delivery!</strong></span>
                        ) : (
                          <span>
                            Add <strong>₹{amountNeededForFreeShipping}</strong> more for <strong>FREE Delivery</strong>
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                        {isFreeShippingQualified ? 'FREE ✨' : `₹${totalPrice}/₹${freeShippingThreshold}`}
                      </span>
                    </div>
                    <div className="w-full bg-white/80 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-black/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFreeShippingQualified ? 'bg-indigo-600' : 'bg-indigo-400'
                        }`}
                        style={{ width: `${freeShippingProgressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* CART ITEMS LIST */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-primary/60 dark:text-gray-400 px-0.5">
                    <span>Items in Bag ({totalItems})</span>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[10px] text-rose-500/80 hover:text-rose-600 lowercase tracking-normal font-medium"
                    >
                      empty bag
                    </button>
                  </div>

                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 dark:bg-navy border border-primary/5 dark:border-white/5 shadow-2xs hover:border-primary/15 transition-all"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-navy-light shrink-0 border border-primary/10 dark:border-white/10">
                        <img
                          src={item.product.img}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details & Quantity */}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-serif text-xs sm:text-sm font-bold text-primary dark:text-white truncate leading-tight">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] text-primary/60 dark:text-gray-400 mt-0.5">
                          ₹{item.product.numericPrice} each
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-primary/15 dark:border-white/15 rounded-xl overflow-hidden bg-white dark:bg-navy-light shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2.5 py-1 text-primary dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-bold text-primary dark:text-white min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2.5 py-1 text-primary dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors active:scale-90"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Item Subtotal */}
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-primary dark:text-secondary-light">
                          ₹{item.product.numericPrice * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* COUPON CODE BOX */}
                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary dark:text-white flex items-center gap-1.5">
                      <Tag size={13} className="text-rose-500" /> Have a Coupon Code?
                    </span>
                    {appliedCoupon && (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600 shrink-0" />
                        <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-300">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% off` : `₹${appliedCoupon.discountValue} off`})
                        </span>
                      </div>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                        -₹{couponDiscount}
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. PETAL10"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 uppercase font-mono text-xs px-3 py-2 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 placeholder:normal-case placeholder:font-sans"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponMsg && (
                    <p
                      className={`text-[11px] font-semibold ${
                        couponMsg.isError ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                {/* Reassurance Banner */}
                <div className="flex items-center justify-center gap-3 py-2 text-[11px] text-primary/60 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    Handcrafted in Coimbatore
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Safe Delivery
                  </span>
                </div>
              </div>
            ) : (
              /* ================== STEP 2: DELIVERY & CHECKOUT ================== */
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* COLLAPSIBLE ORDER SUMMARY CARD */}
                <div className="rounded-2xl border border-primary/10 dark:border-white/10 bg-gray-50/80 dark:bg-navy overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsOrderSummaryExpanded((prev) => !prev)}
                    className="w-full p-3 flex items-center justify-between text-left select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-white/10 text-primary dark:text-white flex items-center justify-center font-bold text-xs">
                        {totalItems}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-primary dark:text-white block leading-tight">
                          Order Summary
                        </span>
                        <span className="text-[10px] text-primary/60 dark:text-gray-400">
                          {isOrderSummaryExpanded ? 'Tap to collapse' : 'Tap to see items breakdown'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                        ₹{grandTotal}
                      </span>
                      {isOrderSummaryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Expanded Breakdown */}
                  {isOrderSummaryExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-primary/10 dark:border-white/10 space-y-2 text-xs">
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {cartItems.map((item) => (
                          <div key={item.product.id} className="flex justify-between items-center text-[11px]">
                            <span className="truncate max-w-[200px] text-primary/80 dark:text-gray-300">
                              {item.product.name} × {item.quantity}
                            </span>
                            <span className="font-bold shrink-0">
                              ₹{item.product.numericPrice * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-primary/10 dark:border-white/10 space-y-1 text-[11px] text-primary/70 dark:text-gray-300">
                        <div className="flex justify-between">
                          <span>Items Subtotal:</span>
                          <span className="font-semibold text-primary dark:text-white">₹{totalPrice}</span>
                        </div>
                        {couponDiscount > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                            <span>Coupon Discount:</span>
                            <span>-₹{couponDiscount}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Delivery Fee ({shipping.region}):</span>
                          <span className={shipping.fee === 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'font-semibold'}>
                            {shipping.fee === 0 ? 'FREE' : `₹${shipping.fee}`}
                          </span>
                        </div>
                        {isFreeGiftUnlocked && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                            <span>Complimentary Gift Charm:</span>
                            <span className="font-bold">FREE 🎁</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleBackToCartStep}
                        className="w-full mt-1 py-1.5 text-center text-[11px] font-bold text-primary dark:text-secondary-light hover:underline flex items-center justify-center gap-1"
                      >
                        <Edit3 size={11} />
                        <span>Edit items or quantities</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* EXPRESS CHECKOUT BANNER FOR MOBILE */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/40 space-y-2 shadow-2xs">
                  <div className="flex items-start gap-2">
                    <Zap size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
                        Prefer to share address in WhatsApp?
                      </h4>
                      <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/80 mt-0.5 leading-snug">
                        Skip typing the form and directly send your address in chat!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppCheckout(true)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <WhatsAppIcon size={14} />
                    <span>Instant WhatsApp Order (Skip Form)</span>
                  </button>
                </div>

                {/* FORM HEADING & USER STATUS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-rose-500" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary dark:text-white">
                        Delivery Address
                      </h3>
                    </div>

                    {user && user.isLoggedIn ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        <UserCheck size={11} />
                        Auto-Filled
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleProceedToLogin}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        <LogIn size={11} />
                        Sign in (optional)
                      </button>
                    )}
                  </div>

                  {/* Validation Error Banner */}
                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                      <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">{errorMessage}</p>
                        <button
                          type="button"
                          onClick={() => handleWhatsAppCheckout(true)}
                          className="text-[10px] underline font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 mt-1 block"
                        >
                          Or proceed with WhatsApp without typing →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORM FIELDS OPTIMIZED FOR MOBILE TOUCH */}
                  <div className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-primary/80 dark:text-gray-200 mb-1">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-3 text-primary/40 dark:text-gray-500 pointer-events-none" />
                        <input
                          ref={nameInputRef}
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="e.g. Priya Sundaram"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={`w-full text-sm sm:text-xs pl-10 pr-3.5 py-2.5 rounded-xl border ${
                            errorMessage && !name.trim()
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-primary/15 dark:border-white/15'
                          } bg-white dark:bg-navy text-primary dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs`}
                        />
                      </div>
                    </div>

                    {/* WhatsApp / Mobile Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-primary/80 dark:text-gray-200">
                          WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                        </label>
                        {isPhoneValid && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <Check size={12} /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute left-3.5 top-3 flex items-center pointer-events-none">
                          <WhatsAppIcon size={16} />
                        </div>
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          inputMode="tel"
                          required
                          autoComplete="tel"
                          placeholder="10-digit mobile number"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value.replace(/[^0-9+]/g, ''));
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={`w-full text-sm sm:text-xs pl-10 pr-3.5 py-2.5 rounded-xl border ${
                            errorMessage && (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10)
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-primary/15 dark:border-white/15'
                          } bg-white dark:bg-navy text-primary dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs`}
                        />
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <label className="block text-xs font-bold text-primary/80 dark:text-gray-200 mb-1">
                        Delivery Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Home size={16} className="absolute left-3.5 top-3 text-primary/40 dark:text-gray-500 pointer-events-none" />
                        <textarea
                          ref={addressInputRef}
                          rows={2}
                          required
                          autoComplete="street-address"
                          placeholder="House/Flat No., Street, Area, Landmark"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={`w-full text-sm sm:text-xs pl-10 pr-3.5 py-2.5 rounded-xl border ${
                            errorMessage && !address.trim()
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-primary/15 dark:border-white/15'
                          } bg-white dark:bg-navy text-primary dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs resize-none`}
                        />
                      </div>
                    </div>

                    {/* Pincode & City (2 Columns) */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-primary/80 dark:text-gray-200">
                            Pincode <span className="text-rose-500">*</span>
                          </label>
                          {isPincodeValid && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <input
                          ref={pincodeInputRef}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          autoComplete="postal-code"
                          placeholder="6 digits"
                          value={pincode}
                          onChange={(e) => {
                            setPincode(e.target.value.replace(/[^0-9]/g, ''));
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={`w-full text-sm sm:text-xs px-3.5 py-2.5 rounded-xl border ${
                            errorMessage && (!pincode.trim() || pincode.replace(/[^0-9]/g, '').length < 6)
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-primary/15 dark:border-white/15'
                          } bg-white dark:bg-navy text-primary dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs`}
                        />
                        <span className="text-[10px] text-primary/50 dark:text-gray-400 mt-1 block truncate">
                          {shipping.region}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-primary/80 dark:text-gray-200 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          autoComplete="address-level2"
                          placeholder="e.g. Coimbatore"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full text-sm sm:text-xs px-3.5 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-primary dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
                        />
                        <span className="text-[10px] text-primary/50 dark:text-gray-400 mt-1 block truncate">
                          State: {state}
                        </span>
                      </div>
                    </div>

                    {/* Special Instructions / Notes */}
                    <div>
                      <input
                        type="text"
                        placeholder="Gift Note or Custom Color Request (Optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full text-xs px-3.5 py-2 rounded-xl border border-primary/10 dark:border-white/10 bg-gray-50/50 dark:bg-navy text-primary dark:text-gray-300 italic focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================== STICKY MOBILE FOOTER (STEP 1 vs STEP 2) ================== */}
        {cartItems.length > 0 && !placedOrderId && (
          <div
            className="p-3.5 sm:p-4 border-t border-primary/10 dark:border-white/10 bg-white/95 dark:bg-navy-light/95 backdrop-blur-md space-y-2.5 flex-shrink-0 z-20"
            style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
          >
            {checkoutStep === 'cart' ? (
              /* --- STEP 1 FOOTER: PROCEED TO CHECKOUT --- */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-primary/60 dark:text-gray-400 uppercase tracking-wider block font-bold">
                      Subtotal
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-primary dark:text-white">
                        ₹{totalPrice - couponDiscount}
                      </span>
                      {couponDiscount > 0 && (
                        <span className="text-xs text-primary/40 line-through">₹{totalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
                      {shipping.fee === 0 ? 'Free Delivery' : `+ ₹${shipping.fee} Delivery`}
                    </span>
                    {isFreeGiftUnlocked && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        + Free Mini Gift 🎁
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoToDetailsStep}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-primary to-primary-light hover:brightness-105 active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>

                <div className="flex items-center justify-between text-[11px] text-primary/50 dark:text-gray-400 px-1 pt-0.5">
                  <span>🌸 Handcrafted with care</span>
                  <button
                    type="button"
                    onClick={() => handleWhatsAppCheckout(true)}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    ⚡ Express WhatsApp Order
                  </button>
                </div>
              </div>
            ) : (
              /* --- STEP 2 FOOTER: PLACE ORDER ACTIONS --- */
              <div className="space-y-2">
                {/* Total amount summary line */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-primary/60 dark:text-gray-400 font-semibold block">
                      Total Payable Amount
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
                        ₹{grandTotal}
                      </span>
                      {couponDiscount > 0 && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          (Saved ₹{couponDiscount})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full ${shipping.fee === 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-navy text-primary/70 dark:text-gray-300'}`}>
                      {shipping.fee === 0 ? 'FREE Shipping' : `Shipping ₹${shipping.fee}`}
                    </span>
                  </div>
                </div>

                {/* Primary: Order via WhatsApp */}
                <button
                  type="button"
                  disabled={isPlacingOrder}
                  onClick={() => handleWhatsAppCheckout(false)}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-80 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Generating Order...</span>
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon size={19} />
                      <span>Order via WhatsApp</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Secondary: Instagram DM */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isPlacingOrder}
                    onClick={() => handleInstagramCheckout(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-pink-50 dark:bg-pink-950/30 hover:bg-pink-100 dark:hover:bg-pink-950/50 active:scale-[0.99] text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900/40 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <InstagramIcon size={14} />
                    <span>Order via Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToCartStep}
                    className="py-2 px-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-primary/70 dark:text-gray-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Back to Bag
                  </button>
                </div>

                {/* Micro trust badge */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-primary/50 dark:text-gray-400 pt-0.5">
                  <span>🌸 100% Handcrafted</span>
                  <span>•</span>
                  <span>💬 Direct WhatsApp Confirmation</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
