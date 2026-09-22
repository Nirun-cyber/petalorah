/**
 * Background preloader for key storefront images.
 * Runs during browser idle time so it never contends with critical render path.
 */
export const preloadKeyImages = (imageUrls: string[]) => {
  if (typeof window === 'undefined') return;

  const preloadNext = (urls: string[], index = 0) => {
    if (index >= urls.length) return;
    const url = urls[index];
    const webpUrl = url.startsWith('/assets/') && !url.endsWith('.webp')
      ? url.replace(/\.(jpe?g|png)$/i, '.webp')
      : url;

    const img = new Image();
    img.decoding = 'async';
    img.src = webpUrl;
    img.onload = img.onerror = () => {
      // Small tick between requests to prevent network congestion
      setTimeout(() => preloadNext(urls, index + 1), 40);
    };
  };

  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
      preloadNext(imageUrls);
    });
  } else {
    setTimeout(() => preloadNext(imageUrls), 300);
  }
};
