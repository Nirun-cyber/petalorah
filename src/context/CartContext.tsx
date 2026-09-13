import React, { createContext, useContext, useState } from 'react';
import type { Product } from '../data/products';
import { useOrders } from './OrderContext';
import { useSettings } from './SettingsContext';

export const INSTAGRAM_USERNAME = "petalorah";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerCheckoutInfo {
  name: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  pincode: string;
  notes?: string;
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
  proceedToOrder: (shippingFee?: number, shippingRegion?: string, customerInfo?: CustomerCheckoutInfo) => void;
  proceedToInstagramOrder: (shippingFee?: number, shippingRegion?: string, customerInfo?: CustomerCheckoutInfo) => Promise<string>;
  proceedToWhatsAppOrder: (shippingFee?: number, shippingRegion?: string, customerInfo?: CustomerCheckoutInfo) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Calculates delivery shipping charges based on destination pincode:
 * - Coimbatore pincodes (641xxx) or city 'Coimbatore': ₹60
 * - Other Tamil Nadu pincodes (60xxxx - 64xxxx) or state 'Tamil Nadu': ₹80
 * - Other Indian pincodes: ₹100
 */
export const calculateShippingFee = (
  pincode: string = '',
  city?: string,
  state?: string
): { fee: number; region: string } => {
  const cleanPin = (pincode || '').replace(/[^0-9]/g, '').trim();
  const cleanCity = (city || '').toLowerCase().trim();
  const cleanState = (state || '').toLowerCase().trim();

  // 1. Coimbatore Local (641xxx)
  if (cleanPin.startsWith('641') || cleanCity.includes('coimbatore') || cleanCity === 'cbe') {
    return { fee: 60, region: 'Coimbatore Local' };
  }

  // 2. Tamil Nadu Standard (60xxxx - 64xxxx)
  if (
    cleanPin.startsWith('60') ||
    cleanPin.startsWith('61') ||
    cleanPin.startsWith('62') ||
    cleanPin.startsWith('63') ||
    cleanPin.startsWith('64') ||
    cleanState.includes('tamil nadu') ||
    cleanState === 'tn'
  ) {
    return { fee: 80, region: 'Tamil Nadu Standard' };
  }

  // 3. Other Indian regions
  if (cleanPin.length === 6) {
    return { fee: 100, region: 'Interstate Standard' };
  }

  // Default standard Tamil Nadu rate if empty
  return { fee: 80, region: 'Tamil Nadu Standard' };
};

export const copyToClipboardSafe = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Navigator clipboard failed, attempting fallback', err);
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed', err);
    return false;
  }
};

export const generateWhatsAppOrderMessage = (
  items: CartItem[],
  shippingFee: number = 80,
  _shippingRegion: string = 'Tamil Nadu Standard',
  customerInfo?: CustomerCheckoutInfo,
  _orderId?: string
): string => {
  if (!items || items.length === 0) return '';

  const itemLines = items
    .map((item) => `${item.product.name} × ${item.quantity} — ₹${item.product.numericPrice * item.quantity}`)
    .join('\n');

  const itemsSubtotal = items.reduce((sum, item) => sum + item.product.numericPrice * item.quantity, 0);
  const grandTotal = itemsSubtotal + shippingFee;

  const freeCharmLine = itemsSubtotal >= 200
    ? '\n\u{1F381} Free Mini Gift Charm: Unlocked (₹0)'
    : '';

  const customerName = customerInfo?.name || '';
  const customerPhone = customerInfo?.phone || '';
  const customerAddress = customerInfo ? [customerInfo.address, customerInfo.city, customerInfo.state].filter(Boolean).join(', ') : '';
  const customerPincode = customerInfo?.pincode || '';

  return `\u{1F338} Petalorah Order

Products:
${itemLines}

Subtotal: ₹${itemsSubtotal}
Shipping: ₹${shippingFee}${freeCharmLine}
Total: ₹${grandTotal}

Customer Name: ${customerName}
Phone: ${customerPhone}
Address: ${customerAddress}
Pincode: ${customerPincode}

"Please confirm my order. Thank you! \u{1F497}"`;
};

