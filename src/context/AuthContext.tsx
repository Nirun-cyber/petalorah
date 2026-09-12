import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface CustomerUser {
  name: string;
  email: string;
  phone: string;
  isLoggedIn: boolean;
  avatar?: string;
  createdDate?: string;
  address?: DeliveryAddress;
}

interface AuthContextType {
  user: CustomerUser | null;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  initialTab: 'customer' | 'admin';
  openAuthModal: (tab?: 'customer' | 'admin') => void;
  closeAuthModal: () => void;
  loginCustomer: (data: { name: string; email: string; phone: string; address?: DeliveryAddress; avatar?: string }) => void;
  loginCustomerWithGoogle: () => void;
  logoutCustomer: () => void;
  updateCustomerAddress: (address: DeliveryAddress) => void;
  updateCustomerProfile: (data: Partial<CustomerUser>) => void;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
}

const CUSTOMER_STORAGE_KEY = 'petalorah_customer_user';
const ADMIN_SESSION_KEY = 'petalorah_admin_authed';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { verifyPin } = useSettings();

  const [user, setUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load customer user profile:', e);
    }
    return null;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'customer' | 'admin'>('customer');

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error('Failed to save customer user profile:', e);
      }
    } else {
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = (tab: 'customer' | 'admin' = 'customer') => {
    setInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginCustomer = (data: {
    name: string;
    email: string;
    phone: string;
    address?: DeliveryAddress;
    avatar?: string;
  }) => {
    setUser((prev) => ({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      isLoggedIn: true,
      avatar: data.avatar || prev?.avatar,
      createdDate: prev?.createdDate || new Date().toISOString(),
      address: data.address || prev?.address,
    }));
  };

  const loginCustomerWithGoogle = () => {
    setUser({
      name: 'Priya Sharma (Google)',
      email: 'priya.sharma.crafts@gmail.com',
      phone: '+91 98765 43210',
      isLoggedIn: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      createdDate: new Date().toISOString(),
      address: {
        street: '14 Lotus Blossom Street, Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
        landmark: 'Near Eco Park',
      },
    });
  };

  const logoutCustomer = () => {
    setUser(null);
  };

  const updateCustomerAddress = (address: DeliveryAddress) => {
    setUser((prev) => (prev ? { ...prev, address } : null));
  };

  const updateCustomerProfile = (data: Partial<CustomerUser>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const loginAdmin = (pin: string): boolean => {
    if (verifyPin(pin)) {
      setIsAdmin(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAuthModalOpen,
        initialTab,
        openAuthModal,
        closeAuthModal,
        loginCustomer,
        loginCustomerWithGoogle,
        logoutCustomer,
        updateCustomerAddress,
        updateCustomerProfile,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
