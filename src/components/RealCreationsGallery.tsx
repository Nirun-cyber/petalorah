import React from 'react';
import { Camera, Heart } from 'lucide-react';
import { INSTAGRAM_USERNAME } from '../context/CartContext';

interface CreationItem {
  id: string;
  img: string;
  title: string;
  caption: string;
  tag: string;
}

const REAL_CREATIONS: CreationItem[] = [
  {
    id: 'c1',
    img: '/assets/products/custom_jersey.png',
    title: 'Custom Jersey Charm',
    caption: 'Handcrafted personalized jersey charm with custom player number.',
    tag: 'Custom Order',
  },
  {
    id: 'c2',
    img: '/assets/products/four_tulips_pot.png',
    title: 'Four Tulips Desk Garden',
    caption: 'Pastel handmade tulips in miniature pot, brightens up any workspace.',
    tag: 'Desk Keepsake',
  },
  {
    id: 'c3',
    img: '/assets/products/custom_letter.jpg',
    title: 'Personalized Initial Charm',
    caption: 'Custom letter charm crafted with soft lavender pipe cleaners.',
    tag: 'Gift Order',
  },
  {
    id: 'c4',
    img: '/assets/products/duck.png',
    title: 'Yellow Duck with Blue Bow',
    caption: 'Cute squishy little duck charm finished with handmade satin bow.',
    tag: 'Handmade Charm',
  },
  {
    id: 'c5',
    img: '/assets/products/flower_bouquets.jpg',
    title: 'Everlasting Pipe Cleaner Bouquet',
    caption: 'Hand-twisted floral arrangement designed to stay vibrant forever.',
    tag: 'Custom Bouquet',
  },
  {
    id: 'c6',
    img: '/assets/products/blue_rose.jpg',
    title: 'Royal Blue Rose Charm',
    caption: 'Intricately coiled petals with matching green leaf accents.',
    tag: 'Handmade Floral',
  },
];

export const RealCreationsGallery: React.FC = () => {
  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 text-xs font-semibold tracking-wide border border-pink-200/50 dark:border-pink-900/40">
          <Camera size={13} className="text-pink-500" />
          <span>Petalorah in Your Hands</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary dark:text-white tracking-tight">
          Made for Real People <Heart size={20} className="inline text-rose-500 fill-rose-500 mb-1" />
        </h2>
        <p className="text-xs sm:text-sm text-primary/70 dark:text-gray-300">
          Real handmade creations shaped with patience and care, photographed before dispatch and in customer spaces.
        </p>
      </div>

      {/* Responsive Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {REAL_CREATIONS.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image Aspect Box */}
            <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-navy">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white">
                {item.tag}
              </span>
            </div>

            {/* Description & Caption */}
            <div className="p-2.5 sm:p-3 space-y-1">
              <h4 className="font-serif text-xs font-bold text-primary dark:text-white truncate">
                {item.title}
              </h4>
              <p className="text-[11px] text-primary/70 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Subtle Community Note */}
      <div className="mt-6 text-center">
        <a
          href={`https://instagram.com/${INSTAGRAM_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span>Tag @{INSTAGRAM_USERNAME} on Instagram to feature your creation</span>
        </a>
      </div>
    </section>
  );
};

export default RealCreationsGallery;
