import React from 'react';
import { Heart } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { InstagramIcon } from './InstagramIcon';
import { useSettings } from '../context/SettingsContext';

interface FooterProps {
  onNavigate: (tab: 'home' | 'about' | 'shop' | 'portfolio' | 'keychains' | 'tabletops' | 'bouquets' | 'admin' | 'login') => void;
  onOpenTracking?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTracking }) => {
  const { settings } = useSettings();
  const phone = (settings.whatsappNumber || '916380437068').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hi Petalorah! I would like to place an order.")}`;

  return (
    <footer className="w-full bg-white/90 dark:bg-navy-dark border-t border-primary/10 dark:border-white/10 pt-6 pb-6 sm:pt-10 sm:pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto gap-6 sm:gap-12 pb-6 sm:pb-8 border-b border-primary/10 dark:border-white/10">
          
          {/* Quick Links */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-serif text-xs sm:text-base font-bold text-primary dark:text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-primary/80 dark:text-gray-300">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:underline">Home</button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:underline">About &amp; Story</button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:underline font-semibold text-rose-500 dark:text-rose-400">Shop All Crafts</button>
              </li>
              <li>
                <button onClick={() => onNavigate('bouquets')} className="hover:underline">Flower Bouquets</button>
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
          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-serif text-xs sm:text-base font-bold text-primary dark:text-white uppercase tracking-wider">
              Connect & Order
            </h4>
            <p className="text-[11px] sm:text-xs text-primary/70 dark:text-gray-300">
              Reach out directly on Instagram or WhatsApp to place your order:
            </p>
            <div className="flex flex-col gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <WhatsAppIcon size={16} />
                <span>WhatsApp: 63804 37068</span>
              </a>
              <a
                href="https://instagram.com/petalorah"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-pink-600 dark:text-pink-400 hover:underline"
              >
                <InstagramIcon size={16} />
                <span>Instagram: @petalorah</span>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-[11px] sm:text-xs text-primary/60 dark:text-gray-400 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Petalorah. All handmade rights reserved.</p>
          <p className="flex items-center gap-1 justify-center">
            Handcrafted with <Heart size={13} className="text-rose-500 fill-current inline" /> for flower & craft lovers everywhere.
          </p>
        </div>

      </div>
    </footer>
  );
};
