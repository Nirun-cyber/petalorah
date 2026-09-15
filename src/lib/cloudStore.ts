import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Universal Cloud Store for Petalorah
 *
 * Enables instant multi-device synchronization for all Admin panel settings,
 * coupons, reviews, gallery items, and customer accounts.
 *
 * Uses dual-layer cloud persistence:
 * 1. Primary: Dedicated tables if created in Supabase (e.g. site_settings, coupons, reviews, gallery, customers).
 * 2. Fallback: Resilient metadata rows in the active 'products' table under category '__petalorah_system_config__'.
 *
 * Also provides multi-tab broadcast, window visibility/focus auto-refresh,
 * and periodic background polling so every device is guaranteed to stay synchronized.
 */

export const SYSTEM_CONFIG_CATEGORY = '__petalorah_system_config__';

export const CLOUD_KEYS = {
  SETTINGS: '__cloud_meta_settings__',
  COUPONS: '__cloud_meta_coupons__',
  REVIEWS: '__cloud_meta_reviews__',
  GALLERY: '__cloud_meta_gallery__',
  CUSTOMERS: '__cloud_meta_customers__',
} as const;

type CloudKey = (typeof CLOUD_KEYS)[keyof typeof CLOUD_KEYS];

type ChangeListener<T> = (data: T) => void;
const listeners = new Map<CloudKey, Set<ChangeListener<any>>>();

// Register a listener for real-time cloud changes
export function onCloudChange<T>(key: CloudKey, callback: ChangeListener<T>): () => void {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(callback);
  return () => {
    listeners.get(key)?.delete(callback);
  };
}

function notifyListeners<T>(key: CloudKey, data: T) {
  listeners.get(key)?.forEach((cb) => {
    try {
      cb(data);
    } catch (e) {
      console.warn(`Error in cloud change listener for ${key}:`, e);
    }
  });
}

// Track table availability cache (whether dedicated table exists)
const tableAvailabilityCache = new Map<string, boolean>();

/**
 * Checks if a dedicated table exists in Supabase public schema.
 */
async function hasDedicatedTable(tableName: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  if (tableAvailabilityCache.has(tableName)) {
    return tableAvailabilityCache.get(tableName)!;
  }

  try {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    if (error && (error.code === 'PGRST205' || error.message?.includes('not find the table'))) {
      tableAvailabilityCache.set(tableName, false);
      return false;
    }
    tableAvailabilityCache.set(tableName, true);
    return true;
  } catch {
    tableAvailabilityCache.set(tableName, false);
    return false;
  }
}

/**
 * Fetch a JSON payload from the cloud for a specific key.
 */
export async function getCloudItem<T>(key: CloudKey, fallback: T): Promise<T> {
  if (!isSupabaseConfigured || !supabase) {
    return fallback;
  }

  try {
    // 1. Try dedicated table if mapped
    const dedicatedTableMap: Record<CloudKey, string> = {
      [CLOUD_KEYS.SETTINGS]: 'site_settings',
      [CLOUD_KEYS.COUPONS]: 'coupons',
      [CLOUD_KEYS.REVIEWS]: 'reviews',
      [CLOUD_KEYS.GALLERY]: 'gallery',
      [CLOUD_KEYS.CUSTOMERS]: 'customers',
    };

    const tableName = dedicatedTableMap[key];
    if (tableName && (await hasDedicatedTable(tableName))) {
      const { data, error } = await supabase.from(tableName).select('*');
      if (!error && data) {
        if (key === CLOUD_KEYS.SETTINGS && data.length > 0) {
          return { ...fallback, ...data[0] } as T;
        }
        if (data.length > 0) {
          return data as unknown as T;
        }
      }
    }

    // 2. Fetch from resilient system config row in products table
    const { data: configRow, error: configError } = await supabase
      .from('products')
      .select('description')
      .eq('id', key)
      .maybeSingle();

    if (!configError && configRow && configRow.description) {
      try {
        const parsed = JSON.parse(configRow.description);
        return parsed as T;
      } catch (err) {
        console.warn(`Failed to parse cloud config for ${key}:`, err);
      }
    }
  } catch (err) {
    console.warn(`Error reading cloud item ${key}:`, err);
  }

  return fallback;
}