export const generateInstagramOrderMessage = generateWhatsAppOrderMessage;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logOrder } = useOrders();
  const { settings } = useSettings();

  // Cart starts clean on refresh
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [clipboardFallbackMessage, setClipboardFallbackMessage] = useState<string | null>(null);

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

  const proceedToWhatsAppOrder = (
    shippingFee: number = 80,
    shippingRegion: string = 'Tamil Nadu Standard',
    customerInfo?: CustomerCheckoutInfo
  ): string => {
    if (cartItems.length === 0) return '';
    const finalTotal = totalPrice + shippingFee;
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const fullAddress = customerInfo
      ? [
          customerInfo.address,
          customerInfo.city,
          customerInfo.state,
          customerInfo.pincode ? `PIN: ${customerInfo.pincode}` : '',
        ]
          .filter(Boolean)
          .join(', ')
      : undefined;

    try {
      logOrder(cartItems, 'WhatsApp', {
        orderId,
        name: customerInfo?.name || 'Guest Customer',
        phone: customerInfo?.phone || '',
        deliveryAddress: fullAddress,
        pincode: customerInfo?.pincode,
        city: customerInfo?.city,
        state: customerInfo?.state,
        totalAmount: finalTotal,
      });
    } catch (err) {
      console.warn('logOrder error ignored:', err);
    }

    const message = generateWhatsAppOrderMessage(cartItems, shippingFee, shippingRegion, customerInfo, orderId);
    const phone = settings.whatsappNumber.replace(/[^0-9]/g, '') || '916380437068';

    // Auto-copy order message to clipboard for guaranteed convenience
    copyToClipboardSafe(message);

    // Desktop vs Mobile routing:
    // On desktop browsers, wa.me asks to download the Windows desktop app.
    // web.whatsapp.com bypasses this and opens WhatsApp Web directly.
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = isMobile
      ? `https://wa.me/${phone}?text=${encodedText}`
      : `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

    try {
      const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Pop-up was blocked by browser or failed to launch
        setClipboardFallbackMessage(message);
      }
    } catch (err) {
      console.warn('WhatsApp window open failed:', err);
      setClipboardFallbackMessage(message);
    }

    return orderId;
  };

  const proceedToInstagramOrder = async (
    shippingFee: number = 80,
    shippingRegion: string = 'Tamil Nadu Standard',
    customerInfo?: CustomerCheckoutInfo
  ): Promise<string> => {
    if (cartItems.length === 0) return '';
    const finalTotal = totalPrice + shippingFee;
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const fullAddress = customerInfo
      ? [
          customerInfo.address,
          customerInfo.city,
          customerInfo.state,
          customerInfo.pincode ? `PIN: ${customerInfo.pincode}` : '',
        ]
          .filter(Boolean)
          .join(', ')
      : undefined;

    try {
      logOrder(cartItems, 'Instagram', {
        orderId,
        name: customerInfo?.name || 'Guest Customer',
        phone: customerInfo?.phone || '',
        deliveryAddress: fullAddress,
        pincode: customerInfo?.pincode,
        city: customerInfo?.city,
        state: customerInfo?.state,
        totalAmount: finalTotal,
      });
    } catch (err) {
      console.warn('logOrder error ignored:', err);
    }

    const message = generateInstagramOrderMessage(cartItems, shippingFee, shippingRegion, customerInfo, orderId);
    const instagramHandle = settings.instagramUsername || 'petalorah';
    const instagramDmUrl = `https://ig.me/m/${instagramHandle}`;

    await copyToClipboardSafe(message);
    setClipboardFallbackMessage(message);

    try {
      window.open(instagramDmUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.warn('Instagram window open failed:', err);
    }

    return orderId;
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
