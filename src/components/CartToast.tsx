import React from 'react';
import { useCart } from '../context/CartContext';
import { Sparkles } from 'lucide-react';

export const CartToast: React.FC = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-md px-6 py-3.5 rounded-full bg-primary text-white dark:bg-secondary dark:text-navy font-semibold text-xs sm:text-sm shadow-2xl border border-white/20 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300 pointer-events-none">
      <Sparkles size={16} className="text-amber-400 fill-current animate-pulse flex-shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
};
