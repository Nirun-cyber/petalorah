import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { Product } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { ProductModal } from '../components/ProductModal';
import { ProductQuantityControl } from '../components/ProductQuantityControl';

interface PortfolioProps {
  onNavigateHome: () => void;
  initialCategory?: 'keychain' | 'tabletop' | 'bouquet' | 'custom';
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  initialCategory = 'keychain',
}) => {
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'keychain' | 'tabletop' | 'bouquet' | 'custom'>(initialCategory);
  const [sortBy, setSortBy] = useState<'default' | 'low-high' | 'high-low' | 'bestsellers'>('default');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const categories = [
    { id: 'keychain', label: 'Keychains' },
    { id: 'tabletop', label: 'Table Tops' },
    { id: 'bouquet', label: 'Bouquets' },
    { id: 'custom', label: 'Custom Requests' },
  ] as const;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'low-high') return a.numericPrice - b.numericPrice;
      if (sortBy === 'high-low') return b.numericPrice - a.numericPrice;
      if (sortBy === 'bestsellers') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="w-full flex flex-col min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Headline */}
      <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-8 space-y-1 sm:space-y-2">
        <h1 className="font-serif text-2xl sm:text-5xl font-extrabold text-primary dark:text-white">
          Handmade Crafts &amp; Gifts
        </h1>
        <p className="text-xs sm:text-base text-primary/70 dark:text-gray-300">
          Browse our fluffy keychains, tabletop flower pots, anime charms, and forever flower bouquets.
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="flex flex-col md:flex-row gap-2.5 sm:gap-4 justify-between items-center bg-white/70 dark:bg-navy-light/60 border border-primary/10 dark:border-white/10 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs mb-4 sm:mb-8 backdrop-blur-md">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 sm:gap-2 justify-center md:justify-start w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white dark:bg-secondary dark:text-navy shadow-xs scale-105'
                  : 'bg-primary/5 dark:bg-white/5 text-primary/80 dark:text-gray-300 hover:bg-primary/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-row gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search crafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white dark:bg-navy border border-primary/15 dark:border-white/15 text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white dark:bg-navy border border-primary/15 dark:border-white/15 text-xs text-primary dark:text-white font-medium focus:outline-none"
          >
            <option value="default">Default</option>
            <option value="low-high">₹ Low-High</option>
            <option value="high-low">₹ High-Low</option>
            <option value="bestsellers">Bestsellers</option>
          </select>
        </div>

      </div>

      {/* Catalog Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 sm:py-16 px-4 bg-white/60 dark:bg-navy-light/40 rounded-2xl sm:rounded-3xl border border-dashed border-primary/20 dark:border-white/15 max-w-lg mx-auto space-y-2 sm:space-y-3 my-4 sm:my-8">
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto text-xl">
            🌸
          </div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-primary dark:text-white">
            No matching crafts found
          </h3>
          <p className="text-xs text-primary/70 dark:text-gray-300 leading-relaxed max-w-xs mx-auto">
            We couldn't find any handmade crafts matching "{searchQuery}". Try searching for 'rose', 'sunflower', or 'keychain'.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('keychain'); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl sm:rounded-2xl bg-primary text-white dark:bg-secondary dark:text-navy text-xs font-bold shadow hover:scale-105 active:scale-95 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
          {filteredProducts.map((product) => (
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
                    <span className="absolute top-1 left-1 sm:top-3 sm:left-3 bg-primary text-white dark:bg-secondary dark:text-navy text-[8px] sm:text-[11px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                      {product.badge}
                    </span>
                  )}
                </div>

                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-primary/50 dark:text-secondary/70 block">
                  {product.category}
                </span>
                <h3 className="font-serif text-xs sm:text-base font-bold text-primary dark:text-white line-clamp-1">
                  {product.name}
                </h3>
              </div>

              <div className="mt-1.5 sm:mt-4 pt-1.5 sm:pt-3 border-t border-primary/5 dark:border-white/5 flex items-center justify-between gap-1 sm:gap-2">
                <div>
                  <span className="text-xs sm:text-base font-extrabold text-primary dark:text-secondary-light">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[9px] sm:text-xs line-through text-gray-400 ml-1">
                      {product.originalPrice}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5">
                  <ProductQuantityControl product={product} size="sm" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="hidden sm:inline-block px-2.5 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-bold text-xs group-hover:bg-pink-500 group-hover:text-white transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRODUCT DETAILS MODAL */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

    </div>
  );
};
