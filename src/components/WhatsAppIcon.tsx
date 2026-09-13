import React from 'react';

interface WhatsAppIconProps {
  size?: number | string;
  className?: string;
  variant?: 'color' | 'white' | 'current';
}

/**
 * Authentic WhatsApp brand vector icon.
 * Features the official green speech bubble (#25D366) and white phone handset.
 */
export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  size = 20,
  className = '',
  variant = 'color',
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  if (variant === 'current') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={pixelSize}
        height={pixelSize}
        className={`shrink-0 inline-block fill-current ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.01 2.002c-5.523 0-10 4.477-10 10 0 1.765.458 3.424 1.259 4.873L2 22.002l5.247-1.222a9.96 9.96 0 0 0 4.763 1.222c5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10zm5.495 14.288c-.228.64-1.328 1.228-1.848 1.306-.48.073-1.07.103-1.728-.106-.4-.125-.91-.295-1.565-.579-2.75-1.183-4.54-3.953-4.678-4.137-.138-.184-1.12-1.488-1.12-2.84 0-1.351.705-2.016.955-2.285.25-.269.548-.337.73-.337.183 0 .365.002.525.01.17.009.398-.064.622.474.23.55.78 1.897.848 2.036.069.138.115.301.023.483-.092.183-.138.297-.275.457-.137.16-.29.356-.414.478-.137.137-.28.286-.12.56.16.275.71 1.17 1.523 1.892 1.046.929 1.928 1.216 2.203 1.353.275.137.435.114.595-.069.16-.183.687-.799.87-1.074.183-.274.366-.228.618-.137.252.091 1.597.753 1.871.89.275.138.457.206.526.32.07.115.07.665-.158 1.305z"
        />
      </svg>
    );
  }

  // Official WhatsApp Brand Colors
  const bubbleColor = variant === 'white' ? '#FFFFFF' : '#25D366';
  const handsetColor = variant === 'white' ? '#25D366' : '#FFFFFF';

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
      {/* WhatsApp Speech Bubble */}
      <path
        d="M12.01 2.002c-5.523 0-10 4.477-10 10 0 1.765.458 3.424 1.259 4.873L2 22.002l5.247-1.222a9.96 9.96 0 0 0 4.763 1.222c5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10z"
        fill={bubbleColor}
      />
      {/* Handset inside */}
      <path
        d="M17.505 16.29c-.228.64-1.328 1.228-1.848 1.306-.48.073-1.07.103-1.728-.106-.4-.125-.91-.295-1.565-.579-2.75-1.183-4.54-3.953-4.678-4.137-.138-.184-1.12-1.488-1.12-2.84 0-1.351.705-2.016.955-2.285.25-.269.548-.337.73-.337.183 0 .365.002.525.01.17.009.398-.064.622.474.23.55.78 1.897.848 2.036.069.138.115.301.023.483-.092.183-.138.297-.275.457-.137.16-.29.356-.414.478-.137.137-.28.286-.12.56.16.275.71 1.17 1.523 1.892 1.046.929 1.928 1.216 2.203 1.353.275.137.435.114.595-.069.16-.183.687-.799.87-1.074.183-.274.366-.228.618-.137.252.091 1.597.753 1.871.89.275.138.457.206.526.32.07.115.07.665-.158 1.305z"
        fill={handsetColor}
      />
    </svg>
  );
};

export default WhatsAppIcon;
