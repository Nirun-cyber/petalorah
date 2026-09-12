import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileStickyCart: React.FC = () => {
  const { totalItems, totalPrice, openCart, isCartOpen } = useCart();

  // Don't display the sticky floating bar if cart is empty or cart drawer is currently open
  if (totalItems === 0 || isCartOpen) {
    return null;
  }

  // Threshold calculation for the Free Mini Charm
  const FREE_GIFT_THRESHOLD = 200;
  const isFreeGiftUnlocked = totalPrice >= FREE_GIFT_THRESHOLD;
  const neededForFreeGift = Math.max(0, FREE_GIFT_THRESHOLD - totalPrice);

  return (
    <aside
      aria-label="Sticky Cart Summary"
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:hidden pointer-events-none animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="max-w-md mx-auto pointer-events-auto shadow-2xl rounded-2xl overflow-hidden border border-rose-200/80 dark:border-rose-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl transition-all">
        {/* Subtle top notification for Free Charm if close */}
        {!isFreeGiftUnlocked && neededForFreeGift > 0 && (
          <div className="bg-rose-50/90 dark:bg-rose-950/50 border-b border-rose-100 dark:border-rose-900/30 px-3 py-1 text-[11px] text-rose-700 dark:text-rose-300 font-medium flex items-center justify-between">
            <span className="truncate">Add ₹{neededForFreeGift} more for FREE mini charm 🎁</span>
            <span className="text-[10px] font-bold text-rose-500 shrink-0">₹{totalPrice}/₹200</span>
          </div>
        )}

        {isFreeGiftUnlocked && (
          <div className="bg-emerald-50/90 dark:bg-emerald-950/50 border-b border-emerald-100 dark:border-emerald-900/30 px-3 py-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between">
            <span className="truncate">🎁 FREE mini surprise charm unlocked!</span>
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 shrink-0">
              FREE
            </span>
          </div>
        )}

        {/* Main interactive button bar */}
        <button
          onClick={openCart}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary via-primary to-primary-dark hover:brightness-105 active:scale-[0.99] text-white transition-all select-none"
        >
          {/* Left: Cart icon + Item count badge */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <ShoppingBag size={17} className="text-white" />
              </div>
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            </div>
            <div className="text-left leading-tight">
              <span className="text-xs font-medium text-white/80 block">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
              </span>
              <span className="text-sm font-black text-white">
                ₹{totalPrice}
              </span>
            </div>
          </div>

          {/* Right: View Cart Action Prompt */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 text-white font-bold text-xs tracking-wide">
            <span>View Cart</span>
            <ArrowRight size={14} />
          </div>
        </button>
      </div>
    </aside>
  );
};
