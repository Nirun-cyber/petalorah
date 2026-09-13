import React from 'react';
import { Palette, Sparkles, SlidersHorizontal, PackageCheck, Scissors } from 'lucide-react';

export const HowItsMade: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Choose Your Idea',
      description: 'Select your favorite flower, keychain charm, table top pot, or custom creation from our catalog.',
      icon: Palette,
      color: 'text-pink-500 bg-pink-100 dark:bg-pink-950/60',
    },
    {
      step: '02',
      title: 'Shaped by Hand',
      description: 'Each petal, leaf, and curve is patiently coiled, twisted, and assembled petal-by-petal by hand.',
      icon: Scissors,
      color: 'text-amber-500 bg-amber-100 dark:bg-amber-950/60',
    },
    {
      step: '03',
      title: 'Personalize Details',
      description: 'Custom petal shades, jersey numbers, and initials are incorporated to match your custom request.',
      icon: SlidersHorizontal,
      color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950/60',
    },
    {
      step: '04',
      title: 'Packed With Love',
      description: 'Every piece is gently inspected, safely cushioned in protective wrap, and packed for safe arrival.',
      icon: PackageCheck,
      color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60',
    },
  ];

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light text-xs font-semibold tracking-wide">
          <Sparkles size={13} className="text-amber-500" />
          <span>Handmade Craftsmanship</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary dark:text-white tracking-tight">
          How It's Made — Handcrafted, Not Mass-Produced
        </h2>
        <p className="text-xs sm:text-sm text-primary/70 dark:text-gray-300">
          From individual fuzzy pipe cleaners to an everlasting floral keepsake.
        </p>
      </div>

      {/* 4-Step Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {steps.map((s) => {
          const IconComponent = s.icon;
          return (
            <div
              key={s.step}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-2xl ${s.color} flex items-center justify-center shrink-0`}>
                    <IconComponent size={20} />
                  </div>
                  <span className="font-serif text-2xl font-black text-primary/15 dark:text-white/15">
                    {s.step}
                  </span>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-primary dark:text-white mb-1.5">
                  {s.title}
                </h3>
                <p className="text-xs text-primary/70 dark:text-gray-300 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-primary/5 dark:border-white/5 flex items-center gap-1 text-[11px] font-semibold text-primary/60 dark:text-gray-400">
                <span>Handmade with care</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItsMade;
