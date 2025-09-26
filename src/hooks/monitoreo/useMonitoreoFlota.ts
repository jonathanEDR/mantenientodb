import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  IResumenFlota,
  IResumenMonitoreoAeronave,
  EstadoAlerta,
  TipoAlerta
} from '../../types/monitoreo';
import { obtenerResumenFlota } from '../../utils/monitoreoApi';

interface IMonitoreoError {
  message: string;
  code: string;
  details?: string;
}

interface UseMonitoreoFlotaState {
  resumenFlota: IResumenFlota | null;
  loading: boolean;
  error: IMonitoreoError | null;
  ultimaActualizacion: Date | null;
}

interface CacheEntry {
  data: IResumenFlota;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface FiltrosFlota {
  soloConAlertas?: boolean;
  estadosPermitidos?: EstadoAlerta[];
  tiposAlertaPermitidos?: TipoAlerta[];
  horasMinimas?: number;
  horasMaximas?: number;
}

interface UseMonitoreoFlotaReturn extends UseMonitoreoFlotaState {
  refetch: () => Promise<void>;
  aeronavesFiltrasdas: IResumenMonitoreoAeronave[];
  aplicarFiltros: (filtros: FiltrosFlota) => void;
  estadisticas: {
    totalAeronaves: number;
    aeronavesConProblemas: number;
    porcentajeProblemas: number;
    totalAlertasCriticas: number;
    totalAlertasProximas: number;
    promedioSalud: number;
  };
  limpiarError: () => void;
  obtenerAeronavesOrdenadas: (criterio: 'alfabetico' | 'criticidad' | 'horas') => IResumenMonitoreoAeronave[];
}

// Cache global para evitar múltiples peticiones
const CACHE_KEY = 'monitoreo_flota_cache';
const CACHE_TTL = Number(import.meta.env.VITE_CACHE_TTL) || 30000; // 30 segundos por defecto
const IS_DEVELOPMENT = import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.DEV;
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';
let globalCache: CacheEntry | null = null;

// Función para verificar si el cache es válido
const isCacheValid = (cache: CacheEntry | null): boolean => {
  if (!cache) return false;
  return Date.now() - cache.timestamp < cache.ttl;
};

// Función de debouncing
const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

/**
 * Hook para gestionar el monitoreo de toda la flota
 */
export const useMonitoreoFlota = (): UseMonitoreoFlotaReturn => {
  const [state, setState] = useState<UseMonitoreoFlotaState>({
    resumenFlota: null,
    loading: false,
    error: null,
    ultimaActualizacion: null,
  });

  const [filtros, setFiltros] = useState<FiltrosFlota>({});
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  /**
   * Función para limpiar errores
   */
  const limpiarError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Función para obtener el resumen de la flota con cache y retry logic
   */
  const fetchResumenFlota = useCallback(async (forceRefresh = false) => {
    // Verificar cache si no es refresh forzado
    if (!forceRefresh && isCacheValid(globalCache)) {
      setState(prev => ({
        ...prev,
        resumenFlota: globalCache!.data,
        loading: false,
        error: null,
        ultimaActualizacion: new Date(globalCache!.timestamp),
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await obtenerResumenFlota();

      // Actualizar cache global
      globalCache = {
        data,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      };

      setState(prev => ({
        ...prev,
        resumenFlota: data,
        loading: false,
        error: null,
        ultimaActualizacion: new Date(),
      }));

      // Reset retry counter on success
      retryCountRef.current = 0;

    } catch (error: any) {
      if (DEBUG_MODE) {
        console.error('🚨 [useMonitoreoFlota] Error al obtener resumen de flota:', error);
        console.error('🔍 [useMonitoreoFlota] Error details:', {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          url: error?.config?.url
        });
      }

      const isRateLimitError = error?.response?.status === 429;
      const shouldRetry = isRateLimitError && retryCountRef.current < maxRetries;

      if (shouldRetry) {
        retryCountRef.current += 1;
        const retryDelay = Math.pow(2, retryCountRef.current) * 1000; // Exponential backoff

        if (DEBUG_MODE) {
          console.log(`🔄 [useMonitoreoFlota] Rate limit error, retrying in ${retryDelay}ms (attempt ${retryCountRef.current}/${maxRetries})`);
        }

        setTimeout(() => {
          fetchResumenFlota(forceRefresh);
        }, retryDelay);

        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          message: isRateLimitError
            ? 'Demasiadas solicitudes. El sistema se está limitando automáticamente.'
            : (error instanceof Error ? error.message : 'Error desconocido'),
          code: isRateLimitError ? 'RATE_LIMIT_ERROR' : 'FETCH_ERROR',
          details: error instanceof Error ? error.stack : undefined
        }
      }));
    }
  }, []);

  /**
   * Aplicar filtros a la flota
   */
  const aplicarFiltros = useCallback((nuevosFiltros: FiltrosFlota) => {
    setFiltros(nuevosFiltros);
  }, []);

  /**
   * Calcular el porcentaje de salud de una aeronave
   */
  const calcularPorcentajeSalud = useCallback((aeronave: IResumenMonitoreoAeronave): number => {
    if (aeronave.totalAlertas === 0) return 100;
    
    const pesoOk = 100;
    const pesoProximo = 50;
    const pesoCritico = 0;
    
    const puntuacionTotal = 
      (aeronave.alertasOk * pesoOk) +
      (aeronave.alertasProximas * pesoProximo) +
      (aeronave.alertasCriticas * pesoCritico);
      
    const puntuacionMaxima = aeronave.totalAlertas * pesoOk;
    
    return Math.round((puntuacionTotal / puntuacionMaxima) * 100);
  }, []);

  /**
   * Determinar el nivel de criticidad de una aeronave
   */
  const calcularNivelCriticidad = useCallback((aeronave: IResumenMonitoreoAeronave): EstadoAlerta => {
    if (aeronave.alertasCriticas > 0) {
      return EstadoAlerta.VENCIDO;
    }
    if (aeronave.alertasProximas > 0) {
      return EstadoAlerta.PROXIMO;
    }
    return EstadoAlerta.OK;
  }, []);

  /**
   * Aeronaves filtradas según los criterios aplicados
   */
  const aeronavesFiltrasdas = useMemo((): IResumenMonitoreoAeronave[] => {
    if (!state.resumenFlota?.aeronaves) return [];

    return state.resumenFlota.aeronaves.filter(aeronave => {
      // Filtro por alertas
      if (filtros.soloConAlertas && (aeronave.alertasCriticas + aeronave.alertasProximas) === 0) {
        return false;
      }

      // Filtro por estados permitidos
      if (filtros.estadosPermitidos && filtros.estadosPermitidos.length > 0) {
        const estadoAeronave = calcularNivelCriticidad(aeronave);
        if (!filtros.estadosPermitidos.includes(estadoAeronave)) {
          return false;
        }
      }

      // Filtro por horas de vuelo
      if (filtros.horasMinimas !== undefined && aeronave.horasVueloActuales < filtros.horasMinimas) {
        return false;
      }

      if (filtros.horasMaximas !== undefined && aeronave.horasVueloActuales > filtros.horasMaximas) {
        return false;
      }

      // Filtro por tipos de alerta (requiere revisar las alertas individuales)
      if (filtros.tiposAlertaPermitidos && filtros.tiposAlertaPermitidos.length > 0) {
        const tieneAlertaPermitida = aeronave.alertas?.some(alerta => 
          filtros.tiposAlertaPermitidos!.includes(alerta.tipoAlerta)
        );
        if (!tieneAlertaPermitida) {
          return false;
        }
      }

      return true;
    });
  }, [state.resumenFlota, filtros, calcularNivelCriticidad]);

  /**
   * Estadísticas calculadas de la flota
   */
  const estadisticas = useMemo(() => {
    if (!state.resumenFlota) {
      return {
        totalAeronaves: 0,
        aeronavesConProblemas: 0,
        porcentajeProblemas: 0,
        totalAlertasCriticas: 0,
        totalAlertasProximas: 0,
        promedioSalud: 0,
      };
    }

    const aeronavesConProblemas = aeronavesFiltrasdas.filter(
      aeronave => aeronave.alertasCriticas > 0 || aeronave.alertasProximas > 0
    ).length;

    const totalAlertasCriticas = aeronavesFiltrasdas.reduce(
      (total, aeronave) => total + aeronave.alertasCriticas, 0
    );

    const totalAlertasProximas = aeronavesFiltrasdas.reduce(
      (total, aeronave) => total + aeronave.alertasProximas, 0
    );

    const sumatoriaSalud = aeronavesFiltrasdas.reduce(
      (total, aeronave) => total + calcularPorcentajeSalud(aeronave), 0
    );

    const promedioSalud = aeronavesFiltrasdas.length > 0 
      ? Math.round(sumatoriaSalud / aeronavesFiltrasdas.length)
      : 0;

    return {
      totalAeronaves: aeronavesFiltrasdas.length,
      aeronavesConProblemas,
      porcentajeProblemas: aeronavesFiltrasdas.length > 0 
        ? Math.round((aeronavesConProblemas / aeronavesFiltrasdas.length) * 100) 
        : 0,
      totalAlertasCriticas,
      totalAlertasProximas,
      promedioSalud,
    };
  }, [aeronavesFiltrasdas, calcularPorcentajeSalud]);

  /**
   * Obtener aeronaves ordenadas según diferentes criterios
   */
  const obtenerAeronavesOrdenadas = useCallback((criterio: 'alfabetico' | 'criticidad' | 'horas'): IResumenMonitoreoAeronave[] => {
    const aeronaves = [...aeronavesFiltrasdas];

    switch (criterio) {
      case 'alfabetico':
        return aeronaves.sort((a, b) => a.matricula.localeCompare(b.matricula));
      
      case 'criticidad':
        return aeronaves.sort((a, b) => {
          const estadoA = calcularNivelCriticidad(a);
          const estadoB = calcularNivelCriticidad(b);
          
          // VENCIDO = 0, PROXIMO = 1, OK = 2 (para ordenar por criticidad descendente)
          const pesoEstado = { [EstadoAlerta.VENCIDO]: 0, [EstadoAlerta.PROXIMO]: 1, [EstadoAlerta.OK]: 2 };
          
          if (pesoEstado[estadoA] !== pesoEstado[estadoB]) {
            return pesoEstado[estadoA] - pesoEstado[estadoB];
          }
          
          // Si tienen el mismo estado, ordenar por número de alertas críticas
          return b.alertasCriticas - a.alertasCriticas;
        });
      
      case 'horas':
        return aeronaves.sort((a, b) => b.horasVueloActuales - a.horasVueloActuales);
      
      default:
        return aeronaves;
    }
  }, [aeronavesFiltrasdas, calcularNivelCriticidad]);

  // Función debounced para evitar múltiples calls
  const debouncedFetch = useMemo(
    () => debounce(() => fetchResumenFlota(), 500),
    [fetchResumenFlota]
  );

  // Efecto para cargar datos iniciales con debouncing
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Usar timeout para evitar llamadas inmediatas en StrictMode
    fetchTimeoutRef.current = setTimeout(() => {
      fetchResumenFlota();
    }, 100);

    // Cleanup
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []); // Solo ejecutar una vez al montar

