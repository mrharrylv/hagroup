import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase-vendor': ['firebase/app', 'firebase/firestore'],
          'react-vendor': ['i18next', 'react', 'react-dom', 'react-i18next', 'react-router-dom'],
        },
      },
    },
  },
});
