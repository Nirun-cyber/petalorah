import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
  usageCount: number;
  description?: string;
  expiresAt?: string;
}

interface CouponContextType {
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string, subtotal: number) => { success: boolean; message: string; discount: number };
  removeCoupon: () => void;
  calculateDiscount: (coupon: Coupon | null, subtotal: number) => number;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponActive: (id: string) => void;
  resetCouponsToDefault: () => void;
}

const COUPONS_STORAGE_KEY = 'petalorah_coupons';

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'PETAL10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 199,
    isActive: true,
    usageCount: 24,
    description: '10% off on all orders above ₹199',
  },
  {
    id: 'cpn-2',
    code: 'FLOWER50',
    discountType: 'flat',
    discountValue: 50,
    minOrderValue: 399,
    isActive: true,
    usageCount: 15,
    description: 'Flat ₹50 off on orders above ₹399',
  },
  {
    id: 'cpn-3',
    code: 'FREESHIP',
    discountType: 'flat',
    discountValue: 60,
    minOrderValue: 299,
    isActive: true,
    usageCount: 42,
    description: 'Save ₹60 shipping discount on orders above ₹299',
  },
];

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(COUPONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load coupons from localStorage:', e);
    }
    return DEFAULT_COUPONS;
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
    } catch (e) {
      console.error('Failed to save coupons:', e);
    }
  }, [coupons]);

  const calculateDiscount = (coupon: Coupon | null, subtotal: number): number => {
    if (!coupon || !coupon.isActive) return 0;
    if (subtotal < coupon.minOrderValue) return 0;

    if (coupon.discountType === 'percentage') {
      const discount = Math.round((subtotal * coupon.discountValue) / 100);
      return Math.min(discount, subtotal);
    } else {
      return Math.min(coupon.discountValue, subtotal);
    }
  };

  const applyCoupon = (
    code: string,
    subtotal: number
  ): { success: boolean; message: string; discount: number } => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code.', discount: 0 };
    }

    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { success: false, message: `Coupon "${cleanCode}" is invalid.`, discount: 0 };
    }

    if (!found.isActive) {
      return { success: false, message: `Coupon "${cleanCode}" is no longer active.`, discount: 0 };
    }

    if (subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Min order value for "${cleanCode}" is ₹${found.minOrderValue}. Add ₹${found.minOrderValue - subtotal} more!`,
        discount: 0,
      };
    }

    const discount = calculateDiscount(found, subtotal);
    setAppliedCoupon(found);

    // Increment usage count
    setCoupons((prev) =>
      prev.map((c) => (c.id === found.id ? { ...c, usageCount: c.usageCount + 1 } : c))
    );

    return {
      success: true,
      message: `🎉 Applied! Saved ₹${discount} with ${found.code}`,
      discount,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const addCoupon = (couponData: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `cpn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: couponData.code.trim().toUpperCase(),
      usageCount: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          if (updates.code) {
            updated.code = updates.code.trim().toUpperCase();
          }
          return updated;
        }
        return c;
      })
    );
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    if (appliedCoupon?.id === id) {
      setAppliedCoupon(null);
    }
  };

  const toggleCouponActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const toggled = !c.isActive;
          if (appliedCoupon?.id === id && !toggled) {
            setAppliedCoupon(null);
          }
          return { ...c, isActive: toggled };
        }
        return c;
      })
    );
  };

  const resetCouponsToDefault = () => {
    setCoupons(DEFAULT_COUPONS);
    setAppliedCoupon(null);
  };

  return (
    <CouponContext.Provider
      value={{
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        calculateDiscount,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponActive,
        resetCouponsToDefault,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};
