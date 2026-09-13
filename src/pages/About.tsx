import React, { useEffect } from 'react';
import { ArrowLeft, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import { BrandStory } from '../components/BrandStory';
import { HowItsMade } from '../components/HowItsMade';
import { DeliveryAndPolicies } from '../components/DeliveryAndPolicies';
import { OrderGuide } from '../components/OrderGuide';

interface AboutProps {
  onNavigateHome: () => void;
  onNavigateToKeychains?: () => void;
  onNavigateToTableTops?: () => void;
}

export const About: React.FC<AboutProps> = ({
  onNavigateHome,
  onNavigateToKeychains,
  onNavigateToTableTops,
}) => {
  useEffect(() => {
    // Check if there's an anchor hash in URL (e.g. #delivery-info or #our-story)
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="w-full flex flex-col min-h-screen animate-in fade-in duration-300 pb-16">
      {/* Page Header / Hero */}
      <section className="w-full bg-gradient-to-b from-rose-50/60 via-white to-white dark:from-navy-dark dark:via-navy dark:to-navy pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-primary/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary/70 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light text-xs font-semibold">
              <Heart size={13} className="text-rose-500 fill-current" />
              <span>Meet Petalorah</span>
            </span>
          </div>

          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-primary dark:text-white tracking-tight leading-tight">
              About Petalorah
            </h1>
            <p className="text-sm sm:text-base text-primary/70 dark:text-gray-300 mt-2 leading-relaxed">
              Discover our story, learn how our pipe cleaner flowers and pocket keepsakes are handcrafted one-by-one, view delivery details, and see how easy it is to place your custom order.
            </p>
          </div>

          {/* Quick Anchor Navigation Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-navy-light border border-primary/15 dark:border-white/15 text-primary dark:text-gray-200 hover:border-rose-400 transition-colors shadow-2xs"
            >
              🌸 Our Story
            </button>
            <button
              onClick={() => document.getElementById('how-its-made')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-navy-light border border-primary/15 dark:border-white/15 text-primary dark:text-gray-200 hover:border-rose-400 transition-colors shadow-2xs"
            >
              ✨ How It&apos;s Made
            </button>
            <button
              onClick={() => document.getElementById('delivery-info')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-navy-light border border-primary/15 dark:border-white/15 text-primary dark:text-gray-200 hover:border-rose-400 transition-colors shadow-2xs"
            >
              🚚 Delivery &amp; Policies
            </button>
            <button
              onClick={() => document.getElementById('order-guide')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-navy-light border border-primary/15 dark:border-white/15 text-primary dark:text-gray-200 hover:border-rose-400 transition-colors shadow-2xs"
            >
              💬 How to Order
            </button>
          </div>
        </div>
      </section>

      {/* Main Shifted Content Sections */}
      <div className="space-y-4">
        {/* 1. OUR STORY & WHY PETALORAH */}
        <BrandStory />

        {/* 2. HOW IT'S MADE — 4-STEP CRAFTSMANSHIP */}
        <div id="how-its-made" className="scroll-mt-20">
          <HowItsMade />
        </div>

        {/* 3. DELIVERY & POLICIES */}
        <DeliveryAndPolicies />

        {/* 4. HOW TO ORDER GUIDE */}
        <div id="order-guide" className="scroll-mt-20">
          <OrderGuide />
        </div>
      </div>

      {/* Bottom CTA Banner */}
      {(onNavigateToKeychains || onNavigateToTableTops) && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="rounded-3xl bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-serif text-xl sm:text-2xl font-bold">
                Ready to find your handmade keepsake?
              </h3>
              <p className="text-xs sm:text-sm text-white/90">
                Explore our soft fluffy keychains and miniature tabletop pots crafted to stay fresh forever.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {onNavigateToKeychains && (
                <button
                  onClick={onNavigateToKeychains}
                  className="px-5 py-2.5 rounded-2xl bg-white text-rose-600 font-bold text-xs sm:text-sm hover:bg-white/90 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <ShoppingBag size={15} />
                  <span>Keychains</span>
                </button>
              )}
              {onNavigateToTableTops && (
                <button
                  onClick={onNavigateToTableTops}
                  className="px-5 py-2.5 rounded-2xl bg-rose-700/60 hover:bg-rose-700/80 text-white font-bold text-xs sm:text-sm border border-white/20 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles size={15} />
                  <span>Table Tops</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
