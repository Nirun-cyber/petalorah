/**
 * Google Drive Image Storage & Products Bridge for Petalorah
 *
 * Utilizes the Google Apps Script Web App to upload and store high-resolution
 * product, review, and gallery images directly in the store owner's Google Drive (15 GB Free),
 * returning permanent high-speed CDN URLs (https://lh3.googleusercontent.com/d/FILE_ID).
 */

import type { Product } from '../data/products';

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
