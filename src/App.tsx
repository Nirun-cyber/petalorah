import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Portfolio } from './pages/Portfolio';
import { Keychains } from './pages/Keychains';
import { TableTops } from './pages/TableTops';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { CartToast } from './components/CartToast';
import { ClipboardFallbackModal } from './components/ClipboardFallbackModal';
import Lenis from 'lenis';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'portfolio' | 'keychains' | 'tabletops'>('home');
  
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

  const handleNavigate = (tab: 'home' | 'portfolio' | 'keychains' | 'tabletops' | 'custom') => {
    if (tab === 'custom') {
      setCurrentTab('portfolio');
    } else {
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CartProvider>
      <div className="relative w-full min-h-screen flex flex-col justify-between text-primary dark:text-gray-100 bg-white dark:bg-navy font-sans antialiased selection:bg-pink-500/20">
        
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          onNavigate={handleNavigate}
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
        </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />

        {/* Cart Drawer & Modals */}
        <CartDrawer />
        <CartToast />
        <ClipboardFallbackModal />
      </div>
    </CartProvider>
  );
};

export default App;
