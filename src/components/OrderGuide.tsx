import React from 'react';
import { ShoppingBag, Palette, MessageCircleHeart, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useSettings } from '../context/SettingsContext';

export const OrderGuide: React.FC = () => {
  const { settings } = useSettings();
  const phone = (settings.whatsappNumber || '916380437068').replace(/[^0-9]/g, '');
  const steps = [
    {
      number: '01',
      icon: ShoppingBag,
      title: 'Pick Your Craft',
      description: 'Explore our keychains, table tops, miniature flower pots, or custom bouquets.',
    },
    {
      number: '02',
      icon: Palette,
      title: 'Choose Custom Colors',
      description: 'Request custom petal colors, jersey numbers, initials, or personalized gift tags.',
    },
    {
      number: '03',
      icon: MessageCircleHeart,
      title: 'DM or WhatsApp Us',
      description: 'Send a message to @petalorah on Instagram or WhatsApp to finalize & place your order!',
    },
  ];

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hi Petalorah! I would like to place an order for a handmade craft.")}`;

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-primary/70 dark:text-secondary-light">
          Simple & Direct
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary dark:text-white mt-1">
          How To Place An Order
        </h2>
        <p className="text-sm text-primary/70 dark:text-gray-300 mt-2">
          Ordering your favorite handmade craft is super easy in just 3 quick steps!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-navy-light/40 border border-primary/10 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start"
            >
              <div className="flex items-center justify-between w-full mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light flex items-center justify-center font-bold">
                  <Icon size={24} />
                </div>
                <span className="font-serif text-3xl font-bold text-primary/20 dark:text-white/10">
                  {step.number}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-primary dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-primary/70 dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Direct Ordering Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
        {/* Instagram DM Button */}
        <a
          href="https://instagram.com/petalorah"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-full bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          <MessageCircleHeart size={16} className="shrink-0" />
          <span>Send a DM to @petalorah</span>
          <ArrowRight size={14} className="shrink-0" />
        </a>

        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 sm:px-6 sm:py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          <WhatsAppIcon size={18} className="shrink-0" />
          <span>Order on WhatsApp (63804 37068)</span>
          <ArrowRight size={14} className="shrink-0" />
        </a>
      </div>
    </section>
  );
};
