import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Mail,
  MapPin,
  LogOut,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  Package,
  Heart,
  Edit2,
  X,
  Loader2,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import confetti from 'canvas-confetti';
import { useAuth, type DeliveryAddress } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import {
  authenticateCustomerAccount,
  registerCustomerAccount,
  requestPasswordReset,
  resetCustomerPassword,
} from '../lib/customerAuth';

interface LoginPageProps {
  onNavigateHome: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToCollection: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateHome,
  onNavigateToCollection,
}) => {
  const {
    user,
    loginCustomer,
    logoutCustomer,
    updateCustomerAddress,
    updateCustomerProfile,
  } = useAuth();

  const { orders } = useOrders();
  const { openCart } = useCart();

  // Customer Mode: Sign In vs Register vs Forgot Password vs Reset Password
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'forgot' | 'reset'>('signin');

  // Forgot Password / Reset Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetLinkSent, setResetLinkSent] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields - Customer Sign In (Email & Password Only)
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields - Customer Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAgreeTerms, setRegAgreeTerms] = useState(true);

  // Loading indicator for secure auth
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address Fields
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  // Feedback Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Customer Profile In-Dashboard Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Sync state if user is already present
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone);
      if (user.address) {
        setStreet(user.address.street || '');
        setCity(user.address.city || '');
        setState(user.address.state || 'Tamil Nadu');
        setPincode(user.address.pincode || '');
        setLandmark(user.address.landmark || '');
      }
    }
  }, [user]);

  // Detect reset link in URL (?reset=true or #access_token)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isReset = params.get('reset') === 'true' || window.location.hash.includes('access_token');
    const emailParam = params.get('email');
    const tokenParam = params.get('token');

    if (isReset) {
      setAuthMode('reset');
      if (emailParam) setResetEmail(decodeURIComponent(emailParam));
      if (tokenParam) setResetToken(tokenParam);
    }
  }, []);

  // Confetti helper
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F43F5E', '#FB7185', '#FDA4AF', '#F472B6', '#E0E7FF'],
    });
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'Empty', score: 0, color: 'bg-gray-200' };
    if (pass.length < 6) return { label: 'Weak', score: 1, color: 'bg-rose-400' };
    if (pass.length < 10) return { label: 'Good', score: 2, color: 'bg-amber-400' };
    return { label: 'Strong', score: 3, color: 'bg-emerald-500' };
  };

  // Handle Customer Sign In (Strict database matching: only logs in if email & password match)
  const handleCustomerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = signInEmail.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address (Gmail / Email).');
      return;
    }
    if (!signInPassword) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authenticateCustomerAccount(cleanEmail, signInPassword);
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Invalid credentials. Only matching email and password can log in.');
        setIsSubmitting(false);
        return;
      }

      loginCustomer(res.user);
      triggerConfetti();
      setSuccessMessage(`Welcome back, ${res.user.name}!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Customer Registration (Saves email/Gmail and hashed password securely to database)
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid Gmail / Email address.');
      return;
    }
    if (!regPhone.trim()) {
      setErrorMessage('Please enter your WhatsApp/Mobile number.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const newAddress: DeliveryAddress | undefined =
      street.trim() || city.trim() || pincode.trim()
        ? {
            street: street.trim(),
            city: city.trim(),
            state: state.trim() || 'Tamil Nadu',
            pincode: pincode.trim(),
            landmark: landmark.trim(),
          }
        : undefined;

    setIsSubmitting(true);
    try {
      const res = await registerCustomerAccount({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim(),
        address: newAddress,
      });

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Failed to create account. Please check your details.');
        setIsSubmitting(false);
        return;
      }

      loginCustomer(res.user);
      triggerConfetti();
      setSuccessMessage(`Welcome to the Petalorah family, ${res.user.name}!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to register account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !pincode.trim()) {
      setErrorMessage('Please enter street, city, and pincode.');
      return;
    }
    updateCustomerAddress({
      street: street.trim(),
      city: city.trim(),
      state: state.trim() || 'Tamil Nadu',
      pincode: pincode.trim(),
      landmark: landmark.trim(),
    });
    setShowAddressFields(false);
    setSuccessMessage('Delivery destination updated!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle In-Dashboard Profile Update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateCustomerProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
    });
    setIsEditingProfile(false);
    setSuccessMessage('Profile details updated!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle Request Password Reset Link
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid Gmail / Email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(cleanEmail);
      if (!res.success) {
        setErrorMessage(res.error || 'Unable to request password reset. Please check your email.');
        setIsSubmitting(false);
        return;
      }

      setResetLinkSent(true);
      if (res.token) setResetToken(res.token);
      setResetEmail(cleanEmail);
      setSuccessMessage(`Password reset link sent to ${cleanEmail}! Please check your Gmail.`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save New Password
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter both passwords.');
      return;
    }

    const targetEmail = resetEmail.trim().toLowerCase();
    if (!targetEmail) {
      setErrorMessage('Missing email context. Please request a new reset link.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetCustomerPassword(targetEmail, newPassword, resetToken);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update password. Please try again.');
        setIsSubmitting(false);
        return;
      }

      triggerConfetti();
      setSuccessMessage('Password changed successfully! Please log in with your new password.');
      setSignInEmail(targetEmail);
      setSignInPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setAuthMode('signin');
      if (window.location.search.includes('reset=true')) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error updating password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[92vh] relative flex flex-col justify-center items-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 bg-gradient-to-b from-rose-50/40 via-white to-pink-50/30 dark:from-slate-950 dark:via-navy dark:to-slate-900 overflow-hidden">
      {/* Decorative Floral Blur Orbs */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-rose-200/40 dark:bg-rose-900/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-pink-200/35 dark:bg-pink-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Actions */}
      <div className="w-full max-w-xl mx-auto mb-3 sm:mb-6 flex items-center justify-start z-10">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary/70 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors bg-white/70 dark:bg-white/5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-primary/10 shadow-xs backdrop-blur-md"
        >
          <ArrowLeft size={14} />
          Back to Store
        </button>
      </div>

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-xl bg-white/90 dark:bg-navy-light/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-rose-100/90 dark:border-white/10 overflow-hidden z-10"
      >
        {/* Card Header */}
        <div className="pt-5 pb-3 sm:pt-8 sm:pb-5 px-4 sm:px-10 text-center border-b border-primary/5 dark:border-white/5">
          <div className="w-11 h-11 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 p-0.5 shadow-md shadow-rose-500/20">
            <div className="w-full h-full bg-white dark:bg-navy rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
              <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-rose-500 fill-rose-500/20" />
            </div>
          </div>
          <h1 className="font-serif text-xl sm:text-3xl font-bold text-primary dark:text-white tracking-wide">
            Welcome to Petalorah
          </h1>
          <p className="text-xs sm:text-sm text-primary/60 dark:text-gray-400 mt-0.5 sm:mt-1 max-w-sm mx-auto">
            Your home for handcrafted pipe cleaner blooms, keychains, and custom resin art.
          </p>

        </div>

        {/* Dynamic Card Content */}
        <div className="p-4 sm:p-10">
          {/* Notifications */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{successMessage}</div>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{errorMessage}</div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-600 hover:text-rose-800"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Customer Access Portal */}
          <div>
              {user ? (
                /* Customer Authenticated Dashboard */
                <div className="space-y-6">
                  {/* Customer Identity Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50/70 to-pink-50/40 dark:from-white/5 dark:to-white/5 border border-rose-200/70 dark:border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-13 h-13 rounded-full object-cover border-2 border-rose-300 shadow-sm"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-rose-500/20">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-primary dark:text-white text-base sm:text-lg">
                            {user.name}
                          </h3>
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-primary/60 dark:text-gray-400">
                          {user.email || user.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="p-2 rounded-xl border border-primary/10 dark:border-white/10 text-primary/70 dark:text-gray-300 hover:text-primary hover:bg-white/80 transition-colors"
                        title="Edit Name or Phone"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={logoutCustomer}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 dark:border-white/10 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-white/5 transition-colors"
                        title="Sign Out"
                      >
                        <LogOut size={14} />
                        <span className="hidden sm:inline">Sign Out</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Profile Edit Form */}
                  <AnimatePresence>
                    {isEditingProfile && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSaveProfile}
                        className="p-4 rounded-2xl bg-white dark:bg-navy border border-primary/15 dark:border-white/15 space-y-3"
                      >
                        <h4 className="text-xs font-bold text-primary dark:text-white">
                          Edit Personal Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="text-xs px-3 py-2 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                          <input
                            type="text"
                            placeholder="WhatsApp / Phone"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="text-xs px-3 py-2 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="px-3 py-1.5 rounded-xl border border-primary/10 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
                          >
                            Save Changes
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Saved Delivery Destination */}
                  <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary/80 dark:text-gray-200 flex items-center gap-1.5">
                        <MapPin size={15} className="text-rose-500" />
                        Default Delivery Destination
                      </span>
                      <button
                        onClick={() => setShowAddressFields(!showAddressFields)}
                        className="text-xs font-bold text-rose-500 hover:underline"
                      >
                        {showAddressFields ? 'Close' : user.address ? 'Change Address' : '+ Add Address'}
                      </button>
                    </div>

                    {user.address ? (
                      <p className="text-xs text-primary/80 dark:text-gray-300 leading-relaxed font-medium">
                        {user.address.street}, {user.address.city}, {user.address.state} -{' '}
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {user.address.pincode}
                        </span>
                        {user.address.landmark && ` (Near ${user.address.landmark})`}
                      </p>
                    ) : (
                      <p className="text-xs text-primary/60 dark:text-gray-400 py-1">
                        No delivery address saved yet. Save your address for faster, one-tap checkout on future gifts!
                      </p>
                    )}
                  </div>

                  {/* Address Edit Form Modal/Drawer */}
                  <AnimatePresence>
                    {showAddressFields && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSaveAddress}
                        className="p-4 rounded-2xl bg-rose-50/30 dark:bg-white/5 border border-rose-100 dark:border-white/10 space-y-3"
                      >
                        <h4 className="text-xs font-bold text-primary dark:text-white">
                          Delivery Shipping Address
                        </h4>
                        <input
                          type="text"
                          required
                          placeholder="House No, Apartment, Street name"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="City / District"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="text-xs px-3.5 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Pincode (6-digits)"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            className="text-xs px-3.5 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="State"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="text-xs px-3.5 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                          <input
                            type="text"
                            placeholder="Landmark (Optional)"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            className="text-xs px-3.5 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowAddressFields(false)}
                            className="px-3 py-1.5 rounded-xl border border-primary/10 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
                          >
                            Save Address
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Orders Summary & Live Tracking */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Package size={18} className="text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold text-primary dark:text-white">
                          Order History ({orders.length})
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                        Recent Activity
                      </span>
                    </div>

                    {orders.length === 0 ? (
                      <div className="py-2.5 text-center space-y-1">
                        <p className="text-xs font-medium text-primary/75 dark:text-gray-300">
                          No orders placed yet 🌸
                        </p>
                        <p className="text-[11px] text-primary/50 dark:text-gray-400">
                          Your handcrafted keepsake orders will appear here once placed.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {orders.slice(0, 3).map((ord) => (
                          <div
                            key={ord.id}
                            className="p-2.5 rounded-xl bg-white dark:bg-navy border border-amber-100 dark:border-white/5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-primary dark:text-white">
                                #{ord.id.slice(-6).toUpperCase()}
                              </div>
                              <div className="text-[11px] text-primary/60 dark:text-gray-400">
                                {new Date(ord.createdAt).toLocaleDateString()} · {ord.items.length} item(s)
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-rose-500">₹{ord.totalAmount}</span>
                              <div>
                                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  {ord.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Primary Navigation Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onNavigateToCollection}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={16} />
                      Shop Floral Collections
                    </button>
                    <button
                      onClick={openCart}
                      className="py-3.5 px-6 rounded-2xl bg-primary text-white dark:bg-secondary dark:text-navy font-bold text-xs sm:text-sm shadow-md hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                      View Cart
                    </button>
                  </div>
                </div>
              ) : (
                /* Unauthenticated Customer View */
                <div>
                  {/* Sign In vs Register Toggle Pills */}
                  {(authMode === 'signin' || authMode === 'register') && (
                    <div className="flex border-b border-primary/10 dark:border-white/10 mb-6">
                      <button
                        onClick={() => {
                          setAuthMode('signin');
                          setErrorMessage(null);
                        }}
                        className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                          authMode === 'signin'
                            ? 'border-rose-500 text-rose-500'
                            : 'border-transparent text-primary/60 dark:text-gray-400 hover:text-primary'
                        }`}
                      >
                        Sign In to Account
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode('register');
                          setErrorMessage(null);
                        }}
                        className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                          authMode === 'register'
                            ? 'border-rose-500 text-rose-500'
                            : 'border-transparent text-primary/60 dark:text-gray-400 hover:text-primary'
                        }`}
                      >
                        Create New Account
                      </button>
                    </div>
                  )}

                  {/* ========================================= */}
                  {/* MODE A: SIGN IN */}
                  {/* ========================================= */}
                  {authMode === 'signin' && (
                    <div className="space-y-4">
                      {/* Standard Email & Password Sign In Form */}
                      <form onSubmit={handleCustomerSignIn} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-1.5">
                            Email Address (Gmail / Email) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/40 dark:text-gray-400">
                              <Mail size={16} />
                            </div>
                            <input
                              type="email"
                              required
                              placeholder="you@gmail.com"
                              value={signInEmail}
                              onChange={(e) => setSignInEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-400"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
                              Password <span className="text-rose-500">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setForgotEmail(signInEmail || '');
                                setResetLinkSent(false);
                                setErrorMessage(null);
                                setAuthMode('forgot');
                              }}
                              className="text-xs font-semibold text-rose-500 hover:underline"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/40 dark:text-gray-400">
                              <Lock size={16} />
                            </div>
                            <input
                              type={showSignInPassword ? 'text' : 'password'}
                              required
                              placeholder="••••••••"
                              value={signInPassword}
                              onChange={(e) => setSignInPassword(e.target.value)}
                              className="w-full pl-10 pr-11 py-3 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignInPassword(!showSignInPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-primary/50 dark:text-gray-400 hover:text-primary"
                            >
                              {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center text-xs pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-primary/80 dark:text-gray-300 font-medium">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="rounded border-primary/30 text-rose-500 focus:ring-rose-500"
                            />
                            Remember me on this browser
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Verifying Credentials...</span>
                            </>
                          ) : (
                            <>
                              <span>Sign In & Continue</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* ========================================= */}
                  {/* MODE B: REGISTER (NEW ACCOUNT) */}
                  {/* ========================================= */}
                  {authMode === 'register' && (
                    <form onSubmit={handleCustomerRegister} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-1.5">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/40 dark:text-gray-400">
                            <User size={16} />
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Priya Sharma"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-1.5">
                            Email Address (Gmail / Email) <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/40 dark:text-gray-400">
                              <Mail size={16} />
                            </div>
                            <input
                              type="email"
                              required
                              placeholder="you@gmail.com"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-1.5">
                            WhatsApp / Mobile <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <WhatsAppIcon size={16} />
                            </div>
                            <input
                              type="tel"
                              required
                              placeholder="+91 98765 43210"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-1.5">
                          Create Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/40 dark:text-gray-400">
                            <Lock size={16} />
                          </div>
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            placeholder="At least 6 characters"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-primary/50 dark:text-gray-400 hover:text-primary"
                          >
                            {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {regPassword && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-1">
                              {[1, 2, 3].map((step) => (
                                <div
                                  key={step}
                                  className={`flex-1 h-full rounded-full ${
                                    getPasswordStrength(regPassword).score >= step
                                      ? getPasswordStrength(regPassword).color
                                      : 'bg-gray-200 dark:bg-white/10'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-bold text-primary/60 dark:text-gray-400">
                              {getPasswordStrength(regPassword).label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Optional Delivery Address */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowAddressFields(!showAddressFields)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1.5"
                        >
                          <MapPin size={14} />
                          {showAddressFields
                            ? 'Hide Delivery Address (Optional)'
                            : '+ Add Delivery Shipping Address Now'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {showAddressFields && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2.5 p-3.5 rounded-2xl bg-rose-50/40 dark:bg-white/5 border border-rose-100 dark:border-white/5"
                          >
                            <input
                              type="text"
                              placeholder="Flat / House / Street Name"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              className="w-full text-xs px-3 py-2 rounded-xl border border-primary/10 dark:border-white/10 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="City / District"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="text-xs px-3 py-2 rounded-xl border border-primary/10 dark:border-white/10 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                              />
                              <input
                                type="text"
                                placeholder="Pincode"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                className="text-xs px-3 py-2 rounded-xl border border-primary/10 dark:border-white/10 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Landmark (Optional)"
                              value={landmark}
                              onChange={(e) => setLandmark(e.target.value)}
                              className="w-full text-xs px-3 py-2 rounded-xl border border-primary/10 dark:border-white/10 bg-white dark:bg-navy-light text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Terms */}
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-primary/70 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={regAgreeTerms}
                          onChange={(e) => setRegAgreeTerms(e.target.checked)}
                          className="rounded border-primary/30 text-rose-500 focus:ring-rose-500"
                        />
                        <span>I agree to receive order notifications & handcrafted updates.</span>
                      </label>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            <span>Create My Petalorah Account</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* ========================================= */}
                  {/* MODE C: FORGOT PASSWORD */}
                  {/* ========================================= */}
                  {authMode === 'forgot' && (
                    <div className="space-y-5">
                      <div className="text-center space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
                          <KeyRound size={14} /> Password Recovery
                        </div>
                        <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary dark:text-white">
                          Forgot Your Password?
                        </h2>
                        <p className="text-xs text-primary/70 dark:text-gray-300 max-w-sm mx-auto">
                          Enter your registered Gmail or Email address. We'll send you a secure link to reset your password.
                        </p>
                      </div>

                      {!resetLinkSent ? (
                        <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-1.5">
                              Registered Gmail / Email <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/40 dark:text-gray-400">
                                <Mail size={16} />
                              </div>
                              <input
                                type="email"
                                required
                                placeholder="your.name@gmail.com"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-400"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Generating Reset Link...</span>
                              </>
                            ) : (
                              <>
                                <span>Send Reset Link to Gmail</span>
                                <ArrowRight size={16} />
                              </>
                            )}
                          </button>

                          <div className="text-center pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode('signin');
                                setErrorMessage(null);
                              }}
                              className="text-xs font-semibold text-primary/70 dark:text-gray-300 hover:text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <ArrowLeft size={13} /> Back to Sign In
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="p-4 sm:p-6 rounded-2xl bg-rose-50/60 dark:bg-navy border border-rose-200/70 dark:border-white/10 text-center space-y-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                            <CheckCircle2 size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-primary dark:text-white">
                              Check Your Gmail Inbox!
                            </h3>
                            <p className="text-xs text-primary/75 dark:text-gray-300 mt-1 leading-relaxed">
                              A password reset link has been dispatched to:
                              <br />
                              <strong className="text-primary dark:text-white">{forgotEmail}</strong>
                            </p>
                            <p className="text-[11px] text-primary/60 dark:text-gray-400 mt-2">
                              Click the link inside your email to reset your password. The link will expire in 15 minutes.
                            </p>
                          </div>

                          <div className="pt-2 flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setResetEmail(forgotEmail);
                                setAuthMode('reset');
                              }}
                              className="w-full py-2.5 px-4 rounded-xl bg-primary text-white dark:bg-secondary dark:text-navy text-xs font-bold hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                            >
                              <span>Open Reset Password Screen Now</span>
                              <ExternalLink size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setResetLinkSent(false);
                                setAuthMode('signin');
                              }}
                              className="text-xs font-semibold text-primary/70 dark:text-gray-300 hover:underline pt-1"
                            >
                              Back to Sign In
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================= */}
                  {/* MODE D: SET NEW PASSWORD */}
                  {/* ========================================= */}
                  {authMode === 'reset' && (
                    <div className="space-y-5">
                      <div className="text-center space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
                          <Lock size={14} /> Security
                        </div>
                        <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary dark:text-white">
                          Create New Password
                        </h2>
                        <p className="text-xs text-primary/70 dark:text-gray-300 max-w-sm mx-auto">
                          Resetting password for: <strong className="text-primary dark:text-white">{resetEmail || 'Your Account'}</strong>
                        </p>
                      </div>

                      <form onSubmit={handleSaveNewPassword} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-1.5">
                            New Password <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/40 dark:text-gray-400">
                              <Lock size={16} />
                            </div>
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              required
                              placeholder="At least 6 characters"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full pl-10 pr-11 py-3 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-primary/50 dark:text-gray-400 hover:text-primary"
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>

                          {/* Password Strength Indicator */}
                          {newPassword && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden flex gap-1">
                                {[1, 2, 3].map((step) => (
                                  <div
                                    key={step}
                                    className={`flex-1 h-full rounded-full ${
                                      getPasswordStrength(newPassword).score >= step
                                        ? getPasswordStrength(newPassword).color
                                        : 'bg-gray-200 dark:bg-white/10'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] font-bold text-primary/60 dark:text-gray-400">
                                {getPasswordStrength(newPassword).label}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-primary dark:text-white uppercase tracking-wider mb-1.5">
                            Confirm New Password <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary/40 dark:text-gray-400">
                              <Lock size={16} />
                            </div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              placeholder="Re-type new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full pl-10 pr-11 py-3 rounded-xl border border-primary/15 dark:border-white/15 bg-white dark:bg-navy-light text-primary dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-primary/50 dark:text-gray-400 hover:text-primary"
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <span>Save New Password & Sign In</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>

                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('signin');
                              setErrorMessage(null);
                            }}
                            className="text-xs font-semibold text-primary/70 dark:text-gray-300 hover:text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <ArrowLeft size={13} /> Cancel & Back to Sign In
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        {/* Card Footer: Guest Shopping Link */}
        <div className="py-4 px-6 bg-primary/5 dark:bg-white/5 border-t border-primary/5 dark:border-white/5 text-center">
          <p className="text-xs text-primary/70 dark:text-gray-400">
            Looking to browse without an account?{' '}
            <button
              onClick={onNavigateToCollection}
              className="font-bold text-rose-500 hover:underline"
            >
              Continue as Guest & Explore Collections &rarr;
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
