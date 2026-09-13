import React, { useState } from 'react';
import { Menu, X, ShoppingBag, User, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: 'home' | 'about' | 'shop' | 'portfolio' | 'keychains' | 'tabletops' | 'bouquets' | 'custom' | 'admin' | 'login';
  onNavigate: (tab: 'home' | 'about' | 'shop' | 'portfolio' | 'keychains' | 'tabletops' | 'bouquets' | 'custom' | 'admin' | 'login') => void;
  onOpenTracking: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenTracking,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const { user } = useAuth();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'shop', label: 'Shop' },
  ] as const;

  const isTabActive = (linkId: string) => {
    if (linkId === 'shop') {
      return ['shop', 'portfolio', 'keychains', 'tabletops', 'custom'].includes(currentTab);
    }
    return currentTab === linkId;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-navy/80 backdrop-blur-xl border-b border-primary/10 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-full border-2 border-primary/20 dark:border-secondary/30 overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
            <img src="/assets/logo.jpg" alt="Petalorah Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-sm xs:text-base sm:text-2xl font-bold tracking-wider text-primary dark:text-secondary-light">
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
                isTabActive(link.id)
                  ? 'bg-primary text-white dark:bg-secondary dark:text-navy font-semibold shadow-sm'
                  : 'text-primary/80 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions: Track Order, Cart Button & Login Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Track Order Button - Responsive: shown on sm+, in drawer on mobile */}
          <button
            onClick={onOpenTracking}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/50 font-bold text-xs transition-all duration-200 hover:scale-105"
            aria-label="Track Your Order"
            title="Track Your Order"
          >
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden lg:inline">Track Order</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            aria-label="Open shopping cart"
            title="Check your cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">check your cart</span>
            <span className="sm:hidden font-bold text-[11px]">Cart</span>
            {totalItems > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] sm:text-xs shadow-sm animate-in zoom-in duration-200">
                {totalItems}
              </span>
            )}
          </button>

          {/* Login / Account Button (Right to Cart) */}
          <button
            onClick={() => onNavigate('login')}
            className={`inline-flex items-center gap-1.5 p-1.5 sm:px-4 sm:py-2.5 rounded-full border transition-all duration-200 hover:scale-105 ${
              currentTab === 'login'
                ? 'bg-rose-500 text-white border-rose-500 shadow-md font-bold'
                : user
                ? 'bg-primary/5 dark:bg-white/10 border-primary/20 dark:border-white/20 text-primary dark:text-white font-bold'
                : 'border-primary/20 dark:border-white/20 text-primary/80 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5 font-medium'
            } text-xs sm:text-sm`}
            aria-label="User Account Login"
            title={user ? `Signed in as ${user.name}` : 'Sign In / Account'}
          >
            <User className="w-4 h-4 text-primary dark:text-secondary-light" />
            <span className="hidden sm:inline">
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-full text-primary dark:text-gray-200 hover:bg-primary/5 dark:hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
                isTabActive(link.id)
                  ? 'bg-primary text-white dark:bg-secondary dark:text-navy font-semibold'
                  : 'text-primary dark:text-gray-200 hover:bg-primary/5 dark:hover:bg-white/5'
              }`}
            >
              {link.label}
            </button>
          ))}

          <button
            onClick={() => {
              onOpenTracking();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-sm border border-indigo-200 dark:border-indigo-800/50"
          >
            <span className="flex items-center gap-2">
              <Truck size={18} className="text-indigo-600 dark:text-indigo-400" />
              Track Your Order
            </span>
            <span className="text-[11px] font-semibold bg-indigo-200/60 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
              Live Status
            </span>
          </button>

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

          <button
            onClick={() => {
              onNavigate('login');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-colors ${
              currentTab === 'login'
                ? 'bg-rose-500 text-white border-rose-500'
                : 'border-primary/15 dark:border-white/15 text-primary dark:text-gray-200'
            }`}
          >
            <User size={18} />
            <span>{user ? `Account (${user.name})` : 'Sign In / Account'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