  // Efecto para limpiar cache cuando el componente se desmonta
  useEffect(() => {
    return () => {
      // No limpiar el cache global aquí, puede ser usado por otros componentes
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch: fetchResumenFlota,
    aeronavesFiltrasdas,
    aplicarFiltros,
    estadisticas,
    limpiarError,
    obtenerAeronavesOrdenadas,
  };
};

/**
 * Hook simplificado para obtener solo estadísticas de la flota
 */
export const useEstadisticasFlota = () => {
  const { estadisticas, loading, error, refetch } = useMonitoreoFlota();
  
  return {
    estadisticas,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para obtener solo aeronaves con problemas
 */
export const useAeronavesConProblemas = () => {
  const { aeronavesFiltrasdas, loading, error, refetch } = useMonitoreoFlota();
  
  const aeronavesConProblemas = aeronavesFiltrasdas.filter(
    aeronave => aeronave.alertasCriticas > 0 || aeronave.alertasProximas > 0
  );

  return {
    aeronavesConProblemas,
    loading,
    error,
    refetch,
    cantidad: aeronavesConProblemas.length
  };
};

/**
 * Hook para monitoreo con actualización automática
 */
export const useMonitoreoFlotaEnTiempoReal = (intervaloMs: number = 300000) => { // 5 minutos por defecto
  const monitoreoFlota = useMonitoreoFlota();
  
  useEffect(() => {
    const intervalo = setInterval(() => {
      monitoreoFlota.refetch();
    }, intervaloMs);

    return () => clearInterval(intervalo);
  }, [monitoreoFlota.refetch, intervaloMs]);

  return monitoreoFlota;
};

export default useMonitoreoFlota;