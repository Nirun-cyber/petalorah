import React from 'react';
import { Heart, Sparkles, Flower2, Gift, Palette } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section id="our-story" className="w-full py-4 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-50/70 via-white to-blue-50/40 dark:from-navy-light/50 dark:via-navy-light/30 dark:to-navy/40 border border-primary/10 dark:border-white/10 p-3.5 sm:p-10 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 items-center">
          
          {/* Left Column: Human Story */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light text-[11px] sm:text-xs font-semibold tracking-wide">
              <Flower2 size={12} className="text-rose-500" />
              <span>Our Story</span>
            </div>

            <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-primary dark:text-white tracking-tight leading-tight">
              Twisted with Patience, <br className="hidden sm:inline" />Crafted to Stay Fresh Forever
            </h2>

            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-primary/80 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>Petalorah</strong> started with a simple passion: taking soft, colorful pipe cleaners and hand-sculpting them into blooms and whimsical keepsakes that never fade away.
              </p>
              <p>
                Real flowers bring warmth, but they wilt in days. Our handcrafted pipe cleaner flowers and pocket charms stay vibrant for years — sitting gently on your work desk, accompanying your keys, or bringing a smile to someone dear on their special day.
              </p>
              <p>
                Every single petal, leaf, and charm is individually shaped and assembled by hand. There are no factory lines or cookie-cutter molds here — just honest craft, patience, and love poured into every twist.
              </p>
            </div>
          </div>

          {/* Right Column: Why Petalorah Cards */}
          <div className="lg:col-span-5 space-y-2 sm:space-y-3">
            <h3 className="font-serif text-sm sm:text-lg font-bold text-primary dark:text-white mb-1 sm:mb-2">
              Why Choose Petalorah?
            </h3>

            <div className="space-y-2 sm:space-y-2.5">
              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-navy/80 border border-primary/10 dark:border-white/10 shadow-xs flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-primary dark:text-white">
                    Handmade with Care
                  </h4>
                  <p className="text-[11px] sm:text-xs text-primary/70 dark:text-gray-300 mt-0.5">
                    Every piece is crafted one-by-one by an independent artisan.
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-navy/80 border border-primary/10 dark:border-white/10 shadow-xs flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-primary dark:text-white">
                    Cute & Unique Designs
                  </h4>
                  <p className="text-[11px] sm:text-xs text-primary/70 dark:text-gray-300 mt-0.5">
                    Original flower pots, anime motifs, and whimsical charms not found in stores.
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-navy/80 border border-primary/10 dark:border-white/10 shadow-xs flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Palette size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-primary dark:text-white">
                    Customization When Available
                  </h4>
                  <p className="text-[11px] sm:text-xs text-primary/70 dark:text-gray-300 mt-0.5">
                    Choose petal shades, custom sports jersey numbers, or initial letters.
                  </p>
                </div>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-navy/80 border border-primary/10 dark:border-white/10 shadow-xs flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Gift size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-primary dark:text-white">
                    Everlasting Keepsakes
                  </h4>
                  <p className="text-[11px] sm:text-xs text-primary/70 dark:text-gray-300 mt-0.5">
                    Durable pipe cleaner materials that retain their shape and color forever.
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
