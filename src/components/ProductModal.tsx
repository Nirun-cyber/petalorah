import React, { useEffect } from 'react';
import { X, Sparkles, Star } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { InstagramIcon } from './InstagramIcon';
import type { Product } from '../data/products';
import { ProductQuantityControl } from './ProductQuantityControl';
import { useReviews } from '../context/ReviewContext';
import { useSettings } from '../context/SettingsContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { getProductReviews } = useReviews();
  const { settings } = useSettings();

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const productReviews = getProductReviews(product.id);
  const reviewCount = productReviews.length > 0 ? productReviews.length : 14;
  const ratingScore = productReviews.length > 0 ? productReviews[0].rating : 5;

  const cleanPhone = (settings.whatsappNumber || '916380437068').replace(/[^0-9]/g, '');
  const whatsappMessage = encodeURIComponent(
    `Hi Petalorah! I would like to order "${product.name}" (${product.price}).`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Dialog Window */}
      <div
        data-lenis-prevent
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto overscroll-contain bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl z-10 p-3.5 sm:p-8 flex flex-col md:flex-row gap-3 sm:gap-8"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-primary dark:text-gray-200 transition-colors z-20"
          aria-label="Close details"
        >
          <X size={18} />
        </button>

        {/* Left Column: Product Image (aspect-[4/3] max-h-52 on mobile, aspect-square on desktop) */}
        <div className="w-full md:w-1/2 flex-shrink-0">
          <div className="relative aspect-[4/3] sm:aspect-square max-h-52 sm:max-h-none w-full rounded-xl sm:rounded-2xl overflow-hidden border border-primary/10 dark:border-white/10 shadow-xs sm:shadow-md bg-gray-50 dark:bg-navy">
            <img
              src={product.img}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = '/assets/products/rose.jpg')}
            />
            {product.badge && (
              <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary text-white dark:bg-secondary dark:text-navy text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-xs">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Product Content & Ordering CTAs */}
        <div className="w-full md:w-1/2 flex flex-col justify-between space-y-2.5 sm:space-y-4">
          <div>
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-primary/60 dark:text-secondary/70 uppercase tracking-widest mb-0.5 sm:mb-1">
              <span className="flex items-center gap-1">
                <Sparkles size={11} />
                {product.category === 'keychain' && 'Fluffy Keychain'}
                {product.category === 'tabletop' && 'Table Top Decor'}
                {product.category === 'bouquet' && 'Flower Bouquet'}
                {product.category === 'custom' && 'Personalized Craft'}
              </span>

              {/* Rating Badge */}
              <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {ratingScore}.0 ({reviewCount})
              </span>
            </div>

            <h2 className="font-serif text-xl sm:text-3xl font-bold text-primary dark:text-white leading-tight">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-2 sm:gap-3 mt-1.5 sm:mt-3">
              <span className="text-xl sm:text-2xl font-bold text-primary dark:text-secondary-light">
                {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs sm:text-sm line-through text-gray-400">
                  {product.originalPrice}
                </span>
              )}
            </div>

            {product.description && (
              <div className="mt-2 sm:mt-3.5 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gray-50/90 dark:bg-navy/60 border border-primary/5 dark:border-white/5 space-y-1 text-[11px] sm:text-xs">
                {product.description.split('\n').map((line, idx) => {
                  const colonIndex = line.indexOf(':');
                  if (colonIndex > 0) {
                    const label = line.slice(0, colonIndex).trim();
                    const value = line.slice(colonIndex + 1).trim();
                    return (
                      <div key={idx} className="flex flex-row items-baseline justify-between gap-1 py-0.5 border-b border-primary/5 dark:border-white/5 last:border-0">
                        <span className="font-semibold text-primary/90 dark:text-rose-200/90 truncate">
                          {label}
                        </span>
                        <span className="text-primary/75 dark:text-gray-300 text-right font-medium truncate">
                          {value || <span className="italic text-gray-400">Handcrafted</span>}
                        </span>
                      </div>
                    );
                  }
                  return line.trim() ? (
                    <p key={idx} className="text-primary/80 dark:text-gray-300 leading-relaxed">
                      {line}
                    </p>
                  ) : null;
                })}
              </div>
            )}

            {/* Customer review quote if available */}
            {productReviews.length > 0 && (
              <div className="mt-2 sm:mt-3 p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-navy border border-primary/5 dark:border-white/5 text-[11px] sm:text-xs text-primary/80 dark:text-gray-300 italic">
                "{productReviews[0].comment}"
                <span className="block not-italic text-[10px] sm:text-[11px] font-bold text-primary/60 dark:text-gray-400 mt-0.5">
                  — {productReviews[0].customerName} ({productReviews[0].city})
                </span>
              </div>
            )}
          </div>

          {/* Action CTAs & Quantity Control */}
          <div className="pt-2 sm:pt-4 border-t border-primary/10 dark:border-white/10 space-y-2 sm:space-y-2.5">
            <ProductQuantityControl product={product} size="md" />

            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all truncate"
              >
                <WhatsAppIcon size={15} />
                <span>WhatsApp</span>
              </a>

              <a
                href="https://instagram.com/petalorah"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-sm transition-all truncate"
              >
                <InstagramIcon size={15} />
                <span>Instagram</span>
              </a>
            </div>

            {/* Subtle Trust Reminder */}
            <div className="pt-0.5 flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-primary/60 dark:text-gray-400">
              <span>🌸 Handmade with care</span>
              <span>•</span>
              <span>💬 Direct artisan support</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
