import React, { createContext, useContext, useState, useEffect } from 'react';

interface SiteSettings {
  announcementText: string;
  isAnnouncementVisible: boolean;
  whatsappNumber: string;
  instagramUsername: string;
  adminPin: string;
  googleSheetWebhookUrl?: string;
}

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  verifyPin: (pin: string) => boolean;
  changePin: (oldPin: string, newPin: string) => boolean;
}

const SETTINGS_STORAGE_KEY = 'petalorah_site_settings';

const DEFAULT_SETTINGS: SiteSettings = {
  announcementText: '🌸 Special Offer: Free mini gift charm on all orders above ₹200! Handcrafted with love ✨',
  isAnnouncementVisible: true,
  whatsappNumber: '916382735751',
  instagramUsername: 'petalorah',
  adminPin: '240812',
  googleSheetWebhookUrl: (import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string) || '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Force update legacy PINs to 240812
        if (parsed.adminPin === '1234' || parsed.adminPin === '240312') {
          parsed.adminPin = '240812';
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load site settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save site settings:', e);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
