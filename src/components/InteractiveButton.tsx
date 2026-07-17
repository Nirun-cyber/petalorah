import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'glass';
  disabled?: boolean;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [hovered, setHovered] = useState(false);

  // Motion values for magnetic effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for elastic pull back
  const springConfig = { damping: 15, elastic: 0.6, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Position relative to button center
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Magnetic pull (max 25px offset)
    const pullX = (clientX - centerX) * 0.35;
    const pullY = (clientY - centerY) * 0.35;
    
    x.set(pullX);
    y.set(pullY);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Safely check coordinates for touch devices or keyboard triggers
    const clientX = e.clientX || 0;
    const clientY = e.clientY || 0;
    
    const clickX = clientX !== 0 ? clientX - left : width / 2;
    const clickY = clientY !== 0 ? clientY - top : height / 2;

    // Spawn a ripple
    const newRipple = {
      id: Date.now(),
      x: clickX,
      y: clickY,
    };
    setRipples((prev) => [...prev, newRipple]);
    
    // Clean up ripple
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);

    if (onClick) onClick();
  };

  // Build variant classes
  let baseClass = 'relative overflow-hidden font-medium rounded-full px-5 py-2.5 sm:px-8 sm:py-3.5 transition-all duration-300 text-sm tracking-wide z-10 ';
  
  if (disabled) {
    baseClass += 'bg-black/5 dark:bg-white/5 text-primary/35 dark:text-white/25 border border-black/10 dark:border-white/10 cursor-not-allowed pointer-events-none';
  } else {
    if (variant === 'primary') {
      baseClass += 'bg-primary text-white shadow-lg hover:shadow-primary/30 hover:bg-primary-light';
    } else if (variant === 'secondary') {
      baseClass += 'bg-secondary text-primary hover:bg-secondary-light border border-primary/10 shadow-sm';
    } else if (variant === 'glass') {
      baseClass += 'glass-card text-primary dark:text-secondary-light hover:bg-white/60 dark:hover:bg-navy-light/60';
    }
  }

  return (
    <motion.button
      ref={ref}
      className={`${baseClass} ${className}`}
      onMouseMove={disabled ? undefined : handleMouseMove}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={disabled ? undefined : handleClick}
      style={{ x: disabled ? 0 : springX, y: disabled ? 0 : springY }}
      whileTap={disabled ? {} : { scale: 0.94 }} // Elastic click
      disabled={disabled}
    >
      {/* Dynamic Glow Background */}
      <span
        className={`absolute inset-0 bg-white/20 blur-md rounded-full pointer-events-none transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Ripple elements */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 animate-ping pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: r.x,
            top: r.y,
            width: 160,
            height: 160,
            animationDuration: '0.8s',
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
