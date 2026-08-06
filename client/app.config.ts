import path from 'path';
import dotenv from 'dotenv';
import { ExpoConfig } from 'expo/config';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const tenantKey = process.env.EXPO_PUBLIC_TENANT_KEY ?? 'demo-fashion';
const appName = process.env.EXPO_PUBLIC_APP_NAME ?? 'PHENOMEN Store';
const bundleId = process.env.EXPO_PUBLIC_BUNDLE_ID ?? `store.phenomen.${tenantKey.replace(/-/g, '')}`;

const config: ExpoConfig = {
  name: appName,
  slug: tenantKey,
  scheme: tenantKey,
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: bundleId,
    supportsTablet: true,
  },
  android: {
    package: bundleId,
    adaptiveIcon: {
      backgroundColor: process.env.EXPO_PUBLIC_BRAND_COLOR ?? '#111827',
    },
  },
  web: {
    bundler: 'metro',
    output: 'single',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    tenantKey,
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000',
  },
};

export default config;
