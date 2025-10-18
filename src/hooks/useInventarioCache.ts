/**
 * ===== HOOK DE CACHE OPTIMIZADO PARA INVENTARIO =====
 * 
 * Cache inteligente con TTL diferenciado para aeronaves y estadísticas
 * Previene consultas redundantes y mejora la experiencia de usuario
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { IAeronave, IEstadisticasInventario } from '../types/inventario';
import { obtenerAeronaves, obtenerEstadisticasInventario } from '../utils/inventarioApi';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  loading: boolean;
}

// Cache global compartido entre todas las instancias
const CACHE_AERONAVES = new Map<string, CacheEntry<IAeronave[]>>();
const CACHE_ESTADISTICAS = new Map<string, CacheEntry<IEstadisticasInventario>>();

// TTL por tipo de dato
const CACHE_DURATION_AERONAVES = 2 * 60 * 1000; // 2 minutos para aeronaves
const CACHE_DURATION_ESTADISTICAS = 5 * 60 * 1000; // 5 minutos para estadísticas

// Sets para evitar consultas duplicadas simultáneas
const fetchingAeronaves = new Set<string>();
const fetchingEstadisticas = new Set<string>();

/**
 * Hook optimizado para gestión de aeronaves con cache inteligente
 */
export const useAeronavesCache = (page = 1, filtros = {}) => {
  const [aeronaves, setAeronaves] = useState<IAeronave[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  const isMounted = useRef(true);

  // FIXED: Generar clave de cache estable para evitar bucles infinitos
  const cacheKey = useMemo(() => {
    const filtrosStable = Object.keys(filtros).length > 0 ? JSON.stringify(filtros) : '';
    return `aeronaves_${page}_${filtrosStable}`;
  }, [page, filtros]);

  const cargarAeronaves = useCallback(async (forceRefresh = false) => {
    if (!isMounted.current) return;

    // Evitar consultas duplicadas simultáneas
    if (fetchingAeronaves.has(cacheKey)) {
      return;
    }

    const cached = CACHE_AERONAVES.get(cacheKey);
    const now = Date.now();

    // Usar cache si está disponible y no ha expirado
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION_AERONAVES) {
      setAeronaves(cached.data);
      setLoading(cached.loading);
      return;
    }

    // Marcar como fetching
    fetchingAeronaves.add(cacheKey);
    setLoading(true);
    setError(null);

    // Actualizar estado de caché como "loading"
    CACHE_AERONAVES.set(cacheKey, {
      data: cached?.data || [],
      timestamp: now,
      loading: true
    });

    try {
      const response = await obtenerAeronaves({
        page,
        limit: 20,
        ...filtros
      });

      if (response.success) {
        const aeronavesDatos = response.data || [];
        
        // Actualizar caché
        CACHE_AERONAVES.set(cacheKey, {
          data: aeronavesDatos,
          timestamp: Date.now(),
          loading: false
        });

        if (isMounted.current) {
          setAeronaves(aeronavesDatos);
          setPagination(response.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false
          });
          setError(null);
        }
      } else {
        throw new Error('Error al cargar aeronaves');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al cargar aeronaves';
      console.error('Error al cargar aeronaves:', errorMsg);
      
      // Mantener datos antiguos en caso de error si existen
      if (cached?.data && cached.data.length > 0) {
        if (isMounted.current) {
          setAeronaves(cached.data);
          setError(`Error de red: usando datos en caché (${errorMsg})`);
        }
      } else {
        if (isMounted.current) {
          setAeronaves([]);
          setError(errorMsg);
        }
      }
    } finally {
      fetchingAeronaves.delete(cacheKey);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [cacheKey, page, filtros]);

  // Cargar datos al montar o cambiar parámetros
  useEffect(() => {
    cargarAeronaves();
  }, [cargarAeronaves]);

  // Invalidar caché manualmente
  const invalidarCache = useCallback(() => {
    CACHE_AERONAVES.delete(cacheKey);
  }, [cacheKey]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    aeronaves,
    loading,
    error,
    pagination,
    refrescar: () => cargarAeronaves(true),
    invalidarCache
  };
};

/**
 * Hook optimizado para estadísticas con cache de larga duración
 */
export const useEstadisticasCache = () => {
  const [estadisticas, setEstadisticas] = useState<IEstadisticasInventario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);
  const cacheKey = 'estadisticas_inventario';

  const cargarEstadisticas = useCallback(async (forceRefresh = false) => {
    if (!isMounted.current) return;

    // Evitar consultas duplicadas simultáneas
    if (fetchingEstadisticas.has(cacheKey)) {
      return;
    }

    const cached = CACHE_ESTADISTICAS.get(cacheKey);
    const now = Date.now();

    // Usar cache si está disponible y no ha expirado
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION_ESTADISTICAS) {
      setEstadisticas(cached.data);
      setLoading(cached.loading);
      return;
    }

    // Marcar como fetching
    fetchingEstadisticas.add(cacheKey);
    setLoading(true);
    setError(null);

    // Actualizar estado de caché como "loading"
    CACHE_ESTADISTICAS.set(cacheKey, {
      data: cached?.data || null as any,
      timestamp: now,
      loading: true
    });

    try {
      const response = await obtenerEstadisticasInventario();

      if (response.success) {
        // Actualizar caché
        CACHE_ESTADISTICAS.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
          loading: false
        });

        if (isMounted.current) {
          setEstadisticas(response.data);
          setError(null);
        }
      } else {
        throw new Error('Error al cargar estadísticas');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al cargar estadísticas';
      console.error('Error al cargar estadísticas:', errorMsg);
      
      // Mantener datos antiguos en caso de error si existen
      if (cached?.data) {
        if (isMounted.current) {
          setEstadisticas(cached.data);
          setError(`Error de red: usando datos en caché (${errorMsg})`);
        }
      } else {
        if (isMounted.current) {
          setEstadisticas(null);
          setError(errorMsg);
        }
      }
    } finally {
      fetchingEstadisticas.delete(cacheKey);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // Invalidar caché manualmente
  const invalidarCache = useCallback(() => {
    CACHE_ESTADISTICAS.delete(cacheKey);
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    estadisticas,
    loading,
    error,
    refrescar: () => cargarEstadisticas(true),
    invalidarCache
  };
};

// Funciones helper para invalidar cache desde cualquier lugar
export const invalidarCacheAeronaves = (filtros?: any) => {
  // Invalidar entradas relacionadas con los filtros
  const keys = Array.from(CACHE_AERONAVES.keys());
  keys.forEach(key => {
    if (!filtros || key.includes(JSON.stringify(filtros))) {
      CACHE_AERONAVES.delete(key);
    }
  });
};

export const invalidarCacheEstadisticas = () => {
  CACHE_ESTADISTICAS.clear();
};

export const limpiarCacheInventario = () => {
  CACHE_AERONAVES.clear();
  CACHE_ESTADISTICAS.clear();
};