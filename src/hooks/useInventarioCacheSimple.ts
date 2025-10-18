/**
 * ===== VERSIÓN SIMPLIFICADA Y SEGURA DEL CACHE DE INVENTARIO =====
 * 
 * Hook minimalista que agrega cache básico sin romper la funcionalidad existente
 */

import { useState, useEffect, useRef } from 'react';
import { IAeronave, IEstadisticasInventario } from '../types/inventario';
import { obtenerAeronaves, obtenerEstadisticasInventario } from '../utils/inventarioApi';

// Cache simple sin complejidad excesiva
const simpleCache = {
  aeronaves: null as { data: any, timestamp: number } | null,
  estadisticas: null as { data: any, timestamp: number } | null
};

const CACHE_TTL = 60 * 1000; // 1 minuto - conservador

/**
 * Hook simple con cache básico - mantiene la interfaz del hook original
 */
export const useInventarioConCache = () => {
  const [aeronaves, setAeronaves] = useState<IAeronave[]>([]);
  const [estadisticas, setEstadisticas] = useState<IEstadisticasInventario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isMounted = useRef(true);

  const cargarDatos = async (forceRefresh = false) => {
    if (!isMounted.current) return;

    setLoading(true);
    setError(null);

    try {
      const now = Date.now();
      
      // Cargar aeronaves
      let aeronavesData = [];
      if (!forceRefresh && simpleCache.aeronaves && (now - simpleCache.aeronaves.timestamp) < CACHE_TTL) {
        aeronavesData = simpleCache.aeronaves.data;
      } else {
        const responseAeronaves = await obtenerAeronaves();
        aeronavesData = responseAeronaves.data || [];
        simpleCache.aeronaves = { data: aeronavesData, timestamp: now };
      }

      // Cargar estadísticas
      let estadisticasData = null;
      if (!forceRefresh && simpleCache.estadisticas && (now - simpleCache.estadisticas.timestamp) < CACHE_TTL) {
        estadisticasData = simpleCache.estadisticas.data;
      } else {
        const responseEstadisticas = await obtenerEstadisticasInventario();
        estadisticasData = responseEstadisticas.data;
        simpleCache.estadisticas = { data: estadisticasData, timestamp: now };
      }

      if (isMounted.current) {
        setAeronaves(aeronavesData);
        setEstadisticas(estadisticasData);
        setError(null);
      }

    } catch (error: any) {
      console.error('Error al cargar datos de inventario:', error);
      if (isMounted.current) {
        setError(error.message || 'Error al cargar datos');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const refrescarDatos = () => cargarDatos(true);

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    aeronaves,
    estadisticas,
    loading,
    error,
    refrescarDatos
  };
};

// Función para limpiar cache si es necesario
export const limpiarCacheInventarioSimple = () => {
  simpleCache.aeronaves = null;
  simpleCache.estadisticas = null;
};