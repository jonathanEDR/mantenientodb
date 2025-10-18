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

    // OPTIMIZACIÓN: Permitir caché del navegador (30s del backend)
    // Esto reduce peticiones redundantes y mejora rendimiento
    const url = `/estados-monitoreo-componente/componente/${componenteId}`;
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(url);
      
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