import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerComponentes,
  crearComponente,
  actualizarComponente,
  eliminarComponente
} from '../../utils/mantenimientoApi';
import {
  obtenerEstadosMonitoreoComponente,
  obtenerEstadosMonitoreoPorAeronave,
  crearEstadoMonitoreoComponente,
  actualizarEstadoMonitoreoComponente,
  eliminarEstadoMonitoreoComponente
} from '../../utils/estadosMonitoreoComponenteApi';
import { IComponente } from '../../types/mantenimiento';
import { IEstadoMonitoreoComponente, IFormEstadoMonitoreo } from '../../types/estadosMonitoreoComponente';

// Query Keys
export const mantenimientoKeys = {
  all: ['mantenimiento'] as const,
  componentes: () => [...mantenimientoKeys.all, 'componentes'] as const,
  componente: (id: string) => [...mantenimientoKeys.all, 'componente', id] as const,
  estadosComponente: (componenteId: string) => [...mantenimientoKeys.all, 'estados', componenteId] as const,
  estadosAeronave: (aeronaveId: string) => [...mantenimientoKeys.all, 'estados-aeronave', aeronaveId] as const,
};

/**
 * Hook para obtener todos los componentes
 */
export function useComponentes() {
  return useQuery({
    queryKey: mantenimientoKeys.componentes(),
    queryFn: async () => {
      const response = await obtenerComponentes();
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener componentes');
      }
      return response.data;
    },
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para obtener estados de monitoreo de un componente
 */
export function useEstadosMonitoreoComponente(componenteId?: string) {
  return useQuery({
    queryKey: mantenimientoKeys.estadosComponente(componenteId || ''),
    queryFn: async () => {
      if (!componenteId) return [];

      const response = await obtenerEstadosMonitoreoComponente(componenteId);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener estados de monitoreo');
      }
      return response.data;
    },
    enabled: !!componenteId, // Solo ejecutar si hay componenteId
    staleTime: 30000,
  });
}

/**
 * Hook para obtener todos los estados de monitoreo de una aeronave (BATCH)
 * Este hook implementa el patrón de batch loading que resolvió el error 429
 */
export function useEstadosMonitoreoPorAeronave(aeronaveId?: string) {
  return useQuery({
    queryKey: mantenimientoKeys.estadosAeronave(aeronaveId || ''),
    queryFn: async () => {
      if (!aeronaveId) return {};

      const response = await obtenerEstadosMonitoreoPorAeronave(aeronaveId);
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener estados de monitoreo');
      }
      return response.data;
    },
    enabled: !!aeronaveId,
    staleTime: 30000,
  });
}

/**
 * Hook para crear un nuevo componente
 */
export function useCrearComponente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (componenteData: Partial<IComponente>) => {
      const response = await crearComponente(componenteData);
      if (!response.success) {
        throw new Error(response.error || 'Error al crear componente');
      }
      return response.data;
    },
    onSuccess: (nuevoComponente) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: mantenimientoKeys.componentes() });

      // Optimistic update
      queryClient.setQueryData<IComponente[]>(
        mantenimientoKeys.componentes(),
        (old) => (old ? [...old, nuevoComponente!] : [nuevoComponente!])
      );
    },
  });
}

/**
 * Hook para actualizar un componente
 */
export function useActualizarComponente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IComponente> }) => {
      const response = await actualizarComponente(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar componente');
      }
      return response.data;
    },
    onSuccess: (componenteActualizado) => {
      queryClient.invalidateQueries({ queryKey: mantenimientoKeys.componentes() });

      queryClient.setQueryData<IComponente[]>(
        mantenimientoKeys.componentes(),
        (old) =>
          old?.map((comp) =>
            comp._id === componenteActualizado?._id ? componenteActualizado : comp
          )
      );
    },
  });
}

/**
 * Hook para eliminar un componente
 */
export function useEliminarComponente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await eliminarComponente(id);
      if (!response.success) {
        throw new Error(response.error || 'Error al eliminar componente');
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: mantenimientoKeys.componentes() });

      queryClient.setQueryData<IComponente[]>(
        mantenimientoKeys.componentes(),
        (old) => old?.filter((comp) => comp._id !== id)
      );
    },
  });
}

/**
 * Hook para crear estado de monitoreo
 */
export function useCrearEstadoMonitoreo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      componenteId,
      datos,
    }: {
      componenteId: string;
      datos: IFormEstadoMonitoreo;
    }) => {
      const response = await crearEstadoMonitoreoComponente(componenteId, datos);
      if (!response.success) {
        throw new Error(response.error || 'Error al crear estado de monitoreo');
      }
      return { componenteId, estado: response.data };
    },
    onSuccess: ({ componenteId }) => {
      // Invalidar estados de este componente
      queryClient.invalidateQueries({
        queryKey: mantenimientoKeys.estadosComponente(componenteId),
      });
    },
  });
}

/**
 * Hook para actualizar estado de monitoreo
 */
export function useActualizarEstadoMonitoreo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      estadoId,
      componenteId,
      datos,
    }: {
      estadoId: string;
      componenteId: string;
      datos: Partial<IFormEstadoMonitoreo>;
    }) => {
      const response = await actualizarEstadoMonitoreoComponente(estadoId, datos);
      if (!response.success) {
        throw new Error(response.error || 'Error al actualizar estado de monitoreo');
      }
      return { componenteId, estado: response.data };
    },
    onSuccess: ({ componenteId }) => {
      queryClient.invalidateQueries({
        queryKey: mantenimientoKeys.estadosComponente(componenteId),
      });
    },
  });
}

/**
 * Hook para eliminar estado de monitoreo
 */
export function useEliminarEstadoMonitoreo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      estadoId,
      componenteId,
    }: {
      estadoId: string;
      componenteId: string;
    }) => {
      const response = await eliminarEstadoMonitoreoComponente(estadoId);
      if (!response.success) {
        throw new Error(response.error || 'Error al eliminar estado de monitoreo');
      }
      return { estadoId, componenteId };
    },
    onSuccess: ({ componenteId }) => {
      queryClient.invalidateQueries({
        queryKey: mantenimientoKeys.estadosComponente(componenteId),
      });
    },
  });
}
