import React, { createContext, useContext, useState, useEffect } from 'react';
import { ALL_PRODUCTS, type Product } from '../data/products';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ProductContextType {
  products: Product[];
  isCloudSynced: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleBestSeller: (id: string) => void;
  toggleComingSoon: (id: string) => void;
  resetToDefaultProducts: () => void;
  getProductById: (id: string) => Product | undefined;
}

const PRODUCTS_STORAGE_KEY = 'petalorah_dynamic_products';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load products from localStorage:', e);
    }
    return ALL_PRODUCTS;
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(isSupabaseConfigured);

  // Sync with Supabase Cloud Database if configured
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    const fetchProductsFromCloud = async () => {
      try {
        const { data, error } = await client
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Product[] = data.map((item) => ({
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
    };

    fetchProductsFromCloud();

    // Subscribe to real-time changes
    const channel = client
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProductsFromCloud();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  // Save to localStorage as fallback
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newProduct: Product = {
      ...productData,
      id,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Push to Supabase if available
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('products')
        .insert({
          id: newProduct.id,
          name: newProduct.name,
          price: newProduct.price,
          numeric_price: newProduct.numericPrice,
          original_price: newProduct.originalPrice,
          category: newProduct.category,
          description: newProduct.description,
          img: newProduct.img,
          badge: newProduct.badge,
          is_best_seller: newProduct.isBestSeller,
          is_coming_soon: newProduct.isComingSoon,
        })
        .then(({ error }) => {
          if (error) console.error('Supabase product insert error:', error);
        });
    }

    return newProduct;
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, ...productData } : prod))
    );

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('products')
        .update({
          name: productData.name,
          price: productData.price,
          numeric_price: productData.numericPrice,
          original_price: productData.originalPrice,
          category: productData.category,
          description: productData.description,
          img: productData.img,
          badge: productData.badge,
          is_best_seller: productData.isBestSeller,
          is_coming_soon: productData.isComingSoon,
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Supabase product update error:', error);
        });
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('products')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Supabase product delete error:', error);
        });
    }
  };

  const toggleBestSeller = (id: string) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === id) {
          const updated = {
            ...prod,
            isBestSeller: !prod.isBestSeller,
            badge: !prod.isBestSeller ? 'Best Seller' : prod.badge,
          };
          if (isSupabaseConfigured && supabase) {
            supabase
              .from('products')
              .update({ is_best_seller: updated.isBestSeller, badge: updated.badge })
              .eq('id', id);
          }
          return updated;
        }
        return prod;
      })
    );
  };

  const toggleComingSoon = (id: string) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === id) {
          const updated = { ...prod, isComingSoon: !prod.isComingSoon };
          if (isSupabaseConfigured && supabase) {
            supabase
              .from('products')
              .update({ is_coming_soon: updated.isComingSoon })
              .eq('id', id);
          }
          return updated;
        }
        return prod;
      })
    );
  };

  const resetToDefaultProducts = () => {
    setProducts(ALL_PRODUCTS);
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isCloudSynced,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleBestSeller,
        toggleComingSoon,
        resetToDefaultProducts,
        getProductById,
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
