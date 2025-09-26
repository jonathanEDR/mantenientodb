import { useState, useEffect, useCallback } from 'react';
import { 
  IAlertaMonitoreo, 
  IResumenMonitoreoAeronave, 
  EstadoAlerta,
  TipoAlerta
} from '../../types/monitoreo';
import { obtenerMonitoreoAeronave } from '../../utils/monitoreoApi';

interface IMonitoreoError {
  message: string;
  code: string;
  details?: string;
}

interface UseMonitoreoState {
  alertas: IAlertaMonitoreo[];
  resumen: IResumenMonitoreoAeronave | null;
  loading: boolean;
  error: IMonitoreoError | null;
}

interface UseMonitoreoReturn extends UseMonitoreoState {
  refetch: () => Promise<void>;
  filtrarPorEstado: (estados: EstadoAlerta[]) => IAlertaMonitoreo[];
  filtrarPorTipo: (tipos: TipoAlerta[]) => IAlertaMonitoreo[];
  obtenerAlertasPrioritarias: () => IAlertaMonitoreo[];
  limpiarError: () => void;
}

/**
 * Hook para gestionar el monitoreo de una aeronave específica
 */
export const useMonitoreo = (matricula: string): UseMonitoreoReturn => {
  const [state, setState] = useState<UseMonitoreoState>({
    alertas: [],
    resumen: null,
    loading: false,
    error: null,
  });

  /**
   * Función para limpiar errores
   */
  const limpiarError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Función para obtener datos del monitoreo
   */
  const fetchMonitoreo = useCallback(async () => {
    if (!matricula) {
      setState(prev => ({
        ...prev,
        error: {
          message: 'Matrícula requerida',
          code: 'MATRICULA_REQUERIDA',
          details: 'Debe proporcionar una matrícula válida para obtener el monitoreo'
        }
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await obtenerMonitoreoAeronave(matricula);
      
      setState(prev => ({
        ...prev,
        alertas: data.data?.alertas || [],
        resumen: data.data?.resumen || null,
        loading: false,
        error: null,
      }));

    } catch (error) {
      console.error('Error al obtener monitoreo:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          message: error instanceof Error ? error.message : 'Error desconocido',
          code: 'FETCH_ERROR',
          details: error instanceof Error ? error.stack : undefined
        }
      }));
    }
  }, [matricula]);

  /**
   * Filtrar alertas por estado
   */
  const filtrarPorEstado = useCallback((estados: EstadoAlerta[]): IAlertaMonitoreo[] => {
    return state.alertas.filter(alerta => estados.includes(alerta.estado));
  }, [state.alertas]);

  /**
   * Filtrar alertas por tipo
   */
  const filtrarPorTipo = useCallback((tipos: TipoAlerta[]): IAlertaMonitoreo[] => {
    return state.alertas.filter(alerta => tipos.includes(alerta.tipoAlerta));
  }, [state.alertas]);

  /**
   * Obtener las alertas más prioritarias (críticas y próximas, máximo 3)
   */
  const obtenerAlertasPrioritarias = useCallback((): IAlertaMonitoreo[] => {
    return state.alertas
      .filter(alerta => alerta.estado !== EstadoAlerta.OK)
      .sort((a, b) => {
        // Primero por estado (VENCIDO > PROXIMO)
        if (a.estado !== b.estado) {
          if (a.estado === EstadoAlerta.VENCIDO) return -1;
          if (b.estado === EstadoAlerta.VENCIDO) return 1;
        }
        // Luego por prioridad (1 > 2 > 3)
        return a.prioridad - b.prioridad;
      })
      .slice(0, 3);
  }, [state.alertas]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (matricula) {
      fetchMonitoreo();
    }
  }, [fetchMonitoreo, matricula]);

  return {
    ...state,
    refetch: fetchMonitoreo,
    filtrarPorEstado,
    filtrarPorTipo,
    obtenerAlertasPrioritarias,
    limpiarError,
  };
};

/**
 * Hook simplificado para obtener solo el resumen de monitoreo
 */
export const useResumenMonitoreo = (matricula: string) => {
  const { resumen, loading, error, refetch } = useMonitoreo(matricula);
  
  return {
    resumen,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para obtener solo alertas críticas
 */
export const useAlertasCriticas = (matricula: string) => {
  const { alertas, loading, error, refetch } = useMonitoreo(matricula);
  
  const alertasCriticas = alertas.filter(alerta => alerta.estado === EstadoAlerta.VENCIDO);
  
  return {
    alertasCriticas,
    loading,
    error,
    refetch,
    hayAlertas: alertasCriticas.length > 0,
    numeroAlertas: alertasCriticas.length
  };
};

/**
 * Hook para obtener el estado general de salud de una aeronave
 */
export const useEstadoSalud = (matricula: string) => {
  const { resumen, loading, error } = useResumenMonitoreo(matricula);
  
  const calcularEstadoSalud = (): EstadoAlerta => {
    if (!resumen) return EstadoAlerta.OK;
    
    if (resumen.alertasCriticas > 0) {
      return EstadoAlerta.VENCIDO;
    }
    if (resumen.alertasProximas > 0) {
      return EstadoAlerta.PROXIMO;
    }
    return EstadoAlerta.OK;
  };

  const calcularPorcentajeSalud = (): number => {
    if (!resumen || resumen.totalAlertas === 0) return 100;
    
    const pesoOk = 100;
    const pesoProximo = 50;
    const pesoCritico = 0;
    
    const puntuacionTotal = 
      (resumen.alertasOk * pesoOk) +
      (resumen.alertasProximas * pesoProximo) +
      (resumen.alertasCriticas * pesoCritico);
      
    const puntuacionMaxima = resumen.totalAlertas * pesoOk;
    
    return Math.round((puntuacionTotal / puntuacionMaxima) * 100);
  };

  return {
    estadoSalud: calcularEstadoSalud(),
    porcentajeSalud: calcularPorcentajeSalud(),
    necesitaAtencion: (resumen?.alertasCriticas ?? 0) > 0,
    resumen,
    loading,
    error
  };
};

export default useMonitoreo;