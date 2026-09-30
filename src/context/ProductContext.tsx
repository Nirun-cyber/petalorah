import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ALL_PRODUCTS, type Product, DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE } from '../data/products';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SYSTEM_CONFIG_CATEGORY, CLOUD_KEYS } from '../lib/cloudStore';
import { syncProductsToGoogleSheet, fetchProductsFromGoogleSheet } from '../lib/googleDriveStorage';

const getGoogleSheetUrl = (): string => {
  try {
    const saved = localStorage.getItem('petalorah_site_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.googleSheetWebhookUrl) {
        return parsed.googleSheetWebhookUrl.trim();
      }
    }
  } catch (e) {
    // ignore
  }
  return (import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string) || '';
};

interface ProductContextType {
  products: Product[];
  isCloudSynced: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleBestSeller: (id: string) => void;
  toggleComingSoon: (id: string) => void;
  resetToDefaultProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  forceRefreshProducts: () => Promise<void>;
  importProducts: (newProducts: Product[]) => boolean;
}

const PRODUCTS_STORAGE_KEY = 'petalorah_dynamic_products';

const isSystemConfigRecord = (id: string, category?: string) => {
  return (
    category === SYSTEM_CONFIG_CATEGORY ||
    id.startsWith('__cloud_meta_') ||
    id.startsWith('__config_') ||
    Object.values(CLOUD_KEYS).includes(id as any)
  );
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ALLOWED_BADGES = ['New', 'Best Seller', 'Limited'];
          const valid = parsed
            .filter((p: Product) => p && p.id && !isSystemConfigRecord(p.id, p.category))
            .map((p: Product) => {
              let updated = { ...p };
              if (!updated.badge) updated.badge = '';
              if (!updated.name) updated.name = 'Handcrafted Item';
              if (!updated.category) updated.category = 'keychain';
              if (
                updated.description &&
                !updated.description.includes('Size:') &&
                !updated.description.includes('Material:')
              ) {
                updated.description = DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE;
              }
              if (updated.badge && !ALLOWED_BADGES.includes(updated.badge)) {
                updated.badge = '';
              }
              return updated;
            });
          if (valid.length > 0) {
            return valid;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load products from localStorage:', e);
    }
    return ALL_PRODUCTS;
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(isSupabaseConfigured);

  const fetchProductsFromCloud = useCallback(async () => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .neq('category', SYSTEM_CONFIG_CATEGORY)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Product[] = data
          .filter((item) => !isSystemConfigRecord(item.id, item.category))
          .map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            numericPrice: Number(item.numeric_price || item.numericPrice || 50),
            originalPrice: item.original_price || item.originalPrice,
            category: item.category,
            description: item.description,
            img: item.img,
            badge: item.badge,
            isBestSeller: item.is_best_seller ?? item.isBestSeller,
            isComingSoon: item.is_coming_soon ?? item.isComingSoon,
          }));
        setProducts(mapped);
        setIsCloudSynced(true);
      } else if (data && data.length === 0) {
        // Seed cloud database with initial default products
        setIsCloudSynced(true);
        const initialPayload = ALL_PRODUCTS.map((prod) => ({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          numeric_price: prod.numericPrice,
          original_price: prod.originalPrice,
          category: prod.category,
          description: prod.description,
          img: prod.img,
          badge: prod.badge,
          is_best_seller: prod.isBestSeller,
          is_coming_soon: prod.isComingSoon,
        }));
        await client.from('products').upsert(initialPayload);
      }
    } catch (err) {
      console.warn('Supabase product fetch fallback to local:', err);
    }
  }, []);

  // Sync with Supabase Cloud Database if configured
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    fetchProductsFromCloud();

    // Subscribe to real-time changes
    const channel = client
      .channel('public:products:storefront')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        const changedId = (payload.new as any)?.id || (payload.old as any)?.id;
        const changedCat = (payload.new as any)?.category || (payload.old as any)?.category;
        if (!isSystemConfigRecord(changedId || '', changedCat)) {
          fetchProductsFromCloud();
        }
      })
      .subscribe();

    // Auto-refresh on window focus & tab visibility change (critical for mobile & background tabs)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProductsFromCloud();
      }
    };
    const onFocus = () => {
      fetchProductsFromCloud();
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    // Periodic background sync every 25 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchProductsFromCloud();
      }
    }, 25000);

    return () => {
      client.removeChannel(channel);
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [fetchProductsFromCloud]);

  // Auto-fetch products from Google Sheets (Free Cloud Database)
  useEffect(() => {
    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      fetchProductsFromGoogleSheet(sheetUrl)
        .then((res) => {
          if (res.products && res.products.length > 0) {
            setProducts(res.products);
            setIsCloudSynced(true);
          } else if (res.products && res.products.length === 0) {
            // Google Sheet is empty! Automatically seed it with ALL_PRODUCTS
            syncProductsToGoogleSheet(ALL_PRODUCTS, sheetUrl).catch((err) =>
              console.warn('Auto-seed to Google Sheets failed:', err)
            );
          }
        })
        .catch((e) => {
          console.warn('Google Sheets products fetch warning:', e);
        });
    }
  }, []);

  // Save to localStorage as local offline fallback (never save empty array)
  useEffect(() => {
    if (!products || products.length === 0) return;
    try {
      const cleanProducts = products.filter((p) => p && p.id && !isSystemConfigRecord(p.id, p.category));
      if (cleanProducts.length === 0) return;
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(cleanProducts));
    } catch (e) {
      console.warn('Failed to save products to localStorage, attempting compact save:', e);
      try {
        const compact = products
          .filter((p) => p && p.id && !isSystemConfigRecord(p.id, p.category))
          .map((p) => ({
            ...p,
            img: p.img?.startsWith('data:') && p.img.length > 5000 ? '/assets/products/rose.jpg' : p.img,
          }));
        if (compact.length > 0) {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(compact));
        }
      } catch (innerErr) {
        console.warn('LocalStorage quota limit reached, products preserved in memory:', innerErr);
      }
    }
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newProduct: Product = {
      ...productData,
      id,
    };

    const updated = [newProduct, ...products];
    setProducts(updated);

    // Auto-sync to Google Sheets (Free Cloud Database)
    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncProductsToGoogleSheet(updated, sheetUrl).catch((err) =>
        console.warn('Auto-sync product to Google Sheets failed:', err)
      );
    }

    // Push to Supabase if available
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('products')
        .insert({
          id: newProduct.id,
          name: newProduct.name,
          price: newProduct.price,
          numeric_price: newProduct.numericPrice,
          original_price: newProduct.originalPrice || null,
          category: newProduct.category,
          description: newProduct.description,
          img: newProduct.img,
          badge: newProduct.badge || null,
          is_best_seller: Boolean(newProduct.isBestSeller),
          is_coming_soon: Boolean(newProduct.isComingSoon),
        })
        .then(({ error }) => {
          if (error) console.error('Supabase product insert error:', error);
          else setIsCloudSynced(true);
        });
    }

    return newProduct;
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    const updated = products.map((prod) => (prod.id === id ? { ...prod, ...productData } : prod));
    setProducts(updated);

    // Auto-sync to Google Sheets (Free Cloud Database)
    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncProductsToGoogleSheet(updated, sheetUrl).catch((err) =>
        console.warn('Auto-sync product to Google Sheets failed:', err)
      );
    }

    if (isSupabaseConfigured && supabase) {
      const updatePayload: Record<string, any> = {};
      if (productData.name !== undefined) updatePayload.name = productData.name;
      if (productData.price !== undefined) updatePayload.price = productData.price;
      if (productData.numericPrice !== undefined) updatePayload.numeric_price = productData.numericPrice;
      if (productData.originalPrice !== undefined) updatePayload.original_price = productData.originalPrice || null;
      if (productData.category !== undefined) updatePayload.category = productData.category;
      if (productData.description !== undefined) updatePayload.description = productData.description;
      if (productData.img !== undefined) updatePayload.img = productData.img;
      if (productData.badge !== undefined) updatePayload.badge = productData.badge;
      if (productData.isBestSeller !== undefined) updatePayload.is_best_seller = productData.isBestSeller;
      if (productData.isComingSoon !== undefined) updatePayload.is_coming_soon = productData.isComingSoon;

      supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Supabase product update error:', error);
          else setIsCloudSynced(true);
        });
    }
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((prod) => prod.id !== id);
    setProducts(updated);

    // Auto-sync to Google Sheets (Free Cloud Database)
    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncProductsToGoogleSheet(updated, sheetUrl).catch((err) =>
        console.warn('Auto-sync product to Google Sheets failed:', err)
      );
    }

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('products')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Supabase product delete error:', error);
          else setIsCloudSynced(true);
        });
    }
  };

  const toggleBestSeller = (id: string) => {
    const updated = products.map((prod) => {
      if (prod.id === id) {
        return {
          ...prod,
          isBestSeller: !prod.isBestSeller,
          badge: !prod.isBestSeller ? 'Best Seller' : prod.badge,
        };
      }
      return prod;
    });
    setProducts(updated);

    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncProductsToGoogleSheet(updated, sheetUrl).catch((err) =>
        console.warn('Auto-sync product to Google Sheets failed:', err)
      );
    }

    if (isSupabaseConfigured && supabase) {
      const target = updated.find((p) => p.id === id);
      if (target) {
        supabase
          .from('products')
          .update({ is_best_seller: target.isBestSeller, badge: target.badge })
          .eq('id', id);
      }
    }
  };

  const toggleComingSoon = (id: string) => {
    const updated = products.map((prod) => {
      if (prod.id === id) {
        return { ...prod, isComingSoon: !prod.isComingSoon };
      }
      return prod;
    });
    setProducts(updated);

    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncProductsToGoogleSheet(updated, sheetUrl).catch((err) =>
        console.warn('Auto-sync product to Google Sheets failed:', err)
      );
    }

    if (isSupabaseConfigured && supabase) {
      const target = updated.find((p) => p.id === id);
      if (target) {
        supabase
          .from('products')
          .update({ is_coming_soon: target.isComingSoon })
          .eq('id', id);
      }
    }
  };

  const resetToDefaultProducts = async () => {
    setProducts(ALL_PRODUCTS);

    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      syncProductsToGoogleSheet(ALL_PRODUCTS, sheetUrl).catch((err) =>
        console.warn('Auto-sync product to Google Sheets failed:', err)
      );
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Delete all non-system products
        await supabase
          .from('products')
          .delete()
          .neq('category', SYSTEM_CONFIG_CATEGORY);

        // Re-seed with default products
        const initialPayload = ALL_PRODUCTS.map((prod) => ({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          numeric_price: prod.numericPrice,
          original_price: prod.originalPrice,
          category: prod.category,
          description: prod.description,
          img: prod.img,
          badge: prod.badge,
          is_best_seller: prod.isBestSeller,
          is_coming_soon: prod.isComingSoon,
        }));
        await supabase.from('products').upsert(initialPayload);
        setIsCloudSynced(true);
      } catch (e) {
        console.error('Failed to reset cloud products:', e);
      }
    }
  };

  const forceRefreshProducts = async () => {
    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl && sheetUrl.includes('script.google.com')) {
      try {
        const res = await fetchProductsFromGoogleSheet(sheetUrl);
        if (res.products && res.products.length > 0) {
          setProducts(res.products);
          setIsCloudSynced(true);
          return;
        }
      } catch (e) {
        console.warn('Failed to force refresh from Google Sheets:', e);
      }
    }
    await fetchProductsFromCloud();
  };

  const safeProducts = products && products.length > 0 ? products : ALL_PRODUCTS;

  const getProductById = (id: string): Product | undefined => {
    return safeProducts.find((p) => p.id === id) || ALL_PRODUCTS.find((p) => p.id === id);
  };

  const importProducts = (newProducts: Product[]): boolean => {
    if (!Array.isArray(newProducts) || newProducts.length === 0) return false;
    const clean = newProducts.filter((p) => p && p.id && p.name);
    if (clean.length === 0) return false;
    setProducts(clean);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(clean));
    } catch (e) {
      console.warn('LocalStorage save after import warning:', e);
    }
    return true;
  };

  return (
    <ProductContext.Provider
      value={{
        products: safeProducts,
        isCloudSynced,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleBestSeller,
        toggleComingSoon,
        resetToDefaultProducts,
        getProductById,
        forceRefreshProducts,
        importProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
