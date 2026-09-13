import React, { useState, useEffect } from 'react';
import {
  Lock,
  Heart,
  Package,
  ShoppingCart,
  Megaphone,
  Settings,
  Plus,
  Trash2,
  Edit,
  Star,
  RefreshCw,
  Eye,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Search,
  Key,
  ArrowRight,
  AlertCircle,
  Clock,
  Truck,
  FileSpreadsheet,
  Copy,
  Check,
  X,
  Sparkles,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { InstagramIcon } from '../components/InstagramIcon';
import { useProducts } from '../context/ProductContext';
import { useOrders, type LoggedOrder } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';
import { useReviews } from '../context/ReviewContext';
import { useGallery, type CreationItem } from '../context/GalleryContext';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import type { Product } from '../data/products';
import type { Review } from '../data/reviews';
import {
  syncOrderToGoogleSheets,
  syncBatchOrdersToGoogleSheets,
  testGoogleSheetsConnection,
  GOOGLE_APPS_SCRIPT_CODE,
} from '../lib/googleSheets';

interface AdminProps {
  onNavigateHome: () => void;
}

export const Admin: React.FC<AdminProps> = ({ onNavigateHome }) => {
  const { products, addProduct, updateProduct, deleteProduct, toggleBestSeller, toggleComingSoon, resetToDefaultProducts } = useProducts();
  const { orders, updateOrderStatus, updateOrderTracking, deleteOrder, clearAllOrders, pullOrdersFromGoogleSheet } = useOrders();
  const { settings, updateSettings, verifyPin, changePin } = useSettings();

  // Authentication State (Strictly Transient In-Memory - Auto-locks on reload or navigating out)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Auto-lock when leaving Admin page or unmounting
  React.useEffect(() => {
    // Ensure any old session cache is cleared
    sessionStorage.removeItem('petalorah_admin_authed');

    return () => {
      setIsAuthenticated(false);
      sessionStorage.removeItem('petalorah_admin_authed');
    };
  }, []);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'reviews' | 'gallery' | 'banner' | 'settings'
  >('overview');

  // Reviews Context & State
  const {
    reviews,
    addReview,
    updateReview,
    deleteReview,
    resetReviewsToDefault,
    averageRating,
  } = useReviews();

  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewFormName, setReviewFormName] = useState('');
  const [reviewFormCity, setReviewFormCity] = useState('');
  const [reviewFormRating, setReviewFormRating] = useState(5);
  const [reviewFormProductId, setReviewFormProductId] = useState('');
  const [reviewFormComment, setReviewFormComment] = useState('');
  const [reviewFormPhoto, setReviewFormPhoto] = useState('');
  const [reviewFormVerified, setReviewFormVerified] = useState(true);
  const [reviewStatusMsg, setReviewStatusMsg] = useState<string | null>(null);

  // Gallery Context & State
  const {
    galleryItems,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    resetGalleryToDefault,
  } = useGallery();

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<CreationItem | null>(null);
  const [galleryFormTitle, setGalleryFormTitle] = useState('');
  const [galleryFormCaption, setGalleryFormCaption] = useState('');
  const [galleryFormTag, setGalleryFormTag] = useState('Custom Order');
  const [galleryFormImg, setGalleryFormImg] = useState('');
  const [galleryStatusMsg, setGalleryStatusMsg] = useState<string | null>(null);

  // Open Review Add/Edit Modals
  const handleOpenAddReview = () => {
    setEditingReview(null);
    setReviewFormName('');
    setReviewFormCity('');
    setReviewFormRating(5);
    setReviewFormProductId(products[0]?.id || '');
    setReviewFormComment('');
    setReviewFormPhoto('');
    setReviewFormVerified(true);
    setIsReviewModalOpen(true);
  };

  const handleOpenEditReview = (rev: Review) => {
    setEditingReview(rev);
    setReviewFormName(rev.customerName);
    setReviewFormCity(rev.city);
    setReviewFormRating(rev.rating);
    setReviewFormProductId(rev.productId || '');
    setReviewFormComment(rev.comment);
    setReviewFormPhoto(rev.photo || '');
    setReviewFormVerified(rev.verifiedBuyer);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewFormName.trim() || !reviewFormComment.trim()) {
      alert('Please fill in customer name and review comment.');
      return;
    }

    const matchedProduct = products.find((p) => p.id === reviewFormProductId);
    const prodName = matchedProduct?.name || 'Petalorah Handmade Craft';
    const prodCategory = (matchedProduct?.category || 'keychain') as Review['category'];

    if (editingReview) {
      updateReview(editingReview.id, {
        customerName: reviewFormName.trim(),
        city: reviewFormCity.trim() || 'India',
        rating: reviewFormRating,
        productId: reviewFormProductId,
        productName: prodName,
        category: prodCategory,
        comment: reviewFormComment.trim(),
        photo: reviewFormPhoto.trim() || undefined,
        verifiedBuyer: reviewFormVerified,
      });
      setReviewStatusMsg(`✅ Updated review from "${reviewFormName.trim()}"`);
    } else {
      addReview({
        customerName: reviewFormName.trim(),
        city: reviewFormCity.trim() || 'India',
        rating: reviewFormRating,
        productId: reviewFormProductId,
        productName: prodName,
        category: prodCategory,
        comment: reviewFormComment.trim(),
        photo: reviewFormPhoto.trim() || undefined,
      });
      setReviewStatusMsg(`✨ Added new review from "${reviewFormName.trim()}"`);
    }

    setIsReviewModalOpen(false);
    setTimeout(() => setReviewStatusMsg(null), 3500);
  };

  const handleDeleteReview = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the review by "${name}"?`)) {
      deleteReview(id);
      setReviewStatusMsg(`🗑️ Deleted review by "${name}"`);
      setTimeout(() => setReviewStatusMsg(null), 3000);
    }
  };

  // Open Gallery Add/Edit Modals
  const handleOpenAddGallery = () => {
    setEditingGalleryItem(null);
    setGalleryFormTitle('');
    setGalleryFormCaption('');
    setGalleryFormTag('Custom Order');
    setGalleryFormImg('');
    setIsGalleryModalOpen(true);
  };

  const handleOpenEditGallery = (item: CreationItem) => {
    setEditingGalleryItem(item);
    setGalleryFormTitle(item.title);
    setGalleryFormCaption(item.caption);
    setGalleryFormTag(item.tag);
    setGalleryFormImg(item.img);
    setIsGalleryModalOpen(true);
  };

  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFormTitle.trim() || !galleryFormImg.trim()) {
      alert('Please provide a creation title and image path/URL.');
      return;
    }

    if (editingGalleryItem) {
      updateGalleryItem(editingGalleryItem.id, {
        title: galleryFormTitle.trim(),
        caption: galleryFormCaption.trim(),
        tag: galleryFormTag.trim() || 'Custom Order',
        img: galleryFormImg.trim(),
      });
      setGalleryStatusMsg(`✅ Updated showcase item "${galleryFormTitle.trim()}"`);
    } else {
      addGalleryItem({
        title: galleryFormTitle.trim(),
        caption: galleryFormCaption.trim(),
        tag: galleryFormTag.trim() || 'Custom Order',
        img: galleryFormImg.trim(),
      });
      setGalleryStatusMsg(`✨ Added new showcase item "${galleryFormTitle.trim()}"`);
    }

    setIsGalleryModalOpen(false);
    setTimeout(() => setGalleryStatusMsg(null), 3500);
  };

  const handleDeleteGalleryItem = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}" from the About gallery?`)) {
      deleteGalleryItem(id);
      setGalleryStatusMsg(`🗑️ Deleted "${title}" from gallery`);
      setTimeout(() => setGalleryStatusMsg(null), 3000);
    }
  };

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Order Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Settings Forms
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string | null>(null);
  const [pinErrorMsg, setPinErrorMsg] = useState<string | null>(null);

  const [announcementInput, setAnnouncementInput] = useState(settings.announcementText);
  const [whatsappInput, setWhatsappInput] = useState(settings.whatsappNumber);
  const [instagramInput, setInstagramInput] = useState(settings.instagramUsername);
  const [googleSheetInput, setGoogleSheetInput] = useState(settings.googleSheetWebhookUrl || '');
  const [creationOfTheWeekInput, setCreationOfTheWeekInput] = useState(
    settings.creationOfTheWeekProductId || 'four_tulips_pot'
  );
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (settings.creationOfTheWeekProductId) {
      setCreationOfTheWeekInput(settings.creationOfTheWeekProductId);
    }
  }, [settings.creationOfTheWeekProductId]);

  const handleSetCreationOfTheWeek = (productId: string) => {
    updateSettings({ creationOfTheWeekProductId: productId });
    setCreationOfTheWeekInput(productId);
    const prod = products.find((p) => p.id === productId);
    setSettingsSuccessMsg(`✨ "${prod?.name || 'Craft'}" is now featured as Creation of the Week on the homepage!`);
    setTimeout(() => setSettingsSuccessMsg(null), 3500);
  };

  // Google Sheets Integration State
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [sheetTestStatus, setSheetTestStatus] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [syncedOrderIds, setSyncedOrderIds] = useState<Record<string, boolean>>({});

  // Auth Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPin(pinInput)) {
      setIsAuthenticated(true);
      setAuthError(false);
      setPinInput('');
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Product Actions
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Settings Actions
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      announcementText: announcementInput,
      whatsappNumber: whatsappInput,
      instagramUsername: instagramInput,
      googleSheetWebhookUrl: googleSheetInput.trim(),
      creationOfTheWeekProductId: creationOfTheWeekInput,
    });
    setSettingsSuccessMsg('Store & Showcase settings saved successfully!');
    setTimeout(() => setSettingsSuccessMsg(null), 3000);
  };

  const handleTestGoogleSheet = async () => {
    const url = googleSheetInput.trim() || settings.googleSheetWebhookUrl;
    if (!url) {
      alert('Please enter your Google Sheet link or Apps Script Webhook URL first.');
      return;
    }
    setIsTestingSheet(true);
    setSheetTestStatus(null);
    const res = await testGoogleSheetsConnection(url);
    setIsTestingSheet(false);
    if (res.success) {
      setSheetTestStatus(`✅ ${res.message}`);
    } else {
      setSheetTestStatus(`❌ ${res.message}`);
    }
    setTimeout(() => setSheetTestStatus(null), 6000);
  };

  const handlePullOrdersFromSheet = async () => {
    const url = googleSheetInput.trim() || settings.googleSheetWebhookUrl;
    if (!url) {
      alert('Please enter and save your Google Sheet link or Apps Script URL first.');
      return;
    }
    setIsSyncingAll(true);
    setSyncStatusMsg(null);
    const res = await pullOrdersFromGoogleSheet();
    setIsSyncingAll(false);
    if (res.error) {
      setSyncStatusMsg(`❌ ${res.error}`);
    } else {
      setSyncStatusMsg(`✅ Imported ${res.count} new orders from Google Sheet! Total store orders: ${orders.length + res.count}`);
    }
    setTimeout(() => setSyncStatusMsg(null), 5000);
  };

  const handleSyncAllOrders = async () => {
    const url = googleSheetInput.trim() || settings.googleSheetWebhookUrl;
    if (!url) {
      alert('Please enter and save your Google Sheet Webhook URL first.');
      return;
    }
    if (orders.length === 0) {
      alert('No orders to sync yet.');
      return;
    }
    setIsSyncingAll(true);
    setSyncStatusMsg(null);
    const res = await syncBatchOrdersToGoogleSheets(orders, url);
    setIsSyncingAll(false);
    setSyncStatusMsg(`✅ Dispatched ${res.success} of ${res.total} orders to Google Sheets!`);
    setTimeout(() => setSyncStatusMsg(null), 4500);
  };

  const handleSyncSingleOrder = async (order: LoggedOrder) => {
    const url = googleSheetInput.trim() || settings.googleSheetWebhookUrl;
    if (!url) {
      alert('Please configure your Google Sheet Webhook URL in Settings first.');
      return;
    }
    const ok = await syncOrderToGoogleSheets(order, url);
    if (ok) {
      setSyncedOrderIds((prev) => ({ ...prev, [order.id]: true }));
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id);
    }
  };

  const handleResetProducts = () => {
    if (window.confirm('Reset all products to initial default Petalorah list? Any custom products added will be removed.')) {
      resetToDefaultProducts();
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinSuccessMsg(null);
    setPinErrorMsg(null);

    if (newPin.length < 4) {
      setPinErrorMsg('New Passcode must be at least 4 digits/characters.');
      return;
    }

    const success = changePin(oldPin, newPin);
    if (success) {
      setPinSuccessMsg('Admin Passcode changed successfully!');
      setOldPin('');
      setNewPin('');
      setTimeout(() => setPinSuccessMsg(null), 3000);
    } else {
      setPinErrorMsg('Current Passcode is incorrect.');
    }
  };

  // Computed Stats
  const totalProducts = products.length;
  const bestSellersCount = products.filter((p) => p.isBestSeller).length;
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(productSearch.toLowerCase()) || prod.description.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = selectedCategory === 'all' || prod.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter((ord) => {
    return orderStatusFilter === 'all' || ord.status === orderStatusFilter;
  });

  // --- PASSCODE / AUTH SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-rose-50/50 via-white to-pink-50/30 dark:from-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-rose-100 dark:border-slate-800 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-200 dark:shadow-none">
            <Heart className="w-8 h-8 fill-white/20" />
          </div>

          <h1 className="text-2xl font-bold font-serif text-slate-800 dark:text-white mb-2">
            Petalorah Admin Access
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Enter your admin PIN passcode to unlock the store control center.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter Passcode"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setAuthError(false);
                }}
                className={`w-full text-center tracking-widest text-lg font-bold px-4 py-3 rounded-2xl border ${
                  authError
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                } focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 dark:text-white transition-all`}
              />
              <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            </div>

            {authError && (
              <p className="text-xs font-bold text-rose-500 flex items-center justify-center gap-1">
                <AlertCircle size={14} /> Incorrect passcode! Please try again.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Unlock Control Center</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
            <button onClick={onNavigateHome} className="hover:text-rose-500 transition-colors font-medium">
              ← Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGGED IN ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-24 text-slate-800 dark:text-slate-100">
      {/* Top Admin Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-rose-100 dark:border-slate-800 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-slate-800 dark:text-white flex flex-wrap items-center gap-2">
                Petalorah Control Center
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-sans font-extrabold bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  Admin
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Manage products, track order logs, edit announcement banners & store configuration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Eye size={15} />
              <span className="hidden sm:inline">View Website</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <Lock size={15} />
              <span>Lock Console</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Stats', icon: TrendingUp },
            { id: 'products', label: `Products (${totalProducts})`, icon: Package },
            { id: 'orders', label: `Order Logs (${totalOrdersCount})`, icon: ShoppingCart },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
            { id: 'gallery', label: `Gallery (${galleryItems.length})`, icon: Camera },
            { id: 'banner', label: 'Announcement Bar', icon: Megaphone },
            { id: 'settings', label: 'Store Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Total Products</p>
                  <h3 className="text-3xl font-extrabold font-serif text-slate-800 dark:text-white mt-1">
                    {totalProducts}
                  </h3>
                  <p className="text-xs text-rose-500 font-semibold mt-1">{bestSellersCount} Bestsellers</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-500 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Total Order Logs</p>
                  <h3 className="text-3xl font-extrabold font-serif text-slate-800 dark:text-white mt-1">
                    {totalOrdersCount}
                  </h3>
                  <p className="text-xs text-emerald-500 font-semibold mt-1">Dispatched to Socials</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Est. Order Value</p>
                  <h3 className="text-3xl font-extrabold font-serif text-slate-800 dark:text-white mt-1">
                    ₹{totalRevenue}
                  </h3>
                  <p className="text-xs text-blue-500 font-semibold mt-1">From recorded orders</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Creation of the Week</p>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mt-1 truncate max-w-[150px]">
                    {products.find(p => p.id === (settings.creationOfTheWeekProductId || 'four_tulips_pot'))?.name || 'Featured Craft'}
                  </h3>
                  <p className="text-xs text-rose-500 font-semibold mt-1">Homepage Hero Card</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Action Box */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-white">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleOpenAddModal}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-5 h-5" /> Add New Craft Product
                    </span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Manage Customer Reviews
                    </span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => setActiveTab('gallery')}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-pink-500" /> Manage Showcase Gallery
                    </span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => setActiveTab('banner')}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-rose-500" /> Update Top Announcement
                    </span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-emerald-500" /> View Order Logs
                    </span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Bestseller Highlights */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Bestseller Highlights ({bestSellersCount})
                  </h3>
                  <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-rose-500 hover:underline">
                    Manage All Products →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products
                    .filter((p) => p.isBestSeller)
                    .slice(0, 4)
                    .map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                          <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="text-xs font-bold truncate text-slate-800 dark:text-white">{prod.name}</h4>
                          <p className="text-xs font-semibold text-rose-500">{prod.price}</p>
                        </div>
                        <button
                          onClick={() => toggleBestSeller(prod.id)}
                          className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Remove Bestseller"
                        >
                          <Star className="w-4 h-4 fill-amber-500" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB (CRUD) --- */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 flex-grow max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products by name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="all">All Categories</option>
                  <option value="keychain">Keychains</option>
                  <option value="tabletop">Tabletop Decor</option>
                  <option value="bouquet">Bouquets</option>
                  <option value="custom">Custom Crafts</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetProducts}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
                  title="Reset to default products"
                >
                  <RefreshCw size={14} />
                  <span className="hidden md:inline">Reset Defaults</span>
                </button>

                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Product Grid Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Item</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Badge / Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                              <img
                                src={prod.img}
                                alt={prod.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.src = '/assets/products/rose.jpg')}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-white truncate max-w-xs">{prod.name}</p>
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{prod.description?.replace(/\n+/g, ' • ')}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="capitalize px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                            {prod.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-rose-500">
                          {prod.price}
                          {prod.originalPrice && (
                            <span className="ml-1 text-slate-400 line-through text-[10px]">
                              {prod.originalPrice}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-x-1.5">
                          {(settings.creationOfTheWeekProductId || 'four_tulips_pot') === prod.id && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] shadow-sm inline-flex items-center gap-1">
                              <Sparkles size={10} /> Creation of Week
                            </span>
                          )}
                          {prod.isBestSeller && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-extrabold text-[10px]">
                              🔥 Best Seller
                            </span>
                          )}
                          {prod.isComingSoon && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px]">
                              ⏳ Coming Soon
                            </span>
                          )}
                          {!prod.isBestSeller && !prod.isComingSoon && (settings.creationOfTheWeekProductId || 'four_tulips_pot') !== prod.id && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold text-[10px]">
                              {prod.badge || 'Active'}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSetCreationOfTheWeek(prod.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                (settings.creationOfTheWeekProductId || 'four_tulips_pot') === prod.id
                                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                                  : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                              }`}
                              title={
                                (settings.creationOfTheWeekProductId || 'four_tulips_pot') === prod.id
                                  ? 'Current Creation of the Week (Homepage Hero)'
                                  : 'Feature as Creation of the Week on Homepage'
                              }
                            >
                              <Sparkles size={14} className={(settings.creationOfTheWeekProductId || 'four_tulips_pot') === prod.id ? 'fill-white' : ''} />
                            </button>

                            <button
                              onClick={() => toggleBestSeller(prod.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                prod.isBestSeller
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'border-slate-200 text-slate-400 hover:text-amber-500'
                              }`}
                              title={prod.isBestSeller ? 'Unmark Bestseller' : 'Mark as Bestseller'}
                            >
                              <Star size={14} className={prod.isBestSeller ? 'fill-white' : ''} />
                            </button>

                            <button
                              onClick={() => toggleComingSoon(prod.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                prod.isComingSoon
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'border-slate-200 text-slate-400 hover:text-blue-500'
                              }`}
                              title={prod.isComingSoon ? 'Unmark Coming Soon' : 'Mark as Coming Soon'}
                            >
                              <Clock size={14} />
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Edit Product"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1.5 rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div>
                <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-white">Order Logs & Dispatches</h3>
                <p className="text-xs text-slate-400">Recorded when customers click order via WhatsApp or Instagram</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Crafting">Crafting</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Packed">Packed</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {orders.length > 0 && (
                  <button
                    onClick={handleSyncAllOrders}
                    disabled={isSyncingAll}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    title="Sync all orders to Google Sheets for your accounting app"
                  >
                    <FileSpreadsheet size={15} />
                    <span>{isSyncingAll ? 'Syncing...' : 'Sync to Sheets'}</span>
                  </button>
                )}

                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all order history logs?')) clearAllOrders();
                    }}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 text-xs font-bold"
                  >
                    Clear Logs
                  </button>
                )}
              </div>
            </div>

            {syncStatusMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
                <Check size={16} /> {syncStatusMsg}
              </div>
            )}

            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">No Orders Logged Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When users add keychains or decor items to their cart and initiate an order dispatch, details will automatically be tracked here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-bold text-rose-500 text-sm">{ord.id}</span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            ord.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {ord.channel === 'WhatsApp' ? <WhatsAppIcon size={12} /> : <InstagramIcon size={12} />}
                          Via {ord.channel}
                        </span>
                        {ord.customerName && (
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {ord.customerName} {ord.customerPhone ? `(${ord.customerPhone})` : ''}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {new Date(ord.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as LoggedOrder['status'])}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : ord.status === 'Dispatched'
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : ord.status === 'Crafting'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : ord.status === 'New'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="New">Status: New</option>
                          <option value="Crafting">Status: Crafting</option>
                          <option value="Contacted">Status: Contacted</option>
                          <option value="Packed">Status: Packed</option>
                          <option value="Dispatched">Status: Dispatched</option>
                          <option value="Delivered">Status: Delivered</option>
                          <option value="Cancelled">Status: Cancelled</option>
                        </select>

                        {/* Sync Single Order to Sheet */}
                        <button
                          onClick={() => handleSyncSingleOrder(ord)}
                          className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                            syncedOrderIds[ord.id]
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title="Sync this order row to Google Sheets"
                        >
                          <FileSpreadsheet size={14} className="text-emerald-600" />
                          <span className="hidden sm:inline">
                            {syncedOrderIds[ord.id] ? 'Synced' : 'Sheet'}
                          </span>
                        </button>

                        <button
                          onClick={() => deleteOrder(ord.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {ord.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-white">
                            <img src={item.img} alt={item.productName} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate text-slate-800 dark:text-white">{item.productName}</p>
                            <p className="text-[10px] text-slate-400">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping & Tracking Control Row */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                        <Truck size={14} className="text-indigo-500" />
                        <span>Tracking:</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Courier (e.g. Delhivery, India Post)"
                        defaultValue={ord.courierPartner || ''}
                        onBlur={(e) => updateOrderTracking(ord.id, { courierPartner: e.target.value })}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-[11px] w-44"
                      />
                      <input
                        type="text"
                        placeholder="Tracking AWB #"
                        defaultValue={ord.trackingNumber || ''}
                        onBlur={(e) => updateOrderTracking(ord.id, { trackingNumber: e.target.value })}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-mono text-[11px] w-36"
                      />
                      <input
                        type="text"
                        placeholder="Est. Delivery (e.g. In 3 days)"
                        defaultValue={ord.estimatedDelivery || ''}
                        onBlur={(e) => updateOrderTracking(ord.id, { estimatedDelivery: e.target.value })}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-[11px] w-36"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-500">Total Items: {ord.totalItems}</span>
                      <span className="font-extrabold text-rose-500 text-base">Total: ₹{ord.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- REVIEWS TAB (CRUD) --- */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow max-w-xl">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reviews by reviewer, product, or comment..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <select
                  value={reviewRatingFilter}
                  onChange={(e) => setReviewRatingFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">All Ratings (⭐)</option>
                  <option value="5">5 Stars Only</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddReview}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Add Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all customer reviews to default initial reviews?')) {
                      resetReviewsToDefault();
                      setReviewStatusMsg('✨ Reset reviews to default initial reviews.');
                      setTimeout(() => setReviewStatusMsg(null), 3000);
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
                  title="Reset to default reviews"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Reviews</span>
                <p className="text-xl font-bold font-serif text-slate-800 dark:text-white mt-0.5">{reviews.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Average Rating</span>
                <p className="text-xl font-bold font-serif text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                  <span>{averageRating}</span>
                  <Star size={16} className="fill-amber-500 text-amber-500" />
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">5-Star Reviews</span>
                <p className="text-xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {reviews.filter((r) => r.rating === 5).length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Verified Buyers</span>
                <p className="text-xl font-bold font-serif text-rose-500 mt-0.5">
                  {reviews.filter((r) => r.verifiedBuyer).length}
                </p>
              </div>
            </div>

            {reviewStatusMsg && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <Check size={16} /> {reviewStatusMsg}
              </div>
            )}

            {/* Reviews List */}
            {(() => {
              const filteredReviews = reviews.filter((r) => {
                const query = reviewSearch.toLowerCase();
                const matchesSearch =
                  r.customerName.toLowerCase().includes(query) ||
                  r.comment.toLowerCase().includes(query) ||
                  r.productName.toLowerCase().includes(query) ||
                  (r.city && r.city.toLowerCase().includes(query));
                const matchesRating =
                  reviewRatingFilter === 'all' || r.rating === Number(reviewRatingFilter);
                return matchesSearch && matchesRating;
              });

              if (filteredReviews.length === 0) {
                return (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800">
                    <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">No Reviews Found</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing your search query or rating filter, or click &quot;Add Review&quot; to create one.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        {/* Header: Name, Location, Verified, Rating & Actions */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                                {rev.customerName}
                              </h4>
                              {rev.city && (
                                <span className="text-xs text-slate-400">· {rev.city}</span>
                              )}
                              {rev.verifiedBuyer && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                                  <CheckCircle2 size={11} /> Verified Buyer
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">{rev.date}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditReview(rev)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Review"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev.id, rev.customerName)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Review"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Rating Stars & Product Tag */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-0.5 rounded-full truncate max-w-[180px]">
                            {rev.productName}
                          </span>
                        </div>

                        {/* Review Comment */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                          &quot;{rev.comment}&quot;
                        </p>
                      </div>

                      {/* Photo Thumbnail if any */}
                      {rev.photo && (
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                            <img src={rev.photo} alt={rev.productName} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[11px] text-slate-400">Customer photo attached</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* --- GALLERY TAB (CRUD) --- */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div>
                <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-pink-500" /> Real Creations Showcase Gallery ({galleryItems.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Handcrafted pieces showcased on the <strong>About</strong> page under &quot;Petalorah in Your Hands&quot;
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddGallery}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Add Showcase Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset gallery showcase items to default photos?')) {
                      resetGalleryToDefault();
                      setGalleryStatusMsg('✨ Reset showcase gallery to default photos.');
                      setTimeout(() => setGalleryStatusMsg(null), 3000);
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
                  title="Reset to default photos"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {galleryStatusMsg && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <Check size={16} /> {galleryStatusMsg}
              </div>
            )}

            {/* Showcase Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div>
                    {/* Thumbnail with Tag */}
                    <div className="relative aspect-video sm:aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                        {item.tag}
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 space-y-1.5">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {item.caption}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400">ID: {item.id}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditGallery(item)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Edit size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete showcase item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ANNOUNCEMENT BANNER TAB --- */}
        {activeTab === 'banner' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Megaphone size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-white">Site Announcement Banner</h3>
                <p className="text-xs text-slate-400">Control the top promotional bar displayed above the navbar</p>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview</label>
              <div className="w-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 text-white py-2 px-4 text-center text-xs font-medium rounded-xl shadow-sm">
                {announcementInput || 'Your announcement will appear here...'}
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Announcement Ticker Text
                </label>
                <input
                  type="text"
                  required
                  value={announcementInput}
                  onChange={(e) => setAnnouncementInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white text-sm font-medium text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isAnnouncementVisible"
                  checked={settings.isAnnouncementVisible}
                  onChange={(e) => updateSettings({ isAnnouncementVisible: e.target.checked })}
                  className="w-5 h-5 text-rose-500 rounded focus:ring-rose-400 cursor-pointer"
                />
                <label htmlFor="isAnnouncementVisible" className="text-sm font-bold cursor-pointer text-slate-700 dark:text-slate-200">
                  Show Announcement Bar on Website
                </label>
              </div>

              {settingsSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle size={16} /> {settingsSuccessMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
              >
                Save Announcement Banner
              </button>
            </form>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
            {/* Homepage Hero Showcase: Creation of the Week */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-white flex items-center gap-2 flex-wrap">
                      <span>Creation of the Week</span>
                      <span className="text-xs bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 font-bold px-2.5 py-0.5 rounded-full">
                        Homepage Hero Showcase
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Choose which handcrafted craft is featured prominently in the hero showcase on the Petalorah homepage
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Product Select Controls */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                      Select Featured Craft Product
                    </label>
                    <select
                      value={creationOfTheWeekInput}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setCreationOfTheWeekInput(newId);
                        handleSetCreationOfTheWeek(newId);
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-white cursor-pointer focus:ring-2 focus:ring-rose-500/20"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.price} ({p.category})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-2">
                      💡 Tip: You can also click the ✨ icon next to any craft in the <strong>Products</strong> tab to feature it instantly!
                    </p>
                  </div>

                  {settingsSuccessMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                      <CheckCircle size={16} /> {settingsSuccessMsg}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSetCreationOfTheWeek(creationOfTheWeekInput)}
                      className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all text-xs flex items-center gap-2"
                    >
                      <Sparkles size={15} />
                      <span>Set as Creation of the Week</span>
                    </button>

                    <button
                      type="button"
                      onClick={onNavigateHome}
                      className="px-4 py-3 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1.5"
                    >
                      <Eye size={14} />
                      <span>View Live on Homepage</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="md:col-span-5 flex justify-center">
                  {(() => {
                    const previewProd =
                      products.find((p) => p.id === creationOfTheWeekInput) || products[0];
                    if (!previewProd) return null;
                    return (
                      <div className="relative w-full max-w-[240px] rounded-3xl p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl transition-all duration-300">
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 mb-3">
                          <img
                            src={previewProd.img}
                            alt={previewProd.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <Sparkles size={11} /> Creation of the Week
                          </span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-slate-800 dark:text-white truncate">
                          {previewProd.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {previewProd.category} craft
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-sm font-extrabold text-rose-500">
                            {previewProd.price}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Active Showcase
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Store Contact Config */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-white">Socials & Order Contacts</h3>
                  <p className="text-xs text-slate-400">Configure where customer orders are dispatched</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <WhatsAppIcon size={16} /> WhatsApp Number (With Country Code)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="916380437068"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">E.g., 916380437068 for India (+91)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <InstagramIcon size={16} /> Instagram Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="petalorah"
                    value={instagramInput}
                    onChange={(e) => setInstagramInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-white"
                  />
                </div>

                {settingsSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle size={16} /> {settingsSuccessMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
                >
                  Save Store Contacts
                </button>
              </form>
            </div>

            {/* Admin PIN Passcode Changer */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-white">Change Admin Passcode</h3>
                  <p className="text-xs text-slate-400">Update security PIN for unlocking the admin panel</p>
                </div>
              </div>

              <form onSubmit={handleChangePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Current Passcode
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current passcode"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    New Passcode
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new passcode (min 4 characters)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                  />
                </div>

                {pinSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle size={16} /> {pinSuccessMsg}
                  </div>
                )}

                {pinErrorMsg && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} /> {pinErrorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl font-bold text-slate-800 bg-amber-400 hover:bg-amber-500 shadow-md transition-all"
                >
                  Update Passcode PIN
                </button>
              </form>
            </div>

            {/* Google Sheets & AI Studio Accounting Sync */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-white flex items-center gap-2">
                      Google Sheets & Accounting Sync
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Google AI Studio Ready
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sync every order ID, items breakdown, and revenue in real-time to your Google Spreadsheet.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsScriptModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600" />
                  View Setup Guide & Script
                </button>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Google Sheet Link or Apps Script Webhook URL
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="Paste Google Sheet URL (docs.google.com/spreadsheets/d/...) or Apps Script URL"
                      value={googleSheetInput}
                      onChange={(e) => setGoogleSheetInput(e.target.value)}
                      className="flex-grow px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex-shrink-0"
                    >
                      Save URL
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
                    ✨ <strong>Option 1 (Easiest):</strong> Paste your Google Sheet URL directly (make sure Google Drive sharing is set to <em>&quot;Anyone with the link can view&quot;</em>). Orders created in your accounts app can be tracked immediately!<br />
                    ⚡ <strong>Option 2 (Bidirectional):</strong> Paste your Google Apps Script Web App URL to both live query and sync orders back and forth.
                  </p>
                </div>

                {sheetTestStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      sheetTestStatus.startsWith('✅')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {sheetTestStatus}
                  </div>
                )}

                {syncStatusMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      syncStatusMsg.startsWith('✅')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {syncStatusMsg}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestGoogleSheet}
                    disabled={isTestingSheet}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check size={14} className="text-emerald-500" />
                    <span>{isTestingSheet ? 'Testing Connection...' : 'Test Connection & Orders'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullOrdersFromSheet}
                    disabled={isSyncingAll}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors flex items-center gap-1.5"
                  >
                    <FileSpreadsheet size={14} className="text-white" />
                    <span>{isSyncingAll ? 'Importing...' : 'Import Orders from Google Sheet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncAllOrders}
                    disabled={isSyncingAll}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs shadow transition-colors flex items-center gap-1.5"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-400" />
                    <span>{isSyncingAll ? 'Syncing...' : `Export Petalorah Orders to Sheet (${orders.length})`}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* REVIEW ADD / EDIT MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsReviewModalOpen(false)} />
          <div
            data-lenis-prevent
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 max-h-[90vh] overflow-y-auto overscroll-contain space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={18} />
                <span>{editingReview ? 'Edit Customer Review' : 'Add Customer Review'}</span>
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya S."
                    value={reviewFormName}
                    onChange={(e) => setReviewFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai"
                    value={reviewFormCity}
                    onChange={(e) => setReviewFormCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Rating (Stars)
                  </label>
                  <select
                    value={reviewFormRating}
                    onChange={(e) => setReviewFormRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Associated Craft
                  </label>
                  <select
                    value={reviewFormProductId}
                    onChange={(e) => setReviewFormProductId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Customer Review Comment *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="What did the customer say about this handmade craft?..."
                  value={reviewFormComment}
                  onChange={(e) => setReviewFormComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Photo (Image URL or Path)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/assets/products/rose.jpg or https://..."
                    value={reviewFormPhoto}
                    onChange={(e) => setReviewFormPhoto(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none font-mono"
                  />
                  <label className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    <Camera size={14} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setReviewFormPhoto(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {reviewFormPhoto && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <img src={reviewFormPhoto} alt="Review Preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewFormPhoto('')}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Remove photo
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verifiedReviewCheckbox"
                  checked={reviewFormVerified}
                  onChange={(e) => setReviewFormVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <label htmlFor="verifiedReviewCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Display &quot;Verified Buyer&quot; badge
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 text-white font-bold text-xs shadow"
                >
                  {editingReview ? 'Save Changes' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GALLERY SHOWCASE ADD / EDIT MODAL */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsGalleryModalOpen(false)} />
          <div
            data-lenis-prevent
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 max-h-[90vh] overflow-y-auto overscroll-contain space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Camera className="text-pink-500" size={18} />
                <span>{editingGalleryItem ? 'Edit Showcase Photo' : 'Add Showcase Photo'}</span>
              </h3>
              <button
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Creation Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom Jersey Charm"
                  value={galleryFormTitle}
                  onChange={(e) => setGalleryFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tag Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. Custom Order, Desk Keepsake, Gift Order, Handmade Charm"
                  value={galleryFormTag}
                  onChange={(e) => setGalleryFormTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Caption / Customer Story *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Handcrafted personalized jersey charm with custom player number."
                  value={galleryFormCaption}
                  onChange={(e) => setGalleryFormCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Photo Path or URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="/assets/products/... or image URL"
                    value={galleryFormImg}
                    onChange={(e) => setGalleryFormImg(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none font-mono"
                  />
                  <label className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    <Camera size={14} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setGalleryFormImg(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {galleryFormImg && (
                  <div className="mt-2.5">
                    <div className="relative aspect-video w-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <img src={galleryFormImg} alt="Gallery Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 text-white font-bold text-xs shadow"
                >
                  {editingGalleryItem ? 'Save Changes' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* GOOGLE APPS SCRIPT SETUP MODAL */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsScriptModalOpen(false)} />
          <div
            data-lenis-prevent
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 max-h-[90vh] overflow-y-auto overscroll-contain space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="text-emerald-600" size={22} />
                <h3 className="text-lg font-bold font-serif text-slate-800 dark:text-white">
                  Google Sheets & Accounting Setup
                </h3>
              </div>
              <button
                onClick={() => setIsScriptModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-white">
                Follow these 4 simple steps to connect Petalorah to your Google Sheet:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1">
                <li>Open your Google Sheet (used by your Google AI Studio accounting app).</li>
                <li>Click <strong>Extensions</strong> → <strong>Apps Script</strong>.</li>
                <li>Delete any default code, paste the script below, and click <strong>Save</strong> (💾).</li>
                <li>Click <strong>Deploy</strong> → <strong>New deployment</strong> → Select type: <strong>Web app</strong>:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                    <li>Execute as: <strong>Me</strong></li>
                    <li>Who has access: <strong>Anyone</strong></li>
                  </ul>
                </li>
                <li>Copy the generated <strong>Web App URL</strong> and paste it into the setting input above!</li>
              </ol>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-4 py-2 rounded-t-2xl text-[11px] font-mono">
                <span>Code.gs (Google Apps Script)</span>
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono rounded-b-2xl overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsScriptModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
