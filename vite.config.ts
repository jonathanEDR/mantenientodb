import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_API_BASE_URL can be used to point to a remote backend, otherwise
// the dev server will proxy /api to http://localhost:5000 by default.
const backend = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@clerk/clerk-react',
      'react-router-dom',
      'axios'
    ],
    force: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React y React-DOM en su propio chunk para evitar conflictos
          'react-vendor': ['react', 'react-dom'],
          // Clerk en su propio chunk
          'clerk': ['@clerk/clerk-react'],
          // React Router
          'routing': ['react-router-dom'],
          // Axios y utilidades HTTP
          'http': ['axios'],
          // PDF libraries
          'pdf': ['jspdf', 'jspdf-autotable']
        }
      }
    }
  },
  // Configuración específica para Vercel
  base: '/',
  publicDir: 'public',
  server: {
    port: 5173,
    host: 'localhost',
    hmr: {
      port: 5174, // Puerto diferente para WebSocket HMR
      host: 'localhost',
      clientPort: 5174
    },
    cors: true, // Habilitar CORS
    strictPort: false, // Permitir cambiar puerto si está ocupado
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        secure: false,
        ws: true, // Habilitar WebSocket proxy
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
});
