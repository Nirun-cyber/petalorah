import React from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product } from '../data/products';

interface ProductQuantityControlProps {
  product: Product;
  size?: 'sm' | 'md';
}

export const ProductQuantityControl: React.FC<ProductQuantityControlProps> = ({
  product,
  size = 'sm',
}) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  if (quantity === 0) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product);
        }}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all shadow-sm ${
          size === 'sm'
            ? 'px-2.5 py-1.5 bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light hover:bg-primary hover:text-white dark:hover:bg-secondary dark:hover:text-navy text-xs'
            : 'w-full py-3 px-5 bg-primary text-white dark:bg-secondary dark:text-navy hover:scale-[1.02] text-sm'
        }`}
        title="Add to Cart"
      >
        <ShoppingBag size={size === 'sm' ? 14 : 18} />
        <span>Add to Cart</span>
      </button>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-between border rounded-xl font-bold bg-pink-50 dark:bg-pink-950/50 border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 shadow-sm ${
        size === 'sm' ? 'px-2 py-1 text-xs gap-2' : 'w-full py-2.5 px-4 text-sm gap-4'
      }`}
    >
      <button
        onClick={() => updateQuantity(product.id, quantity - 1)}
        className="p-1 hover:bg-pink-200 dark:hover:bg-pink-900/60 rounded-lg transition-colors flex items-center justify-center"
        aria-label="Decrease quantity"
      >
        <Minus size={size === 'sm' ? 12 : 16} />
      </button>

      <span className="font-extrabold px-1 min-w-[16px] text-center">
        {quantity}
      </span>

      <button
        onClick={() => updateQuantity(product.id, quantity + 1)}
        className="p-1 hover:bg-pink-200 dark:hover:bg-pink-900/60 rounded-lg transition-colors flex items-center justify-center"
        aria-label="Increase quantity"
      >
        <Plus size={size === 'sm' ? 12 : 16} />
      </button>
    </div>
  );
};