/**
 * Save a JSON payload to the cloud for a specific key and notify all devices.
 */
export async function saveCloudItem<T>(key: CloudKey, value: T): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  try {
    // 1. If dedicated table exists, attempt to save there as well
    const dedicatedTableMap: Record<CloudKey, string> = {
      [CLOUD_KEYS.SETTINGS]: 'site_settings',
      [CLOUD_KEYS.COUPONS]: 'coupons',
      [CLOUD_KEYS.REVIEWS]: 'reviews',
      [CLOUD_KEYS.GALLERY]: 'gallery',
      [CLOUD_KEYS.CUSTOMERS]: 'customers',
    };

    const tableName = dedicatedTableMap[key];
    if (tableName && (await hasDedicatedTable(tableName))) {
      try {
        if (key === CLOUD_KEYS.SETTINGS) {
          await supabase.from(tableName).upsert({ id: 'primary_settings', ...(value as object) });
        } else if (Array.isArray(value)) {
          await supabase.from(tableName).upsert(value);
        }
      } catch (tableErr) {
        console.warn(`Dedicated table upsert notice for ${tableName}:`, tableErr);
      }
    }

    // 2. Always persist into the resilient system config row in products table
    const payload = {
      id: key,
      name: `System Configuration: ${key.replace(/_/g, ' ')}`,
      price: '0',
      numeric_price: 0,
      category: SYSTEM_CONFIG_CATEGORY,
      description: JSON.stringify(value),
      badge: 'system',
      is_best_seller: false,
      is_coming_soon: false,
    };

    const { error: upsertError } = await supabase.from('products').upsert(payload);

    if (upsertError) {
      console.error(`Supabase cloud save error for ${key}:`, upsertError);
      return false;
    }

    // Notify local listeners
    notifyListeners(key, value);
    return true;
  } catch (err) {
    console.error(`Exception while saving cloud item ${key}:`, err);
    return false;
  }
}

/**
 * Initialize global realtime subscriptions and auto-sync listeners.
 */
let isRealtimeInitialized = false;

export function initCloudRealtimeSync(refreshAll: () => void) {
  if (isRealtimeInitialized || !isSupabaseConfigured || !supabase) return;
  isRealtimeInitialized = true;

  // 1. Supabase Realtime channel for instant remote updates
  try {
    const channel = supabase
      .channel('petalorah_universal_cloud_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          const changedId = (payload.new as { id?: string })?.id || (payload.old as { id?: string })?.id;
          if (changedId && Object.values(CLOUD_KEYS).includes(changedId as CloudKey)) {
            const key = changedId as CloudKey;
            const desc = (payload.new as { description?: string })?.description;
            if (desc) {
              try {
                const parsed = JSON.parse(desc);
                notifyListeners(key, parsed);
              } catch {
                refreshAll();
              }
            } else {
              refreshAll();
            }
          } else {
            // General product update
            refreshAll();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          refreshAll();
        }
      )
      .subscribe();

    // Clean up channel on page unload if needed
    window.addEventListener('beforeunload', () => {
      supabase?.removeChannel(channel);
    });
  } catch (e) {
    console.warn('Realtime channel subscription error:', e);
  }

  // 2. Periodic background polling (every 25 seconds) to catch missed changes on sleep/reconnect
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      refreshAll();
    }
  }, 25000);

  window.addEventListener('beforeunload', () => {
    clearInterval(interval);
  });

  // 3. Tab Visibility & Focus listener: when user switches to the tab or unlocks phone, fetch latest
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      refreshAll();
    }
  };

  const handleWindowFocus = () => {
    refreshAll();
  };

  window.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleWindowFocus);

  // Cross-tab synchronization via storage events
  window.addEventListener('storage', (e) => {
    if (e.key?.startsWith('petalorah_')) {
      refreshAll();
    }
  });
}
