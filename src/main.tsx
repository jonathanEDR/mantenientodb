import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import ConfigError from './components/common/ConfigError';

// Validación mejorada de variables de entorno
const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL;

// Logging para debugging en producción
console.log('🔧 Environment Check:', {
  hasClerkKey: !!PUBLISHABLE_KEY,
  clerkKeyPrefix: PUBLISHABLE_KEY?.substring(0, 7) + '...',
  apiBaseUrl: API_BASE_URL,
  mode: (import.meta as any).env.MODE,
  dev: (import.meta as any).env.DEV,
  prod: (import.meta as any).env.PROD
});

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element with id "root" not found. Make sure your index.html contains a <div id="root"></div>.');
}

// Verificar configuración y mostrar error amigable si es necesario
let configError: string | null = null;
let configDetails: string | null = null;

if (!PUBLISHABLE_KEY) {
  configError = 'Missing VITE_CLERK_PUBLISHABLE_KEY environment variable';
  configDetails = 'La clave pública de Clerk no está configurada en Vercel. Revisa la configuración de Environment Variables.';
  console.error('❌', configError);
  console.error('📋 Available env vars:', Object.keys((import.meta as any).env));
} else if (!PUBLISHABLE_KEY.startsWith('pk_')) {
  configError = 'Invalid Clerk publishable key format';
  configDetails = `Expected key to start with 'pk_', but got: ${PUBLISHABLE_KEY?.substring(0, 10)}...`;
  console.error('❌', configError, configDetails);
}

// Renderizar aplicación o error de configuración
if (configError) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <ConfigError error={configError} details={configDetails || undefined} />
    </React.StrictMode>
  );
} else {
  createRoot(rootEl).render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
      >
        <App />
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }}
        />
      </ClerkProvider>
    </React.StrictMode>
  );
}
