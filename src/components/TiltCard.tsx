import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(30, 78, 156, 0.15)',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  React.useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Mouse positions relative to card boundaries
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animations for rotation and translate
  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    damping: 20,
    stiffness: 150,
  });
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    damping: 20,
    stiffness: 150,
  });

  // Spring values for mouse glow position
  const glowXSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']), {
    damping: 25,
    stiffness: 150,
  });
  const glowYSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']), {
    damping: 25,
    stiffness: 150,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    // Mouse coords normalized between -0.5 and 0.5
    const xVal = (e.clientX - left) / width - 0.5;
    const yVal = (e.clientY - top) / height - 0.5;

    mouseX.set(xVal);
    mouseY.set(yVal);
  };

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative rounded-2xl sm:rounded-3xl glass-card p-2 sm:p-4 md:p-6 overflow-hidden transition-shadow duration-500 select-none ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      } ${
        hovered ? 'shadow-2xl shadow-primary/5 border-primary/20 dark:border-secondary/20' : ''
      } ${className}`}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={hovered ? { y: -8, scale: 1.02 } : { y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Glossy reflection/glare sheet */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 z-10"
        style={{
          background: `radial-gradient(circle 200px at ${glowXSpring} ${glowYSpring}, rgba(255, 255, 255, 0.25), transparent 80%)`,
        }}
        animate={{ opacity: hovered ? 1 : 0 }}
      />

      {/* Glow aura */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-700 blur-2xl z-0"
        style={{
          background: `radial-gradient(circle 250px at ${glowXSpring} ${glowYSpring}, ${glowColor}, transparent 80%)`,
        }}
        animate={{ opacity: hovered ? 0.8 : 0 }}
      />

      {/* Card Contents with translation depth for 3D effect */}
      <div style={{ transform: 'translateZ(25px)', transformStyle: 'preserve-3d' }} className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};
