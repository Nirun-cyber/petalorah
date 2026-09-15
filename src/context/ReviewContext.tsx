import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_REVIEWS, type Review } from '../data/reviews';
import { getCloudItem, saveCloudItem, onCloudChange, CLOUD_KEYS } from '../lib/cloudStore';

interface ReviewContextType {
  reviews: Review[];
  addReview: (newReview: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'verifiedBuyer'>) => void;
  updateReview: (reviewId: string, updatedFields: Partial<Review>) => void;
  deleteReview: (reviewId: string) => void;
  resetReviewsToDefault: () => void;
  markHelpful: (reviewId: string) => void;
  averageRating: number;
  totalReviews: number;
  getProductReviews: (productId: string) => Review[];
  refreshReviewsFromCloud: () => Promise<void>;
}

const REVIEWS_STORAGE_KEY = 'petalorah_customer_reviews';

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    try {
      const cloudReviews = await getCloudItem<Review[]>(CLOUD_KEYS.REVIEWS, INITIAL_REVIEWS);
      if (cloudReviews && Array.isArray(cloudReviews) && cloudReviews.length > 0) {
        setReviews(cloudReviews);
      }
    } catch (e) {
      console.warn('Failed to refresh reviews from cloud:', e);
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
  };

  const updateReview = (reviewId: string, updatedFields: Partial<Review>) => {
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, ...updatedFields } : r));
    setReviews(updated);
    saveCloudItem(CLOUD_KEYS.REVIEWS, updated);
  };

  const deleteReview = (reviewId: string) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    setReviews(updated);
    saveCloudItem(CLOUD_KEYS.REVIEWS, updated);
  };

  const resetReviewsToDefault = () => {
    setReviews(INITIAL_REVIEWS);
    saveCloudItem(CLOUD_KEYS.REVIEWS, INITIAL_REVIEWS);
    try {
      localStorage.removeItem(REVIEWS_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const markHelpful = (reviewId: string) => {
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
    setReviews(updated);
    saveCloudItem(CLOUD_KEYS.REVIEWS, updated);
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
        addReview,
        updateReview,
        deleteReview,
        resetReviewsToDefault,
        markHelpful,
        averageRating,
        totalReviews,
        getProductReviews,
        refreshReviewsFromCloud,
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
