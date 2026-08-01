import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveGarden } from '../components/InteractiveGarden';
import { InteractiveButton } from '../components/InteractiveButton';
import { TiltCard } from '../components/TiltCard';
import { Sparkles, X, Heart, Sun, Moon, ChevronDown } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  img: string;
  badge: string;
  isComingSoon?: boolean;
}

interface TableTopsProps {
  onNavigateHome: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const TableTops: React.FC<TableTopsProps> = ({ 
  onNavigateHome,
  isDarkMode,
  toggleDarkMode,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-low-high' | 'price-high-low' | 'most-selling'>('default');

  // Table Tops products catalog
  const products: Product[] = [
    { 
      id: 'sunflower_pot', 
      name: 'Sunflower Pot', 
      price: '₹199', 
      originalPrice: '₹249',
      description: 'A cheerful handcrafted sunflower pot keychain or desk companion. Twisted with vibrant yellow petals, dark brown center, green leaves, and nestled in a cozy orange pot. A perfect touch of warmth for any desk or workspace.', 
      img: '/assets/products/sunflower_pot.jpg', 
      badge: 'Best Seller' 
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-navy pb-20 overflow-x-hidden">
      <InteractiveGarden />

      {/* Top Navbar */}
      <header className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 z-30 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 select-none cursor-pointer logo-click-target flex-shrink-0" onClick={onNavigateHome}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-primary/20 overflow-hidden shadow-sm">
            <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif text-lg sm:text-2xl font-semibold tracking-wider text-primary dark:text-secondary-light hidden min-[380px]:inline-block">
            PETALORAH
          </span>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <InteractiveButton variant="glass" onClick={onNavigateHome}>
            Back to Home
          </InteractiveButton>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-white/40 dark:bg-navy-light/40 border border-white/40 dark:border-white/10 text-primary dark:text-secondary-light hover:scale-105 transition-transform"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Header Headline */}
      <section className="relative pt-12 pb-8 text-center z-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center gap-2 text-primary dark:text-secondary-light text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <Sparkles size={12} /> Fluffy Table Tops Collection
          </motion.div>
          <motion.h1
            className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-primary dark:text-white leading-tight"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Handmade Table Tops
          </motion.h1>
          <motion.p
            className="text-sm md:text-base text-primary/70 dark:text-gray-300 mt-4 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Bring life to your desk. Meticulously handcrafted miniature flower pots and table decorations that stay fresh and bright forever.
          </motion.p>
        </div>
      </section>

      {/* Filter and Sorting Header */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 mb-8 z-30">
        <div className="flex items-center justify-between py-4 border-y border-primary/10 dark:border-white/5 relative">
          {/* glassmorphic animated sorting selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/10 bg-white/60 dark:border-white/5 dark:bg-navy-light/40 backdrop-blur-md text-xs sm:text-sm font-medium hover:scale-103 active:scale-98 transition-all duration-200 text-primary dark:text-white"
            >
              <span>
                {sortBy === 'default' && 'Default Sorting'}
                {sortBy === 'price-low-high' && 'Price: Low to High'}
                {sortBy === 'price-high-low' && 'Price: High to Low'}
                {sortBy === 'most-selling' && 'Most Selling'}
              </span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.div>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  {/* Backdrop overlay for closing dropdown */}
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-48 sm:w-56 rounded-2xl border border-primary/10 bg-white/95 dark:border-white/5 dark:bg-navy-light/95 backdrop-blur-xl shadow-xl z-20 overflow-hidden py-1.5"
                  >
                    {[
                      { value: 'default', label: 'Default Sorting' },
                      { value: 'price-low-high', label: 'Price: Low to High' },
                      { value: 'price-high-low', label: 'Price: High to Low' },
                      { value: 'most-selling', label: 'Most Selling' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value as any);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors duration-200 flex items-center justify-between ${
                          sortBy === opt.value
                            ? 'bg-primary/5 dark:bg-white/5 text-primary-dark dark:text-secondary-light font-semibold'
                            : 'text-primary/70 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="text-xs sm:text-sm text-primary/60 dark:text-gray-400 font-semibold">
            {products.length} {products.length === 1 ? 'Creation' : 'Creations'}
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {(() => {
            const getNumericPrice = (priceStr: string) => {
              if (priceStr.toLowerCase().includes('coming soon')) return Infinity;
              const match = priceStr.match(/\d+/);
              return match ? parseInt(match[0], 10) : 0;
            };

            const sorted = [...products].sort((a, b) => {
              if (sortBy === 'price-low-high') {
                return getNumericPrice(a.price) - getNumericPrice(b.price);
              }
              if (sortBy === 'price-high-low') {
                const isAComingSoon = a.isComingSoon || a.price.toLowerCase().includes('coming soon');
                const isBComingSoon = b.isComingSoon || b.price.toLowerCase().includes('coming soon');
                if (isAComingSoon && !isBComingSoon) return 1;
                if (!isAComingSoon && isBComingSoon) return -1;
                if (isAComingSoon && isBComingSoon) return 0;
                return getNumericPrice(b.price) - getNumericPrice(a.price);
              }
              if (sortBy === 'most-selling') {
                const isAComingSoon = a.isComingSoon || a.price.toLowerCase().includes('coming soon');
                const isBComingSoon = b.isComingSoon || b.price.toLowerCase().includes('coming soon');
                if (isAComingSoon && !isBComingSoon) return 1;
                if (!isAComingSoon && isBComingSoon) return -1;
                if (isAComingSoon && isBComingSoon) return 0;

                const clicks = JSON.parse(localStorage.getItem('petalorah-clicks') || '{}');
                const clicksA = clicks[a.id] || 0;
                const clicksB = clicks[b.id] || 0;
                if (clicksB === clicksA) {
                  const scoreA = a.badge === 'Best Seller' ? 2 : a.badge === 'Popular' ? 1 : 0;
                  const scoreB = b.badge === 'Best Seller' ? 2 : b.badge === 'Popular' ? 1 : 0;
                  return scoreB - scoreA;
                }
                return clicksB - clicksA;
              }
              return 0; // default (no change)
            });

            return sorted.map((prod, idx) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="group"
              >
                <TiltCard
                  glowColor="rgba(30, 78, 156, 0.15)"
                  className="h-full flex flex-col justify-between cursor-pointer"
                  onClick={() => {
                    // Track click count
                    const clicks = JSON.parse(localStorage.getItem('petalorah-clicks') || '{}');
                    clicks[prod.id] = (clicks[prod.id] || 0) + 1;
                    localStorage.setItem('petalorah-clicks', JSON.stringify(clicks));
                    setSelectedProduct(prod);
                  }}
                >
                  <div>
                    {/* Image Container */}
                    <div className="w-full aspect-[4/5] rounded-[16px] sm:rounded-[24px] md:rounded-[32px] overflow-hidden border border-primary/40 bg-white/40 dark:border-white/10 dark:bg-navy-light/20 p-1 sm:p-2 mb-2 sm:mb-6">
                      <div className="w-full h-full rounded-[12px] sm:rounded-[18px] md:rounded-[24px] overflow-hidden relative shadow-inner">
                        <img
                          src={prod.img}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                        {/* Handmade Badge */}
                        <span className="absolute top-1 left-1 sm:top-4 sm:left-4 px-1 py-0.5 sm:px-3.5 sm:py-1 text-[8px] sm:text-xs font-semibold rounded-full bg-white/90 text-primary dark:bg-navy-light/95 dark:text-secondary-light shadow-md border border-primary/10">
                          {prod.badge}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full mb-1.5 sm:mb-3">
                      <h3 className="font-serif text-xs sm:text-lg md:text-2xl font-bold text-primary dark:text-white group-hover:text-primary-dark dark:group-hover:text-secondary-light transition-colors line-clamp-1 sm:line-clamp-none">
                        {prod.name}
                      </h3>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {prod.originalPrice && (
                          <span className="text-[9px] sm:text-xs line-through text-primary/40 dark:text-white/40">
                            {prod.originalPrice}
                          </span>
                        )}
                        <span className={`px-1 py-0.5 sm:px-3.5 sm:py-1 text-[9px] sm:text-xs md:text-sm font-semibold rounded-full w-fit ${
                          prod.isComingSoon 
                            ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/25 dark:text-amber-300'
                            : 'bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary-light'
                        }`}>
                          {prod.isComingSoon ? prod.price : `${prod.price} / pc`}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-primary/70 dark:text-gray-300 leading-relaxed mb-6 text-left line-clamp-3 hidden sm:block">
                      {prod.description}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ));
          })()}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative w-full py-20 text-center bg-gradient-to-b from-transparent to-primary/5 dark:to-primary-dark/10 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 z-20 relative">
          <div className="flex flex-col items-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary dark:text-white leading-tight mb-4">
              Ordering & Customizations
            </h2>
            <p className="text-base text-primary/70 dark:text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed">
              Found something you love? Direct message us on Instagram or WhatsApp to order! Custom color palettes and gift packaging are available on request.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <InteractiveButton
                variant="primary"
                onClick={() => window.open('https://instagram.com/petalorah', '_blank')}
              >
                Order on Instagram 
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </InteractiveButton>
              <InteractiveButton
                variant="glass"
                onClick={() => window.open('https://wa.me/916382735751', '_blank')}
              >
                Chat on WhatsApp 
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </InteractiveButton>
            </div>
          </div>
        </div>
      </section>

      {/* Zoom / Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
            />

            {/* Modal Box */}
            <motion.div
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-modal rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 z-10"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              {/* Close Button */}
              <button
                className="absolute top-5 right-5 p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-primary/70 dark:text-gray-300 transition-colors z-20"
                onClick={() => setSelectedProduct(null)}
              >
                <X size={18} />
              </button>

              {/* Modal Left: Product Image */}
              <div className="w-full md:w-1/2 aspect-[4/5] rounded-[24px] md:rounded-[28px] overflow-hidden border border-white/60 bg-white/20 dark:border-white/5 p-2 flex-shrink-0">
                <div className="w-full h-full rounded-[20px] overflow-hidden shadow-inner">
                  <img
                    src={selectedProduct.img}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Modal Right: Details */}
              <div className="flex flex-col justify-between items-start text-left w-full">
                <div className="w-full">
                  <span className="px-3.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary-light border border-primary/5 inline-block mb-4">
                    {selectedProduct.badge}
                  </span>
                  
                  <div className="flex items-baseline justify-between w-full border-b border-primary/10 dark:border-white/5 pb-4 mb-4">
                    <h2 className="font-serif text-3xl font-bold text-primary dark:text-white">
                      {selectedProduct.name}
                    </h2>
                    <div className="flex items-baseline gap-2">
                      {selectedProduct.originalPrice && (
                        <span className="text-sm line-through text-primary/40 dark:text-white/40">
                          {selectedProduct.originalPrice}
                        </span>
                      )}
                      <span className={`text-xl font-bold ${selectedProduct.isComingSoon ? 'text-amber-600 dark:text-amber-400' : 'text-primary dark:text-secondary-light'}`}>
                        {selectedProduct.isComingSoon ? selectedProduct.price : `${selectedProduct.price} / pc`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-bold mb-4 uppercase tracking-widest">
                    <Heart size={12} className="fill-current" /> Authentic Pipe Cleaner Art
                  </div>

                  <p className="text-sm text-primary/70 dark:text-gray-300 leading-relaxed mb-6">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <InteractiveButton
                    variant="primary"
                    className="w-full py-3.5 flex justify-center items-center gap-2"
                    onClick={() => window.open('https://instagram.com/petalorah', '_blank')}
                  >
                    Order on Instagram 
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </InteractiveButton>
                  <InteractiveButton
                    variant="glass"
                    className="w-full py-3.5 flex justify-center items-center gap-2"
                    onClick={() => window.open('https://wa.me/916382735751', '_blank')}
                  >
                    Chat on WhatsApp 
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </InteractiveButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
