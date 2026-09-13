import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { Product } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { ProductModal } from '../components/ProductModal';
import { ProductQuantityControl } from '../components/ProductQuantityControl';

interface KeychainsProps {
  onNavigateHome: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Keychains: React.FC<KeychainsProps> = () => {
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'low-high' | 'high-low' | 'bestsellers'>('default');

  const keychains = useMemo(() => {
    return products.filter(
      (p) => p.category === 'keychain' || p.category === 'custom'
    ).filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      if (sortBy === 'low-high') return a.numericPrice - b.numericPrice;
      if (sortBy === 'high-low') return b.numericPrice - a.numericPrice;
      if (sortBy === 'bestsellers') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      return 0;
    });
  }, [products, searchQuery, sortBy]);

  return (
    <div className="w-full flex flex-col min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Headline */}
      <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-8 space-y-1 sm:space-y-2">
        <h1 className="font-serif text-2xl sm:text-5xl font-extrabold text-primary dark:text-white">
          Handmade Keychains ({keychains.length})
        </h1>
        <p className="text-xs sm:text-base text-primary/70 dark:text-gray-300">
          Soft, fluffy pipe cleaner keychains twisted into roses, tulips, ducks, anime icons, and custom letters.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-row gap-2 justify-between items-center bg-white/70 dark:bg-navy-light/60 border border-primary/10 dark:border-white/10 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs mb-4 sm:mb-8">
        
        {/* Search */}
        <div className="relative flex-1 sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search keychains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white dark:bg-navy border border-primary/15 dark:border-white/15 text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white dark:bg-navy border border-primary/15 dark:border-white/15 text-xs font-medium text-primary dark:text-white focus:outline-none"
          >
            <option value="default">Default</option>
            <option value="low-high">₹ Low-High</option>
            <option value="high-low">₹ High-Low</option>
            <option value="bestsellers">Bestsellers</option>
          </select>
        </div>

      </div>

      {/* Keychain Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
        {keychains.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="p-2 sm:p-4 rounded-xl sm:rounded-3xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group min-w-0"
          >
            <div className="min-w-0">
              <div className="relative aspect-square rounded-lg sm:rounded-2xl overflow-hidden bg-gray-50 dark:bg-navy mb-1.5 sm:mb-4">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <span className="absolute top-1 left-1 sm:top-3 sm:left-3 bg-pink-500 text-white text-[8px] sm:text-[11px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                    {product.badge}
                  </span>
                )}
              </div>

              <h3 className="font-serif text-xs sm:text-base font-bold text-primary dark:text-white line-clamp-1">
                {product.name}
              </h3>
            </div>

            <div className="mt-1.5 sm:mt-4 pt-1.5 sm:pt-3 border-t border-primary/5 dark:border-white/5 flex items-center justify-between gap-1 sm:gap-2">
              <span className="text-xs sm:text-base font-extrabold text-primary dark:text-secondary-light">
                {product.price}
              </span>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <ProductQuantityControl product={product} size="sm" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
                  className="hidden sm:inline-block px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-navy text-primary dark:text-gray-200 font-bold text-xs hover:bg-primary hover:text-white transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PRODUCT DETAILS MODAL */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

    </div>
  );
};
