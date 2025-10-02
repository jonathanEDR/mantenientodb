import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../config/queryClient';
import {
  obtenerAeronaves,
  obtenerAeronave,
  obtenerEstadisticasInventario,
  crearAeronave,
  actualizarAeronave,
  eliminarAeronave,
  actualizarHorasConPropagacion,
  actualizarEstadoAeronave,
} from '../../utils/inventarioApi';
import { notifications, handleError } from '../../utils/notifications';
import type {
  ICrearAeronaveData,
  IActualizarAeronaveData,
  EstadoAeronave,
} from '../../types/inventario';

/**
 * Hook para obtener lista de aeronaves con paginación
 */
export const useAeronaves = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: string;
  estado?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.inventario.list(params),
    queryFn: () => obtenerAeronaves(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para obtener una aeronave específica
 */
export const useAeronave = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.inventario.detail(id),
    queryFn: () => obtenerAeronave(id),
    enabled: !!id && enabled,
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
};

/**
 * Hook para obtener estadísticas de inventario
 */
export const useEstadisticasInventario = () => {
  return useQuery({
    queryKey: queryKeys.inventario.stats(),
    queryFn: obtenerEstadisticasInventario,
    staleTime: 5 * 60 * 1000, // 5 minutos - las stats pueden ser más antiguas
  });
};

/**
 * Hook para crear una nueva aeronave
 */
export const useCrearAeronave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICrearAeronaveData) => crearAeronave(data),
    onSuccess: (response) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.stats() });

      notifications.success(`Aeronave ${response.data.matricula} creada exitosamente`);
    },
    onError: (error) => {
      handleError(error, 'Error al crear la aeronave');
    },
  });
};

/**
 * Hook para actualizar una aeronave
 */
export const useActualizarAeronave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICrearAeronaveData> }) =>
      actualizarAeronave(id, data),
    onSuccess: (response, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.stats() });

      notifications.success(`Aeronave ${response.data.matricula} actualizada exitosamente`);
    },
    onError: (error) => {
      handleError(error, 'Error al actualizar la aeronave');
    },
  });
};

/**
 * Hook para eliminar una aeronave
 */
export const useEliminarAeronave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eliminarAeronave(id),
    onSuccess: (response) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.stats() });

      notifications.success(`Aeronave ${response.data.matricula} eliminada exitosamente`);
    },
    onError: (error) => {
      handleError(error, 'Error al eliminar la aeronave');
    },
  });
};

/**
 * Hook para actualizar horas con propagación a componentes
 */
export const useActualizarHorasConPropagacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      aeronaveId,
      data,
    }: {
      aeronaveId: string;
      data: {
        horasVuelo: number;
        propagarAComponentes?: boolean;
        motivo?: string;
        observaciones?: string;
      };
    }) => actualizarHorasConPropagacion(aeronaveId, data),
    onSuccess: (response, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.detail(variables.aeronaveId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventario.componentes(variables.aeronaveId),
      });

      const componentesActualizados = response.data.propagacion?.componentesActualizados || 0;
      notifications.success(
        `Horas actualizadas: ${response.data.aeronave.horasVuelo}h. ${componentesActualizados} componentes actualizados`
      );
    },
    onError: (error) => {
      handleError(error, 'Error al actualizar las horas');
    },
  });
};

/**
 * Hook para actualizar solo el estado de una aeronave
 */
export const useActualizarEstadoAeronave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ aeronaveId, estado }: { aeronaveId: string; estado: EstadoAeronave }) =>
      actualizarEstadoAeronave(aeronaveId, estado),
    onSuccess: (response, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.detail(variables.aeronaveId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventario.stats() });

      notifications.success(`Estado actualizado a: ${response.data.estado}`);
    },
    onError: (error) => {
      handleError(error, 'Error al actualizar el estado');
    },
  });
};

/**
 * Hook combinado que expone todas las operaciones de inventario
 */
export const useInventario = () => {
  const crearMutation = useCrearAeronave();
  const actualizarMutation = useActualizarAeronave();
  const eliminarMutation = useEliminarAeronave();
  const actualizarHorasMutation = useActualizarHorasConPropagacion();
  const actualizarEstadoMutation = useActualizarEstadoAeronave();

  return {
    // Mutations
    crear: crearMutation.mutateAsync,
    actualizar: actualizarMutation.mutateAsync,
    eliminar: eliminarMutation.mutateAsync,
    actualizarHoras: actualizarHorasMutation.mutateAsync,
    actualizarEstado: actualizarEstadoMutation.mutateAsync,

    // Estados
    isCreating: crearMutation.isPending,
    isUpdating: actualizarMutation.isPending,
    isDeleting: eliminarMutation.isPending,
    isUpdatingHoras: actualizarHorasMutation.isPending,
    isUpdatingEstado: actualizarEstadoMutation.isPending,

    // Errores
    createError: crearMutation.error,
    updateError: actualizarMutation.error,
    deleteError: eliminarMutation.error,
  };
};
