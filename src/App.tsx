import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Portfolio } from './pages/Portfolio';
import { Keychains } from './pages/Keychains';
import { TableTops } from './pages/TableTops';
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
import { CartDrawer } from './components/CartDrawer';
import { MobileStickyCart } from './components/MobileStickyCart';
import { CartToast } from './components/CartToast';
import { ClipboardFallbackModal } from './components/ClipboardFallbackModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import Lenis from 'lenis';

const getTabFromPath = (): 'home' | 'portfolio' | 'keychains' | 'tabletops' | 'admin' | 'login' => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('admin')) return 'admin';
  if (path.includes('login')) return 'login';
  if (path.includes('keychains')) return 'keychains';
  if (path.includes('tabletops')) return 'tabletops';
  if (path.includes('portfolio')) return 'portfolio';
  return 'home';
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'portfolio' | 'keychains' | 'tabletops' | 'admin' | 'login'>(getTabFromPath);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Sync tab with browser URL history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getTabFromPath());
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

  const handleNavigate = (tab: 'home' | 'portfolio' | 'keychains' | 'tabletops' | 'custom' | 'admin' | 'login') => {
    const targetTab = tab === 'custom' ? 'portfolio' : tab;
    setCurrentTab(targetTab);
    const newPath = targetTab === 'home' ? '/' : `/${targetTab}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
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
                        onNavigateToCollection={() => handleNavigate('portfolio')}
                        onNavigateToKeychains={() => handleNavigate('keychains')}
                        onNavigateToTableTops={() => handleNavigate('tabletops')}
                        onOpenTracking={() => setIsTrackingModalOpen(true)}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={() => {}}
                      />
                    )}
                    {currentTab === 'portfolio' && (
                      <Portfolio
                        onNavigateHome={() => handleNavigate('home')}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={() => {}}
                      />
                    )}
                    {currentTab === 'keychains' && (
                      <Keychains
                        onNavigateHome={() => handleNavigate('home')}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={() => {}}
                      />
                    )}
                    {currentTab === 'tabletops' && (
                      <TableTops
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
                        onNavigateToCollection={() => handleNavigate('portfolio')}
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
              </ReviewProvider>
            </AuthProvider>
          </CartProvider>
        </OrderProvider>
      </ProductProvider>
    </SettingsProvider>
  );
};

export default App;
