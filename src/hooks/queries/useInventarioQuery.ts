import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerTodasAeronaves,
  obtenerEstadisticasAeronaves,
  crearAeronave,
  actualizarAeronave,
  eliminarAeronave
} from '../../utils/inventarioApi';
import { IAeronave } from '../../types/inventario';

// Query Keys - Centralizados para consistencia
export const inventarioKeys = {
  all: ['inventario'] as const,
  aeronaves: () => [...inventarioKeys.all, 'aeronaves'] as const,
  estadisticas: () => [...inventarioKeys.all, 'estadisticas'] as const,
  aeronave: (id: string) => [...inventarioKeys.all, 'aeronave', id] as const,
};

/**
 * Hook para obtener todas las aeronaves con React Query
 * - Cache automático de 30s
 * - Refetch en background
 * - Optimistic updates
 */
export function useAeronaves() {
  return useQuery({
    queryKey: inventarioKeys.aeronaves(),
    queryFn: async () => {
      const response = await obtenerTodasAeronaves();
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener aeronaves');
      }
      return response.data;
    },
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para obtener estadísticas de aeronaves
 */
export function useEstadisticasAeronaves() {
  return useQuery({
    queryKey: inventarioKeys.estadisticas(),
    queryFn: async () => {
      const response = await obtenerEstadisticasAeronaves();
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener estadísticas');
      }
      return response.data;
    },
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para crear una nueva aeronave con optimistic update
 */
export function useCrearAeronave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aeronaveData: Partial<IAeronave>) => {
      const response = await crearAeronave(aeronaveData);
      if (!response.success) {
        throw new Error(response.error || 'Error al crear aeronave');
      }
      return response.data;
    },
    onSuccess: (nuevaAeronave) => {
      // Invalidar queries relacionadas para refetch automático
      queryClient.invalidateQueries({ queryKey: inventarioKeys.aeronaves() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.estadisticas() });

      // Optimistic update - agregar la nueva aeronave al cache inmediatamente
      queryClient.setQueryData<IAeronave[]>(
        inventarioKeys.aeronaves(),
        (old) => (old ? [...old, nuevaAeronave!] : [nuevaAeronave!])
      );
    },
  });
}

/**
 * Hook para actualizar una aeronave existente
 */
export function useActualizarAeronave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IAeronave> }) => {
      const response = await actualizarAeronave(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar aeronave');
      }
      return response.data;
    },
    onSuccess: (aeronaveActualizada) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: inventarioKeys.aeronaves() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.estadisticas() });

      // Optimistic update - actualizar en el cache
      queryClient.setQueryData<IAeronave[]>(
        inventarioKeys.aeronaves(),
        (old) =>
          old?.map((aeronave) =>
            aeronave._id === aeronaveActualizada?._id ? aeronaveActualizada : aeronave
          )
      );
    },
  });
}

/**
 * Hook para eliminar una aeronave
 */
export function useEliminarAeronave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await eliminarAeronave(id);
      if (!response.success) {
        throw new Error(response.error || 'Error al eliminar aeronave');
      }
      return id;
    },
    onSuccess: (id) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: inventarioKeys.aeronaves() });
      queryClient.invalidateQueries({ queryKey: inventarioKeys.estadisticas() });

      // Optimistic update - remover del cache
      queryClient.setQueryData<IAeronave[]>(
        inventarioKeys.aeronaves(),
        (old) => old?.filter((aeronave) => aeronave._id !== id)
      );
    },
  });
}

/**
 * Hook combinado para obtener aeronaves y estadísticas en paralelo
 * Este es un ejemplo de cómo React Query maneja múltiples queries automáticamente
 */
export function useInventarioCompleto() {
  const aeronavesQuery = useAeronaves();
  const estadisticasQuery = useEstadisticasAeronaves();

  return {
    aeronaves: aeronavesQuery.data ?? [],
    estadisticas: estadisticasQuery.data ?? null,
    isLoading: aeronavesQuery.isLoading || estadisticasQuery.isLoading,
    error: aeronavesQuery.error || estadisticasQuery.error,
    refetch: () => {
      aeronavesQuery.refetch();
      estadisticasQuery.refetch();
    },
  };
}
