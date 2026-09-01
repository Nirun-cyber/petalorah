import React from 'react';
import { X, Sparkles, CheckCircle2, MessageCircleHeart, MessageSquareCode } from 'lucide-react';
import type { Product } from '../data/products';
import { ProductQuantityControl } from './ProductQuantityControl';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const whatsappMessage = encodeURIComponent(
    `Hi Petalorah! I would like to order "${product.name}" (${product.price}).`
  );
  const whatsappUrl = `https://wa.me/916382735751?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Dialog Window */}
      <div
        data-lenis-prevent
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto overscroll-contain bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 rounded-3xl shadow-2xl z-10 p-4 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-primary dark:text-gray-200 transition-colors z-20"
          aria-label="Close details"
        >
          <X size={20} />
        </button>

        {/* Left Column: Product Image */}
        <div className="w-full md:w-1/2 flex-shrink-0">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-primary/10 dark:border-white/10 shadow-md bg-gray-50 dark:bg-navy">
            <img
              src={product.img}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = '/assets/products/rose.jpg')}
            />
            {product.badge && (
              <span className="absolute top-3 left-3 bg-primary text-white dark:bg-secondary dark:text-navy text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Product Content & Ordering CTAs */}
        <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary/60 dark:text-secondary/70 uppercase tracking-widest mb-1">
              <Sparkles size={12} />
              {product.category === 'keychain' && 'Fluffy Keychain'}
              {product.category === 'tabletop' && 'Table Top Decor'}
              {product.category === 'bouquet' && 'Flower Bouquet'}
              {product.category === 'custom' && 'Personalized Craft'}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary dark:text-white leading-tight">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-bold text-primary dark:text-secondary-light">
                {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm line-through text-gray-400">
                  {product.originalPrice}
                </span>
              )}
            </div>

            <p className="text-sm text-primary/70 dark:text-gray-300 leading-relaxed mt-4">
              {product.description}
            </p>

            {/* Customization Note */}
            <div className="mt-4 p-3 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40 text-pink-900 dark:text-pink-200 text-xs flex items-start gap-2">
              <CheckCircle2 size={16} className="text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>100% Custom Color Options Available!</strong> You can request custom petal colors, initials, numbers, or charms when ordering.
              </span>
            </div>
          </div>

          {/* Action CTAs & Quantity Control */}
          <div className="pt-4 border-t border-primary/10 dark:border-white/10 space-y-2.5">
            <ProductQuantityControl product={product} size="md" />

            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all truncate"
              >
                <MessageSquareCode size={16} />
                WhatsApp
              </a>

              <a
                href="https://instagram.com/petalorah"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition-all truncate"
              >
                <MessageCircleHeart size={16} />
                Instagram
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
