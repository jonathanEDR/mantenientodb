import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk publishable key (VITE_CLERK_PUBLISHABLE_KEY)');
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element with id "root" not found. Make sure your index.html contains a <div id="root"></div>.');
}

createRoot(rootEl).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
