// Type definitions for Vite import.meta.env and global Clerk helper
// Keep this file as a global types declaration only

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extender la interfaz Window para incluir Clerk (opcional, evita errores si lo usas)
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string>;
      };
    };
  }
}

export {};
