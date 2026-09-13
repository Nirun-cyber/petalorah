import React from 'react';
import { Heart } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { InstagramIcon } from './InstagramIcon';
import { useSettings } from '../context/SettingsContext';

interface FooterProps {
  onNavigate: (tab: 'home' | 'about' | 'portfolio' | 'keychains' | 'tabletops' | 'admin' | 'login') => void;
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
                <button onClick={() => onNavigate('about')} className="hover:underline">About &amp; Story</button>
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
                    onNavigate('about');
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
                <WhatsAppIcon size={18} />
                <span>WhatsApp: 63804 37068</span>
              </a>
              <a
                href="https://instagram.com/petalorah"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline"
              >
                <InstagramIcon size={18} />
                <span>Instagram: @petalorah</span>
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
