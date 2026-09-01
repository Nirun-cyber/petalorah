import React, { useState, useMemo } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import type { Product } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { ProductModal } from '../components/ProductModal';
import { ProductQuantityControl } from '../components/ProductQuantityControl';

interface TableTopsProps {
  onNavigateHome: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const TableTops: React.FC<TableTopsProps> = () => {
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const tabletops = useMemo(() => {
    return products.filter((p) => p.category === 'tabletop');
  }, [products]);

  return (
    <div className="w-full flex flex-col min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Headline */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles size={14} /> Desk & Home Decor
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-primary dark:text-white">
          Table Top Flower Pots
        </h1>
        <p className="text-sm sm:text-base text-primary/70 dark:text-gray-300">
          Everlasting miniature flower pots handcrafted with soft pipe cleaners to bring warmth to your desk or home workspace.
        </p>
      </div>

      {/* Table Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto w-full">
        {tabletops.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-navy mb-5">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              <h3 className="font-serif text-xl font-bold text-primary dark:text-white mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-primary/70 dark:text-gray-300 leading-relaxed mb-4">
                {product.description}
              </p>

              <ul className="space-y-1.5 text-xs text-primary/80 dark:text-gray-300 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" /> Never fades or needs watering
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" /> Cozy ribbed pot included
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-primary/10 dark:border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-2xl font-extrabold text-primary dark:text-secondary-light">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xs line-through text-gray-400 ml-2">
                    {product.originalPrice}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <ProductQuantityControl product={product} size="sm" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
                  className="px-3 py-2 rounded-2xl bg-gray-100 dark:bg-navy text-primary dark:text-gray-200 font-bold text-xs hover:bg-primary hover:text-white transition-colors"
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
