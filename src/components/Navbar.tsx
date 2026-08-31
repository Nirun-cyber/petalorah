import React, { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentTab: 'home' | 'portfolio' | 'keychains' | 'tabletops' | 'custom';
  onNavigate: (tab: 'home' | 'portfolio' | 'keychains' | 'tabletops' | 'custom') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'keychains', label: 'Keychains' },
    { id: 'tabletops', label: 'Table Tops' },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-navy/80 backdrop-blur-xl border-b border-primary/10 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-primary/20 dark:border-secondary/30 overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
            <img src="/assets/logo.jpg" alt="Petalorah Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-2xl font-bold tracking-wider text-primary dark:text-secondary-light">
              PETALORAH
            </span>
            <span className="text-[10px] sm:text-xs tracking-widest text-primary/60 dark:text-gray-400 font-medium uppercase -mt-1 hidden sm:block">
              Handcrafted Crafts & Gifts
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                currentTab === link.id
                  ? 'bg-primary text-white dark:bg-secondary dark:text-navy font-semibold shadow-sm'
                  : 'text-primary/80 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions: Cart Button Alone with "check your cart" */}
        <div className="flex items-center gap-3">
          <button
            onClick={openCart}
            className="relative inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            aria-label="Open shopping cart"
            title="Check your cart"
          >
            <ShoppingBag size={18} />
            <span>check your cart</span>
            {totalItems > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow-sm animate-in zoom-in duration-200">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-full text-primary dark:text-gray-200 hover:bg-primary/5 dark:hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-navy/95 backdrop-blur-2xl border-b border-primary/10 dark:border-white/10 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                currentTab === link.id
                  ? 'bg-primary text-white dark:bg-secondary dark:text-navy font-semibold'
                  : 'text-primary dark:text-gray-200 hover:bg-primary/5 dark:hover:bg-white/5'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              openCart();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-sm"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={18} />
              check your cart
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
              {totalItems}
            </span>
          </button>
        </div>
      )}
    </header>
  );
};
