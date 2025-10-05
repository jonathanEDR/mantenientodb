import { useState, useCallback } from 'react';
import api from '../utils/axiosConfig';

// Interfaces
export interface IEstadoMonitoreoDetalle {
  _id: string;
  controlId: string;
  descripcionControl: string;
  valorActual: number;
  valorLimite: number;
  unidad: string;
  estado: 'OK' | 'PROXIMO' | 'VENCIDO' | 'OVERHAUL_REQUERIDO';
  progreso: number;
  criticidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  alertaActiva: boolean;
  configuracionOverhaul?: {
    habilitarOverhaul: boolean;
    intervaloOverhaul: number;
    cicloActual: number;
    ciclosOverhaul: number;
    requiereOverhaul: boolean;
  };
}

export interface IComponenteMonitoreo {
  _id: string;
  numeroSerie: string;
  nombre: string;
  categoria: string;
  horasAcumuladas: number;
  estadosMonitoreo: IEstadoMonitoreoDetalle[];
  alertasActivas: number;
  requiereOverhaul: boolean;
}

export interface IAeronaveMonitoreo {
  _id: string;
  matricula: string;
  modelo: string;
  horasVuelo: number;
  estado: string;
  componentes: IComponenteMonitoreo[];
  resumen: {
    totalComponentes: number;
    componentesOK: number;
    componentesProximos: number;
    componentesVencidos: number;
    componentesOverhaul: number;
    alertasActivas: number;
  };
}

export interface IMonitoreoCompletoResponse {
  aeronaves: IAeronaveMonitoreo[];
  resumenGeneral: {
    totalAeronaves: number;
    totalComponentes: number;
    totalAlertas: number;
    componentesRequierenOverhaul: number;
  };
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const useMonitoreoCompleto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos de monitoreo completo
  const obtenerMonitoreoCompleto = useCallback(async (): Promise<IApiResponse<IMonitoreoCompletoResponse>> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<IApiResponse<IMonitoreoCompletoResponse>>('/dashboard/monitoreo-completo');

      if (response.data.success && response.data.data) {

        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Error al obtener datos');
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar estado específico
  const actualizarEstadoComponente = useCallback(async (
    componenteId: string, 
    estadoId: string, 
    actualizaciones: any
  ): Promise<IApiResponse<any>> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 [HOOK-MONITOREO] Actualizando estado ${estadoId} del componente ${componenteId}`);

      const response = await api.patch<IApiResponse<any>>(
        `/dashboard/componente/${componenteId}/estado/${estadoId}`,
        actualizaciones
      );

      if (response.data.success) {
        console.log('✅ [HOOK-MONITOREO] Estado actualizado correctamente');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Error al actualizar estado');
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar estado';
      console.error('❌ [HOOK-MONITOREO] Error al actualizar:', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para completar overhaul
  const completarOverhaul = useCallback(async (
    componenteId: string, 
    estadoIds: string[], 
    observaciones?: string
  ): Promise<IApiResponse<any>> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔧 [HOOK-MONITOREO] Completando overhaul del componente ${componenteId}`);

      const response = await api.post<IApiResponse<any>>(
        `/dashboard/componente/${componenteId}/completar-overhaul`,
        { 
          estadoIds, 
          observaciones 
        }
      );

      if (response.data.success) {
        console.log('✅ [HOOK-MONITOREO] Overhaul completado correctamente');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Error al completar overhaul');
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al completar overhaul';
      console.error('❌ [HOOK-MONITOREO] Error al completar overhaul:', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    obtenerMonitoreoCompleto,
    actualizarEstadoComponente,
    completarOverhaul
  };
};