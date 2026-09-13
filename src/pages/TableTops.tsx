import React, { useState, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
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
    <div className="w-full flex flex-col min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Headline */}
      <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-10 space-y-1 sm:space-y-2">
        <h1 className="font-serif text-2xl sm:text-5xl font-extrabold text-primary dark:text-white">
          Table Top Flower Pots
        </h1>
        <p className="text-xs sm:text-base text-primary/70 dark:text-gray-300">
          Everlasting miniature flower pots handcrafted with soft pipe cleaners to bring warmth to your desk or home workspace.
        </p>
      </div>

      {/* Table Top Grid - 2-col on mobile, 3-col on md+ */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-8 max-w-5xl mx-auto w-full">
        {tabletops.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="p-2.5 sm:p-6 rounded-xl sm:rounded-3xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-xs hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between group min-w-0"
          >
            <div className="min-w-0">
              <div className="relative aspect-square rounded-lg sm:rounded-2xl overflow-hidden bg-gray-50 dark:bg-navy mb-2 sm:mb-5">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-indigo-600 text-white text-[8px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs">
                    {product.badge}
                  </span>
                )}
              </div>

              <h3 className="font-serif text-xs sm:text-xl font-bold text-primary dark:text-white mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-none">
                {product.name}
              </h3>

              <ul className="hidden sm:block space-y-1.5 text-xs text-primary/80 dark:text-gray-300 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" /> Never fades or needs watering
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" /> Cozy ribbed pot included
                </li>
              </ul>
            </div>

            <div className="pt-2 sm:pt-4 border-t border-primary/10 dark:border-white/10 flex items-center justify-between gap-1 sm:gap-3">
              <div>
                <span className="text-sm sm:text-2xl font-extrabold text-primary dark:text-secondary-light">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-[10px] sm:text-xs line-through text-gray-400 ml-1 sm:ml-2">
                    {product.originalPrice}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <ProductQuantityControl product={product} size="sm" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
                  className="hidden sm:inline-block px-3 py-2 rounded-2xl bg-gray-100 dark:bg-navy text-primary dark:text-gray-200 font-bold text-xs hover:bg-primary hover:text-white transition-colors"
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
