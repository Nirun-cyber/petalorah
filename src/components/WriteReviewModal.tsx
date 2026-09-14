import React, { useState } from 'react';
import { X, Star, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useReviews } from '../context/ReviewContext';
import { useProducts } from '../context/ProductContext';
import type { Review } from '../data/reviews';
import { compressImageFile } from '../lib/imageCompressor';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  preselectedProductId,
}) => {
  const { addReview } = useReviews();
  const { products } = useProducts();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [productId, setProductId] = useState(preselectedProductId || products[0]?.id || 'rose');
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Please choose an image under 10MB.');
        return;
      }
      try {
        const compressed = await compressImageFile(file, 600, 0.7);
        setPhoto(compressed);
      } catch (err) {
        console.error('Failed to compress review photo:', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) {
      alert('Please enter your name and a short review message.');
      return;
    }

    const selectedProduct = products.find((p) => p.id === productId);
    const category: Review['category'] = selectedProduct?.category || 'keychain';

    addReview({
      customerName: customerName.trim(),
      city: city.trim() || 'India',
      rating,
      productName: selectedProduct?.name || 'Petalorah Handmade Craft',
      productId,
      category,
      comment: comment.trim(),
      photo: photo || selectedProduct?.img,
    });

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F43F5E', '#FB7185', '#E11D48', '#FDA4AF', '#FBCFE8'],
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      // Reset form
      setCustomerName('');
      setCity('');
      setComment('');
      setPhoto('');
      setRating(5);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        data-lenis-prevent
        className="relative w-full max-w-lg bg-white dark:bg-navy-light rounded-3xl p-4 sm:p-8 shadow-2xl border border-primary/10 dark:border-white/10 z-10 max-h-[92vh] overflow-y-auto overscroll-contain"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-primary dark:text-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {isSubmitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary dark:text-white">
              Thank You for the Love! 🌸
            </h3>
            <p className="text-sm text-primary/70 dark:text-gray-300">
              Your review has been published and will inspire fellow craft lovers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={13} /> Share Your Experience
              </div>
              <h2 className="font-serif text-2xl font-bold text-primary dark:text-white">
                Review Your Petalorah Craft
              </h2>
              <p className="text-xs text-primary/70 dark:text-gray-400">
                Help other flower and keepsake lovers discover the magic of our handmade pipe cleaners.
              </p>
            </div>

            {/* Star Rating Picker */}
            <div className="flex flex-col items-center justify-center pt-2">
              <span className="text-xs font-semibold text-primary/60 dark:text-gray-400 mb-1">
                Your Rating
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      size={28}
                      className={`${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                          : 'text-gray-300 dark:text-gray-600'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Craft Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-gray-300 mb-1">
                Which craft did you order?
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/15 dark:border-white/15 text-xs text-primary dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Name & City in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-gray-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sneha R."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/15 dark:border-white/15 text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-gray-300 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chennai, Tamil Nadu"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/15 dark:border-white/15 text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-gray-300 mb-1">
                Your Review *
              </label>
              <textarea
                required
                rows={3}
                placeholder="What did you love about the craft? (Texture, color, gift packaging, delivery speed...)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-navy border border-primary/15 dark:border-white/15 text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Photo Upload (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-gray-300 mb-1">
                Add Craft Photo (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/15 dark:border-white/15 text-xs font-semibold text-primary dark:text-gray-200 hover:bg-primary/10 transition-colors">
                  <Upload size={14} /> Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photo && (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-primary/20">
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-2xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.01]"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
