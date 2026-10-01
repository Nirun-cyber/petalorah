/**
 * Google Drive Image Storage & Products Bridge for Petalorah
 *
 * Utilizes the Google Apps Script Web App to upload and store high-resolution
 * product, review, and gallery images directly in the store owner's Google Drive (15 GB Free),
 * returning permanent high-speed CDN URLs (https://lh3.googleusercontent.com/d/FILE_ID).
 */

import type { Product } from '../data/products';
import type { Review } from '../data/reviews';

export interface UploadImageResult {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
}

/**
 * Uploads a base64 image data URL to Google Drive via Google Apps Script Web App.
 */
export async function uploadImageToGoogleDrive(
  base64DataUrl: string,
  fileName: string,
  webhookUrl: string
): Promise<UploadImageResult> {
  if (!webhookUrl || !webhookUrl.includes('script.google.com')) {
    return {
      success: false,
      error: 'Google Apps Script Web App URL is not configured.',
    };
  }

  try {
    const payload = {
      action: 'uploadImage',
      base64: base64DataUrl,
      fileName: fileName || `petalorah_${Date.now()}.jpg`,
      folderName: 'Petalorah Store Images',
    };

    // Use text/plain to avoid CORS preflight OPTIONS request
    const response = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success' && data.url) {
      return {
        success: true,
        url: data.url,
        fileId: data.fileId,
      };
    }

    return {
      success: false,
      error: data.message || 'Failed to upload image to Google Drive.',
    };
  } catch (error: any) {
    console.error('Google Drive image upload error:', error);
    return {
      success: false,
      error: error?.message || 'Network error while uploading image.',
    };
  }
}

/**
 * Syncs the entire product catalog to the 'Products' tab in the Google Spreadsheet.
 */
export async function syncProductsToGoogleSheet(
  products: Product[],
  webhookUrl: string
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!webhookUrl || !webhookUrl.includes('script.google.com')) {
    return { success: false, count: 0, error: 'Apps Script URL not configured.' };
  }

  try {
    const payload = {
      action: 'saveProducts',
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        numericPrice: p.numericPrice,
        originalPrice: p.originalPrice || '',
        description: p.description || '',
        img: p.img || '',
        badge: p.badge || '',
        isBestSeller: Boolean(p.isBestSeller),
        isComingSoon: Boolean(p.isComingSoon),
      })),
    };

    const response = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.status === 'success') {
      return { success: true, count: products.length };
    }
    return { success: false, count: 0, error: data.message || 'Failed to save products to sheet.' };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Network error syncing products.' };
  }
}

/**
 * Fetches products from the 'Products' tab in Google Sheets.
 */
export async function fetchProductsFromGoogleSheet(
  webhookUrl: string
): Promise<{ products: Product[]; error?: string }> {
  if (!webhookUrl || !webhookUrl.includes('script.google.com')) {
    return { products: [], error: 'Apps Script URL not configured.' };
  }

  try {
    const url = `${webhookUrl.trim()}${webhookUrl.includes('?') ? '&' : '?'}action=getProducts&t=${Date.now()}`;
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.products)) {
      const mapped: Product[] = data.products.map((p: any) => ({
        id: String(p.id || `custom-${Date.now()}`),
        name: String(p.name || 'Handcrafted Product'),
        category: (p.category || 'keychain') as Product['category'],
        price: String(p.price || `₹${p.numericPrice || 50}`),
        numericPrice: Number(p.numericPrice || 50),
        originalPrice: p.originalPrice ? String(p.originalPrice) : undefined,
        description: String(p.description || ''),
        img: String(p.img || '/assets/products/rose.jpg'),
        badge: p.badge ? String(p.badge) : undefined,
        isBestSeller: Boolean(p.isBestSeller),
        isComingSoon: Boolean(p.isComingSoon),
      }));
      return { products: mapped };
    }

    return { products: [], error: data.message || 'No products found in sheet.' };
  } catch (err: any) {
    return { products: [], error: err.message || 'Network error fetching products from sheet.' };
  }
}

/**
 * Syncs the complete customer reviews list to the 'Reviews' tab in Google Sheets.
 */
export async function syncAllReviewsToGoogleSheet(
  reviews: Review[],
  webhookUrl: string
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!webhookUrl || !webhookUrl.includes('script.google.com')) {
    return { success: false, count: 0, error: 'Apps Script URL not configured.' };
  }

  try {
    const payload = {
      action: 'saveReviews',
      reviews: reviews.map((r) => ({
        id: r.id,
        date: r.date || '',
        customerName: r.customerName || 'Customer',
        city: r.city || '',
        rating: r.rating || 5,
        productName: r.productName || '',
        productId: r.productId || '',
        category: r.category || 'keychain',
        comment: r.comment || '',
        photo: r.photo || '',
        verifiedBuyer: Boolean(r.verifiedBuyer),
        helpfulCount: r.helpfulCount || 0,
      })),
    };

    const response = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      return { success: true, count: reviews.length };
    }
    return { success: false, count: 0, error: data.message || 'Failed to save reviews to sheet.' };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Network error syncing reviews.' };
  }
}

/**
 * Appends or updates a single review in the 'Reviews' tab of Google Sheets.
 */
export async function syncSingleReviewToGoogleSheet(
  review: Review,
  webhookUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.includes('script.google.com')) {
    return { success: false, error: 'Apps Script URL not configured.' };
  }

  try {
    const payload = {
      action: 'addReview',
      review: {
        id: review.id,
        date: review.date || 'Just now',
        customerName: review.customerName || 'Customer',
        city: review.city || '',
        rating: review.rating || 5,
        productName: review.productName || '',
        productId: review.productId || '',
        category: review.category || 'keychain',
        comment: review.comment || '',
        photo: review.photo || '',
        verifiedBuyer: Boolean(review.verifiedBuyer),
        helpfulCount: review.helpfulCount || 0,
      },
    };

    const response = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      return { success: true };
    }
    return { success: false, error: data.message || 'Failed to sync review.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error syncing single review.' };
  }
}

/**
 * Fetches all reviews from the 'Reviews' tab in Google Sheets.
 */
export async function fetchReviewsFromGoogleSheet(
  webhookUrl: string
): Promise<{ reviews: Review[]; error?: string }> {
  if (!webhookUrl || !webhookUrl.includes('script.google.com')) {
    return { reviews: [], error: 'Apps Script URL not configured.' };
  }

  try {
    const url = `${webhookUrl.trim()}${webhookUrl.includes('?') ? '&' : '?'}action=getReviews&t=${Date.now()}`;
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.reviews)) {
      const mapped: Review[] = data.reviews.map((r: any) => ({
        id: String(r.id || `rev-${Date.now()}`),
        customerName: String(r.customerName || 'Customer'),
        city: String(r.city || ''),
        rating: Number(r.rating || 5),
        date: String(r.date || 'Recently'),
        productName: String(r.productName || 'Handcrafted Item'),
        productId: r.productId ? String(r.productId) : undefined,
        category: (r.category || 'keychain') as Review['category'],
        comment: String(r.comment || ''),
        photo: r.photo ? String(r.photo) : undefined,
        verifiedBuyer: Boolean(r.verifiedBuyer),
        helpfulCount: Number(r.helpfulCount || 0),
      }));
      return { reviews: mapped };
    }

    return { reviews: [], error: data.message || 'No reviews found in sheet.' };
  } catch (err: any) {
    return { reviews: [], error: err.message || 'Network error fetching reviews from sheet.' };
  }
}
