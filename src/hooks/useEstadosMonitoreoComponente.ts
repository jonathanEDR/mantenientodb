import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IEstadoMonitoreoComponente,
  IFormEstadoMonitoreo,
  IFiltrosEstadosMonitoreo
} from '../types/estadosMonitoreoComponente';
import {
  obtenerEstadosMonitoreoComponente,
  crearEstadoMonitoreoComponente,
  actualizarEstadoMonitoreoComponente,
  eliminarEstadoMonitoreoComponente,
  completarOverhaulEstado,
  filtrarEstados
} from '../utils/estadosMonitoreoComponenteApi';

// Cache global para request deduplication
const requestCache = new Map<string, { data: IEstadoMonitoreoComponente[]; timestamp: number; promise?: Promise<any> }>();
const CACHE_TTL = 30000; // 30 segundos
const pendingRequests = new Map<string, Promise<any>>();

// Rate limiting global - máximo 5 requests por segundo
let requestQueue: Array<() => void> = [];
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 5;
const REQUEST_INTERVAL = 200; // 200ms entre requests

const executeNextRequest = () => {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
    return;
  }

  const nextRequest = requestQueue.shift();
  if (nextRequest) {
    activeRequests++;
    nextRequest();

    setTimeout(() => {
      activeRequests--;
      executeNextRequest();
    }, REQUEST_INTERVAL);
  }
};

interface UseEstadosMonitoreoComponenteReturn {
  estados: IEstadoMonitoreoComponente[];
  estadosFiltrados: IEstadoMonitoreoComponente[];
  loading: boolean;
  error: string | null;
  filtros: IFiltrosEstadosMonitoreo;
  // Funciones CRUD
  cargarEstados: (componenteId: string) => Promise<void>;
  crearEstado: (componenteId: string, datos: IFormEstadoMonitoreo) => Promise<boolean>;
  actualizarEstado: (estadoId: string, datos: Partial<IFormEstadoMonitoreo>) => Promise<boolean>;
  eliminarEstado: (estadoId: string) => Promise<boolean>;
  completarOverhaul: (estadoId: string, observaciones?: string) => Promise<boolean>;
  // Funciones de filtro
  aplicarFiltros: (nuevosFiltros: Partial<IFiltrosEstadosMonitoreo>) => void;
  limpiarFiltros: () => void;
  // Funciones de utilidad
  obtenerEstadisticas: () => {
    total: number;
    ok: number;
    proximos: number;
    vencidos: number;
    conAlertas: number;
  };
  refrescar: () => Promise<void>;
}

const filtrosIniciales: IFiltrosEstadosMonitoreo = {
  estado: 'TODOS',
  criticidad: 'TODAS',
  unidad: 'TODAS',
  alertaActiva: undefined,
  busqueda: ''
};

