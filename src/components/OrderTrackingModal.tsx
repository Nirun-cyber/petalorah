import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  Package,
  Gift,
  ExternalLink,
  MapPin,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useOrders, type LoggedOrder } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const { orders, findOrder, lookupOrder } = useOrders();
  const { settings } = useSettings();
  const cleanPhone = (settings.whatsappNumber || '916380437068').replace(/[^0-9]/g, '');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [activeOrder, setActiveOrder] = useState<LoggedOrder | null>(() => {
    if (initialQuery) {
      const found = orders.find((o) => o.id.toLowerCase() === initialQuery.toLowerCase());
      if (found) return found;
    }
    return null;
  });
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));

  // Ensure state is clean on refresh and whenever tracking modal opens without a query
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setSearchQuery(initialQuery);
        const found = findOrder(initialQuery);
        setActiveOrder(found || null);
        setHasSearched(true);
      } else {
        setSearchQuery('');
        setActiveOrder(null);
        setHasSearched(false);
      }
    }
  }, [isOpen, initialQuery]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setHasSearched(true);
    // Instant local memory check
    const localMatch = findOrder(query);
    if (localMatch) {
      setActiveOrder(localMatch);
      return;
    }

    // Async lookup in Google Sheets / live database
    setIsSearching(true);
    try {
      const remoteMatch = await lookupOrder(query);
      setActiveOrder(remoteMatch || null);
    } catch (err) {
      console.error('Order tracking search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSampleOrder = async (orderId: string) => {
    setSearchQuery(orderId);
    setHasSearched(true);
    const localMatch = findOrder(orderId);
    if (localMatch) {
      setActiveOrder(localMatch);
      return;
    }

    setIsSearching(true);
    try {
      const remoteMatch = await lookupOrder(orderId);
      setActiveOrder(remoteMatch || null);
    } catch (err) {
      console.error('Sample order search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Determine active step (1 to 5)
  const getStepIndex = (status: LoggedOrder['status']): number => {
    switch (status) {
      case 'New':
        return 1;
      case 'Crafting':
        return 2;
      case 'Contacted':
        return 2;
      case 'Packed':
        return 3;
      case 'Dispatched':
        return 4;
      case 'Delivered':
        return 5;
      case 'Cancelled':
        return 0;
      default:
        return 1;
    }
  };

  const steps = [
    { title: 'Order Received', desc: 'Confirmed & in queue', icon: CheckCircle2 },
    { title: 'Artisan Crafting', desc: 'Twisted with pipe cleaners', icon: Sparkles },
    { title: 'Gift Packed', desc: 'Protected & gift-boxed', icon: Gift },
    { title: 'Dispatched', desc: 'Handed to courier', icon: Truck },
    { title: 'Delivered', desc: 'At your doorstep', icon: Package },
  ];

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        data-lenis-prevent
        className="relative w-full max-w-2xl bg-white dark:bg-navy-light rounded-3xl p-4 sm:p-8 shadow-2xl border border-primary/10 dark:border-white/10 z-10 max-h-[92vh] overflow-y-auto overscroll-contain flex flex-col justify-between"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-primary dark:text-gray-200 transition-colors"
          aria-label="Close tracking"
        >
          <X size={18} />
        </button>

        {/* Header & Search */}
        <div>
          <div className="text-center space-y-1 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Truck size={14} /> Live Keepsake Tracking
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary dark:text-white">
              Track Your Order
            </h2>
            <p className="text-xs text-primary/70 dark:text-gray-300">
              Check crafting status, dispatch date, and courier tracking for your handmade order.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col xs:flex-row gap-2 mb-4">
            <div className="relative flex-grow">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40 dark:text-gray-400"
              />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-849201-342) or Mobile Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/15 dark:border-white/15 text-xs sm:text-sm text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 sm:py-3 rounded-2xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center min-w-[70px] disabled:opacity-75"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Track'}
            </button>
          </form>

          {/* Quick Demo Sample Chips */}
          <div className="flex items-center gap-2 flex-wrap mb-6 text-xs">
            <span className="text-primary/50 dark:text-gray-400 font-medium">Try Sample:</span>
            {orders.slice(0, 2).map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => selectSampleOrder(sample.id)}
                className="px-2.5 py-1 rounded-xl bg-primary/5 dark:bg-white/5 hover:bg-primary/10 text-primary dark:text-gray-300 font-semibold border border-primary/10 text-[11px] transition-colors"
              >
                #{sample.id.slice(0, 10)}... ({sample.status})
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Status Display */}
        {hasSearched && (
          <div className="space-y-6 pt-2">
            {activeOrder ? (
              <div className="p-4 sm:p-6 rounded-3xl bg-gray-50/80 dark:bg-navy border border-primary/10 dark:border-white/10 space-y-6">
                
                {/* Order Header Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-primary/10 dark:border-white/10">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif text-base sm:text-lg font-bold text-primary dark:text-white">
                        Order #{activeOrder.id}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          activeOrder.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : activeOrder.status === 'Dispatched'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : activeOrder.status === 'Packed'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {activeOrder.status}
                      </span>
                    </div>
                    <div className="text-xs text-primary/70 dark:text-gray-300 mt-1">
                      Placed on {new Date(activeOrder.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })} via {activeOrder.channel}
                    </div>
                  </div>

                  {activeOrder.estimatedDelivery && (
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] uppercase tracking-wider text-primary/60 dark:text-gray-400 font-semibold block">
                        Estimated Arrival
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 sm:justify-end">
                        <Clock size={13} /> {activeOrder.estimatedDelivery}
                      </span>
                    </div>
                  )}
                </div>

                {/* 5-Step Visual Progress Stepper */}
                <div className="py-2">
                  <div className="grid grid-cols-5 gap-0.5 sm:gap-1 relative">
                    {steps.map((step, idx) => {
                      const stepNum = idx + 1;
                      const isCompleted = currentStep >= stepNum;
                      const isCurrent = currentStep === stepNum;
                      const IconComponent = step.icon;

                      return (
                        <div key={step.title} className="flex flex-col items-center text-center">
                          <div
                            className={`w-7 h-7 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                              isCompleted
                                ? 'bg-emerald-500 text-white scale-105 ring-2 sm:ring-4 ring-emerald-100 dark:ring-emerald-950/40'
                                : isCurrent
                                ? 'bg-primary text-white ring-2 sm:ring-4 ring-primary/20 animate-pulse'
                                : 'bg-gray-100 dark:bg-navy text-gray-400 border border-primary/10'
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span
                            className={`mt-1.5 text-[8px] xs:text-[10px] sm:text-xs font-bold leading-tight ${
                              isCompleted || isCurrent
                                ? 'text-primary dark:text-white'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.title}
                          </span>
                          <span className="text-[9px] text-primary/50 dark:text-gray-400 hidden sm:block mt-0.5">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              {/* Courier & Shipping Details (if dispatched) */}
              {(activeOrder.courierPartner || activeOrder.trackingNumber) && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <MapPin size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-blue-900 dark:text-blue-200">
                        {activeOrder.courierPartner || 'Courier Partner'}
                      </span>
                      {activeOrder.trackingNumber && (
                        <span className="block font-mono text-blue-700 dark:text-blue-300 text-[11px]">
                          AWB: {activeOrder.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  {activeOrder.trackingNumber && (
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      Tracking Active <ExternalLink size={12} />
                    </span>
                  )}
                </div>
              )}

              {/* Ordered Items Summary */}
              <div>
                <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-gray-300 mb-2.5">
                  Items in this Order ({activeOrder.totalItems})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-navy border border-primary/5 dark:border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.img || '/assets/products/rose.jpg'}
                          alt={item.productName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/products/rose.jpg';
                          }}
                          className="w-9 h-9 rounded-lg object-cover border border-primary/10"
                        />
                        <div>
                          <span className="font-semibold text-primary dark:text-white block">
                            {item.productName}
                          </span>
                          <span className="text-[11px] text-primary/60 dark:text-gray-400">
                            Qty: {item.quantity} {item.price > 0 ? `× ₹${item.price}` : ''}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-primary dark:text-secondary-light">
                        ₹{item.price > 0 ? item.price * item.quantity : activeOrder.totalAmount}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between items-center text-sm font-bold text-primary dark:text-white pt-2 border-t border-primary/10">
                  <span>Total Amount:</span>
                  <span className="text-base text-primary dark:text-secondary-light">
                    ₹{activeOrder.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          ) : isSearching ? (
            <div className="p-8 text-center space-y-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 animate-pulse">
              <Loader2 size={32} className="text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
              <h3 className="font-serif text-base font-bold text-primary dark:text-white">
                Checking Your Order Status...
              </h3>
              <p className="text-xs text-primary/70 dark:text-gray-300 max-w-sm mx-auto">
                Searching our store records for your handcrafted order details.
              </p>
            </div>
          ) : hasSearched ? (
            <div className="p-8 text-center space-y-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30">
              <AlertCircle size={32} className="text-rose-500 mx-auto" />
              <h3 className="font-serif text-base font-bold text-primary dark:text-white">
                No Matching Order Found
              </h3>
              <p className="text-xs text-primary/70 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find an order matching that ID or phone number. Please check the digits, or message us on WhatsApp and we will gladly track it for you!
              </p>
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Hi Petalorah! I'm trying to track my order (${searchQuery}) but couldn't find it. Could you please help me?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <WhatsAppIcon size={16} />
                <span>Ask Us on WhatsApp</span>
              </a>
            </div>
          ) : null}
        </div>
        )}

        {/* WhatsApp Help CTA */}
        {activeOrder && (
          <div className="mt-6 pt-4 border-t border-primary/10 dark:border-white/10">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hi Petalorah! I'm inquiring about my order ${activeOrder.id}. Could you please update me?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all duration-200"
            >
              <WhatsAppIcon size={18} />
              <span>Need Help with this Order? Inquire on WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
