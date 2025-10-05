import { useState, useEffect, useCallback } from 'react';
import { obtenerAeronaves } from '../../utils/inventarioApi';
import { IAeronave } from '../../types/inventario';

interface UseAeronavesState {
  data: IAeronave[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook simple para obtener todas las aeronaves
 * Sin cache - cada llamada hace fetch directo
 */
export function useAeronaves() {
  const [state, setState] = useState<UseAeronavesState>({
    data: [],
    isLoading: true,
    error: null
  });

  const fetchAeronaves = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await obtenerAeronaves();
      
      if (response.success && response.data) {
        setState({
          data: response.data,
          isLoading: false,
          error: null
        });
      } else {
        setState({
          data: [],
          isLoading: false,
          error: 'Error al obtener aeronaves'
        });
      }
    } catch (error) {
      setState({
        data: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, []);

  useEffect(() => {
    fetchAeronaves();
  }, [fetchAeronaves]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchAeronaves
  };
}

interface UseEstadisticasState {
  data: any | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook simple para obtener estadísticas de aeronaves
 */
export function useEstadisticasAeronaves() {
  const [state, setState] = useState<UseEstadisticasState>({
    data: null,
    isLoading: true,
    error: null
  });

  const fetchEstadisticas = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      // Por ahora retornamos datos mock ya que el endpoint puede no estar implementado
      const mockStats = {
        total: 0,
        activos: 0,
        mantenimiento: 0,
        fuera_servicio: 0
      };
      
      setState({
        data: mockStats,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
      });
    }
  }, []);

  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: fetchEstadisticas
  };
}

/**
 * Hook combinado para obtener aeronaves y estadísticas
 */
export function useInventarioCompleto() {
  const aeronavesQuery = useAeronaves();
  const estadisticasQuery = useEstadisticasAeronaves();

  return {
    aeronaves: aeronavesQuery.data,
    estadisticas: estadisticasQuery.data,
    isLoading: aeronavesQuery.isLoading || estadisticasQuery.isLoading,
    error: aeronavesQuery.error || estadisticasQuery.error,
    refetch: () => {
      aeronavesQuery.refetch();
      estadisticasQuery.refetch();
    },
  };
}
