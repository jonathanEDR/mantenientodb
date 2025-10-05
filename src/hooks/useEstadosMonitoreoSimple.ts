import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { IEstadoMonitoreoComponente } from '../types/estadosMonitoreoComponente';

export interface UseEstadosMonitoreoSimple {
  estados: IEstadoMonitoreoComponente[];
  loading: boolean;
  error: string | null;
  actualizarEstados: () => void;
}

export const useEstadosMonitoreoSimple = (componenteId?: string): UseEstadosMonitoreoSimple => {
  const [estados, setEstados] = useState<IEstadoMonitoreoComponente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarEstados = async () => {
    if (!componenteId) {
      return;
    }

    // FORZAR PETICIÓN FRESCA - ELIMINAR CACHE COMPLETAMENTE
    const timestamp = Date.now();
    const url = `/estados-monitoreo-componente/componente/${componenteId}?nocache=${timestamp}`;
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-None-Match': '' // Eliminar etag cache
        }
      });
      
      if (response.data.success) {
        const estadosData = response.data.data || [];
        setEstados(estadosData);
      } else {
        setError(response.data.message);
        setEstados([]);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Error al cargar estados');
      setEstados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstados();
  }, [componenteId]);

  return {
    estados,
    loading,
    error,
    actualizarEstados: cargarEstados
  };
};