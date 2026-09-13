import React from 'react';
import { Truck, RotateCcw, Clock, ShieldCheck, MapPin, MessageSquare, Gift } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useSettings } from '../context/SettingsContext';

export const DeliveryAndPolicies: React.FC = () => {
  const { settings } = useSettings();
  const phone = settings.whatsappNumber || '63804 37068';

  return (
    <section id="delivery-info" className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light text-xs font-semibold tracking-wide">
          <Truck size={13} className="text-rose-500" />
          <span>Transparent Ordering</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary dark:text-white tracking-tight">
          Delivery, Shipping & Return Policies
        </h2>
        <p className="text-xs sm:text-sm text-primary/70 dark:text-gray-300">
          Everything you need to know about preparation times, shipping charges, and order care.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Card 1: Delivery & Shipping Information */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                Delivery & Shipping Details
              </h3>
              <p className="text-xs text-primary/60 dark:text-gray-400">
                Shipped securely across India
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-primary/80 dark:text-gray-300 leading-relaxed">
            {/* Rates Table */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/10 dark:border-white/10 space-y-2">
              <div className="font-bold text-primary dark:text-white flex items-center gap-1.5">
                <MapPin size={13} className="text-rose-500" /> Standard Delivery Charges
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-navy-light border border-primary/5 text-center">
                  <span className="block text-[11px] font-semibold text-primary/70 dark:text-gray-300">Coimbatore Local</span>
                  <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">₹60</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-navy-light border border-primary/5 text-center">
                  <span className="block text-[11px] font-semibold text-primary/70 dark:text-gray-300">Tamil Nadu</span>
                  <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">₹80</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-navy-light border border-primary/5 text-center">
                  <span className="block text-[11px] font-semibold text-primary/70 dark:text-gray-300">Other States</span>
                  <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">₹100</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                <Gift size={13} />
                <span>Special: Orders above ₹200 receive a FREE mini gift charm! 🎁</span>
              </div>
            </div>

            {/* Timelines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-2.5">
                <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary dark:text-white block">Preparation Time</span>
                  <p className="text-[11px] text-primary/70 dark:text-gray-300 mt-0.5">
                    1–3 business days for hand-twisting and careful packaging.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Truck size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-primary dark:text-white block">Transit Time</span>
                  <p className="text-[11px] text-primary/70 dark:text-gray-300 mt-0.5">
                    3–5 business days via trusted India courier / postal services.
                  </p>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-navy border border-blue-100 dark:border-white/5 text-[11px] text-blue-900 dark:text-blue-200 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <MessageSquare size={12} /> Live Updates & Tracking
              </span>
              <p>
                After your order is placed, you receive confirmation and tracking details via WhatsApp. You can also track your status anytime with our Track Order tool.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Returns & Cancellations Information */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                Cancellations & Returns
              </h3>
              <p className="text-xs text-primary/60 dark:text-gray-400">
                Fair & friendly handmade support
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-primary/80 dark:text-gray-300 leading-relaxed">
            <div className="space-y-1">
              <h4 className="font-bold text-primary dark:text-white flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" /> Order Cancellations
              </h4>
              <p>
                If you need to cancel an order, please contact us on WhatsApp as soon as possible before your craft has been prepared or dispatched.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-primary dark:text-white flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-indigo-500" /> Custom / Personalized Orders
              </h4>
              <p>
                Custom pieces (such as personalized sports jerseys and initial charms) are made specifically for you. Color preferences and initials are confirmed with you in chat before handcrafting begins.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-primary dark:text-white flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-rose-500" /> Damage in Transit Guarantee
              </h4>
              <p>
                We carefully package all flowerpots and charms with bubble wrap. In the unlikely event an item arrives damaged, please take a quick photo/video and message us on WhatsApp within 48 hours of delivery — we will gladly review and make it right!
              </p>
            </div>

            <div className="pt-2 border-t border-primary/10 dark:border-white/10 flex items-center justify-between text-[11px] text-primary/70 dark:text-gray-300">
              <span>Have a question about an order?</span>
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5"
              >
                <WhatsAppIcon size={14} />
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
