/**
 * ===== HOOK OPTIMIZADO CON CACHÉ =====
 * 
 * Mejoras implementadas:
 * 1. Caché en memoria para evitar re-fetching
 * 2. Invalidación inteligente del caché
 * 3. Soporte para pre-fetching
 * 4. Reducción de llamadas API redundantes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { IEstadoMonitoreoComponente } from '../types/estadosMonitoreoComponente';

// Caché global compartido entre todos los hooks
const CACHE_ESTADOS: Map<string, {
  data: IEstadoMonitoreoComponente[];
  timestamp: number;
  loading: boolean;
}> = new Map();

const CACHE_DURATION = 60000; // 60 segundos de caché

export interface UseEstadosMonitoreoCache {
  estados: IEstadoMonitoreoComponente[];
  loading: boolean;
  error: string | null;
  actualizarEstados: () => Promise<void>;
  invalidarCache: () => void;
  preFetch: (componenteId: string) => Promise<void>;
}

export const useEstadosMonitoreoCache = (componenteId?: string): UseEstadosMonitoreoCache => {
  const [estados, setEstados] = useState<IEstadoMonitoreoComponente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const fetchingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const cargarEstados = useCallback(async (forceRefresh = false) => {
    if (!componenteId) {
      setEstados([]);
      return;
    }

    // Evitar múltiples fetches simultáneos del mismo recurso
    if (fetchingRef.current.has(componenteId)) {
      return;
    }

    const cached = CACHE_ESTADOS.get(componenteId);
    const now = Date.now();

    // Usar caché si está disponible y no ha expirado
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      setEstados(cached.data);
      setLoading(cached.loading);
      return;
    }

    // Marcar como fetching
    fetchingRef.current.add(componenteId);
    setLoading(true);
    setError(null);

    // Actualizar estado de caché como "loading"
    CACHE_ESTADOS.set(componenteId, {
      data: cached?.data || [],
      timestamp: now,
      loading: true
    });

    try {
      const url = `/estados-monitoreo-componente/componente/${componenteId}`;
      const response = await axiosInstance.get(url);
      
      if (response.data.success) {
        const estadosData = response.data.data || [];
        
        // Actualizar caché
        CACHE_ESTADOS.set(componenteId, {
          data: estadosData,
          timestamp: Date.now(),
          loading: false
        });

        if (isMounted.current) {
          setEstados(estadosData);
          setError(null);
        }
        
      } else {
        throw new Error(response.data.message || 'Error al cargar estados');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al cargar estados';
      console.error(`Error al cargar estados para ${componenteId}:`, errorMsg);
      
      // Mantener datos antiguos en caso de error si existen
      if (cached?.data && cached.data.length > 0) {
        if (isMounted.current) {
          setEstados(cached.data);
        }
      } else {
        if (isMounted.current) {
          setError(errorMsg);
          setEstados([]);
        }
      }
      
      // Remover del caché si hay error
      CACHE_ESTADOS.delete(componenteId);
    } finally {
      fetchingRef.current.delete(componenteId);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [componenteId]);

  // Pre-fetch para cargar datos anticipadamente
  const preFetch = useCallback(async (targetComponenteId: string) => {
    const cached = CACHE_ESTADOS.get(targetComponenteId);
    const now = Date.now();

    // Solo pre-fetch si no existe en caché o ha expirado
    if (!cached || (now - cached.timestamp) >= CACHE_DURATION) {
      try {
        const url = `/estados-monitoreo-componente/componente/${targetComponenteId}`;
        const response = await axiosInstance.get(url);
        
        if (response.data.success) {
          CACHE_ESTADOS.set(targetComponenteId, {
            data: response.data.data || [],
            timestamp: Date.now(),
            loading: false
          });
        }
      } catch (error) {
        console.error(`Error en pre-fetch para ${targetComponenteId}:`, error);
      }
    }
  }, []);

  // Invalidar caché manualmente
  const invalidarCache = useCallback(() => {
    if (componenteId) {
      CACHE_ESTADOS.delete(componenteId);
    }
  }, [componenteId]);

  // Cargar estados al montar o cuando cambie el componenteId
  useEffect(() => {
    cargarEstados();
  }, [cargarEstados]);

  return {
    estados,
    loading,
    error,
    actualizarEstados: () => cargarEstados(true), // Force refresh
    invalidarCache,
    preFetch
  };
};

// Función helper para invalidar caché de múltiples componentes
export const invalidarCacheEstados = (componenteIds: string[]) => {
  componenteIds.forEach(id => {
    CACHE_ESTADOS.delete(id);
  });
};

// Función helper para limpiar todo el caché
export const limpiarCacheCompleto = () => {
  CACHE_ESTADOS.clear();
};
