import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_KEY_STORAGE = 'phenomen.guest-key';
const TOKEN_STORAGE = 'phenomen.auth-token';
const RANDOM_BASE = 36;
const RANDOM_LENGTH = 10;

let cachedGuestKey: string | null = null;

const createGuestKey = (): string => [
  Date.now().toString(RANDOM_BASE),
  Math.random().toString(RANDOM_BASE).slice(2, RANDOM_LENGTH),
].join('-');

export const getGuestKey = async (): Promise<string> => {
  if (cachedGuestKey) {
    return cachedGuestKey;
  }

  const stored = await AsyncStorage.getItem(GUEST_KEY_STORAGE);
  const key = stored ?? createGuestKey();

  if (!stored) {
    await AsyncStorage.setItem(GUEST_KEY_STORAGE, key);
  }

  cachedGuestKey = key;

  return key;
};

export const readCachedGuestKey = (): string | null => cachedGuestKey;

export const loadAuthToken = async (): Promise<string | null> => AsyncStorage.getItem(TOKEN_STORAGE);

export const saveAuthToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_STORAGE, token);
};

export const clearAuthToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_STORAGE);
};

export const createIdempotencyKey = (): string => `${createGuestKey()}-${Math.random().toString(RANDOM_BASE).slice(2, 8)}`;
