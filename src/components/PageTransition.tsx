import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  isActive: boolean;
  onTransitionComplete: () => void;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  isActive,
  onTransitionComplete,
}) => {
  // Config for flying petals during transition
  const transitionPetals = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    yStart: 10 + Math.random() * 80, // % from top
    delay: Math.random() * 0.4,
    size: 20 + Math.random() * 30,
    speed: 0.8 + Math.random() * 0.6,
  }));

  // Curtains config
  const curtainVariants = {
    initial: {
      y: '-100%',
    },
    animate: {
      y: '0%',
      transition: {
        duration: 0.6,
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      },
    },
    exit: {
      y: '100%',
      transition: {
        duration: 0.6,
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div className={`fixed inset-0 z-[9990] flex ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <AnimatePresence>
        {isActive && (
          <div className="absolute inset-0 flex pointer-events-auto">
            {/* Staggered sweeping columns */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-full flex-1 bg-gradient-to-b from-primary to-primary-dark"
                style={{
                  borderRadius: '0',
                  zIndex: 9991 + i,
                }}
                variants={curtainVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  delay: i * 0.08,
                  duration: 0.6,
                  ease: [0.76, 0, 0.24, 1],
                }}
                onAnimationComplete={(definition: any) => {
                  // Trigger tab page change exactly when the final column (index 4) covers the screen
                  if (definition === 'animate' && i === 4) {
                    onTransitionComplete();
                  }
                }}
              />
            ))}

            {/* Full screen blur overlay */}
            <motion.div
              className="absolute inset-0 bg-white/20 dark:bg-black/10 z-[9990] pointer-events-none"
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.5 }}
            />

            {/* Flying Petals Sweeping Left-to-Right */}
            <div className="absolute inset-0 z-[9995] overflow-hidden pointer-events-none">
              {transitionPetals.map((petal) => (
                <motion.div
                  key={petal.id}
                  className="absolute bg-white/90 dark:bg-secondary-light/90 rounded-full"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 35%, 80% 100%, 20% 100%, 0% 35%)',
                    width: petal.size,
                    height: petal.size * 1.5,
                    top: `${petal.yStart}%`,
                    left: '-10%',
                  }}
                  initial={{ x: '-10%', rotate: 0, scale: 0.8 }}
                  animate={{
                    x: '120vw',
                    y: ['0px', '50px', '-50px', '0px'],
                    rotate: 360 * petal.speed,
                    scale: [0.8, 1.2, 1, 0.8],
                  }}
                  transition={{
                    duration: petal.speed * 1.2,
                    delay: petal.delay,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
