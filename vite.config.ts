import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_API_BASE_URL can be used to point to a remote backend, otherwise
// the dev server will proxy /api to http://localhost:5000 by default.
const backend = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@clerk/clerk-react',
      'react-router-dom',
      'axios'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Aumentar límite de warning para chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Chunk para vendor libraries (React, etc.)
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@clerk/clerk-react')) {
              return 'clerk';
            }
            if (id.includes('react-router')) {
              return 'routing';
            }
            if (id.includes('axios')) {
              return 'http';
            }
            if (id.includes('jspdf') || id.includes('autotable')) {
              return 'pdf';
            }
            // Otras librerías grandes
            return 'vendor';
          }
          
          // Chunks por módulos de la aplicación
          if (id.includes('/src/components/inventario/')) {
            return 'inventario';
          }
          if (id.includes('/src/components/mantenimiento/')) {
            return 'mantenimiento';
          }
          if (id.includes('/src/components/monitoreo/')) {
            return 'monitoreo';
          }
          if (id.includes('/src/services/')) {
            return 'services';
          }
          
          // Chunk principal para el resto
          return 'main';
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
