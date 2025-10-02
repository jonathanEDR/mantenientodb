/* eslint-disable no-restricted-globals */

// Nombre del cache
const CACHE_NAME = 'invmant-cache-v1';

// Recursos estáticos a cachear
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
];

// URLs de API a cachear (estrategia cache-first)
const API_CACHE_URLS = [
  '/api/inventario/aeronaves',
  '/api/mantenimiento/componentes',
  '/api/mantenimiento/dashboard/resumen',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando recursos estáticos');
      return cache.addAll(STATIC_RESOURCES);
    })
  );

  // Forzar activación inmediata
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Tomar control de todas las páginas inmediatamente
  self.clients.claim();
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear requests GET
  if (request.method !== 'GET') {
    return;
  }

  // Estrategia Network First para API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirstStrategy(request)
    );
    return;
  }

  // Estrategia Cache First para recursos estáticos
  event.respondWith(
    cacheFirstStrategy(request)
  );
});

/**
 * Estrategia Cache First
 * 1. Buscar en cache
 * 2. Si no está, ir a la red
 * 3. Guardar respuesta en cache
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log('[Service Worker] Cache hit:', request.url);
    return cachedResponse;
  }

  try {
    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    // Retornar una respuesta de fallback si es necesario
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Estrategia Network First
 * 1. Intentar obtener de la red
 * 2. Si falla, buscar en cache
 * 3. Guardar respuesta exitosa en cache
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, checking cache:', request.url);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[Service Worker] Returning cached response');
      return cachedResponse;
    }

    // Si no hay cache, retornar error
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Sin conexión y sin datos en caché',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Estrategia Stale While Revalidate
 * 1. Retornar cache inmediatamente
 * 2. Actualizar cache en background
 */
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
