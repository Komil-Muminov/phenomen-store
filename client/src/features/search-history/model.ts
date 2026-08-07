import AsyncStorage from '@react-native-async-storage/async-storage';
import { IProduct } from '@/entities/product';

const SEARCH_HISTORY_KEY = '@phenomen_search_history_v1';
const RECENTLY_VIEWED_KEY = '@phenomen_recently_viewed_v1';

export const getSearchHistory = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : ['Худи', 'Бомбер oversized', 'Куртка', 'Джинсы wide leg'];
  } catch {
    return ['Худи', 'Бомбер oversized', 'Куртка', 'Джинсы wide leg'];
  }
};

export const addSearchTerm = async (term: string): Promise<string[]> => {
  if (!term || !term.trim()) {
    return getSearchHistory();
  }
  try {
    const current = await getSearchHistory();
    const filtered = current.filter((item) => item.toLowerCase() !== term.trim().toLowerCase());
    const updated = [term.trim(), ...filtered].slice(0, 10);
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [term.trim()];
  }
};

export const clearSearchHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // Ignore errors
  }
};

export const getRecentlyViewed = async (): Promise<IProduct[]> => {
  try {
    const raw = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentlyViewed = async (product: IProduct): Promise<IProduct[]> => {
  try {
    const current = await getRecentlyViewed();
    const filtered = current.filter((item) => item.id !== product.id);
    const updated = [product, ...filtered].slice(0, 10);
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [product];
  }
};
