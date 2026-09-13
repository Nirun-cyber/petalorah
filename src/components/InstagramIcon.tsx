import React, { useId } from 'react';

interface InstagramIconProps {
  size?: number | string;
  className?: string;
  variant?: 'color' | 'current' | 'white';
}

/**
 * Authentic Instagram brand vector icon.
 * Features official Meta Instagram glyph with standard brand gradient or fill options.
 */
export const InstagramIcon: React.FC<InstagramIconProps> = ({
  size = 18,
  className = '',
  variant = 'color',
}) => {
  const gradientId = useId();
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  if (variant === 'current' || variant === 'white') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={pixelSize}
        height={pixelSize}
        className={`shrink-0 inline-block fill-current ${className}`}
        style={variant === 'white' ? { fill: '#FFFFFF' } : undefined}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }

  // Official Colorful Instagram Badge (Gradient + White Camera)
  return (
    <svg
      viewBox="0 0 24 24"
      width={pixelSize}
      height={pixelSize}
      className={`shrink-0 inline-block overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${gradientId}-radial`} cx="20%" cy="115%" r="125%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      {/* Official Rounded Square with Instagram Gradient */}
      <rect
        x="1.5"
        y="1.5"
        width="21"
        height="21"
        rx="6"
        fill={`url(#${gradientId}-radial)`}
      />
      {/* White camera outline */}
      <rect
        x="5.5"
        y="5.5"
        width="13"
        height="13"
        rx="3.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Center lens circle */}
      <circle
        cx="12"
        cy="12"
        r="3.2"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Top right flash dot */}
      <circle
        cx="15.8"
        cy="8.2"
        r="0.9"
        fill="#FFFFFF"
      />
    </svg>
  );
};

export default InstagramIcon;
