import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { handleError } from '../utils/notifications';

/**
 * Configuración global de React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo de cache: 5 minutos
      staleTime: 5 * 60 * 1000,
      // Mantener datos en cache: 10 minutos
      gcTime: 10 * 60 * 1000,
      // Reintentar automáticamente en caso de error
      retry: 1,
      // Delay entre reintentos (exponencial)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus solo en producción
      refetchOnWindowFocus: (import.meta as any).env.PROD,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount si los datos están obsoletos
      refetchOnMount: 'always',
    },
    mutations: {
      // No reintentar mutaciones por defecto
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Manejar errores de queries de forma centralizada
      if ((import.meta as any).env.DEV) {
        console.error(`❌ Query error [${query.queryKey}]:`, error);
      }
      // No mostrar toast aquí, dejar que cada query maneje su error
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Manejar errores de mutaciones de forma centralizada
      if ((import.meta as any).env.DEV) {
        console.error(`❌ Mutation error:`, error);
      }
      // No mostrar toast aquí, dejar que cada mutation maneje su error
    },
  }),
});

/**
 * Query keys centralizados para evitar duplicados
 */
export const queryKeys = {
  // Inventario
  inventario: {
    all: ['inventario'] as const,
    lists: () => [...queryKeys.inventario.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.inventario.lists(), filters] as const,
    details: () => [...queryKeys.inventario.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.inventario.details(), id] as const,
    stats: () => [...queryKeys.inventario.all, 'stats'] as const,
    componentes: (id: string) => [...queryKeys.inventario.detail(id), 'componentes'] as const,
  },

  // Usuarios
  usuarios: {
    all: ['usuarios'] as const,
    lists: () => [...queryKeys.usuarios.all, 'list'] as const,
    list: () => [...queryKeys.usuarios.lists()] as const,
    stats: () => [...queryKeys.usuarios.all, 'stats'] as const,
    me: () => [...queryKeys.usuarios.all, 'me'] as const,
    permissions: () => [...queryKeys.usuarios.me(), 'permissions'] as const,
  },

  // Mantenimiento
  mantenimiento: {
    all: ['mantenimiento'] as const,
    ordenes: {
      all: () => [...queryKeys.mantenimiento.all, 'ordenes'] as const,
      lists: () => [...queryKeys.mantenimiento.ordenes.all(), 'list'] as const,
      list: (filters?: any) => [...queryKeys.mantenimiento.ordenes.lists(), filters] as const,
      detail: (id: string) => [...queryKeys.mantenimiento.ordenes.all(), id] as const,
      stats: () => [...queryKeys.mantenimiento.ordenes.all(), 'stats'] as const,
    },
    inspecciones: {
      all: () => [...queryKeys.mantenimiento.all, 'inspecciones'] as const,
      lists: () => [...queryKeys.mantenimiento.inspecciones.all(), 'list'] as const,
      list: (filters?: any) => [...queryKeys.mantenimiento.inspecciones.lists(), filters] as const,
      detail: (id: string) => [...queryKeys.mantenimiento.inspecciones.all(), id] as const,
      stats: () => [...queryKeys.mantenimiento.inspecciones.all(), 'stats'] as const,
    },
  },

  // Monitoreo
  monitoreo: {
    all: ['monitoreo'] as const,
    flota: () => [...queryKeys.monitoreo.all, 'flota'] as const,
    componentes: () => [...queryKeys.monitoreo.all, 'componentes'] as const,
    alertas: () => [...queryKeys.monitoreo.all, 'alertas'] as const,
    stats: () => [...queryKeys.monitoreo.all, 'stats'] as const,
  },

  // Herramientas
  herramientas: {
    all: ['herramientas'] as const,
    catalogos: {
      all: () => [...queryKeys.herramientas.all, 'catalogos'] as const,
      componentes: () => [...queryKeys.herramientas.catalogos.all(), 'componentes'] as const,
      controles: () => [...queryKeys.herramientas.catalogos.all(), 'controles'] as const,
    },
  },
};

export default queryClient;
