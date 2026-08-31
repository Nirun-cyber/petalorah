import React, { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { ALL_PRODUCTS } from '../data/products';
import type { Product } from '../data/products';
import { ProductModal } from '../components/ProductModal';
import { ProductQuantityControl } from '../components/ProductQuantityControl';

interface PortfolioProps {
  onNavigateHome: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Portfolio: React.FC<PortfolioProps> = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'keychain' | 'tabletop' | 'bouquet' | 'custom'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'low-high' | 'high-low' | 'bestsellers'>('default');

  const categories = [
    { id: 'keychain', label: 'Keychains' },
    { id: 'tabletop', label: 'Table Tops' },
    { id: 'bouquet', label: 'Bouquets' },
    { id: 'custom', label: 'Custom Requests' },
  ] as const;

  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
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
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="w-full flex flex-col min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Headline */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={14} /> Full Handmade Collection
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-primary dark:text-white">
          All Crafts & Gifts
        </h1>
        <p className="text-sm sm:text-base text-primary/70 dark:text-gray-300">
          Browse our complete catalog of handcrafted pipe cleaner keychains, table tops, anime charms, and flower bouquets.
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/70 dark:bg-navy-light/60 border border-primary/10 dark:border-white/10 p-4 rounded-3xl shadow-sm mb-8 backdrop-blur-md">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white dark:bg-secondary dark:text-navy shadow-sm'
                  : 'bg-primary/5 dark:bg-white/5 text-primary/80 dark:text-gray-300 hover:bg-primary/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input & Sort Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search crafts... e.g. Rose"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-navy border border-primary/15 dark:border-white/15 text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
            />
          </div>

          {/* Sort Select */}
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

      {/* Catalog Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-navy-light/20 rounded-3xl border border-dashed border-primary/20">
          <p className="text-base text-primary/70 dark:text-gray-400 font-medium">
            No craft items match "{searchQuery}".
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-3 text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="p-4 rounded-3xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-navy mb-4">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-primary text-white dark:bg-secondary dark:text-navy text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {product.badge}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/50 dark:text-secondary/70">
                  {product.category}
                </span>
                <h3 className="font-serif text-base font-bold text-primary dark:text-white line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-primary/70 dark:text-gray-300 line-clamp-2 mt-1">
                  {product.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-primary/5 dark:border-white/5 flex items-center justify-between gap-2">
                <div>
                  <span className="text-base font-extrabold text-primary dark:text-secondary-light">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs line-through text-gray-400 ml-1">
                      {product.originalPrice}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <ProductQuantityControl product={product} size="sm" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-bold text-xs group-hover:bg-pink-500 group-hover:text-white transition-colors"
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
