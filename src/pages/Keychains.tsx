import React, { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
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
    <div className="w-full flex flex-col min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Headline */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={14} /> Fluffy & Cute
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-primary dark:text-white">
          Handmade Keychains ({keychains.length})
        </h1>
        <p className="text-sm sm:text-base text-primary/70 dark:text-gray-300">
          Soft, fluffy pipe cleaner keychains twisted into roses, tulips, ducks, anime icons, and custom letters.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/70 dark:bg-navy-light/60 border border-primary/10 dark:border-white/10 p-4 rounded-3xl shadow-sm mb-8">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search keychains... e.g. Rose, Luffy"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-navy border border-primary/15 dark:border-white/15 text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-primary/70 dark:text-gray-300">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-2xl bg-white dark:bg-navy border border-primary/15 dark:border-white/15 text-xs font-medium text-primary dark:text-white focus:outline-none"
          >
            <option value="default">Default Sort</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="bestsellers">Best Sellers</option>
          </select>
        </div>

      </div>

      {/* Keychain Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {keychains.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-navy mb-4">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-pink-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              <h3 className="font-serif text-base font-bold text-primary dark:text-white line-clamp-1">
                {product.name}
              </h3>
              <p className="text-xs text-primary/70 dark:text-gray-300 line-clamp-2 mt-1">
                {product.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-primary/5 dark:border-white/5 flex items-center justify-between gap-2">
              <span className="text-base font-extrabold text-primary dark:text-secondary-light">
                {product.price}
              </span>

              <div className="flex items-center gap-1.5">
                <ProductQuantityControl product={product} size="sm" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-navy text-primary dark:text-gray-200 font-bold text-xs hover:bg-primary hover:text-white transition-colors"
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