export const useEstadosMonitoreoComponente = (componenteId?: string): UseEstadosMonitoreoComponenteReturn => {
  const [estados, setEstados] = useState<IEstadoMonitoreoComponente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<IFiltrosEstadosMonitoreo>(filtrosIniciales);

  // Cargar estados de monitoreo con deduplication
  const cargarEstados = useCallback(async (targetComponenteId: string) => {
    const cacheKey = `estados_${targetComponenteId}`;
    const now = Date.now();

    // 1. Verificar si hay un request pendiente para este componente
    if (pendingRequests.has(cacheKey)) {
      console.log(`⏳ [useEstadosMonitoreo] Request pendiente para ${targetComponenteId}, reutilizando...`);
      try {
        await pendingRequests.get(cacheKey);
        const cached = requestCache.get(cacheKey);
        if (cached) {
          setEstados(cached.data);
          setLoading(false);
        }
        return;
      } catch (err) {
        // Si el request pendiente falla, continuar con uno nuevo
      }
    }

    // 2. Verificar caché válido
    const cached = requestCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      console.log(`📦 [useEstadosMonitoreo] Usando caché para ${targetComponenteId}`);
      setEstados(cached.data);
      setLoading(false);
      return;
    }

    // 3. Encolar nuevo request con rate limiting
    setLoading(true);
    setError(null);

    const executeRequest = async () => {
      const requestPromise = obtenerEstadosMonitoreoComponente(targetComponenteId);
      pendingRequests.set(cacheKey, requestPromise);

      try {
        const resultado = await requestPromise;

        if (resultado.success) {
          // Actualizar caché
          requestCache.set(cacheKey, {
            data: resultado.data,
            timestamp: Date.now()
          });
          setEstados(resultado.data);
          console.log(`✅ [useEstadosMonitoreo] Datos cargados y cacheados para ${targetComponenteId}`);
        } else {
          setError(resultado.error);
          setEstados([]);
        }
      } catch (err) {
        console.error('Error al cargar estados:', err);
        setError('Error inesperado al cargar estados');
        setEstados([]);
      } finally {
        setLoading(false);
        pendingRequests.delete(cacheKey);
      }
    };

    // Agregar a la cola y ejecutar
    requestQueue.push(executeRequest);
    executeNextRequest();
  }, []);

  // Crear nuevo estado
  const crearEstado = useCallback(async (
    targetComponenteId: string,
    datos: IFormEstadoMonitoreo
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await crearEstadoMonitoreoComponente(targetComponenteId, datos);

      if (resultado.success) {
        // Invalidar caché
        const cacheKey = `estados_${targetComponenteId}`;
        requestCache.delete(cacheKey);

        // Agregar el nuevo estado a la lista
        setEstados(prev => [...prev, resultado.data!]);
        return true;
      } else {
        setError(resultado.error);
        return false;
      }
    } catch (err) {
      console.error('Error al crear estado:', err);
      setError('Error inesperado al crear estado');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estado existente
  const actualizarEstado = useCallback(async (
    estadoId: string,
    datos: Partial<IFormEstadoMonitoreo>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await actualizarEstadoMonitoreoComponente(estadoId, datos);

      if (resultado.success) {
        // Invalidar caché (necesitamos el componenteId del estado actualizado)
        const estadoActual = estados.find(e => e._id === estadoId);
        if (estadoActual && estadoActual.componenteId) {
          const cacheKey = `estados_${estadoActual.componenteId}`;
          requestCache.delete(cacheKey);
        }

        // Actualizar el estado en la lista
        setEstados(prev =>
          prev.map(estado =>
            estado._id === estadoId ? resultado.data! : estado
          )
        );
        return true;
      } else {
        setError(resultado.error);
        return false;
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('Error inesperado al actualizar estado');
      return false;
    } finally {
      setLoading(false);
    }
  }, [estados]);

  // Eliminar estado
  const eliminarEstado = useCallback(async (estadoId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await eliminarEstadoMonitoreoComponente(estadoId);
      
      if (resultado.success) {
        // Remover el estado de la lista
        setEstados(prev => prev.filter(estado => estado._id !== estadoId));
        return true;
      } else {
        setError(resultado.error);
        return false;
      }
    } catch (err) {
      console.error('Error al eliminar estado:', err);
      setError('Error inesperado al eliminar estado');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Completar overhaul
  const completarOverhaul = useCallback(async (estadoId: string, observaciones?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await completarOverhaulEstado(estadoId, observaciones);
      
      if (resultado.success) {
        // Actualizar el estado en la lista
        setEstados(prev => 
          prev.map(estado => 
            estado._id === estadoId ? resultado.data! : estado
          )
        );
        return true;
      } else {
        setError(resultado.error);
        return false;
      }
    } catch (err) {
      console.error('Error al completar overhaul:', err);
      setError('Error inesperado al completar overhaul');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros
  const aplicarFiltros = useCallback((nuevosFiltros: Partial<IFiltrosEstadosMonitoreo>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  // Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros(filtrosIniciales);
  }, []);

  // Obtener estadísticas
  const obtenerEstadisticas = useCallback(() => {
    const total = estados.length;
    const ok = estados.filter(e => e.estado === 'OK').length;
    const proximos = estados.filter(e => e.estado === 'PROXIMO').length;
    const vencidos = estados.filter(e => e.estado === 'VENCIDO').length;
    const conAlertas = estados.filter(e => e.alertaActiva).length;

    return { total, ok, proximos, vencidos, conAlertas };
  }, [estados]);

  // Refrescar datos
  const refrescar = useCallback(async () => {
    if (componenteId) {
      await cargarEstados(componenteId);
    }
  }, [componenteId, cargarEstados]);

  // Calcular estados filtrados
  const estadosFiltrados = filtrarEstados(estados, filtros);

  // Control de montaje para evitar llamadas en componentes desmontados
  const isMountedRef = useRef(true);

  // Cargar estados inicial si se proporciona componenteId con AbortController
  useEffect(() => {
    if (!componenteId || !isMountedRef.current) return;

    const abortController = new AbortController();

    // Delay aleatorio para distribuir requests (aumentado a 0-500ms)
    const randomDelay = Math.random() * 500; // 0-500ms para mejor distribución
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        cargarEstados(componenteId);
      }
    }, randomDelay);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
      console.log(`🛑 [useEstadosMonitoreo] Componente desmontado, cancelando requests para ${componenteId}`);
    };
  }, [componenteId, cargarEstados]);

  // Cleanup al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    estados,
    estadosFiltrados,
    loading,
    error,
    filtros,
    cargarEstados,
    crearEstado,
    actualizarEstado,
    eliminarEstado,
    completarOverhaul,
    aplicarFiltros,
    limpiarFiltros,
    obtenerEstadisticas,
    refrescar
  };
};