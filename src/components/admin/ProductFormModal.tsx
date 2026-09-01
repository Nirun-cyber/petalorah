import React, { useState } from 'react';
import { X, Upload, Sparkles, CheckCircle, Trash2, Wand2 } from 'lucide-react';
import type { Product } from '../../data/products';

interface ProductFormModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id'>) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(product?.name || '');
  const [numericPrice, setNumericPrice] = useState<number>(product?.numericPrice || 50);
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || '');
  const [category, setCategory] = useState<Product['category']>(product?.category || 'keychain');
  const [description, setDescription] = useState(product?.description || '');
  const [img, setImg] = useState(product?.img || '');
  const [badge, setBadge] = useState(product?.badge || 'New Arrival');
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller || false);
  const [isComingSoon, setIsComingSoon] = useState(product?.isComingSoon || false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Handle local image file upload -> convert to Base64 data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size is too large. Please select an image under 5MB.');
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImg(reader.result as string);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Failed to read image file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Smart AI Craft Description Generator
  const handleGenerateAiDescription = () => {
    setIsGeneratingAi(true);

    setTimeout(() => {
      const title = name.trim() || 'Handcrafted Gift Item';
      const titleLower = title.toLowerCase();

      let generatedDesc = '';
      let suggestedBadge = badge;

      if (titleLower.includes('panda')) {
        generatedDesc = `An adorable handmade panda keychain meticulously crafted with soft monochrome pipe cleaners and fluffy detailing. Carefully twisted with patience to create a cozy, cuddly companion that brings happy smiles to your bag or keys.`;
        suggestedBadge = 'Kawaii Special';
      } else if (titleLower.includes('tulip')) {
        generatedDesc = `An elegant handcrafted tulip creation carrying the gentle warmth of spring. Carefully twisted loops ensure a soft, fluffy texture with rich green leaves that stay fresh and vibrant forever.`;
        suggestedBadge = 'Cute Accent';
      } else if (titleLower.includes('rose')) {
        generatedDesc = `A timeless symbol of love, meticulously handcrafted with rich crimson pipe cleaner petals and a deep green stem. Perfect as a romantic keepsake, luxury bag charm, or thoughtful handmade gift.`;
        suggestedBadge = 'Best Seller';
      } else if (titleLower.includes('duck')) {
        generatedDesc = `An adorable round duck charm handcrafted from bright yellow pipe cleaners with a tiny blue head bow accent. Guaranteed to bring happy vibes and sweet smiles wherever you carry it.`;
        suggestedBadge = 'Super Cute';
      } else if (titleLower.includes('pot') || category === 'tabletop') {
        generatedDesc = `A charming handcrafted miniature flower pot desk companion. Twisted with vibrant petals, green leaves, and nestled in a cozy ribbed pot to bring a touch of warm floral aesthetic to your workspace or home decor.`;
        suggestedBadge = 'Table Decor';
      } else if (category === 'bouquet') {
        generatedDesc = `A stunning custom pipe cleaner flower bouquet handcrafted with intricate wire twisting and rich color harmony. Designed to stay fresh, vibrant, and blooming forever as an eternal romantic keepsake.`;
        suggestedBadge = 'Custom Bouquet';
      } else {
        generatedDesc = `An exquisite handmade ${title} crafted with premium soft pipe cleaners and precision wire twisting. Meticulously handcrafted by Petalorah studio to bring sweet charm, eternal durability, and smiles to your daily accessories.`;
        suggestedBadge = 'Handcrafted';
      }

      setDescription(generatedDesc);
      setBadge(suggestedBadge);
      setIsGeneratingAi(false);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      price: `₹${numericPrice}`,
      numericPrice,
      originalPrice: originalPrice.trim() ? originalPrice.trim() : undefined,
      category,
      description: description.trim(),
      img: img.trim() || '/assets/products/rose.jpg',
      badge: badge.trim(),
      isBestSeller,
      isComingSoon,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-rose-100 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-900 border-b border-rose-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-white">
              {product ? 'Edit Product' : 'Add New Craft Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-rose-100/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          data-lenis-prevent
          className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-5 flex-grow text-slate-700 dark:text-slate-200 text-sm min-h-0"
        >
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cute Panda Keychain"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Product['category'])}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-800 dark:text-white"
              >
                <option value="keychain">Keychain</option>
                <option value="tabletop">Tabletop Decor</option>
                <option value="bouquet">Bouquet</option>
                <option value="custom">Custom Craft</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={numericPrice}
                onChange={(e) => setNumericPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Original Price (Optional, e.g. ₹99)
              </label>
              <input
                type="text"
                placeholder="e.g. ₹99"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Upload Product Image Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Product Image *
            </label>

            {img ? (
              <div className="relative rounded-2xl border-2 border-rose-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800 flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0 shadow-sm">
                  <img src={img} alt="Product Preview" className="w-full h-full object-cover" />
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs mb-1">
                    <CheckCircle size={14} /> Image Selected
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-xs">
                    {img.startsWith('data:') ? 'Uploaded image file (Base64)' : img}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setImg('')}
                  className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  title="Remove image"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-rose-300 dark:border-slate-700 hover:border-rose-500 rounded-2xl p-6 text-center bg-rose-50/40 dark:bg-slate-800/50 transition-all group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Click or drag image file here to upload
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Supports PNG, JPG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Direct URL input */}
            <div className="pt-1">
              <details className="text-xs text-slate-400 cursor-pointer">
                <summary className="font-semibold hover:text-rose-500 transition-colors">
                  Or paste an image URL directly
                </summary>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="/assets/products/custom.jpg or https://..."
                    value={img}
                    onChange={(e) => setImg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </details>
            </div>
          </div>

          {/* Description & AI Generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Description *
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingAi}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 hover:from-purple-700 hover:to-rose-600 shadow-sm hover:shadow transition-all transform active:scale-95 disabled:opacity-50"
              >
                <Wand2 size={13} className={isGeneratingAi ? 'animate-spin' : ''} />
                <span>{isGeneratingAi ? 'Generating AI...' : '✨ Auto-Generate AI Description'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              required
              placeholder="Enter product description or click ✨ Auto-Generate AI Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium text-slate-800 dark:text-white"
            />
          </div>

          {/* Badge & Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Badge Label
              </label>
              <input
                type="text"
                placeholder="e.g. Best Seller, New"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isBestSeller"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 text-rose-500 rounded focus:ring-rose-400 cursor-pointer"
              />
              <label htmlFor="isBestSeller" className="text-xs font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                Mark Best Seller 🔥
              </label>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isComingSoon"
                checked={isComingSoon}
                onChange={(e) => setIsComingSoon(e.target.checked)}
                className="w-4 h-4 text-rose-500 rounded focus:ring-rose-400 cursor-pointer"
              />
              <label htmlFor="isComingSoon" className="text-xs font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                Coming Soon ⏳
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{product ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
