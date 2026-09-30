import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartItem } from './CartContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  syncOrderToGoogleSheets,
  searchOrderInGoogleSheet,
  fetchOrdersFromGoogleSheet,
} from '../lib/googleSheets';

export interface LoggedOrder {
  id: string;
  createdAt: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    img: string;
  }[];
  totalItems: number;
  totalAmount: number;
  channel: 'WhatsApp' | 'Instagram';
  status: 'New' | 'Crafting' | 'Contacted' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  pincode?: string;
  city?: string;
  courierPartner?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface OrderContextType {
  orders: LoggedOrder[];
  logOrder: (
    items: CartItem[],
    channel: 'WhatsApp' | 'Instagram',
    customerDetails?: {
      name?: string;
      phone?: string;
      totalAmount?: number;
      deliveryAddress?: string;
      pincode?: string;
      city?: string;
      state?: string;
      orderId?: string;
    }
  ) => LoggedOrder;
  updateOrderStatus: (orderId: string, status: LoggedOrder['status']) => void;
  updateOrderTracking: (orderId: string, trackingData: {
    status?: LoggedOrder['status'];
    courierPartner?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  }) => void;
  deleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;
  findOrder: (query: string) => LoggedOrder | undefined;
  lookupOrder: (query: string) => Promise<LoggedOrder | undefined>;
  pullOrdersFromGoogleSheet: () => Promise<{ count: number; error?: string }>;
  refreshOrdersFromCloud: () => Promise<void>;
}

const ORDERS_STORAGE_KEY = 'petalorah_logged_orders';

