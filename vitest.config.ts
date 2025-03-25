import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/client/setupTests.ts'],
    exclude: [
      '**/___*/**', // Ignore folders starting with ___
      '**/node_modules/**', // Ignore node_modules
    ],
  },
  resolve: {
    alias: {
      '@client': resolve(__dirname, './src/client'),
      '@server': resolve(__dirname, './src/server'),
    },
  },
});
