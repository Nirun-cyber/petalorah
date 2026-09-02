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
  address?: DeliveryAddress;
}

interface AuthContextType {
  user: CustomerUser | null;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  initialTab: 'customer' | 'admin';
  openAuthModal: (tab?: 'customer' | 'admin') => void;
  closeAuthModal: () => void;
  loginCustomer: (data: { name: string; email: string; phone: string }) => void;
  logoutCustomer: () => void;
  updateCustomerAddress: (address: DeliveryAddress) => void;
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

  const loginCustomer = (data: { name: string; email: string; phone: string }) => {
    setUser((prev) => ({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      isLoggedIn: true,
      address: prev?.address,
    }));
  };

  const logoutCustomer = () => {
    setUser(null);
  };

  const updateCustomerAddress = (address: DeliveryAddress) => {
    setUser((prev) => (prev ? { ...prev, address } : null));
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
        logoutCustomer,
        updateCustomerAddress,
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