export const SAMPLE_ORDERS: LoggedOrder[] = [
  {
    id: 'ORD-849201-342',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    customerName: 'Priya Sundaram',
    customerPhone: '9876543210',
    items: [
      {
        productId: 'single_tulip_pot',
        productName: 'Pink Tulip in Miniature Pot',
        quantity: 1,
        price: 169,
        img: '/assets/products/single_tulip_pot.png',
      },
      {
        productId: 'rose',
        productName: 'Handmade Rose Keychain',
        quantity: 1,
        price: 50,
        img: '/assets/products/rose.jpg',
      },
    ],
    totalItems: 2,
    totalAmount: 219,
    channel: 'WhatsApp',
    status: 'Dispatched',
    courierPartner: 'Delhivery Surface',
    trackingNumber: 'DEL-9284719482',
    estimatedDelivery: 'Tomorrow by 5:00 PM',
  },
  {
    id: 'ORD-719384-512',
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    customerName: 'Aakash Verma',
    customerPhone: '9123456780',
    items: [
      {
        productId: 'luffy',
        productName: 'Luffy Straw Hat Charm',
        quantity: 2,
        price: 90,
        img: '/assets/products/luffy.jpg',
      },
    ],
    totalItems: 2,
    totalAmount: 180,
    channel: 'Instagram',
    status: 'Crafting',
    courierPartner: 'India Post Speed Post',
    estimatedDelivery: 'In 3-4 business days',
  },
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<LoggedOrder[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load orders from localStorage:', e);
    }
    return SAMPLE_ORDERS;
  });

  const fetchOrdersFromCloud = useCallback(async () => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: LoggedOrder[] = data.map((item) => {
          let itemsList: any[] = [];
          let meta: any = {};

          if (Array.isArray(item.items)) {
            itemsList = item.items;
          } else if (item.items && typeof item.items === 'object') {
            itemsList = item.items.cartItems || [];
            meta = item.items;
          }

          return {
            id: item.id,
            createdAt: item.created_at || meta.createdAt || new Date().toISOString(),
            customerName: item.customer_name || meta.customerName || 'Customer',
            customerPhone: item.customer_phone || meta.customerPhone || '',
            deliveryAddress: item.delivery_address || meta.deliveryAddress,
            pincode: item.pincode || meta.pincode,
            city: item.city || meta.city,
            items: itemsList,
            totalItems: Number(item.total_items || itemsList.reduce((s: number, i: any) => s + (i.quantity || 1), 0)),
            totalAmount: Number(item.total_amount || 0),
            channel: (item.channel as 'WhatsApp' | 'Instagram') || meta.channel || 'WhatsApp',
            status: (item.status as LoggedOrder['status']) || meta.status || 'New',
            courierPartner: item.courier_partner || meta.courierPartner || 'Handcrafted Express (India Post / Delhivery)',
            trackingNumber: item.tracking_number || meta.trackingNumber,
            estimatedDelivery: item.estimated_delivery || meta.estimatedDelivery || 'Estimated 3-5 business days',
          };
        });
        setOrders(mapped);
      }
    } catch (err) {
      console.warn('Supabase orders fetch fallback to local:', err);
    }
  }, []);

  // Sync from Supabase Cloud Database if configured
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    fetchOrdersFromCloud();

    const channel = client
      .channel('public:orders:all_devices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrdersFromCloud();
      })
      .subscribe();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrdersFromCloud();
      }
    };
    const onFocus = () => {
      fetchOrdersFromCloud();
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchOrdersFromCloud();
      }
    }, 25000);

    return () => {
      client.removeChannel(channel);
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [fetchOrdersFromCloud]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save all orders to localStorage, attempting to save compact recent orders:', e);
      try {
        const compactOrders = orders.slice(0, 25).map((ord) => ({
          ...ord,
          items: ord.items.map((it) => ({
            ...it,
            img: it.img && it.img.startsWith('data:') && it.img.length > 500 ? '' : it.img,
          })),
        }));
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(compactOrders));
      } catch (innerErr) {
        console.warn('Storage quota limit reached, orders preserved in memory:', innerErr);
      }
    }
  }, [orders]);

  const getGoogleSheetUrl = (): string => {
    try {
      const saved = localStorage.getItem('petalorah_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.googleSheetWebhookUrl) {
          return parsed.googleSheetWebhookUrl.trim();
        }
      }
    } catch (e) {
      // ignore
    }
    return (import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string) || '';
  };

  const logOrder = (
    cartItems: CartItem[],
    channel: 'WhatsApp' | 'Instagram',
    customerDetails?: {
      name?: string;
      phone?: string;
      totalAmount?: number;
      deliveryAddress?: string;
      pincode?: string;
      city?: string;
      state?: string;
      orderId?: string;
    }
  ): LoggedOrder => {
    const itemsTotal = cartItems ? cartItems.reduce((sum, i) => sum + i.product.numericPrice * i.quantity, 0) : 0;

    const newOrder: LoggedOrder = {
      id: customerDetails?.orderId || `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      customerName: customerDetails?.name || 'Customer',
      customerPhone: customerDetails?.phone || '',
      deliveryAddress: customerDetails?.deliveryAddress,
      pincode: customerDetails?.pincode,
      city: customerDetails?.city,
      items: (cartItems || []).map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.numericPrice,
        img: item.product.img,
      })),
      totalItems: (cartItems || []).reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: customerDetails?.totalAmount ?? itemsTotal,
      channel,
      status: 'New',
      courierPartner: 'Handcrafted Express (India Post / Delhivery)',
      estimatedDelivery: 'Estimated 3-5 business days',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Resilient order insert: store items + metadata inside items payload to ensure success regardless of table schema
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const itemsWithMetadata = {
        cartItems: newOrder.items,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        deliveryAddress: newOrder.deliveryAddress,
        pincode: newOrder.pincode,
        city: newOrder.city,
        courierPartner: newOrder.courierPartner,
        estimatedDelivery: newOrder.estimatedDelivery,
      };

      // Try full column insert first, fallback to minimal columns if custom columns not yet created
      client
        .from('orders')
        .insert({
          id: newOrder.id,
          created_at: newOrder.createdAt,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          delivery_address: newOrder.deliveryAddress,
          pincode: newOrder.pincode,
          items: itemsWithMetadata,
          total_items: newOrder.totalItems,
          total_amount: newOrder.totalAmount,
          channel: newOrder.channel,
          status: newOrder.status,
          courier_partner: newOrder.courierPartner,
          estimated_delivery: newOrder.estimatedDelivery,
        })
        .then(({ error }) => {
          if (error) {
            // Missing columns fallback: insert only core guaranteed columns
            client
              .from('orders')
              .insert({
                id: newOrder.id,
                created_at: newOrder.createdAt,
                items: itemsWithMetadata,
                total_items: newOrder.totalItems,
                total_amount: newOrder.totalAmount,
                channel: newOrder.channel,
                status: newOrder.status,
              })
              .then(({ error: fallbackErr }) => {
                if (fallbackErr) console.error('Supabase fallback order insert error:', fallbackErr);
              });
          }
        });
    }

    // Automatically sync to Google Sheets (Free Cloud Database)
    try {
      const sheetUrl = getGoogleSheetUrl();
      if (sheetUrl) {
        syncOrderToGoogleSheets(newOrder, sheetUrl);
      }
    } catch (e) {
      console.warn('Google Sheets sync check error:', e);
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: LoggedOrder['status']) => {
    let updatedTarget: LoggedOrder | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          updatedTarget = { ...ord, status };
          return updatedTarget;
        }
        return ord;
      })
    );

    // Sync status change to Google Sheets
    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && updatedTarget) {
      syncOrderToGoogleSheets(updatedTarget, sheetUrl);
    }

    if (isSupabaseConfigured && supabase) {
      const targetOrder = orders.find((o) => o.id === orderId);
      const itemsPayload = targetOrder
        ? {
            cartItems: targetOrder.items,
            customerName: targetOrder.customerName,
            customerPhone: targetOrder.customerPhone,
            courierPartner: targetOrder.courierPartner,
            trackingNumber: targetOrder.trackingNumber,
            estimatedDelivery: targetOrder.estimatedDelivery,
            status,
          }
        : undefined;

      supabase
        .from('orders')
        .update({
          status,
          ...(itemsPayload ? { items: itemsPayload } : {}),
        })
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) console.error('Supabase order update error:', error);
        });
    }
  };

  const updateOrderTracking = (
    orderId: string,
    trackingData: {
      status?: LoggedOrder['status'];
      courierPartner?: string;
      trackingNumber?: string;
      estimatedDelivery?: string;
    }
  ) => {
    let updatedOrder: LoggedOrder | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          updatedOrder = {
            ...ord,
            ...(trackingData.status ? { status: trackingData.status } : {}),
            ...(trackingData.courierPartner !== undefined ? { courierPartner: trackingData.courierPartner } : {}),
            ...(trackingData.trackingNumber !== undefined ? { trackingNumber: trackingData.trackingNumber } : {}),
            ...(trackingData.estimatedDelivery !== undefined ? { estimatedDelivery: trackingData.estimatedDelivery } : {}),
          };
          return updatedOrder;
        }
        return ord;
      })
    );

    // Sync updated tracking details to Google Sheets
    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && updatedOrder) {
      syncOrderToGoogleSheets(updatedOrder, sheetUrl);
    }

    if (isSupabaseConfigured && supabase && updatedOrder) {
      const client = supabase;
      const ord = updatedOrder;
      const itemsWithMetadata = {
        cartItems: ord.items,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        courierPartner: ord.courierPartner,
        trackingNumber: ord.trackingNumber,
        estimatedDelivery: ord.estimatedDelivery,
        status: ord.status,
      };

      // Try updating full columns + items
      client
        .from('orders')
        .update({
          status: ord.status,
          courier_partner: ord.courierPartner,
          tracking_number: ord.trackingNumber,
          estimated_delivery: ord.estimatedDelivery,
          items: itemsWithMetadata,
        })
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) {
            // Fallback to update with status & items only
            client
              .from('orders')
              .update({
                status: ord.status,
                items: itemsWithMetadata,
              })
              .eq('id', orderId)
              .then(({ error: err2 }) => {
                if (err2) console.error('Supabase tracking fallback error:', err2);
              });
          }
        });
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) console.error('Supabase order delete error:', error);
        });
    }
  };

  const clearAllOrders = () => {
    setOrders([]);
  };

  const findOrder = (query: string): LoggedOrder | undefined => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return undefined;

    // Exact ID match or substring
    const idMatch = orders.find(
      (o) => o.id.toLowerCase() === cleanQuery || o.id.toLowerCase().includes(cleanQuery)
    );
    if (idMatch) return idMatch;

    // Digits only match for phone number
    const queryDigits = cleanQuery.replace(/\D/g, '');
    if (queryDigits.length >= 4) {
      return orders.find((o) => {
        const phoneDigits = (o.customerPhone || '').replace(/\D/g, '');
        return phoneDigits.includes(queryDigits) || queryDigits.includes(phoneDigits);
      });
    }

    return undefined;
  };

  const lookupOrder = async (query: string): Promise<LoggedOrder | undefined> => {
    // 1. Search local memory first
    const localMatch = findOrder(query);
    if (localMatch) return localMatch;

    // 2. Query Google Sheet live
    const sheetUrl = getGoogleSheetUrl();
    if (!sheetUrl) return undefined;

    try {
      const remoteOrder = await searchOrderInGoogleSheet(query, sheetUrl);
      if (remoteOrder) {
        setOrders((prev) => {
          if (prev.some((o) => o.id.toLowerCase() === remoteOrder.id.toLowerCase())) {
            return prev;
          }
          return [remoteOrder, ...prev];
        });

        if (isSupabaseConfigured && supabase) {
          supabase
            .from('orders')
            .upsert({
              id: remoteOrder.id,
              created_at: remoteOrder.createdAt,
              items: {
                cartItems: remoteOrder.items,
                customerName: remoteOrder.customerName,
                customerPhone: remoteOrder.customerPhone,
                courierPartner: remoteOrder.courierPartner,
                trackingNumber: remoteOrder.trackingNumber,
                estimatedDelivery: remoteOrder.estimatedDelivery,
                status: remoteOrder.status,
              },
              total_items: remoteOrder.totalItems,
              total_amount: remoteOrder.totalAmount,
              channel: remoteOrder.channel,
              status: remoteOrder.status,
            })
            .then(({ error }) => {
              if (error) console.warn('Supabase upsert sheet order error:', error);
            });
        }

        return remoteOrder;
      }
    } catch (err) {
      console.error('Error looking up order in Google Sheet:', err);
    }

    return undefined;
  };

  const pullOrdersFromGoogleSheet = async (): Promise<{ count: number; error?: string }> => {
    const sheetUrl = getGoogleSheetUrl();
    if (!sheetUrl) {
      return { count: 0, error: 'No Google Sheet link or Apps Script URL configured. Please set it in Store Settings.' };
    }

    try {
      const fetched = await fetchOrdersFromGoogleSheet(sheetUrl);
      if (!fetched || fetched.length === 0) {
        return { count: 0, error: 'No orders found in Google Sheet. Make sure the sheet is shared as "Anyone with the link can view".' };
      }

      let addedCount = 0;
      setOrders((prev) => {
        const existingIds = new Set(prev.map((o) => o.id.toLowerCase()));
        const newOrders = fetched.filter((o) => !existingIds.has(o.id.toLowerCase()));
        addedCount = newOrders.length;
        return [...newOrders, ...prev];
      });

      return { count: addedCount };
    } catch (err: any) {
      return { count: 0, error: err.message || 'Failed to fetch from Google Sheet.' };
    }
  };

  const refreshOrdersFromCloud = async () => {
    await fetchOrdersFromCloud();
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        logOrder,
        updateOrderStatus,
        updateOrderTracking,
        deleteOrder,
        clearAllOrders,
        findOrder,
        lookupOrder,
        pullOrdersFromGoogleSheet,
        refreshOrdersFromCloud,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
