import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0); // 0: Draw P, 1: Stem grows, 2: Bloom, 3: Glow & Fly, 4: Fade Out
  const [petals, setPetals] = useState<Array<{ id: number; x: number; y: number; rotate: number; scale: number; delay: number }>>([]);

  useEffect(() => {
    // Generate flying petals
    const tempPetals = Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24 + (Math.random() * 15 - 7.5);
      const rad = (angle * Math.PI) / 180;
      const distance = 250 + Math.random() * 150;
      return {
        id: i,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance - 50, // offset upward to match flower center
        rotate: Math.random() * 720 - 360,
        scale: Math.random() * 0.6 + 0.4,
        delay: 2.6 + Math.random() * 0.5,
      };
    });
    setPetals(tempPetals);

    // Sequence timelines (Reduced total duration from 7.2s to 4.0s)
    const timer1 = setTimeout(() => setStage(1), 1000); // start stem
    const timer2 = setTimeout(() => setStage(2), 1800); // start bloom
    const timer3 = setTimeout(() => setStage(3), 2600); // start glow & flying petals
    const timer4 = setTimeout(() => setStage(4), 3400); // fade out
    const timer5 = setTimeout(onComplete, 4000); // complete

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  // Sparkles configuration
  const sparkles = [
    { top: '35%', left: '38%', delay: 1.5, size: 14 },
    { top: '48%', left: '62%', delay: 2.2, size: 10 },
    { top: '22%', left: '55%', delay: 1.8, size: 12 },
    { top: '65%', left: '42%', delay: 2.8, size: 8 },
    { top: '30%', left: '66%', delay: 2.5, size: 16 },
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={stage === 4 ? { opacity: 0, scale: 1.08, filter: 'blur(10px)' } : { opacity: 1 }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="relative w-[90vw] h-[90vw] max-w-[450px] max-h-[450px] flex items-center justify-center">
        {/* Sparkles */}
        {stage >= 1 &&
          sparkles.map((sp, idx) => (
            <motion.svg
              key={idx}
              viewBox="0 0 24 24"
              className="absolute text-primary-light pointer-events-none fill-current"
              style={{
                top: sp.top,
                left: sp.left,
                width: sp.size,
                height: sp.size,
              }}
              initial={{ scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                scale: [0, 1, 0.8, 1, 0],
                opacity: [0, 1, 0.8, 1, 0],
                rotate: [0, 45, 90, 135, 180],
              }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
                delay: sp.delay,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
            </motion.svg>
          ))}

        {/* Cinematic Flower Logo SVG */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full relative z-10"
        >
          {/* Main Logo 'P' Outline */}
          <motion.path
            d="M 140,280 L 140,110 C 140,110 140,90 160,90 C 180,90 240,90 240,145 C 240,200 180,200 140,200"
            stroke="#1E4E9C"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
          />
          {/* Decorative Serif foot for the 'P' */}
          <motion.path
            d="M 115,280 L 165,280"
            stroke="#1E4E9C"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={stage >= 0 ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
          />

          {/* Growing Pipe Cleaner Stem */}
          {stage >= 1 && (
            <motion.path
              d="M 140,200 C 140,200 110,210 110,235 C 110,265 145,265 155,235 C 160,220 160,195 180,180 C 200,165 210,175 220,160 C 225,150 220,135 235,120"
              stroke="#2e7d32" // stem green
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
            />
          )}

          {/* Blooming Flower at the end of the stem (x: 235, y: 120) */}
          {stage >= 2 && (
            <g transform="translate(235, 120)">
              {/* Stem Connection Calyx */}
              <motion.path
                d="M -6,0 C -6,6 6,6 6,0 Z"
                fill="#2e7d32"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Individual Petals Blooming */}
              {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
                <motion.path
                  key={idx}
                  d="M 0,0 C -12,-25 -6,-45 0,-50 C 6,-45 12,-25 0,0"
                  fill="#1E4E9C"
                  className="origin-bottom opacity-90"
                  style={{ transformOrigin: '0px 0px' }}
                  initial={{ scale: 0, rotate: angle }}
                  animate={{ scale: 1, rotate: angle }}
                  transition={{
                    duration: 0.6,
                    ease: [0.34, 1.56, 0.64, 1], // elastic overshoot look
                    delay: idx * 0.05,
                  }}
                />
              ))}

              {/* Center pistil / core */}
              <motion.circle
                cx="0"
                cy="0"
                r="7"
                fill="#FFFFF0" // Ivory core
                stroke="#1E4E9C"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              />
            </g>
          )}

          {/* Glowing Aura Effect around Logo */}
          {stage >= 3 && (
            <motion.circle
              cx="190"
              cy="180"
              r="150"
              stroke="rgba(30, 78, 156, 0.15)"
              strokeWidth="30"
              fill="none"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0, 0.8, 0] }}
              transition={{ duration: 2.2, ease: 'easeOut', repeat: Infinity }}
            />
          )}
        </svg>

        {/* Flying Petals Bursting */}
        <AnimatePresence>
          {stage >= 3 &&
            petals.map((petal) => (
              <motion.div
                key={petal.id}
                className="absolute w-4 h-6 bg-primary/80 dark:bg-secondary/80 rounded-full"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 35%, 80% 100%, 20% 100%, 0% 35%)',
                  left: '58.75%',
                  top: '30%', // match approximate center of flower (235, 120) relative to container
                }}
                initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                animate={{
                  x: petal.x,
                  y: petal.y,
                  scale: petal.scale,
                  rotate: petal.rotate,
                  opacity: [1, 1, 0.8, 0],
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.25, 1, 0.5, 1],
                  delay: petal.delay - 2.6, // normalize delay
                }}
              />
            ))}
        </AnimatePresence>
      </div>

      {/* Brand Text */}
      <div className="absolute bottom-20 flex flex-col items-center">
        <motion.h2
          className="font-serif text-3xl font-semibold tracking-wider text-primary text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          PETALORAH
        </motion.h2>
        <motion.p
          className="text-sm uppercase tracking-[0.25em] text-gray-400 mt-2 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Handmade With Love
        </motion.p>
      </div>

      {/* Floating progress text or tagline */}
      <motion.p
        className="absolute bottom-10 text-xs text-gray-300 font-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0], y: [0, -5, -10] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        Crafting magic...
      </motion.p>
    </motion.div>
  );
};
