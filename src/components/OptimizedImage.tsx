import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  priority = false,
  fallbackSrc = '/assets/products/rose.webp',
  onError,
  onLoad,
  ...rest
}) => {
  // Resolve optimal initial format: prefer .webp for local /assets/ if available
  const getInitialSrc = (inputSrc: string) => {
    if (inputSrc && inputSrc.startsWith('/assets/') && !inputSrc.endsWith('.webp')) {
      return inputSrc.replace(/\.(jpe?g|png)$/i, '.webp');
    }
    return inputSrc || fallbackSrc;
  };

  const [currentSrc, setCurrentSrc] = useState<string>(() => getInitialSrc(src));

  useEffect(() => {
    setCurrentSrc(getInitialSrc(src));
  }, [src]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // If the .webp version fails, fallback to the original jpg/png path
    if (currentSrc.endsWith('.webp') && src && !src.endsWith('.webp')) {
      setCurrentSrc(src);
      return;
    }
    // If original also fails or error persists, fallback to default fallbackSrc
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    if (onError) onError(e);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gray-100/50 dark:bg-navy-light/30 ${containerClassName}`}>
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={onLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover ${className}`}
        {...rest}
      />
    </div>
  );
};

export default OptimizedImage;
