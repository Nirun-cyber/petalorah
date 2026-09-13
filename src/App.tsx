import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Portfolio } from './pages/Portfolio';
import { Admin } from './pages/Admin';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AnnouncementBar } from './components/AnnouncementBar';
import { SettingsProvider } from './context/SettingsContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ReviewProvider } from './context/ReviewContext';
import { GalleryProvider } from './context/GalleryContext';
import { CartDrawer } from './components/CartDrawer';
import { MobileStickyCart } from './components/MobileStickyCart';
import { CartToast } from './components/CartToast';
import { ClipboardFallbackModal } from './components/ClipboardFallbackModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import Lenis from 'lenis';

const getTabFromPath = (): 'home' | 'about' | 'shop' | 'portfolio' | 'keychains' | 'tabletops' | 'bouquets' | 'admin' | 'login' => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('admin')) return 'admin';
  if (path.includes('login')) return 'login';
  if (path.includes('about')) return 'about';
  if (path.includes('keychains') || path.includes('tabletops') || path.includes('bouquets') || path.includes('shop') || path.includes('portfolio')) {
    return 'shop';
  }
  return 'home';
};

const getCategoryFromPath = (): 'all' | 'keychain' | 'tabletop' | 'bouquet' | 'custom' => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('keychain')) return 'keychain';
  if (path.includes('tabletop')) return 'tabletop';
  if (path.includes('bouquet')) return 'bouquet';
  if (path.includes('custom')) return 'custom';
  return 'all';
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'about' | 'shop' | 'portfolio' | 'keychains' | 'tabletops' | 'bouquets' | 'admin' | 'login'>(getTabFromPath);
  const [shopCategory, setShopCategory] = useState<'all' | 'keychain' | 'tabletop' | 'bouquet' | 'custom'>(getCategoryFromPath);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Sync tab with browser URL history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getTabFromPath());
      setShopCategory(getCategoryFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Light Mode Only (Locked)
  const isDarkMode = false;

  // Always force Light Mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    localStorage.setItem('petalorah-theme', 'light');
  }, []);

  // Initialize Smooth Scrolling (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });

    let animationFrameId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, [currentTab]);

  const handleNavigate = (tab: 'home' | 'about' | 'shop' | 'portfolio' | 'keychains' | 'tabletops' | 'bouquets' | 'custom' | 'admin' | 'login') => {
    if (tab === 'keychains') {
      setShopCategory('keychain');
      setCurrentTab('shop');
      if (window.location.pathname !== '/shop') window.history.pushState({}, '', '/shop');
    } else if (tab === 'tabletops') {
      setShopCategory('tabletop');
      setCurrentTab('shop');
      if (window.location.pathname !== '/shop') window.history.pushState({}, '', '/shop');
    } else if (tab === 'bouquets') {
      setShopCategory('bouquet');
      setCurrentTab('shop');
      if (window.location.pathname !== '/shop') window.history.pushState({}, '', '/shop');
    } else if (tab === 'custom') {
      setShopCategory('custom');
      setCurrentTab('shop');
      if (window.location.pathname !== '/shop') window.history.pushState({}, '', '/shop');
    } else if (tab === 'shop' || tab === 'portfolio') {
      setShopCategory('all');
      setCurrentTab('shop');
      if (window.location.pathname !== '/shop') window.history.pushState({}, '', '/shop');
    } else {
      setCurrentTab(tab);
      const newPath = tab === 'home' ? '/' : `/${tab}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <SettingsProvider>
      <ProductProvider>
        <OrderProvider>
          <CartProvider>
            <AuthProvider>
              <ReviewProvider>
                <GalleryProvider>
                  <div className="relative w-full min-h-screen flex flex-col justify-between text-primary dark:text-gray-100 bg-white dark:bg-navy font-sans antialiased selection:bg-pink-500/20">
                  {/* Announcement Banner Ticker */}
                  <AnnouncementBar />

                  {/* Top Navbar */}
                  <Navbar
                    currentTab={currentTab}
                    onNavigate={handleNavigate}
                    onOpenTracking={() => setIsTrackingModalOpen(true)}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={() => {}}
                  />

                  {/* Main Content Area */}
                  <main className="flex-grow w-full">
                    {currentTab === 'home' && (
                      <Home
                        onNavigateToCollection={() => handleNavigate('shop')}
                        onNavigateToKeychains={() => handleNavigate('keychains')}
                        onNavigateToTableTops={() => handleNavigate('tabletops')}
                        onNavigateToAbout={() => handleNavigate('about')}
                        onOpenTracking={() => setIsTrackingModalOpen(true)}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={() => {}}
                      />
                    )}
                    {currentTab === 'about' && (
                      <About
                        onNavigateHome={() => handleNavigate('home')}
                        onNavigateToShop={() => handleNavigate('shop')}
                        onNavigateToKeychains={() => handleNavigate('keychains')}
                        onNavigateToTableTops={() => handleNavigate('tabletops')}
                        onNavigateToBouquets={() => handleNavigate('bouquets')}
                      />
                    )}
                    {(currentTab === 'shop' || currentTab === 'portfolio' || currentTab === 'keychains' || currentTab === 'tabletops' || currentTab === 'bouquets') && (
                      <Portfolio
                        key={shopCategory}
                        initialCategory={shopCategory}
                        onNavigateHome={() => handleNavigate('home')}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={() => {}}
                      />
                    )}
                    {currentTab === 'admin' && (
                      <Admin onNavigateHome={() => handleNavigate('home')} />
                    )}
                    {currentTab === 'login' && (
                      <LoginPage
                        onNavigateHome={() => handleNavigate('home')}
                        onNavigateToAdmin={() => handleNavigate('admin')}
                        onNavigateToCollection={() => handleNavigate('shop')}
                      />
                    )}
                  </main>

                  {/* Footer */}
                  <Footer
                    onNavigate={handleNavigate}
                    onOpenTracking={() => setIsTrackingModalOpen(true)}
                  />

                  {/* Cart Drawer & Modals */}
                  <CartDrawer onNavigateToLogin={() => handleNavigate('login')} />
                  <MobileStickyCart />
                  <CartToast />
                  <ClipboardFallbackModal />
                  <OrderTrackingModal
                    isOpen={isTrackingModalOpen}
                    onClose={() => setIsTrackingModalOpen(false)}
                  />
                </div>
                </GalleryProvider>
              </ReviewProvider>
            </AuthProvider>
          </CartProvider>
        </OrderProvider>
      </ProductProvider>
    </SettingsProvider>
  );
};

export default App;
