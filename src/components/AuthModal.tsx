import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Lock,
  LogOut,
  PackageCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Save,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

interface AuthModalProps {
  onNavigateToAdmin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onNavigateToAdmin }) => {
  const {
    user,
    isAdmin,
    isAuthModalOpen,
    initialTab,
    closeAuthModal,
    loginCustomer,
    logoutCustomer,
    updateCustomerAddress,
    loginAdmin,
    logoutAdmin,
  } = useAuth();

  const { orders } = useOrders();

  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>(initialTab);

  // Customer Sign In Form state
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');

  // Address Form State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [streetInput, setStreetInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');
  const [landmarkInput, setLandmarkInput] = useState('');

  // Admin Form state
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(initialTab);
      setPinError(false);
      setAdminPin('');
      setIsEditingAddress(false);
    }
  }, [isAuthModalOpen, initialTab]);

  useEffect(() => {
    if (user?.address) {
      setStreetInput(user.address.street || '');
      setCityInput(user.address.city || '');
      setStateInput(user.address.state || '');
      setPincodeInput(user.address.pincode || '');
      setLandmarkInput(user.address.landmark || '');
    }
  }, [user]);

  if (!isAuthModalOpen) return null;

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || (!custEmail.trim() && !custPhone.trim())) return;
    loginCustomer({
      name: custName,
      email: custEmail,
      phone: custPhone,
    });
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetInput.trim() || !cityInput.trim() || !pincodeInput.trim()) return;
    updateCustomerAddress({
      street: streetInput.trim(),
      city: cityInput.trim(),
      state: stateInput.trim() || 'Tamil Nadu',
      pincode: pincodeInput.trim(),
      landmark: landmarkInput.trim(),
    });
    setIsEditingAddress(false);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(adminPin);
    if (success) {
      setPinError(false);
      setAdminPin('');
      closeAuthModal();
      onNavigateToAdmin();
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-navy-light rounded-3xl shadow-2xl border border-primary/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-primary/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-secondary/20 text-primary dark:text-secondary-light flex items-center justify-center font-bold">
              {activeTab === 'customer' ? <User size={20} /> : <ShieldCheck size={20} />}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-primary dark:text-white leading-tight">
                {activeTab === 'customer' ? 'Customer Profile' : 'Store Admin Portal'}
              </h3>
              <p className="text-xs text-primary/60 dark:text-gray-400">
                {activeTab === 'customer'
                  ? 'Track orders & manage saved delivery details'
                  : 'Manage store products & customer orders'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-2 rounded-full text-primary/60 dark:text-gray-400 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-gray-100 dark:bg-navy mx-6 mt-4 rounded-2xl">
          <button
            onClick={() => setActiveTab('customer')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'customer'
                ? 'bg-white dark:bg-navy-light text-primary dark:text-secondary-light shadow-sm'
                : 'text-primary/60 dark:text-gray-400 hover:text-primary dark:hover:text-white'
            }`}
          >
            <User size={14} />
            Customer Profile
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white dark:bg-navy-light text-primary dark:text-secondary-light shadow-sm'
                : 'text-primary/60 dark:text-gray-400 hover:text-primary dark:hover:text-white'
            }`}
          >
            <ShieldCheck size={14} />
            Admin Portal
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'customer' ? (
            user ? (
              // Logged-in Customer Profile View
              <div className="space-y-5">
                {/* Profile Card Header */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/10 dark:from-secondary/10 dark:to-transparent border border-primary/10 dark:border-secondary/20 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white dark:bg-secondary dark:text-navy text-xl font-bold flex items-center justify-center shadow-md uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-base font-bold text-primary dark:text-white truncate">
                      {user.name}
                    </h4>
                    {user.email && (
                      <p className="text-xs text-primary/70 dark:text-gray-300 flex items-center gap-1.5 truncate">
                        <Mail size={12} className="flex-shrink-0" />
                        {user.email}
                      </p>
                    )}
                    {user.phone && (
                      <p className="text-xs text-primary/70 dark:text-gray-300 flex items-center gap-1.5 truncate">
                        <Phone size={12} className="flex-shrink-0" />
                        {user.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* SAVED DELIVERY ADDRESS SECTION */}
                <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <MapPin size={15} className="text-amber-600" />
                      Saved Delivery Address
                    </span>

                    <button
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                    >
                      {user.address ? (
                        <>
                          <Edit3 size={12} />
                          {isEditingAddress ? 'Cancel' : 'Edit'}
                        </>
                      ) : (
                        <>
                          <Plus size={12} />
                          {isEditingAddress ? 'Cancel' : 'Add Address'}
                        </>
                      )}
                    </button>
                  </div>

                  {isEditingAddress ? (
                    // Address Form
                    <form onSubmit={handleSaveAddress} className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-primary/80 dark:text-gray-300 mb-0.5">
                          Street / House No / Area <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 12 Flower Lane, Apt 4B"
                          value={streetInput}
                          onChange={(e) => setStreetInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-xs text-primary dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-primary/80 dark:text-gray-300 mb-0.5">
                            City <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Chennai"
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-xs text-primary dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-primary/80 dark:text-gray-300 mb-0.5">
                            Pincode <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 600001"
                            value={pincodeInput}
                            onChange={(e) => setPincodeInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-xs text-primary dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-primary/80 dark:text-gray-300 mb-0.5">
                            State
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Tamil Nadu"
                            value={stateInput}
                            onChange={(e) => setStateInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-xs text-primary dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-primary/80 dark:text-gray-300 mb-0.5">
                            Landmark (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Near Rose Garden"
                            value={landmarkInput}
                            onChange={(e) => setLandmarkInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-xs text-primary dark:text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-amber-700 transition-colors"
                      >
                        <Save size={14} />
                        Save Delivery Address
                      </button>
                    </form>
                  ) : user.address ? (
                    // Saved Address Display
                    <div className="text-xs text-primary/80 dark:text-gray-200 leading-relaxed font-medium bg-white/60 dark:bg-navy/60 p-3 rounded-xl border border-amber-500/10">
                      <div>{user.address.street}</div>
                      <div>
                        {user.address.city}, {user.address.state} - {user.address.pincode}
                      </div>
                      {user.address.landmark && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic">
                          📍 Landmark: {user.address.landmark}
                        </div>
                      )}
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Auto-attaches to WhatsApp & IG checkout drafts!
                      </div>
                    </div>
                  ) : (
                    // No Address Saved Yet
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-navy/60 border border-dashed border-amber-500/30 text-center space-y-1">
                      <p className="text-xs text-primary/70 dark:text-gray-400">
                        No delivery address saved yet.
                      </p>
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus size={12} /> Add your address for faster checkouts
                      </button>
                    </div>
                  )}
                </div>

                {/* Orders Summary */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary/70 dark:text-gray-300 flex items-center gap-1">
                      <PackageCheck size={14} className="text-primary dark:text-secondary-light" />
                      Your Recent Craft Orders ({orders.length})
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy text-center space-y-1">
                      <p className="text-xs font-medium text-primary/70 dark:text-gray-400">
                        No orders placed yet.
                      </p>
                      <p className="text-[11px] text-primary/50 dark:text-gray-500">
                        Add items to your cart and place an order via WhatsApp or IG!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {orders.slice(0, 3).map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 rounded-xl bg-gray-50 dark:bg-navy border border-primary/5 dark:border-white/5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-primary dark:text-white">{ord.id}</div>
                            <div className="text-[10px] text-primary/60 dark:text-gray-400">
                              {ord.items.length} items • ₹{ord.totalAmount}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : ord.status === 'Packed'
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={logoutCustomer}
                  className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out of Customer Account
                </button>
              </div>
            ) : (
              // Customer Login Form
              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                  <Sparkles size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Welcome to Petalorah!</span> Sign in to save your shipping address & track craft orders.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary dark:text-gray-300 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. priya@example.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary dark:text-gray-300 mb-1">
                    Phone / Instagram Handle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @priya_crafts or +91 9876543210"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Sign In & Save Profile
                </button>
              </form>
            )
          ) : (
            // Admin Portal Tab
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {isAdmin ? (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-primary dark:text-white">
                      Admin Access Active
                    </h4>
                    <p className="text-xs text-primary/60 dark:text-gray-400 mt-1">
                      You are authenticated as the store owner.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      closeAuthModal();
                      onNavigateToAdmin();
                    }}
                    className="w-full py-3 rounded-xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    Open Control Center
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={logoutAdmin}
                    className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Lock size={14} />
                    Lock Admin Access
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
                    <Lock size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Store Admin Area:</span> Enter your secret passcode PIN to unlock the store control dashboard.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary dark:text-gray-300 mb-1">
                      Security Passcode PIN
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter admin PIN..."
                      value={adminPin}
                      onChange={(e) => {
                        setAdminPin(e.target.value);
                        setPinError(false);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy text-xs text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary tracking-widest font-mono"
                    />
                    {pinError && (
                      <p className="text-[11px] font-bold text-rose-500 mt-1">
                        Incorrect PIN. Please try again!
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    Unlock Store Control Center
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
