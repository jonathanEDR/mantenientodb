import { useState, useEffect, useCallback } from 'react';

// Interfaces para monitoreo granular
export interface IAlertaComponente {
  componenteId: string;
  numeroSerie: string;
  nombre: string;
  categoria: string;
  controlDescripcion: string;
  valorActual: number;
  valorLimite: number;
  unidad: string;
  estado: 'OK' | 'PROXIMO' | 'VENCIDO';
  progreso: number;
  fechaProximaRevision: string;
  alertaActiva: boolean;
  criticidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}

export interface IResumenMonitoreoGranular {
  aeronaveId: string;
  matricula: string;
  tipo: string;
  modelo: string;
  horasVuelo: number;
  componentesMonitoreados: number;
  alertasComponentes: IAlertaComponente[];
  resumen: {
    componentesOk: number;
    componentesProximos: number;
    componentesVencidos: number;
    componentesCriticos: number;
  };
  ultimaActualizacion: string;
}

export interface IResumenFlotaGranular {
  totalAeronaves: number;
  aeronavesConAlertas: number;
  totalComponentesMonitoreados: number;
  totalAlertasComponentes: number;
  aeronaves: IResumenMonitoreoGranular[];
  alertasPrioritarias: IAlertaComponente[];
  generadoEn: string;
}

interface UseMonitoreoGranularReturn {
  // Estados
  resumenFlota: IResumenFlotaGranular | null;
  resumenAeronave: IResumenMonitoreoGranular | null;
  alertasCriticas: IAlertaComponente[];
  loading: boolean;
  error: string | null;
  
  // Funciones
  cargarResumenFlota: () => Promise<void>;
  cargarResumenAeronave: (aeronaveId: string) => Promise<void>;
  cargarAlertasCriticas: (aeronaveId: string) => Promise<void>;
  limpiarError: () => void;
  refrescar: () => Promise<void>;
}

/**
 * Hook para gestionar monitoreo granular basado en estados de componentes
 */
export const useMonitoreoGranular = (): UseMonitoreoGranularReturn => {
  const [resumenFlota, setResumenFlota] = useState<IResumenFlotaGranular | null>(null);
  const [resumenAeronave, setResumenAeronave] = useState<IResumenMonitoreoGranular | null>(null);
  const [alertasCriticas, setAlertasCriticas] = useState<IAlertaComponente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  /**
   * Función para manejar errores de fetch
   */
  const manejarError = (error: any, contexto: string) => {
    console.error(`❌ [MONITOREO GRANULAR] Error en ${contexto}:`, error);
    const mensaje = error?.response?.data?.message || error?.message || `Error en ${contexto}`;
    setError(mensaje);
  };

  /**
   * Cargar resumen granular de toda la flota
   */
  const cargarResumenFlota = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 [MONITOREO GRANULAR] Cargando resumen de flota...');

      const response = await fetch(`${API_BASE}/api/estados-monitoreo-componente/granular/flota`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResumenFlota(data.data);
        console.log('✅ [MONITOREO GRANULAR] Resumen de flota cargado:', data.data);
      } else {
        throw new Error(data.message || 'Error al cargar resumen de flota');
      }

    } catch (error) {
      manejarError(error, 'cargar resumen de flota');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  /**
   * Cargar resumen granular de una aeronave específica
   */
  const cargarResumenAeronave = useCallback(async (aeronaveId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📊 [MONITOREO GRANULAR] Cargando resumen de aeronave: ${aeronaveId}`);

      const response = await fetch(`${API_BASE}/api/estados-monitoreo-componente/granular/aeronave/${aeronaveId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResumenAeronave(data.data);
        console.log('✅ [MONITOREO GRANULAR] Resumen de aeronave cargado:', data.data);
      } else {
        throw new Error(data.message || 'Error al cargar resumen de aeronave');
      }

    } catch (error) {
      manejarError(error, 'cargar resumen de aeronave');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  /**
   * Cargar alertas críticas de una aeronave
   */
  const cargarAlertasCriticas = useCallback(async (aeronaveId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🚨 [MONITOREO GRANULAR] Cargando alertas críticas de aeronave: ${aeronaveId}`);

      const response = await fetch(`${API_BASE}/api/estados-monitoreo-componente/granular/aeronave/${aeronaveId}/criticas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAlertasCriticas(data.data);
        console.log('✅ [MONITOREO GRANULAR] Alertas críticas cargadas:', data.data);
      } else {
        throw new Error(data.message || 'Error al cargar alertas críticas');
      }

    } catch (error) {
      manejarError(error, 'cargar alertas críticas');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  /**
   * Limpiar errores
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refrescar datos actuales
   */
  const refrescar = useCallback(async () => {
    if (resumenFlota) {
      await cargarResumenFlota();
    }
    if (resumenAeronave) {
      await cargarResumenAeronave(resumenAeronave.aeronaveId);
    }
  }, [resumenFlota, resumenAeronave, cargarResumenFlota, cargarResumenAeronave]);

  return {
    // Estados
    resumenFlota,
    resumenAeronave,
    alertasCriticas,
    loading,
    error,
    
    // Funciones
    cargarResumenFlota,
    cargarResumenAeronave,
    cargarAlertasCriticas,
    limpiarError,
    refrescar
  };
};

export default useMonitoreoGranular;