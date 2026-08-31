import React, { useState } from 'react';
import { Sparkles, ArrowRight, MessageCircleHeart, CheckCircle, Gift, Star } from 'lucide-react';
import { ALL_PRODUCTS } from '../data/products';
import type { Product } from '../data/products';
import { ProductModal } from '../components/ProductModal';
import { OrderGuide } from '../components/OrderGuide';
import { ProductQuantityControl } from '../components/ProductQuantityControl';

interface HomeProps {
  onNavigateToCollection: () => void;
  onNavigateToKeychains: () => void;
  onNavigateToTableTops: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onNavigateToCollection,
  onNavigateToKeychains,
  onNavigateToTableTops,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Featured 6 highlight products
  const featuredProducts = ALL_PRODUCTS.filter(
    (p) => p.isBestSeller || ['duck', 'single_tulip_pot', 'luffy', 'custom_jersey'].includes(p.id)
  ).slice(0, 6);

  const creationOfTheWeek = ALL_PRODUCTS.find((p) => p.id === 'four_tulips_pot') || ALL_PRODUCTS[0];

  return (
    <div className="w-full flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative w-full bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-navy-dark dark:via-navy dark:to-navy py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-500" />
              100% Handcrafted Pipe Cleaner Art
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-primary dark:text-white leading-[1.1] tracking-tight">
              Handmade Keepsakes Twisted With Love
            </h1>

            <p className="text-base sm:text-lg text-primary/70 dark:text-gray-300 leading-relaxed max-w-2xl">
              Welcome to <strong>Petalorah</strong>! We craft adorable fluffy keychains, miniature table top flower pots, anime charms, and custom flower bouquets that stay fresh forever.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onNavigateToCollection}
                className="px-6 py-3.5 rounded-2xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
              >
                Browse All Crafts ({ALL_PRODUCTS.length})
                <ArrowRight size={18} />
              </button>

              <a
                href="https://instagram.com/petalorah"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50 font-bold text-sm hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-all flex items-center gap-2"
              >
                <MessageCircleHeart size={18} className="text-pink-500" />
                Custom Order on IG
              </a>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary/10 dark:border-white/10 text-xs font-medium text-primary/80 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Soft & Durable</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Custom Color Request</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Fast Direct DM Order</span>
              </div>
            </div>
          </div>

          {/* Right Column Showcase Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              onClick={() => setSelectedProduct(creationOfTheWeek)}
              className="relative w-full max-w-sm rounded-3xl p-4 bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-2xl cursor-pointer group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 dark:bg-navy mb-4">
                <img
                  src={creationOfTheWeek.img}
                  alt={creationOfTheWeek.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  ✨ Creation of the Week
                </span>
              </div>
              <div className="flex justify-between items-center px-2 pb-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                    {creationOfTheWeek.name}
                  </h3>
                  <p className="text-xs text-primary/60 dark:text-gray-400">
                    Handcrafted Premium Flower Pot
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-lg font-bold text-primary dark:text-secondary-light">
                    {creationOfTheWeek.price}
                  </span>
                  <ProductQuantityControl product={creationOfTheWeek} size="sm" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* QUICK CATEGORY SELECTOR CARDS */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div
            onClick={onNavigateToKeychains}
            className="p-6 rounded-3xl bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent border border-pink-500/20 hover:border-pink-500/40 cursor-pointer transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Gift size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary dark:text-white">
              Fluffy Keychains
            </h3>
            <p className="text-xs text-primary/70 dark:text-gray-300 mt-1">
              Roses, Tulips, Ducks, Anime Straw Hats, Custom Initials & more (17 items starting at ₹35).
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 dark:text-pink-400 mt-4 group-hover:underline">
              Explore Keychains <ArrowRight size={14} />
            </span>
          </div>

          <div
            onClick={onNavigateToTableTops}
            className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary dark:text-white">
              Table Top Pots
            </h3>
            <p className="text-xs text-primary/70 dark:text-gray-300 mt-1">
              Single & multi-tulip garden pots and sunflower desk decorations (starts at ₹169).
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-4 group-hover:underline">
              Explore Table Tops <ArrowRight size={14} />
            </span>
          </div>

          <div
            onClick={onNavigateToCollection}
            className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Star size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary dark:text-white">
              Custom Crafts & Bouquets
            </h3>
            <p className="text-xs text-primary/70 dark:text-gray-300 mt-1">
              Custom sports jerseys, custom initial letters, and handcrafted everlasting flower bouquets.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 mt-4 group-hover:underline">
              View Custom Crafts <ArrowRight size={14} />
            </span>
          </div>

        </div>
      </section>

      {/* FEATURED CRAFTS GRID */}
      <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary/70 dark:text-secondary-light">
              Popular Picks
            </span>
            <h2 className="font-serif text-3xl font-bold text-primary dark:text-white mt-1">
              Featured Handmade Crafts
            </h2>
          </div>
          <button
            onClick={onNavigateToCollection}
            className="text-xs font-bold text-primary dark:text-secondary-light hover:underline flex items-center gap-1"
          >
            View All ({ALL_PRODUCTS.length} items) <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => setSelectedProduct(prod)}
              className="p-3 rounded-2xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-navy mb-3">
                  <img
                    src={prod.img}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.badge && (
                    <span className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {prod.badge}
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-sm font-bold text-primary dark:text-white line-clamp-1">
                  {prod.name}
                </h4>
              </div>

              <div className="mt-2 flex items-center justify-between pt-2 border-t border-primary/5 dark:border-white/5">
                <span className="text-sm font-extrabold text-primary dark:text-secondary-light">
                  {prod.price}
                </span>
                <ProductQuantityControl product={prod} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW TO ORDER GUIDE */}
      <OrderGuide />

      {/* PRODUCT DETAILS MODAL */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

    </div>
  );
};
