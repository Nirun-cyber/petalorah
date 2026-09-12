import React, { useState } from 'react';
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
  MessageSquare,
  ArrowRight,
  AlertCircle,
  Clock,
  Truck,
  FileSpreadsheet,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useOrders, type LoggedOrder } from '../context/OrderContext';
import { useSettings } from '../context/SettingsContext';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import type { Product } from '../data/products';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'banner' | 'settings'>('overview');

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
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

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
    });
    setSettingsSuccessMsg('Store & Google Sheets settings saved successfully!');
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
                  <p className="text-xs font-bold uppercase text-slate-400">Banner Status</p>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1">
                    {settings.isAnnouncementVisible ? 'Active 🟢' : 'Hidden 🔴'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 truncate max-w-[150px]">{settings.announcementText}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
                  <Megaphone className="w-6 h-6" />
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
                          {!prod.isBestSeller && !prod.isComingSoon && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold text-[10px]">
                              {prod.badge || 'Active'}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
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
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            ord.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-700'
                          }`}
                        >
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
                    <MessageSquare size={14} className="text-emerald-500" /> WhatsApp Number (With Country Code)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="916382735751"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">E.g., 916382735751 for India (+91)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-pink-500" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg> Instagram Username
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
