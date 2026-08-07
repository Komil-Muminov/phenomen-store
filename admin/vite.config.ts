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
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
