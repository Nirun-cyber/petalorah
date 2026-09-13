import React, { useState } from 'react';
import {
  Star,
  PenLine,
} from 'lucide-react';
import { useReviews } from '../context/ReviewContext';
import { WriteReviewModal } from './WriteReviewModal';

export const CustomerReviews: React.FC = () => {
  const { reviews, averageRating, totalReviews } = useReviews();
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Take the most recent/featured reviews for a clean 3-4 card grid
  const displayReviews = reviews.slice(0, 4);

  return (
    <section className="w-full py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-6 mb-4 sm:mb-8">
        <div className="space-y-1">
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-primary dark:text-white tracking-tight">
            Loved By Craft Enthusiasts
          </h2>
          <p className="text-xs sm:text-sm text-primary/70 dark:text-gray-300 max-w-xl">
            Real feedback from customers who received our handmade pipe cleaner blooms and keepsakes.
          </p>
        </div>

        {/* Aggregate Rating & Write Review Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-white dark:bg-navy-light border border-primary/10 dark:border-white/10 shadow-sm">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="fill-amber-400" />
              ))}
            </div>
            <span className="font-bold text-xs sm:text-sm text-primary dark:text-white">
              {averageRating}
            </span>
            <span className="text-[11px] sm:text-xs text-primary/60 dark:text-gray-400">
              ({totalReviews})
            </span>
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-rose-500 text-white font-semibold text-xs shadow hover:bg-rose-600 transition-colors"
          >
            <PenLine size={12} /> Write a Review
          </button>
        </div>
      </div>

      {/* Reviews Content or Empty State */}
      {displayReviews.length === 0 ? (
        <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-navy-light/40 border border-primary/10 dark:border-white/10 text-center space-y-2 sm:space-y-3 max-w-md mx-auto">
          <p className="text-xs sm:text-sm font-medium text-primary/80 dark:text-gray-300">
            No reviews yet. Be the first to share your handmade craft experience! 🌸
          </p>
          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs shadow hover:bg-rose-600 transition-colors"
          >
            <PenLine size={12} /> Write the First Review
          </button>
        </div>
      ) : (
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none sm:overflow-visible -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="w-[240px] flex-shrink-0 sm:w-auto sm:flex-shrink p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-navy-light border border-rose-100/80 dark:border-white/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow snap-start"
            >
              <div>
                {/* Star Rating & Date */}
                <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400">{rev.date}</span>
                </div>

                {/* Review Text */}
                <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 leading-relaxed mb-2 sm:mb-3 italic line-clamp-3 sm:line-clamp-none">
                  "{rev.comment}"
                </p>

                {/* Optional Craft Photo */}
                {rev.photo && (
                  <div className="mb-2 sm:mb-3 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border border-primary/10 dark:border-white/10 bg-gray-50 dark:bg-navy flex-shrink-0">
                    <img
                      src={rev.photo}
                      alt={rev.productName || 'Handmade creation'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

              {/* Author & Item */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 dark:text-white block truncate text-[11px] sm:text-xs">
                    {rev.customerName}
                  </span>
                  {rev.city && (
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">{rev.city}</span>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] text-rose-500 font-medium truncate max-w-[110px] text-right">
                  {rev.productName}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
      />
    </section>
  );
};

export default CustomerReviews;
