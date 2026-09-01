import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/products';

export const INSTAGRAM_USERNAME = "petalorah";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  toastMessage: string | null;
  clipboardFallbackMessage: string | null;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  closeClipboardFallback: () => void;
  totalItems: number;
  totalPrice: number;
  proceedToOrder: () => void;
  proceedToInstagramOrder: () => void;
  proceedToWhatsAppOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'petalorah_cart_items';

export const generateInstagramOrderMessage = (items: CartItem[]): string => {
  if (!items || items.length === 0) return '';

  const itemLines = items.map((item, index) => {
    const itemSubtotal = item.product.numericPrice * item.quantity;
    return `${index + 1}. ${item.product.name} × ${item.quantity} — ₹${itemSubtotal}`;
  }).join('\n');

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPriceSum = items.reduce((sum, item) => sum + (item.product.numericPrice * item.quantity), 0);

  return `Hi! I am willing to buy these products:\n\n${itemLines}\n\nTotal Items: ${totalItemsCount}\nTotal: ₹${totalPriceSum}\n\nPlease let me know the next steps. Thank you!`;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [clipboardFallbackMessage, setClipboardFallbackMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prevItems, { product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to cart! 🛒`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const closeClipboardFallback = () => setClipboardFallbackMessage(null);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.numericPrice * item.quantity,
    0
  );

  const proceedToWhatsAppOrder = () => {
    if (cartItems.length === 0) return;
    const message = generateInstagramOrderMessage(cartItems);
    const whatsappUrl = `https://wa.me/916382735751?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const proceedToInstagramOrder = async () => {
    if (cartItems.length === 0) return;

    const message = generateInstagramOrderMessage(cartItems);
    const instagramUrl = `https://instagram.com/petalorah`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }

    // Always show modal for clear instruction that user needs to paste
    setClipboardFallbackMessage(message);
    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
  };

  const proceedToOrder = proceedToInstagramOrder;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        toastMessage,
        clipboardFallbackMessage,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        openCart,
        closeCart,
        closeClipboardFallback,
        totalItems,
        totalPrice,
        proceedToOrder,
        proceedToInstagramOrder,
        proceedToWhatsAppOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
