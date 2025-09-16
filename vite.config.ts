import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_API_BASE_URL can be used to point to a remote backend, otherwise
// the dev server will proxy /api to http://localhost:5000 by default.
const backend = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          clerk: ['@clerk/clerk-react'],
          routing: ['react-router-dom']
        }
      }
    }
  },
  // Configuración específica para Vercel
  base: '/',
  publicDir: 'public',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
