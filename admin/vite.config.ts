import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const ROOT_DIR = path.resolve(__dirname, '..');

export default defineConfig({
  plugins: [react()],
  envDir: ROOT_DIR,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@contracts/csv': path.resolve(ROOT_DIR, 'contracts/csv.ts'),
      '@contracts': path.resolve(ROOT_DIR, 'contracts/index.ts'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
