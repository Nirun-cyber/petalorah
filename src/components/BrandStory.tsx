import React from 'react';
import { Heart, Sparkles, Flower2, Gift, Palette } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section id="our-story" className="w-full py-3 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-50/70 via-white to-blue-50/40 dark:from-navy-light/50 dark:via-navy-light/30 dark:to-navy/40 border border-primary/10 dark:border-white/10 p-3 sm:p-6 lg:p-7 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
          
          {/* Left Column: Human Story */}
          <div className="lg:col-span-6 space-y-2 sm:space-y-3 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light text-[10px] sm:text-xs font-semibold tracking-wide">
              <Flower2 size={12} className="text-rose-500" />
              <span>Our Story</span>
            </div>

            <h2 className="font-serif text-lg sm:text-2xl font-bold text-primary dark:text-white tracking-tight leading-snug">
              Twisted with Patience, Crafted to Stay Fresh Forever
            </h2>

            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-primary/80 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>Petalorah</strong> sculpts soft, colorful pipe cleaners into whimsical blooms, tabletop flower pots, and pocket charms that never fade away.
              </p>
              <p>
                Unlike real flowers that wilt in days, our keepsakes stay vibrant for years — shaped individually with patience, honesty, and love in every single twist.
              </p>
            </div>
          </div>

          {/* Right Column: Why Petalorah 2x2 Grid */}
          <div className="lg:col-span-6 space-y-1.5 sm:space-y-2">
            <h3 className="font-serif text-xs sm:text-sm font-bold text-primary dark:text-white uppercase tracking-wider">
              Why Choose Petalorah?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-navy/80 border border-primary/10 dark:border-white/10 shadow-2xs flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart size={13} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-primary dark:text-white">
                    Handmade with Care
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-primary/70 dark:text-gray-300 mt-0.5 leading-tight">
                    Every piece is crafted one-by-one by an independent artisan.
                  </p>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-navy/80 border border-primary/10 dark:border-white/10 shadow-2xs flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={13} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-primary dark:text-white">
                    Unique Designs
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-primary/70 dark:text-gray-300 mt-0.5 leading-tight">
                    Original flower pots, anime motifs, and whimsical charms.
                  </p>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-navy/80 border border-primary/10 dark:border-white/10 shadow-2xs flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Palette size={13} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-primary dark:text-white">
                    Custom Requests
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-primary/70 dark:text-gray-300 mt-0.5 leading-tight">
                    Pick your petal shades, jersey numbers, or initial letters.
                  </p>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-navy/80 border border-primary/10 dark:border-white/10 shadow-2xs flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Gift size={13} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-primary dark:text-white">
                    Forever Blooms
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-primary/70 dark:text-gray-300 mt-0.5 leading-tight">
                    Durable pipe cleaner art that retains shape and color forever.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BrandStory;
