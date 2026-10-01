import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_REVIEWS, type Review } from '../data/reviews';
import { getCloudItem, saveCloudItem, onCloudChange, CLOUD_KEYS } from '../lib/cloudStore';
import {
  fetchReviewsFromGoogleSheet,
  syncAllReviewsToGoogleSheet,
  syncSingleReviewToGoogleSheet,
} from '../lib/googleDriveStorage';

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

interface ReviewContextType {
  reviews: Review[];
  isCloudSynced: boolean;
  addReview: (newReview: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'verifiedBuyer'>) => void;
  updateReview: (reviewId: string, updatedFields: Partial<Review>) => void;
  deleteReview: (reviewId: string) => void;
  resetReviewsToDefault: () => void;
  markHelpful: (reviewId: string) => void;
  averageRating: number;
  totalReviews: number;
  getProductReviews: (productId: string) => Review[];
  refreshReviewsFromCloud: () => Promise<void>;
  syncReviewsToSheet: () => Promise<{ success: boolean; count?: number; error?: string }>;
  pullReviewsFromSheet: () => Promise<{ success: boolean; count?: number; error?: string }>;
}

const REVIEWS_STORAGE_KEY = 'petalorah_customer_reviews';

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed: Review[] = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load reviews from localStorage:', e);
    }
    return INITIAL_REVIEWS;
  });

  const refreshReviewsFromCloud = useCallback(async () => {
    // 1. Primary: Google Sheets Free Database
    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      try {
        const res = await fetchReviewsFromGoogleSheet(sheetUrl);
        if (res.reviews && res.reviews.length > 0) {
          setReviews(res.reviews);
          setIsCloudSynced(true);
          return;
        } else if (res.reviews && res.reviews.length === 0) {
          // Google Sheet is empty! Automatically seed it with INITIAL_REVIEWS
          syncAllReviewsToGoogleSheet(INITIAL_REVIEWS, sheetUrl).catch((err) =>
            console.warn('Auto-seed reviews to Google Sheets warning:', err)
          );
          setIsCloudSynced(true);
        }
      } catch (sheetErr) {
        console.warn('Google Sheets reviews fetch warning:', sheetErr);
      }
    }

    // 2. Fallback: Supabase Cloud Database (if configured)
    try {
      const cloudReviews = await getCloudItem<Review[]>(CLOUD_KEYS.REVIEWS, INITIAL_REVIEWS);
      if (cloudReviews && Array.isArray(cloudReviews) && cloudReviews.length > 0) {
        setReviews(cloudReviews);
        setIsCloudSynced(true);
      }
    } catch (e) {
      console.warn('Failed to refresh reviews from cloud fallback:', e);
    }
  }, []);

  // Initial cloud fetch and realtime sync
  useEffect(() => {
    refreshReviewsFromCloud();

    const unsubscribe = onCloudChange<Review[]>(CLOUD_KEYS.REVIEWS, (latestReviews) => {
      if (Array.isArray(latestReviews)) {
        setReviews(latestReviews);
      }
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshReviewsFromCloud();
      }
    };
    const onFocus = () => {
      refreshReviewsFromCloud();
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshReviewsFromCloud]);

  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to save reviews to localStorage:', e);
    }
  }, [reviews]);

  const addReview = (newReviewData: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'verifiedBuyer'>) => {
    const newEntry: Review = {
      ...newReviewData,
      id: `rev-${Date.now()}`,
      date: 'Just now',
      verifiedBuyer: true,
      helpfulCount: 1,
    };
    const updated = [newEntry, ...reviews];
    setReviews(updated);
    saveCloudItem(CLOUD_KEYS.REVIEWS, updated);

    // Live Sync to Google Sheets
    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncSingleReviewToGoogleSheet(newEntry, sheetUrl).catch((err) =>
        console.warn('Google Sheets single review sync warning:', err)
      );
    }
  };

  const updateReview = (reviewId: string, updatedFields: Partial<Review>) => {
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, ...updatedFields } : r));
    setReviews(updated);
    saveCloudItem(CLOUD_KEYS.REVIEWS, updated);

    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncAllReviewsToGoogleSheet(updated, sheetUrl).catch((err) =>
        console.warn('Google Sheets review update warning:', err)
      );
    }
  };

  const deleteReview = (reviewId: string) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    setReviews(updated);
    saveCloudItem(CLOUD_KEYS.REVIEWS, updated);

    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncAllReviewsToGoogleSheet(updated, sheetUrl).catch((err) =>
        console.warn('Google Sheets review deletion sync warning:', err)
      );
    }
  };

  const resetReviewsToDefault = () => {
    setReviews(INITIAL_REVIEWS);
    saveCloudItem(CLOUD_KEYS.REVIEWS, INITIAL_REVIEWS);
    try {
      localStorage.removeItem(REVIEWS_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }

    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncAllReviewsToGoogleSheet(INITIAL_REVIEWS, sheetUrl).catch((err) =>
        console.warn('Google Sheets reviews reset warning:', err)
      );
    }
  };

  const markHelpful = (reviewId: string) => {
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
    setReviews(updated);
    saveCloudItem(CLOUD_KEYS.REVIEWS, updated);

    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncAllReviewsToGoogleSheet(updated, sheetUrl).catch((err) =>
        console.warn('Google Sheets review helpful count warning:', err)
      );
    }
  };

  const syncReviewsToSheet = async (): Promise<{ success: boolean; count?: number; error?: string }> => {
    const sheetUrl = getGoogleSheetUrl();
    if (!sheetUrl || !sheetUrl.includes('script.google.com')) {
      return { success: false, error: 'Google Sheets Webhook URL is not configured in Settings.' };
    }
    const res = await syncAllReviewsToGoogleSheet(reviews, sheetUrl);
    if (res.success) {
      setIsCloudSynced(true);
      return { success: true, count: res.count };
    }
    return { success: false, error: res.error };
  };

  const pullReviewsFromSheet = async (): Promise<{ success: boolean; count?: number; error?: string }> => {
    const sheetUrl = getGoogleSheetUrl();
    if (!sheetUrl || !sheetUrl.includes('script.google.com')) {
      return { success: false, error: 'Google Sheets Webhook URL is not configured in Settings.' };
    }
    const res = await fetchReviewsFromGoogleSheet(sheetUrl);
    if (res.reviews && res.reviews.length > 0) {
      setReviews(res.reviews);
      setIsCloudSynced(true);
      return { success: true, count: res.reviews.length };
    }
    if (res.reviews && res.reviews.length === 0) {
      return { success: true, count: 0 };
    }
    return { success: false, error: res.error || 'Failed to fetch reviews.' };
  };

  const averageRating = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
    : 5.0;

  const totalReviews = reviews.length;

  const getProductReviews = (productId: string) => {
    return reviews.filter((r) => r.productId === productId);
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        isCloudSynced,
        addReview,
        updateReview,
        deleteReview,
        resetReviewsToDefault,
        markHelpful,
        averageRating,
        totalReviews,
        getProductReviews,
        refreshReviewsFromCloud,
        syncReviewsToSheet,
        pullReviewsFromSheet,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};

