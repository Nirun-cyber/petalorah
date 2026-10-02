import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ALL_PRODUCTS, type Product, DEFAULT_PRODUCT_DESCRIPTION_TEMPLATE } from '../data/products';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SYSTEM_CONFIG_CATEGORY, CLOUD_KEYS } from '../lib/cloudStore';

interface ProductContextType {
  products: Product[];
  isCloudSynced: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleBestSeller: (id: string) => void;
  toggleComingSoon: (id: string) => void;
  resetToDefaultProducts: () => Promise<void>;
  clearAllProducts: () => Promise<void>;
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
        // Connected to fresh Supabase table with 0 products: restore and seed catalog!
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
        setProducts(ALL_PRODUCTS);
        await client.from('products').upsert(initialPayload);
        setIsCloudSynced(true);
      }
    } catch (err) {
      console.warn('Supabase product fetch warning:', err);
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

  // Save to localStorage as local offline fallback
  useEffect(() => {
    try {
      const cleanProducts = products.filter((p) => p && p.id && !isSystemConfigRecord(p.id, p.category));
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(cleanProducts));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('products')
          .delete()
          .neq('category', SYSTEM_CONFIG_CATEGORY);

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

  const clearAllProducts = async () => {
    setProducts([]);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('products')
          .delete()
          .neq('category', SYSTEM_CONFIG_CATEGORY);
      } catch (e) {
        console.error('Failed to clear Supabase products:', e);
      }
    }
  };

  const forceRefreshProducts = async () => {
    await fetchProductsFromCloud();
  };

  const safeProducts = products;

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
        clearAllProducts,
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
