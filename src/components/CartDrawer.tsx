import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  MessageCircleHeart,
  MessageSquareCode,
  Truck,
  MapPin,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Phone,
  Home,
  LogIn,
} from 'lucide-react';
import { useCart, calculateShippingFee, type CustomerCheckoutInfo } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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

  const formRef = useRef<HTMLDivElement>(null);
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

  // Sync state if customer logs in or updates profile
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.address?.street && !address) setAddress(user.address.street);
      if (user.address?.city && !city) setCity(user.address.city);
      if (user.address?.state && !state) setState(user.address.state);
      if (user.address?.pincode && !pincode) setPincode(user.address.pincode);
    }
  }, [user]);

  if (!isCartOpen) return null;

  // Free Mini Charm Offer (Threshold: ₹200)
  const FREE_GIFT_THRESHOLD = 200;
  const isFreeGiftUnlocked = totalPrice >= FREE_GIFT_THRESHOLD;
  const amountNeededForFreeGift = Math.max(0, FREE_GIFT_THRESHOLD - totalPrice);
  const freeGiftProgressPercent = Math.min(100, Math.round((totalPrice / FREE_GIFT_THRESHOLD) * 100));

  // Dynamic Shipping Calculation based on entered Pincode & City
  const shipping = calculateShippingFee(pincode, city, state);
  const grandTotal = totalPrice + shipping.fee;

  const handleProceedToLogin = () => {
    closeCart();
    if (onNavigateToLogin) {
      onNavigateToLogin();
    }
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
    const customerInfo = validateAndGetCustomerInfo(allowQuickCheckout);
    if (!customerInfo) return;

    const orderId = proceedToWhatsAppOrder(shipping.fee, shipping.region, customerInfo);
    setPlacedOrderId(orderId);
  };

  const handleInstagramCheckout = async (allowQuickCheckout = false) => {
    const customerInfo = validateAndGetCustomerInfo(allowQuickCheckout);
    if (!customerInfo) return;

    const orderId = await proceedToInstagramOrder(shipping.fee, shipping.region, customerInfo);
    setPlacedOrderId(orderId);
  };

  const handleClosePlacedModal = () => {
    setPlacedOrderId(null);
    clearCart();
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0" onClick={closeCart} />

      {/* Cart Panel Drawer */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-navy-light border-l border-primary/10 dark:border-white/10 shadow-2xl z-10 flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-primary/10 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-white dark:bg-navy-light">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary dark:text-secondary-light" size={20} />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-primary dark:text-white">
              Your Cart
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            onClick={closeCart}
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-primary dark:text-gray-200 transition-colors"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* ORDER SUCCESS SCREEN (if order was just placed) */}
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
              Your order is saved and the pre-filled message has been generated. Please send the message in WhatsApp to confirm your items & payment details!
            </p>

            <div className="w-full space-y-2.5 pt-3">
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
              >
                <MessageSquareCode size={16} />
                <span>Open WhatsApp Again</span>
              </button>

              <button
                onClick={handleClosePlacedModal}
                className="w-full py-2.5 px-4 rounded-2xl bg-gray-100 dark:bg-navy text-primary dark:text-gray-200 font-bold text-xs hover:bg-gray-200 dark:hover:bg-navy-dark transition-colors"
              >
                Done & Clear Cart
              </button>
            </div>
          </div>
        ) : (
          /* CART ITEMS & GUEST CHECKOUT FORM */
          <div
            data-lenis-prevent
            className="flex-grow min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4"
          >
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16 px-4 animate-in fade-in duration-300">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-100 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/30 flex items-center justify-center text-3xl shadow-sm border border-rose-200/60 dark:border-rose-900/40">
                  🌸
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-primary dark:text-white">
                    Your cart is feeling a little empty 🌸
                  </h3>
                  <p className="text-xs text-primary/70 dark:text-gray-300 leading-relaxed">
                    Explore our handmade creations and find something you love.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Shop Now</span>
                </button>
              </div>
            ) : (
              <>
                {/* FREE MINI CHARM PROGRESS CARD */}
                <div
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 ${
                    isFreeGiftUnlocked
                      ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 shadow-sm'
                      : 'bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50/50 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-amber-950/20 border-rose-200/80 dark:border-rose-900/40'
                  }`}
                >
                  <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 sm:gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base animate-bounce flex-shrink-0" style={{ animationDuration: '2s' }}>
                        🎁
                      </span>
                      <span
                        className={`text-xs font-bold leading-tight ${
                          isFreeGiftUnlocked
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-rose-900 dark:text-rose-200'
                        }`}
                      >
                        {isFreeGiftUnlocked ? (
                          <span>You've unlocked your <strong>FREE mini charm!</strong></span>
                        ) : (
                          <span>
                            Add <strong>₹{amountNeededForFreeGift}</strong> more to unlock your <strong>FREE mini charm 🎁</strong>
                          </span>
                        )}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex-shrink-0 self-start xs:self-auto ${
                        isFreeGiftUnlocked
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isFreeGiftUnlocked ? 'Unlocked ✨' : `₹${totalPrice} / ₹200`}
                    </span>
                  </div>

                  {/* Progress track bar */}
                  <div className="w-full bg-white/80 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-black/5 dark:border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFreeGiftUnlocked
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-r from-rose-500 to-pink-500'
                      }`}
                      style={{ width: `${freeGiftProgressPercent}%` }}
                    />
                  </div>

                  {isFreeGiftUnlocked && (
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
                      <span>✨ A complimentary handcrafted mini surprise charm will be packed inside your order!</span>
                    </p>
                  )}
                </div>

                {/* 1. Item list */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary/60 dark:text-gray-400">
                    Selected Items ({totalItems})
                  </span>

                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/5 dark:border-white/5 shadow-xs"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-navy-light flex-shrink-0 border border-primary/10 dark:border-white/10">
                        <img
                          src={item.product.img}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details & Quantity */}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-serif text-xs sm:text-sm font-bold text-primary dark:text-white truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs text-primary/70 dark:text-gray-300 mt-0.5">
                          ₹{item.product.numericPrice} each
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center border border-primary/15 dark:border-white/15 rounded-xl overflow-hidden bg-white dark:bg-navy-light shadow-2xs">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-primary dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="px-2 text-xs font-bold text-primary dark:text-white min-w-[18px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-primary dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Item Subtotal */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs sm:text-sm font-extrabold text-primary dark:text-secondary-light">
                          ₹{item.product.numericPrice * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. GUEST DELIVERY DETAILS FORM */}
                <div className="pt-2 border-t border-primary/10 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-rose-500" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary dark:text-white">
                        Delivery & Contact Details
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

                  {/* Validation Error Banner if user left fields blank */}
                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                      <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Customer Form Inputs */}
                  <div className="space-y-2.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-primary/70 dark:text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-2.5 text-primary/40 dark:text-gray-500" />
                        <input
                          ref={nameInputRef}
                          type="text"
                          required
                          placeholder="e.g. Priya Sundaram"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={`w-full text-xs pl-8 pr-3 py-2 rounded-xl border ${
                            errorMessage && !name.trim()
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-primary/15 dark:border-white/15'
                          } bg-white dark:bg-navy text-primary dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20`}
                        />
                      </div>
                    </div>

                    {/* WhatsApp / Phone Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-primary/70 dark:text-gray-300 mb-1">
                        WhatsApp / Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-2.5 text-primary/40 dark:text-gray-500" />
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          required
                          placeholder="e.g. 9876543210 (10 digits)"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value.replace(/[^0-9+]/g, ''));
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={`w-full text-xs pl-8 pr-3 py-2 rounded-xl border ${
                            errorMessage && (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10)
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-primary/15 dark:border-white/15'
                          } bg-white dark:bg-navy text-primary dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20`}
                        />
                      </div>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-[11px] font-bold text-primary/70 dark:text-gray-300 mb-1">
                        Delivery Address (House / Street / Area) *
                      </label>
                      <div className="relative">
                        <Home size={14} className="absolute left-3 top-2.5 text-primary/40 dark:text-gray-500" />
                        <textarea
                          ref={addressInputRef}
                          rows={2}
                          required
                          placeholder="House / Flat No., Street, Landmark"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={`w-full text-xs pl-8 pr-3 py-2 rounded-xl border ${
                            errorMessage && !address.trim()
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-primary/15 dark:border-white/15'
                          } bg-white dark:bg-navy text-primary dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none`}
                        />
                      </div>
                    </div>

                    {/* Pincode & City */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-primary/70 dark:text-gray-300 mb-1">
                          Pincode *
                        </label>
                        <input
                          ref={pincodeInputRef}
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 641001"
                          value={pincode}
                          onChange={(e) => {
                            setPincode(e.target.value.replace(/[^0-9]/g, ''));
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={`w-full text-xs px-3 py-2 rounded-xl border ${
                            errorMessage && (!pincode.trim() || pincode.replace(/[^0-9]/g, '').length < 6)
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-primary/15 dark:border-white/15'
                          } bg-white dark:bg-navy text-primary dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20`}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-primary/70 dark:text-gray-300 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Coimbatore"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-primary dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                      </div>
                    </div>

                    {/* Optional Custom Note */}
                    <div>
                      <input
                        type="text"
                        placeholder="Special Note / Custom Color Request (Optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full text-[11px] px-3 py-1.5 rounded-xl border border-primary/10 dark:border-white/10 bg-gray-50/50 dark:bg-navy text-primary dark:text-gray-300 italic focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. FOOTER: SUBTOTAL, SHIPPING & CHECKOUT CTAS */}
        {cartItems.length > 0 && !placedOrderId && (
          <div className="p-4 sm:p-5 border-t border-primary/10 dark:border-white/10 bg-white/95 dark:bg-navy/95 backdrop-blur-md space-y-3 flex-shrink-0">
            {/* Live Pricing Breakdown */}
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/10 dark:border-white/10 space-y-1.5 text-xs text-primary/80 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-primary dark:text-white">₹{totalPrice}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Truck size={12} className="text-rose-500" />
                  Delivery ({shipping.region}):
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  ₹{shipping.fee}
                </span>
              </div>

              {isFreeGiftUnlocked && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <span>🎁 Mini Gift Charm:</span>
                  </span>
                  <span className="uppercase text-[11px] bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold text-primary dark:text-white pt-1.5 border-t border-primary/10 dark:border-white/10">
                <span>Total Amount:</span>
                <span className="text-base text-rose-600 dark:text-rose-400 font-black">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Validation Error Banner right in footer so customer is never confused */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 shadow-sm animate-in fade-in">
                <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      handleWhatsAppCheckout(true);
                    }}
                    className="text-[11px] underline font-bold text-rose-800 dark:text-rose-200 hover:text-rose-950 block"
                  >
                    Or skip &amp; send delivery address directly in WhatsApp chat →
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleWhatsAppCheckout(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                <MessageSquareCode size={16} />
                <span>Order via WhatsApp</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => handleInstagramCheckout(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                <MessageCircleHeart size={15} />
                <span>Order via Instagram DM (Copied)</span>
              </button>
            </div>

            {/* Clear Cart Link */}
            <div className="text-center pt-0.5">
              <button
                onClick={clearCart}
                className="text-[11px] text-primary/50 dark:text-gray-400 hover:text-rose-500 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
