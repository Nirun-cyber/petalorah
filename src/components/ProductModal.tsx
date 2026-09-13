import React from 'react';
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
            <div className="flex items-center justify-between text-xs font-semibold text-primary/60 dark:text-secondary/70 uppercase tracking-widest mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} />
                {product.category === 'keychain' && 'Fluffy Keychain'}
                {product.category === 'tabletop' && 'Table Top Decor'}
                {product.category === 'bouquet' && 'Flower Bouquet'}
                {product.category === 'custom' && 'Personalized Craft'}
              </span>

              {/* Rating Badge */}
              <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {ratingScore}.0 ({reviewCount})
              </span>
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

            {product.description && (
              <div className="mt-3.5 p-3.5 rounded-2xl bg-gray-50/90 dark:bg-navy/60 border border-primary/5 dark:border-white/5 space-y-1.5 text-xs">
                {product.description.split('\n').map((line, idx) => {
                  const colonIndex = line.indexOf(':');
                  if (colonIndex > 0) {
                    const label = line.slice(0, colonIndex).trim();
                    const value = line.slice(colonIndex + 1).trim();
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1 border-b border-primary/5 dark:border-white/5 last:border-0">
                        <span className="font-semibold text-primary/90 dark:text-rose-200/90">
                          {label}
                        </span>
                        <span className="text-primary/75 dark:text-gray-300 sm:text-right font-medium">
                          {value || <span className="italic text-gray-400">Handcrafted on order</span>}
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
              <div className="mt-3 p-2.5 rounded-xl bg-gray-50 dark:bg-navy border border-primary/5 dark:border-white/5 text-xs text-primary/80 dark:text-gray-300 italic">
                "{productReviews[0].comment}"
                <span className="block not-italic text-[11px] font-bold text-primary/60 dark:text-gray-400 mt-1">
                  — {productReviews[0].customerName} ({productReviews[0].city})
                </span>
              </div>
            )}
          </div>

          {/* Action CTAs & Quantity Control */}
          <div className="pt-4 border-t border-primary/10 dark:border-white/10 space-y-2.5">
            <ProductQuantityControl product={product} size="md" />

            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all truncate"
              >
                <WhatsAppIcon size={16} />
                <span>WhatsApp</span>
              </a>

              <a
                href="https://instagram.com/petalorah"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition-all truncate"
              >
                <InstagramIcon size={16} />
                <span>Instagram</span>
              </a>
            </div>

            {/* Subtle Trust Reminder */}
            <div className="pt-1 flex items-center justify-center gap-3 text-[11px] text-primary/60 dark:text-gray-400">
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
