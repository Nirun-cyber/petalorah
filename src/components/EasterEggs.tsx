import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ButterflyData {
  id: number;
  x: number;
  y: number;
  scale: number;
  delay: number;
  angle: number;
}

interface FlowerData {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export const EasterEggs: React.FC = () => {
  const logoClicksRef = useRef(0);
  const [showMessage, setShowMessage] = useState(false);
  const [butterflies, setButterflies] = useState<ButterflyData[]>([]);
  const [bloomingFlowers, setBloomingFlowers] = useState<FlowerData[]>([]);

  const spawnButterfliesAt = (clientX: number, clientY: number) => {
    const numButterflies = 10;
    const newButterflies = Array.from({ length: numButterflies }).map((_, i) => ({
      id: Date.now() + i,
      x: clientX + (Math.random() - 0.5) * 100,
      y: clientY + (Math.random() - 0.5) * 100,
      scale: Math.random() * 0.4 + 0.4,
      delay: Math.random() * 0.3,
      angle: Math.random() * 360,
    }));

    setButterflies((prev) => [...prev, ...newButterflies]);

    // Remove after 5 seconds
    setTimeout(() => {
      setButterflies((prev) => prev.filter((b) => !newButterflies.find((nb) => nb.id === b.id)));
    }, 5000);
  };

  const triggerBloomingFlowers = () => {
    const numFlowers = 18;
    const colors = ['#1E4E9C', '#A5C4F2', '#E6E6FA', '#FFFFF0', '#F5F2EB'];
    
    const newFlowers = Array.from({ length: numFlowers }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 40 + 30,
    }));

    setBloomingFlowers((prev) => [...prev, ...newFlowers]);

    // Remove after 4 seconds
    setTimeout(() => {
      setBloomingFlowers((prev) => prev.filter((f) => !newFlowers.find((nf) => nf.id === f.id)));
    }, 4000);
  };

  useEffect(() => {
    let lastTap = 0;

    // 1. Global Click Listener for Logo 5x Click & Footer credits click
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if clicked element or its ancestor has class 'logo-click-target'
      if (target.closest('.logo-click-target')) {
        logoClicksRef.current += 1;
        if (logoClicksRef.current >= 5) {
          triggerPetalRain();
          logoClicksRef.current = 0;
        }
      } else {
        logoClicksRef.current = 0;
      }

      // Allow mobile/desktop click on credit footer or heart to trigger blooming flowers
      if (target.closest('.footer-credit-trigger') || target.closest('.heart-bloom-trigger')) {
        triggerBloomingFlowers();
      }
    };

    // 2. Double Click Listener for Butterflies (Desktop)
    const handleDoubleClick = (e: MouseEvent) => {
      spawnButterfliesAt(e.clientX, e.clientY);
    };

    // 3. Double Tap Listener for Butterflies (Mobile)
    const handleTouchStart = (e: TouchEvent) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      if (now - lastTap < DOUBLE_TAP_DELAY) {
        const touch = e.touches[0];
        if (touch) {
          spawnButterfliesAt(touch.clientX, touch.clientY);
        }
      }
      lastTap = now;
    };

    // 4. 'P' Key Listener for Blooming Flowers (Desktop)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') {
        triggerBloomingFlowers();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('dblclick', handleDoubleClick);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const triggerPetalRain = () => {
    // Confetti rain with custom colors matching Petalorah theme
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#1E4E9C', '#A5C4F2', '#FFFFF0', '#E6E6FA'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#1E4E9C', '#A5C4F2', '#FFFFF0', '#E6E6FA'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4500);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      
      {/* 1. Logo Click Message Toast */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="absolute top-28 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-full glass-modal border border-primary/20 text-primary dark:text-secondary-light font-serif text-lg font-semibold tracking-wide shadow-2xl flex items-center gap-3 select-none pointer-events-auto"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <Sparkles size={18} className="animate-spin text-yellow-500 fill-current" />
            <span>✨ Thank you for supporting handmade art! ✨</span>
            <Sparkles size={18} className="animate-spin text-yellow-500 fill-current" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Double Click Extra Butterflies */}
      <AnimatePresence>
        {butterflies.map((b) => (
          <motion.div
            key={b.id}
            className="absolute w-8 h-8 pointer-events-none"
            style={{ left: b.x, top: b.y }}
            initial={{ scale: 0, rotate: b.angle, opacity: 1 }}
            animate={{
              scale: b.scale,
              y: -500, // fly upwards
              x: [0, 80, -80, 0], // wave flight
              opacity: [1, 1, 0.8, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 4.5,
              ease: 'easeInOut',
              delay: b.delay,
            }}
          >
            {/* Simple butterfly SVG shape */}
            <svg viewBox="0 0 24 24" className="w-full h-full text-primary dark:text-secondary-light fill-current drop-shadow-md">
              <path d="M12 2C10.5 2 9 3.5 9 5c0 1 .5 2 1.5 2.5C9.5 8.5 7 11 7 13c0 2 1.5 3 3 3c1.5 0 2-1 2-2s.5-2 2-2 2 1 2 2 1 2 2 2c1.5 0 3-1 3-3c0-2-2.5-4.5-3.5-5.5C14.5 7 15 6 15 5c0-1.5-1.5-3-3-3zm0 4c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 3. 'P' Key Blooming Flowers */}
      <AnimatePresence>
        {bloomingFlowers.map((f) => (
          <motion.div
            key={f.id}
            className="absolute pointer-events-none origin-bottom flex flex-col items-center"
            style={{
              left: f.x - f.size / 2,
              top: f.y - f.size / 2,
              width: f.size,
              height: f.size,
            }}
            initial={{ scale: 0, rotate: -45, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1],
              rotate: [0, 15, 0],
              opacity: [0, 0.95, 0.95, 0],
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              duration: 3.5,
              times: [0, 0.15, 0.85, 1],
              ease: 'easeOut',
            }}
          >
            {/* Simple stylized flower drawing */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Petals */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <path
                  key={angle}
                  d="M 50,50 C 35,20 65,20 50,50"
                  fill={f.color}
                  transform={`rotate(${angle} 50 50)`}
                  className="opacity-90"
                />
              ))}
              {/* Center */}
              <circle cx="50" cy="50" r="12" fill="#FFFFF0" stroke={f.color} strokeWidth="3" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

    </div>
  );
};
