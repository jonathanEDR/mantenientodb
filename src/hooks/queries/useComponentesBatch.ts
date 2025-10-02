import { useQuery } from '@tanstack/react-query';
import { obtenerComponentesConEstadosPorAeronave, obtenerTodosComponentesConEstadosBatch } from '../../utils/componentesBatchApi';
import { IComponente } from '../../types/mantenimiento';
import { IEstadoMonitoreoComponente } from '../../types/estadosMonitoreoComponente';

// Query Keys para el sistema batch
export const componentesBatchKeys = {
  all: ['componentes-batch'] as const,
  porAeronave: (aeronaveId: string) => [...componentesBatchKeys.all, 'aeronave', aeronaveId] as const,
  todosBatch: () => [...componentesBatchKeys.all, 'todos-batch'] as const,
};

/**
 * Hook optimizado para obtener componentes con estados por aeronave
 * Usa la ruta batch del backend que reduce N+1 consultas a solo 2 queries
 */
export function useComponentesBatchPorAeronave(aeronaveId?: string) {
  return useQuery({
    queryKey: componentesBatchKeys.porAeronave(aeronaveId || ''),
    queryFn: async () => {
      if (!aeronaveId) return { componentes: [], estados: {} };
      
      const response = await obtenerComponentesConEstadosPorAeronave(aeronaveId);
      
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener componentes batch');
      }

      return {
        componentes: response.data,
        estados: response.estadosMap,
        total: response.total,
        estadosTotal: response.estadosTotal
      };
    },
    enabled: !!aeronaveId,
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook optimizado para obtener TODOS los componentes con estados usando batch loading
 * Agrupa por aeronave para minimizar consultas al backend
 */
export function useComponentesConEstadosBatch() {
  return useQuery({
    queryKey: componentesBatchKeys.todosBatch(),
    queryFn: async () => {
      const response = await obtenerTodosComponentesConEstadosBatch();
      
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener componentes batch');
      }

      // Aplanar los componentes de todas las aeronaves
      const todosComponentes: IComponente[] = [];
      Object.values(response.data).forEach((componentesAeronave: IComponente[]) => {
        todosComponentes.push(...componentesAeronave);
      });

      return {
        componentes: todosComponentes,
        componentesPorAeronave: response.data,
        estadosMap: response.estadosMap,
        aeronaves: response.aeronaves,
        totalComponentes: response.totalComponentes,
        totalEstados: response.totalEstados
      };
    },
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook auxiliar para obtener estados de un componente específico desde el cache batch
 */
export function useEstadosComponenteDesdeBatch(componenteId: string, estadosMap: Record<string, IEstadoMonitoreoComponente[]>) {
  return estadosMap[componenteId] || [];
}

/**
 * Hook auxiliar para obtener componentes de una aeronave específica desde el cache batch
 */
export function useComponentesAeronaveDesdeBatch(aeronaveId: string, componentesPorAeronave: Record<string, IComponente[]>) {
  return componentesPorAeronave[aeronaveId] || [];
}