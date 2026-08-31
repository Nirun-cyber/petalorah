import React, { useState } from 'react';
import { useCart, INSTAGRAM_USERNAME } from '../context/CartContext';
import { X, Copy, Check, ExternalLink } from 'lucide-react';

export const ClipboardFallbackModal: React.FC = () => {
  const { clipboardFallbackMessage, closeClipboardFallback } = useCart();
  const [copied, setCopied] = useState(false);

  if (!clipboardFallbackMessage) return null;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(clipboardFallbackMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={closeClipboardFallback} />

      <div className="relative w-full max-w-lg bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 rounded-3xl shadow-2xl z-10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
            Your Order Message
          </h3>
          <button
            onClick={closeClipboardFallback}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-primary dark:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-primary/70 dark:text-gray-300">
          Copy your order message below and paste it in Instagram DM to send your order to <strong>@{INSTAGRAM_USERNAME}</strong>:
        </p>

        <div className="relative p-3.5 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/10 dark:border-white/10 font-mono text-xs text-primary dark:text-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
          {clipboardFallbackMessage}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-2xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:scale-102 transition-transform"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            {copied ? 'Message Copied!' : 'Copy Order Message'}
          </button>

          <a
            href={`https://instagram.com/${INSTAGRAM_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
          >
            Open Instagram <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
