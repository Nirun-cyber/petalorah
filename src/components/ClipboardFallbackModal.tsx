import React, { useState } from 'react';
import { useCart, INSTAGRAM_USERNAME } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { X, Copy, Check, ExternalLink, MessageSquareCode } from 'lucide-react';

export const ClipboardFallbackModal: React.FC = () => {
  const { clipboardFallbackMessage, closeClipboardFallback } = useCart();
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);

  if (!clipboardFallbackMessage) return null;

  const isInstagramMessage = clipboardFallbackMessage.includes('Instagram') || !clipboardFallbackMessage.includes('Petalorah Order');
  const cleanPhone = (settings.whatsappNumber || '916380437068').replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(clipboardFallbackMessage);
  const directWhatsAppAppUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  const directWhatsAppWebUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  const directInstagramDmUrl = `https://ig.me/m/${INSTAGRAM_USERNAME}`;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={closeClipboardFallback} />

      <div className="relative w-full max-w-lg bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 rounded-3xl shadow-2xl z-10 p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
            {isInstagramMessage ? 'Instagram Order Message' : 'WhatsApp Order Message'}
          </h3>
          <button
            onClick={closeClipboardFallback}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-primary dark:text-gray-300"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <span>📋 Order Details Ready!</span>
          </p>
          <p>
            {isInstagramMessage ? (
              <>
                Tap <strong>Copy Order Message</strong>, then tap <strong>Open Instagram DM</strong> and press <strong>Paste</strong> to send your order to <strong>@{INSTAGRAM_USERNAME}</strong>.
              </>
            ) : (
              <>
                Your order is ready. Choose <strong>WhatsApp Web</strong> (for laptop/PC browser) or <strong>WhatsApp App</strong> (for phone or desktop app).
              </>
            )}
          </p>
        </div>

        <div className="relative p-3.5 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/10 dark:border-white/10 font-mono text-xs text-primary dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
          {clipboardFallbackMessage}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-2xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            {copied ? 'Message Copied!' : 'Copy Order Message'}
          </button>

          {!isInstagramMessage ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={directWhatsAppWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors text-center"
              >
                <MessageSquareCode size={16} />
                Open WhatsApp Web
              </a>
              <a
                href={directWhatsAppAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-2xl bg-emerald-700/80 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <ExternalLink size={14} />
                WhatsApp App
              </a>
            </div>
          ) : (
            <a
              href={directInstagramDmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              Open Instagram DM <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
