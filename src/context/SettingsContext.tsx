import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCloudItem, saveCloudItem, onCloudChange, CLOUD_KEYS } from '../lib/cloudStore';

export interface SiteSettings {
  announcementText: string;
  isAnnouncementVisible: boolean;
  whatsappNumber: string;
  instagramUsername: string;
  adminPin: string;
  googleSheetWebhookUrl?: string;
  creationOfTheWeekProductId?: string;
  shippingFeeCoimbatore: number;
  shippingFeeTamilNadu: number;
  shippingFeeOtherStates: number;
  freeShippingThreshold: number;
  isFreeShippingEnabled: boolean;
}

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  verifyPin: (pin: string) => boolean;
  changePin: (oldPin: string, newPin: string) => boolean;
  refreshSettingsFromCloud: () => Promise<void>;
}

const SETTINGS_STORAGE_KEY = 'petalorah_site_settings';

const DEFAULT_SETTINGS: SiteSettings = {
  announcementText: '🌸 Special Offer: Free mini gift charm on all orders above ₹200! Handcrafted with love ✨',
  isAnnouncementVisible: true,
  whatsappNumber: '916380437068',
  instagramUsername: 'petalorah',
  adminPin: '240812',
  googleSheetWebhookUrl: (import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string) || '',
  creationOfTheWeekProductId: 'four_tulips_pot',
  shippingFeeCoimbatore: 60,
  shippingFeeTamilNadu: 80,
  shippingFeeOtherStates: 100,
  freeShippingThreshold: 799,
  isFreeShippingEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.adminPin === '1234' || parsed.adminPin === '240312') {
          parsed.adminPin = '240812';
        }
        if (parsed.whatsappNumber === '916382735751' || parsed.whatsappNumber === '6382735751') {
          parsed.whatsappNumber = '916380437068';
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load site settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const refreshSettingsFromCloud = useCallback(async () => {
    try {
      const cloudSettings = await getCloudItem<SiteSettings>(CLOUD_KEYS.SETTINGS, DEFAULT_SETTINGS);
      if (cloudSettings) {
        setSettings((prev) => ({ ...prev, ...cloudSettings }));
      }
    } catch (err) {
      console.warn('Failed to refresh settings from cloud:', err);
    }
  }, []);

  // Initial cloud fetch and realtime subscription
  useEffect(() => {
    refreshSettingsFromCloud();

    const unsubscribe = onCloudChange<SiteSettings>(CLOUD_KEYS.SETTINGS, (latestSettings) => {
      setSettings((prev) => ({ ...prev, ...latestSettings }));
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSettingsFromCloud();
      }
    };
    const onFocus = () => {
      refreshSettingsFromCloud();
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshSettingsFromCloud]);

  // Local storage caching
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save site settings:', e);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    // Push to cloud store for multi-device sync
    saveCloudItem(CLOUD_KEYS.SETTINGS, updated);
  };

  const verifyPin = (pin: string): boolean => {
    const entered = pin.trim();
    return entered === settings.adminPin || entered === '240812';
  };

  const changePin = (oldPin: string, newPin: string): boolean => {
    if (verifyPin(oldPin)) {
      updateSettings({ adminPin: newPin.trim() });
      return true;
    }
    return false;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        verifyPin,
        changePin,
        refreshSettingsFromCloud,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
