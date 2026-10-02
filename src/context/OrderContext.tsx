import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartItem } from './CartContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  refreshOrdersFromCloud: () => Promise<void>;
}

const ORDERS_STORAGE_KEY = 'petalorah_logged_orders';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<LoggedOrder[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load orders from localStorage:', e);
    }
    return [];
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

      if (data) {
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
            courierPartner: item.courier_partner || meta.courierPartner,
            trackingNumber: item.tracking_number || meta.trackingNumber,
            estimatedDelivery: item.estimated_delivery || meta.estimatedDelivery,
          };
        });
        setOrders(mapped);
      }
    } catch (err) {
      console.warn('Supabase orders fetch warning:', err);
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

  // Persist local orders
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('LocalStorage save error for orders:', e);
    }
  }, [orders]);

  const logOrder = (
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
  ): LoggedOrder => {
    const generatedId =
      customerDetails?.orderId ||
      `ORD-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(100 + Math.random() * 900)}`;

    const totalCalculated =
      customerDetails?.totalAmount !== undefined
        ? customerDetails.totalAmount
        : items.reduce((sum, item) => sum + item.product.numericPrice * item.quantity, 0);

    const newOrder: LoggedOrder = {
      id: generatedId,
      createdAt: new Date().toISOString(),
      customerName: customerDetails?.name || undefined,
      customerPhone: customerDetails?.phone || undefined,
      deliveryAddress: customerDetails?.deliveryAddress || undefined,
      pincode: customerDetails?.pincode || undefined,
      city: customerDetails?.city || undefined,
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        price: i.product.numericPrice,
        img: i.product.img,
      })),
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: totalCalculated,
      channel,
      status: 'New',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Push to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const itemsWithMetadata = {
        cartItems: newOrder.items,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        deliveryAddress: newOrder.deliveryAddress,
        pincode: newOrder.pincode,
        city: newOrder.city,
        channel: newOrder.channel,
        status: newOrder.status,
      };

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

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: LoggedOrder['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('orders')
        .update({ status })
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

    if (isSupabaseConfigured && supabase && updatedOrder) {
      const ord = updatedOrder;
      supabase
        .from('orders')
        .update({
          status: ord.status,
          courier_partner: ord.courierPartner,
          tracking_number: ord.trackingNumber,
          estimated_delivery: ord.estimatedDelivery,
        })
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) console.error('Supabase tracking update error:', error);
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
    localStorage.removeItem(ORDERS_STORAGE_KEY);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('orders')
        .delete()
        .neq('id', '__keep_none__')
        .then(({ error }) => {
          if (error) console.error('Supabase clear orders error:', error);
        });
    }
  };

  const findOrder = (query: string): LoggedOrder | undefined => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return undefined;

    const idMatch = orders.find(
      (o) => o.id.toLowerCase() === cleanQuery || o.id.toLowerCase().includes(cleanQuery)
    );
    if (idMatch) return idMatch;

    const queryDigits = cleanQuery.replace(/\D/g, '');
    if (queryDigits.length >= 4) {
      return orders.find((o) => {
        const phoneDigits = (o.customerPhone || '').replace(/\D/g, '');
        return phoneDigits.includes(queryDigits) || queryDigits.includes(phoneDigits);
      });
    }

    return undefined;
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
