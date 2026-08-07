import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiRoutes } from '@/shared/config';
import { requestData } from '@/shared/api';

const WISHLIST_STORAGE_KEY = '@phenomen_wishlist_ids';

let globalWishlistIds: string[] = [];
const listeners = new Set<(ids: string[]) => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...globalWishlistIds]));
};

export const loadWishlistFromStorage = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.length > 0) {
        globalWishlistIds = parsed;
        notifyListeners();
      }
    }

    try {
      const res = await requestData<{ ids: string[] }>({
        url: ApiRoutes.wishlistGet,
        method: 'get',
      });

      if (res?.ids) {
        globalWishlistIds = res.ids;
        notifyListeners();
        await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(globalWishlistIds));
      }
    } catch {
      // Offline fallback
    }
  } catch (e) {
    console.warn('Failed to load wishlist:', e);
  }

  return globalWishlistIds;
};

export const saveWishlistToStorage = async (ids: string[]) => {
  try {
    await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn('Failed to save wishlist:', e);
  }
};

export const useWishlist = () => {
  const [ids, setIds] = useState<string[]>(globalWishlistIds);

  useEffect(() => {
    let isMounted = true;

    const handler = (newIds: string[]) => {
      if (isMounted) {
        setIds(newIds);
      }
    };

    listeners.add(handler);
    loadWishlistFromStorage();

    return () => {
      isMounted = false;
      listeners.delete(handler);
    };
  }, []);

  const toggleWishlist = useCallback(async (productId: string) => {
    const exists = globalWishlistIds.includes(productId);
    const next = exists
      ? globalWishlistIds.filter((id) => id !== productId)
      : [...globalWishlistIds, productId];

    globalWishlistIds = next;
    notifyListeners();
    saveWishlistToStorage(next);

    try {
      const res = await requestData<{ ids: string[] }>({
        url: ApiRoutes.wishlistToggle,
        method: 'post',
        data: { productId },
      });

      if (res?.ids) {
        globalWishlistIds = res.ids;
        notifyListeners();
        saveWishlistToStorage(globalWishlistIds);
      }
    } catch {
      // Synced to local storage
    }
  }, []);

  const isWishlisted = useCallback((productId: string) => (
    ids.includes(productId)
  ), [ids]);

  return {
    wishlistIds: ids,
    toggleWishlist,
    isWishlisted,
    count: ids.length,
  };
};
