import React from 'react';
import { Truck, RotateCcw, Clock, ShieldCheck, MapPin, MessageSquare, Gift } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useSettings } from '../context/SettingsContext';

export const DeliveryAndPolicies: React.FC = () => {
  const { settings } = useSettings();
  const phone = settings.whatsappNumber || '63804 37068';

  return (
    <section id="delivery-info" className="w-full py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-10 space-y-1 sm:space-y-2">
        <h2 className="font-serif text-xl sm:text-3xl font-bold text-primary dark:text-white tracking-tight">
          Delivery, Shipping & Return Policies
        </h2>
        <p className="text-xs sm:text-sm text-primary/70 dark:text-gray-300">
          Everything you need to know about preparation times, shipping charges, and order care.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        
        {/* Card 1: Delivery & Shipping Information */}
        <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-xs space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
              <Truck size={17} />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-primary dark:text-white">
                Delivery & Shipping Details
              </h3>
              <p className="text-[11px] sm:text-xs text-primary/60 dark:text-gray-400">
                Shipped securely across India
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 text-[11px] sm:text-xs text-primary/80 dark:text-gray-300 leading-relaxed">
            {/* Rates Table - 3-col on all screens */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-navy border border-primary/10 dark:border-white/10 space-y-1.5 sm:space-y-2">
              <div className="font-bold text-primary dark:text-white flex items-center gap-1.5 text-xs">
                <MapPin size={12} className="text-rose-500" /> Standard Delivery Charges
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-navy-light border border-primary/5 text-center">
                  <span className="block text-[10px] sm:text-[11px] font-semibold text-primary/70 dark:text-gray-300 truncate">Coimbatore</span>
                  <span className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400">₹{settings.shippingFeeCoimbatore ?? 60}</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-navy-light border border-primary/5 text-center">
                  <span className="block text-[10px] sm:text-[11px] font-semibold text-primary/70 dark:text-gray-300 truncate">Tamil Nadu</span>
                  <span className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400">₹{settings.shippingFeeTamilNadu ?? 80}</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white dark:bg-navy-light border border-primary/5 text-center">
                  <span className="block text-[10px] sm:text-[11px] font-semibold text-primary/70 dark:text-gray-300 truncate">Other States</span>
                  <span className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400">₹{settings.shippingFeeOtherStates ?? 100}</span>
                </div>
              </div>
              {settings.isFreeShippingEnabled && (
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5 sm:pt-1">
                  <Truck size={12} />
                  <span>Free Delivery on orders above ₹{settings.freeShippingThreshold ?? 799}! 🚚</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-semibold pt-0.5">
                <Gift size={12} />
                <span>Orders above ₹200 get a FREE mini charm! 🎁</span>
              </div>
            </div>

            {/* Timelines - 2 col on mobile */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5 sm:pt-1">
              <div className="flex items-start gap-1.5 sm:gap-2.5">
                <Clock size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary dark:text-white block text-xs">Prep Time</span>
                  <p className="text-[10px] sm:text-[11px] text-primary/70 dark:text-gray-300 mt-0.5">
                    1–3 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-1.5 sm:gap-2.5">
                <Truck size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary dark:text-white block text-xs">Transit Time</span>
                  <p className="text-[10px] sm:text-[11px] text-primary/70 dark:text-gray-300 mt-0.5">
                    3–5 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="p-2 sm:p-3 rounded-xl bg-blue-50/60 dark:bg-navy border border-blue-100 dark:border-white/5 text-[10px] sm:text-[11px] text-blue-900 dark:text-blue-200 space-y-0.5 sm:space-y-1">
              <span className="font-bold flex items-center gap-1">
                <MessageSquare size={11} /> Live Updates & Tracking
              </span>
              <p>
                Get tracking details via WhatsApp after dispatch, or use our on-site Track Order tool anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Returns & Cancellations Information */}
        <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-xs space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <RotateCcw size={17} />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-primary dark:text-white">
                Cancellations & Returns
              </h3>
              <p className="text-[11px] sm:text-xs text-primary/60 dark:text-gray-400">
                Fair & friendly handmade support
              </p>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3.5 text-[11px] sm:text-xs text-primary/80 dark:text-gray-300 leading-relaxed">
            <div className="space-y-0.5 sm:space-y-1">
              <h4 className="font-bold text-primary dark:text-white flex items-center gap-1.5 text-xs">
                <ShieldCheck size={13} className="text-emerald-500" /> Order Cancellations
              </h4>
              <p>
                If you need to cancel an order, please contact us on WhatsApp before your craft has been prepared or dispatched.
              </p>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <h4 className="font-bold text-primary dark:text-white flex items-center gap-1.5 text-xs">
                <ShieldCheck size={13} className="text-indigo-500" /> Custom / Personalized Orders
              </h4>
              <p>
                Custom pieces are made specifically for you. Color preferences and initials are confirmed with you in chat before handcrafting begins.
              </p>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <h4 className="font-bold text-primary dark:text-white flex items-center gap-1.5 text-xs">
                <ShieldCheck size={13} className="text-rose-500" /> Damage in Transit Guarantee
              </h4>
              <p>
                All flowerpots and charms are packed with bubble wrap. If an item arrives damaged, send a photo on WhatsApp within 48 hours — we'll make it right!
              </p>
            </div>

            <div className="pt-2 border-t border-primary/10 dark:border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] text-primary/70 dark:text-gray-300">
              <span>Have a question?</span>
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <WhatsAppIcon size={13} />
                <span>Chat on WhatsApp →</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DeliveryAndPolicies;
