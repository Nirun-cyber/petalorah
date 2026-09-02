import React, { useState } from 'react';
import { Menu, X, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: 'home' | 'portfolio' | 'keychains' | 'tabletops' | 'custom' | 'admin';
  onNavigate: (tab: 'home' | 'portfolio' | 'keychains' | 'tabletops' | 'custom' | 'admin') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const { user, isAdmin, openAuthModal } = useAuth();

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
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full border-2 border-primary/20 dark:border-secondary/30 overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
            <img src="/assets/logo.jpg" alt="Petalorah Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-2xl font-bold tracking-wider text-primary dark:text-secondary-light">
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

        {/* Right Actions: Cart Button & Login Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            aria-label="Open shopping cart"
            title="Check your cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">check your cart</span>
            <span className="sm:hidden font-bold">Cart</span>
            {totalItems > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] sm:text-xs shadow-sm animate-in zoom-in duration-200">
                {totalItems}
              </span>
            )}
          </button>

          {/* Login / Account Button (Right to Cart) */}
          <button
            onClick={() => openAuthModal(isAdmin ? 'admin' : 'customer')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full border transition-all duration-200 hover:scale-105 ${
              isAdmin
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-300 font-bold'
                : user
                ? 'bg-primary/5 dark:bg-white/10 border-primary/20 dark:border-white/20 text-primary dark:text-white font-bold'
                : 'border-primary/20 dark:border-white/20 text-primary/80 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/5 font-medium'
            } text-xs sm:text-sm`}
            aria-label="User Account Login"
            title={isAdmin ? 'Admin Active' : user ? `Signed in as ${user.name}` : 'Sign In / Account'}
          >
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            ) : (
              <User className="w-4 h-4 text-primary dark:text-secondary-light" />
            )}
            <span className="hidden sm:inline">
              {isAdmin ? 'Admin' : user ? user.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-primary dark:text-gray-200 hover:bg-primary/5 dark:hover:bg-white/10"
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

          <button
            onClick={() => {
              openAuthModal(isAdmin ? 'admin' : 'customer');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-primary/15 dark:border-white/15 text-primary dark:text-gray-200 font-bold text-sm"
          >
            {isAdmin ? <ShieldCheck size={18} className="text-amber-500" /> : <User size={18} />}
            <span>{isAdmin ? 'Admin Portal' : user ? `Account (${user.name})` : 'Sign In / Account'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
