import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Portfolio } from './pages/Portfolio';
import { Keychains } from './pages/Keychains';
import { Preloader } from './components/Preloader';
import { PageTransition } from './components/PageTransition';
import { EasterEggs } from './components/EasterEggs';
import Lenis from 'lenis';

export const App: React.FC = () => {
  const [isPreloaderActive, setIsPreloaderActive] = useState(true);
  const [currentTab, setCurrentTab] = useState<'home' | 'portfolio' | 'keychains'>('home');
  const [isTransitionActive, setIsTransitionActive] = useState(false);
  const [targetTab, setTargetTab] = useState<'home' | 'portfolio' | 'keychains' | null>(null);
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage
    const saved = localStorage.getItem('petalorah-theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark theme
  });

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('petalorah-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('petalorah-theme', 'light');
    }
  }, [isDarkMode]);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    if (isPreloaderActive) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential curve
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
  }, [isPreloaderActive, currentTab]); // Re-initialize or sync on tab change

  // Custom Cursor dot & follower mechanics
  useEffect(() => {
    // Disable custom cursor on mobile touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      document.documentElement.classList.remove('no-cursor');
      return;
    }

    document.documentElement.classList.add('no-cursor');

    const dot = document.createElement('div');
    const follower = document.createElement('div');

    dot.className = 'cursor-dot';
    follower.className = 'cursor-follower';

    document.body.appendChild(dot);
    document.body.appendChild(follower);

    let followerX = 0;
    let followerY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
    };

    // Smooth lerping for cursor follower
    let frameId: number;
    const updateFollower = () => {
      followerX += (targetX - followerX) * 0.12;
      followerY += (targetY - followerY) * 0.12;
      follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
      frameId = requestAnimationFrame(updateFollower);
    };
    frameId = requestAnimationFrame(updateFollower);

    // Hover effect class additions
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.cursor-pointer') ||
        target.closest('.logo-click-target') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT'
      ) {
        document.body.classList.add('cursor-hover');
      } else {
        document.body.classList.remove('cursor-hover');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(frameId);
      dot.remove();
      follower.remove();
      document.documentElement.classList.remove('no-cursor');
    };
  }, []);

  // Trigger page change with cinematic petal transition
  const navigateToTab = (tab: 'home' | 'portfolio' | 'keychains') => {
    console.log("App: navigateToTab triggered with tab:", tab);
    if (tab === currentTab) return;
    setTargetTab(tab);
    setIsTransitionActive(true);
  };

  const handleTransitionComplete = () => {
    console.log("App: handleTransitionComplete triggered. targetTab =", targetTab);
    if (targetTab) {
      setCurrentTab(targetTab);
      // Reset scroll position to top instantly during transition peak
      window.scrollTo(0, 0);
      
      // Keep active transition showing for a brief split second, then fade out
      setTimeout(() => {
        setIsTransitionActive(false);
        setTargetTab(null);
      }, 100);
    }
  };

  return (
    <div className="relative w-full min-h-screen text-primary dark:text-gray-100 bg-white dark:bg-navy font-sans select-none">
      
      {/* Cinematic Preloader */}
      {isPreloaderActive && (
        <Preloader onComplete={() => setIsPreloaderActive(false)} />
      )}

      {/* Main Pages */}
      {!isPreloaderActive && (
        <main className="w-full">
          {currentTab === 'home' ? (
            <Home
              onNavigateToCollection={() => navigateToTab('portfolio')}
              onNavigateToKeychains={() => navigateToTab('keychains')}
              isDarkMode={isDarkMode}
              toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
          ) : currentTab === 'portfolio' ? (
            <Portfolio
              onNavigateHome={() => navigateToTab('home')}
              isDarkMode={isDarkMode}
              toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
          ) : (
            <Keychains
              onNavigateHome={() => navigateToTab('home')}
              isDarkMode={isDarkMode}
              toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
          )}
        </main>
      )}

      {/* Cinematic Transition curtains */}
      <PageTransition
        isActive={isTransitionActive}
        onTransitionComplete={handleTransitionComplete}
      />

      {/* Global Easter Eggs Hooks */}
      <EasterEggs />
    </div>
  );
};

export default App;
