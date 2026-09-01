import React, { createContext, useContext, useState, useEffect } from 'react';
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
  status: 'New' | 'Contacted' | 'Packed' | 'Delivered' | 'Cancelled';
}

interface OrderContextType {
  orders: LoggedOrder[];
  logOrder: (items: CartItem[], channel: 'WhatsApp' | 'Instagram') => void;
  updateOrderStatus: (orderId: string, status: LoggedOrder['status']) => void;
  deleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;
}

const ORDERS_STORAGE_KEY = 'petalorah_logged_orders';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<LoggedOrder[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load orders from localStorage:', e);
    }
    return [];
  });

  // Sync from Supabase Cloud Database if configured
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    const fetchOrdersFromCloud = async () => {
      try {
        const { data, error } = await client
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: LoggedOrder[] = data.map((item) => ({
            id: item.id,
            createdAt: item.created_at || new Date().toISOString(),
            items: item.items || [],
            totalItems: Number(item.total_items || 0),
            totalAmount: Number(item.total_amount || 0),
            channel: item.channel as 'WhatsApp' | 'Instagram',
            status: item.status as LoggedOrder['status'],
          }));
          setOrders(mapped);
        }
      } catch (err) {
        console.warn('Supabase orders fetch fallback to local:', err);
      }
    };

    fetchOrdersFromCloud();

    const channel = client
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrdersFromCloud();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }
  }, [orders]);

  const logOrder = (cartItems: CartItem[], channel: 'WhatsApp' | 'Instagram') => {
    if (!cartItems || cartItems.length === 0) return;

    const newOrder: LoggedOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.numericPrice,
        img: item.product.img,
      })),
      totalItems: cartItems.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: cartItems.reduce((sum, i) => sum + i.product.numericPrice * i.quantity, 0),
      channel,
      status: 'New',
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('orders')
        .insert({
          id: newOrder.id,
          created_at: newOrder.createdAt,
          items: newOrder.items,
          total_items: newOrder.totalItems,
          total_amount: newOrder.totalAmount,
          channel: newOrder.channel,
          status: newOrder.status,
        })
        .then(({ error }) => {
          if (error) console.error('Supabase order insert error:', error);
        });
    }
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

  return (
    <OrderContext.Provider
      value={{
        orders,
        logOrder,
        updateOrderStatus,
        deleteOrder,
        clearAllOrders,
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
