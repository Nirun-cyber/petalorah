import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_REVIEWS, type Review } from '../data/reviews';

interface ReviewContextType {
  reviews: Review[];
  addReview: (newReview: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'verifiedBuyer'>) => void;
  markHelpful: (reviewId: string) => void;
  averageRating: number;
  totalReviews: number;
  getProductReviews: (productId: string) => Review[];
}

const REVIEWS_STORAGE_KEY = 'petalorah_customer_reviews';

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed: Review[] = JSON.parse(saved);
        // Merge with initial reviews to preserve presets
        const initialIds = new Set(INITIAL_REVIEWS.map((r) => r.id));
        const userAdded = parsed.filter((r) => !initialIds.has(r.id));
        return [...userAdded, ...INITIAL_REVIEWS];
      }
    } catch (e) {
      console.error('Failed to load reviews from localStorage:', e);
    }
    return INITIAL_REVIEWS;
  });

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
    setReviews((prev) => [newEntry, ...prev]);
  };

  const markHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
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
        markHelpful,
        averageRating,
        totalReviews,
        getProductReviews,
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
