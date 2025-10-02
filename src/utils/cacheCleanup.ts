/**
 * 🧹 LIMPIEZA NUCLEAR DE CACHES
 * 
 * Elimina TODOS los posibles caches donde puede estar almacenado
 * el token expirado, incluyendo caches internos de Clerk
 */

export const nuclearCacheCleanup = async (clerk?: any) => {
  try {
    // 1. Limpiar sessionStorage y localStorage
    sessionStorage.clear();
    localStorage.clear();
    
    // 2. Limpiar TODOS los posibles keys de Clerk específicamente
    const clerkKeys = [
      'clerk-db-jwt', '__clerk_db_jwt', 'clerk-session', '__clerk_session',
      '__clerk_client_jwt', 'clerk_session', 'clerk_client_jwt'
    ];
    
    clerkKeys.forEach(key => {
      try {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      } catch (e) {
        // Ignorar errores
      }
    });

    // 3. Limpiar IndexedDB (donde Clerk almacena datos persistentes)
    try {
      const databases = await indexedDB.databases();
      const clerkDatabases = databases.filter(db => 
        db.name && (
          db.name.includes('clerk') || 
          db.name.includes('__clerk') ||
          db.name.includes('Clerk')
        )
      );
      
      for (const db of clerkDatabases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    } catch (e) {
      // Ignorar errores
    }

    // 4. Limpiar cookies relacionadas con Clerk
    try {
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        if (name.includes('clerk') || name.includes('__clerk') || name.includes('Clerk')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        }
      });
    } catch (e) {
      // Ignorar errores
    }

    // 5. Forzar signOut de Clerk si está disponible
    if (clerk) {
      try {
        await clerk.signOut({
          sessionId: undefined, // Cerrar TODAS las sesiones
        });
      } catch (e) {
        // Ignorar errores
      }
    }

    // 6. Limpiar Service Worker cache si existe
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
        }
      }
    } catch (e) {
      // Ignorar errores
    }

    return true;

  } catch (error) {
    return false;
  }
};

/**
 * Verificar si existen tokens expirados en cualquier storage
 */
export const checkForExpiredTokens = () => {
  const storages = [
    { name: 'sessionStorage', storage: sessionStorage },
    { name: 'localStorage', storage: localStorage }
  ];
  
  let foundExpiredTokens = false;
  
  storages.forEach(({ name, storage }) => {
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && (key.includes('jwt') || key.includes('token') || key.includes('clerk'))) {
          const value = storage.getItem(key);
          if (value) {
            try {
              // Intentar parsear como JWT
              if (value.includes('.')) {
                const parts = value.split('.');
                if (parts.length === 3) {
                  const payload = JSON.parse(atob(parts[1]));
                  if (payload.exp) {
                    const now = Math.floor(Date.now() / 1000);
                    if (payload.exp <= now) {
                      foundExpiredTokens = true;
                      // Eliminar inmediatamente
                      storage.removeItem(key);
                    }
                  }
                }
              }
            } catch (e) {
              // No es un JWT válido, ignorar
            }
          }
        }
      }
    } catch (e) {
      // Ignorar errores
    }
  });
  
  return foundExpiredTokens;
};