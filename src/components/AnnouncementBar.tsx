import React from 'react';
import { useSettings } from '../context/SettingsContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useSettings();

  if (!settings.isAnnouncementVisible || !settings.announcementText) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 text-white py-2 px-4 text-center text-xs sm:text-sm font-medium tracking-wide shadow-sm relative z-50 overflow-hidden flex items-center justify-center">
      <div className="animate-pulse flex items-center gap-2">
        <span>{settings.announcementText}</span>
      </div>
    </div>
  );
};
