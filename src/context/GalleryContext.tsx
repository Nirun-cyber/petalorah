import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCloudItem, saveCloudItem, onCloudChange, CLOUD_KEYS } from '../lib/cloudStore';

export interface CreationItem {
  id: string;
  img: string;
  title: string;
  caption: string;
  tag: string;
}

export const INITIAL_CREATIONS: CreationItem[] = [
  {
    id: 'c1',
    img: '/assets/products/custom_jersey.png',
    title: 'Custom Jersey Charm',
    caption: 'Handcrafted personalized jersey charm with custom player number.',
    tag: 'Custom Order',
  },
  {
    id: 'c2',
    img: '/assets/products/four_tulips_pot.png',
    title: 'Four Tulips Desk Garden',
    caption: 'Pastel handmade tulips in miniature pot, brightens up any workspace.',
    tag: 'Desk Keepsake',
  },
  {
    id: 'c3',
    img: '/assets/products/custom_letter.jpg',
    title: 'Personalized Initial Charm',
    caption: 'Custom letter charm crafted with soft lavender pipe cleaners.',
    tag: 'Gift Order',
  },
  {
    id: 'c4',
    img: '/assets/products/duck.png',
    title: 'Yellow Duck with Blue Bow',
    caption: 'Cute squishy little duck charm finished with handmade satin bow.',
    tag: 'Handmade Charm',
  },
  {
    id: 'c5',
    img: '/assets/products/flower_bouquets.jpg',
    title: 'Everlasting Pipe Cleaner Bouquet',
    caption: 'Hand-twisted floral arrangement designed to stay vibrant forever.',
    tag: 'Custom Bouquet',
  },
  {
    id: 'c6',
    img: '/assets/products/blue_rose.jpg',
    title: 'Royal Blue Rose Charm',
    caption: 'Intricately coiled petals with matching green leaf accents.',
    tag: 'Handmade Floral',
  },
];

const GALLERY_STORAGE_KEY = 'petalorah_gallery_items';

interface GalleryContextType {
  galleryItems: CreationItem[];
  addGalleryItem: (item: Omit<CreationItem, 'id'>) => void;
  updateGalleryItem: (id: string, updated: Partial<CreationItem>) => void;
  deleteGalleryItem: (id: string) => void;
  resetGalleryToDefault: () => void;
  refreshGalleryFromCloud: () => Promise<void>;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [galleryItems, setGalleryItems] = useState<CreationItem[]>(() => {
    try {
      const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load gallery from localStorage:', e);
    }
    return INITIAL_CREATIONS;
  });

  const refreshGalleryFromCloud = useCallback(async () => {
    try {
      const cloudGallery = await getCloudItem<CreationItem[]>(CLOUD_KEYS.GALLERY, INITIAL_CREATIONS);
      if (cloudGallery && Array.isArray(cloudGallery) && cloudGallery.length > 0) {
        setGalleryItems(cloudGallery);
      }
    } catch (e) {
      console.warn('Failed to refresh gallery from cloud:', e);
    }
  }, []);

  // Initial cloud fetch and realtime sync
  useEffect(() => {
    refreshGalleryFromCloud();

    const unsubscribe = onCloudChange<CreationItem[]>(CLOUD_KEYS.GALLERY, (latest) => {
      if (Array.isArray(latest)) {
        setGalleryItems(latest);
      }
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshGalleryFromCloud();
      }
    };
    const onFocus = () => {
      refreshGalleryFromCloud();
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshGalleryFromCloud]);

  useEffect(() => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(galleryItems));
    } catch (e) {
      console.error('Failed to save gallery to localStorage:', e);
    }
  }, [galleryItems]);

  const addGalleryItem = (item: Omit<CreationItem, 'id'>) => {
    const newItem: CreationItem = {
      ...item,
      id: `c-${Date.now()}`,
    };
    const updated = [newItem, ...galleryItems];
    setGalleryItems(updated);
    saveCloudItem(CLOUD_KEYS.GALLERY, updated);
  };

  const updateGalleryItem = (id: string, updatedFields: Partial<CreationItem>) => {
    const updated = galleryItems.map((item) => (item.id === id ? { ...item, ...updatedFields } : item));
    setGalleryItems(updated);
    saveCloudItem(CLOUD_KEYS.GALLERY, updated);
  };

  const deleteGalleryItem = (id: string) => {
    const updated = galleryItems.filter((item) => item.id !== id);
    setGalleryItems(updated);
    saveCloudItem(CLOUD_KEYS.GALLERY, updated);
  };

  const resetGalleryToDefault = () => {
    setGalleryItems(INITIAL_CREATIONS);
    saveCloudItem(CLOUD_KEYS.GALLERY, INITIAL_CREATIONS);
    try {
      localStorage.removeItem(GALLERY_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <GalleryContext.Provider
      value={{
        galleryItems,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        resetGalleryToDefault,
        refreshGalleryFromCloud,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};
