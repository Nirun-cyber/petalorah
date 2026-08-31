import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircleHeart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    proceedToOrder,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div className="fixed inset-0" onClick={closeCart} />

      {/* Cart Panel Drawer */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-navy-light border-l border-primary/10 dark:border-white/10 shadow-2xl z-10 flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-primary/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary dark:text-secondary-light" size={22} />
            <h2 className="font-serif text-xl font-bold text-primary dark:text-white">
              Your Cart
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            onClick={closeCart}
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-primary dark:text-gray-200 transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Item List Body */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-primary/5 dark:bg-white/5 flex items-center justify-center text-primary/40 dark:text-gray-500">
                <ShoppingBag size={32} />
              </div>
              <p className="text-base font-semibold text-primary/70 dark:text-gray-300">
                Your cart is empty.
              </p>
              <button
                onClick={closeCart}
                className="px-5 py-2.5 rounded-2xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs shadow-md hover:scale-105 transition-all"
              >
                Browse Crafts
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/5 dark:border-white/5 shadow-sm"
              >
                {/* Product Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-navy-light flex-shrink-0 border border-primary/10 dark:border-white/10">
                  <img
                    src={item.product.img}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details & Quantity */}
                <div className="flex-grow min-w-0">
                  <h4 className="font-serif text-sm font-bold text-primary dark:text-white truncate">
                    {item.product.name}
                  </h4>
                  <div className="text-xs text-primary/70 dark:text-gray-300 mt-0.5">
                    ₹{item.product.numericPrice} each
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-primary/20 dark:border-white/20 rounded-xl overflow-hidden bg-white dark:bg-navy-light">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-1 text-primary dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-bold text-primary dark:text-white min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-1 text-primary dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Item Subtotal */}
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-extrabold text-primary dark:text-secondary-light">
                    ₹{item.product.numericPrice * item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Proceed CTA */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-primary/10 dark:border-white/10 bg-white/50 dark:bg-navy/50 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-primary/70 dark:text-gray-300">
                <span>Total Items:</span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-primary dark:text-white pt-1 border-t border-primary/5 dark:border-white/5">
                <span>Total Amount:</span>
                <span className="text-lg text-primary dark:text-secondary-light">₹{totalPrice}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={proceedToOrder}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                <MessageCircleHeart size={18} />
                Proceed to Order
                <ArrowRight size={16} />
              </button>

              <button
                onClick={clearCart}
                className="w-full py-1.5 text-xs text-primary/50 dark:text-gray-400 hover:text-rose-500 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
