import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import type { Product } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';
import { ProductModal } from '../components/ProductModal';
import { OrderGuide } from '../components/OrderGuide';
import { ProductQuantityControl } from '../components/ProductQuantityControl';
import { CustomerReviews } from '../components/CustomerReviews';
import { RealCreationsGallery } from '../components/RealCreationsGallery';
import { BrandStory } from '../components/BrandStory';
import { HowItsMade } from '../components/HowItsMade';
import { DeliveryAndPolicies } from '../components/DeliveryAndPolicies';

interface HomeProps {
  onNavigateToCollection: () => void;
  onNavigateToKeychains: () => void;
  onNavigateToTableTops: () => void;
  onOpenTracking?: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onNavigateToCollection,
  onNavigateToKeychains,
  onNavigateToTableTops,
}) => {
  const { products } = useProducts();
  const { settings } = useSettings();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const cleanPhone = (settings.whatsappNumber || '916380437068').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hi Petalorah! I would like to place an order.")}`;

  // Featured 6 highlight products
  const featuredProducts = products.filter(
    (p) => p.isBestSeller || ['duck', 'single_tulip_pot', 'luffy', 'custom_jersey'].includes(p.id)
  ).slice(0, 6);

  const creationOfTheWeek =
    products.find((p) => p.id === (settings.creationOfTheWeekProductId || 'four_tulips_pot')) ||
    products[0];

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

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-primary dark:text-white leading-[1.15] sm:leading-[1.1] tracking-tight break-words">
              Handmade Keepsakes Twisted With Love
            </h1>

            <p className="text-base sm:text-lg text-primary/70 dark:text-gray-300 leading-relaxed max-w-2xl">
              Welcome to <strong>Petalorah</strong>! We craft adorable fluffy keychains, miniature table top flower pots, anime charms, and custom flower bouquets that stay fresh forever.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={onNavigateToCollection}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Shop Now
                <ArrowRight size={18} />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md"
              >
                <WhatsAppIcon size={20} />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-6 border-t border-primary/10 dark:border-white/10 text-xs font-medium text-primary/80 dark:text-gray-300">
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
          <div className="lg:col-span-5 flex justify-center w-full">
            <div
              onClick={() => setSelectedProduct(creationOfTheWeek)}
              className="relative w-full max-w-sm rounded-3xl p-3.5 sm:p-4 bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-2xl cursor-pointer group hover:scale-[1.02] transition-all duration-300"
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
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 px-1 sm:px-2 pb-1 sm:pb-2">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-primary dark:text-white">
                    {creationOfTheWeek.name}
                  </h3>
                  <p className="text-xs text-primary/60 dark:text-gray-400">
                    Handcrafted Premium Flower Pot
                  </p>
                </div>
                <div className="flex items-center xs:flex-col xs:items-end gap-1.5 w-full xs:w-auto justify-between xs:justify-start">
                  <span className="text-base sm:text-lg font-bold text-primary dark:text-secondary-light">
                    {creationOfTheWeek.price}
                  </span>
                  <ProductQuantityControl product={creationOfTheWeek} size="sm" />
                </div>
              </div>
            </div>
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
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary dark:text-white mt-1">
              Featured Handmade Crafts
            </h2>
          </div>
          <button
            onClick={onNavigateToCollection}
            className="text-xs font-bold text-primary dark:text-secondary-light hover:underline flex items-center gap-1"
          >
            View All ({products.length} items) <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => setSelectedProduct(prod)}
              className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group min-w-0"
            >
              <div className="min-w-0">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-navy mb-2.5 sm:mb-3">
                  <img
                    src={prod.img}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.badge && (
                    <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-primary/90 text-white text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                      {prod.badge}
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-xs sm:text-sm font-bold text-primary dark:text-white line-clamp-1">
                  {prod.name}
                </h4>
              </div>

              <div className="mt-2 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 pt-2 border-t border-primary/5 dark:border-white/5">
                <span className="text-xs sm:text-sm font-extrabold text-primary dark:text-secondary-light">
                  {prod.price}
                </span>
                <ProductQuantityControl product={prod} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* CUSTOMER REVIEWS & TESTIMONIALS */}
      <CustomerReviews />

      {/* MADE FOR REAL PEOPLE / REAL CREATIONS */}
      <RealCreationsGallery />

      {/* OUR STORY & WHY PETALORAH */}
      <BrandStory />

      {/* HOW IT'S MADE — 4-STEP PROCESS */}
      <HowItsMade />

      {/* DELIVERY & RETURN POLICIES */}
      <DeliveryAndPolicies />

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
