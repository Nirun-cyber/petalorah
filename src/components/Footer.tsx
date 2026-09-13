import React from 'react';
import { Heart, MessageSquareCode } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface FooterProps {
  onNavigate: (tab: 'home' | 'portfolio' | 'keychains' | 'tabletops' | 'admin' | 'login') => void;
  onOpenTracking?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTracking }) => {
  const { settings } = useSettings();
  const phone = (settings.whatsappNumber || '916380437068').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hi Petalorah! I would like to place an order.")}`;

  return (
    <footer className="w-full bg-white/90 dark:bg-navy-dark border-t border-primary/10 dark:border-white/10 pt-12 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-primary/10 dark:border-white/10">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-primary/20 overflow-hidden">
                <img src="/assets/logo.jpg" alt="Petalorah Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif text-2xl font-bold text-primary dark:text-secondary-light">
                PETALORAH
              </span>
            </div>
            <p className="text-sm text-primary/70 dark:text-gray-300 max-w-md leading-relaxed">
              Handcrafted pipe cleaner flowers, keychains, miniature flowerpots, and custom gift keepsakes carefully twisted with patience and love. Designed to bring warm smiles that stay fresh forever.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-primary dark:text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-primary/80 dark:text-gray-300">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:underline">Home</button>
              </li>
              <li>
                <button onClick={() => onNavigate('keychains')} className="hover:underline">Fluffy Keychains</button>
              </li>
              <li>
                <button onClick={() => onNavigate('tabletops')} className="hover:underline">Table Top Pots</button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => {
                      document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:underline"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => {
                      document.getElementById('delivery-info')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:underline"
                >
                  Delivery &amp; Shipping
                </button>
              </li>
              {onOpenTracking && (
                <li>
                  <button
                    onClick={onOpenTracking}
                    className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5"
                  >
                    Track Your Order 🚚
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onNavigate('login')} className="hover:underline text-rose-500 font-semibold">Account / Login</button>
              </li>
            </ul>
          </div>

          {/* Col 3: Connect & Order */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-primary dark:text-white uppercase tracking-wider">
              Connect & Order
            </h4>
            <p className="text-xs text-primary/70 dark:text-gray-300">
              Reach out directly on Instagram or WhatsApp to place your order:
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <MessageSquareCode size={18} />
                WhatsApp: 63804 37068
              </a>
              <a
                href="https://instagram.com/petalorah"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram: @petalorah
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary/60 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Petalorah. All handmade rights reserved.</p>
          <p className="flex items-center gap-1">
            Handcrafted with <Heart size={14} className="text-rose-500 fill-current inline" /> for flower & craft lovers everywhere.
          </p>
        </div>

      </div>
    </footer>
  );
};
