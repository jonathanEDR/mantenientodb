/**
 * Registro del Service Worker para caché offline
 */

export function registerServiceWorker() {
  // DESACTIVADO EN DESARROLLO para evitar cache de archivos viejos
  if (import.meta.env.DEV) {
    console.log('⚠️ Service Worker desactivado en modo desarrollo');
    // Desregistrar cualquier SW existente en desarrollo
    unregisterServiceWorker().then(() => {
      console.log('🗑️ Service Worker removido en desarrollo');
    });
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);

          // Verificar actualizaciones cada 1 minuto
          setInterval(() => {
            registration.update();
          }, 60000);

          // Escuchar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nueva versión disponible
                  console.log('🔄 Nueva versión del Service Worker disponible');

                  // Opcional: Mostrar notificación al usuario
                  if (confirm('Hay una nueva versión disponible. ¿Desea actualizar?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Error al registrar Service Worker:', error);
        });

      // Escuchar cuando el SW toma control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker actualizado, recargando página...');
        window.location.reload();
      });
    });
  } else {
    console.warn('⚠️ Service Workers no soportados en este navegador');
  }
}

/**
 * Limpiar cache del Service Worker
 */
export function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    console.log('🗑️ Cache del Service Worker limpiado');
  }
}

/**
 * Desregistrar Service Worker
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
      await registration.unregister();
      console.log('🗑️ Service Worker desregistrado');
    }
  }
}

/**
 * Verificar si la app está offline
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Hook para detectar cambios de estado online/offline
 */
export function setupOnlineDetection() {
  window.addEventListener('online', () => {
    console.log('🌐 Conexión restaurada');
    // Opcional: Mostrar notificación al usuario
  });

  window.addEventListener('offline', () => {
    console.log('📡 Sin conexión - modo offline activado');
    // Opcional: Mostrar notificación al usuario
  });
}
