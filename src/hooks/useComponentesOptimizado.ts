// Hook Optimizado para Componentes con Batch Loading
import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useDebounce } from './useDebounce';

// Tipos locales para evitar dependencias circulares
interface IComponente {
  _id: string;
  nombre: string;
  numeroSerie: string;
  categoria: string;
  estado: string;
  fabricante?: string;
  fechaInstalacion?: string;
  alertasActivas?: boolean;
  vidaUtil?: any[];
}

enum EstadoComponente {
  INSTALADO = 'INSTALADO',
  EN_ALMACEN = 'EN_ALMACEN',
  EN_REPARACION = 'EN_REPARACION'
}

type ComponenteCategoria = string;

// Cache inteligente para componentes
const componentesCache = new Map<string, any>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

interface UseComponentesOptions {
  aeronaveId?: string;
  enablePagination?: boolean;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

interface ComponentesPaginacion {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const useComponentes = (options: UseComponentesOptions = {}) => {
  const { aeronaveId, enablePagination = true, enableAutoRefresh = false, refreshInterval = 30000 } = options;
  
  // Estados principales
  const [componentes, setComponentes] = useState<IComponente[]>([]);
  const [filteredComponentes, setFilteredComponentes] = useState<IComponente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [pagination, setPagination] = useState<ComponentesPaginacion>({
    page: 1,
    limit: enablePagination ? 10 : 1000,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Filtros con debounce
  const [filters, setFilters] = useState({
    search: '',
    categoria: '' as ComponenteCategoria | '',
    estado: '' as EstadoComponente | '',
    alertas: false
  });
  
  const debouncedFilters = useDebounce(filters, 500);
  
  // Estados de monitoreo batch (carga en lote para optimizar rendimiento)
  const [estadosMonitoreoBatch, setEstadosMonitoreoBatch] = useState<Record<string, any[]>>({});
  const [estadosLoading, setEstadosLoading] = useState(false);
  
  const isMountedRef = useRef(true);
  const lastRequestRef = useRef<number>(0);
  const refreshIntervalRef = useRef<number | null>(null);

  // Función optimizada para cargar componentes
  const cargarComponentes = useCallback(async (page = 1, useCache = true) => {
    const requestId = Date.now();
    lastRequestRef.current = requestId;

    try {
      const cacheKey = `componentes_${aeronaveId || 'all'}_${page}_${JSON.stringify(debouncedFilters)}`;
      
      // Verificar cache
      if (useCache) {
        const cached = componentesCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
          console.log('📦 [useComponentes] Datos desde caché');
          
          if (!isMountedRef.current || lastRequestRef.current !== requestId) return;
          
          setComponentes(cached.data);
          setPagination(cached.pagination);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      // Construir URL y parámetros
      const url = aeronaveId ? `/mantenimiento/componentes/aeronave/id/${aeronaveId}` : '/mantenimiento/componentes';
      
      const params = {
        page,
        limit: pagination.limit,
        ...(debouncedFilters.search && { search: debouncedFilters.search }),
        ...(debouncedFilters.categoria && { categoria: debouncedFilters.categoria }),
        ...(debouncedFilters.estado && { estado: debouncedFilters.estado }),
        ...(debouncedFilters.alertas && { alertas: 'true' })
      };

      const response = await axiosInstance.get(url, { params });

      // Verificar si la petición sigue siendo válida
      if (!isMountedRef.current || lastRequestRef.current !== requestId) return;

      if (response.data.success) {
        const componentesData = response.data.data || [];
        setComponentes(componentesData);
        
        // Establecer paginación si está disponible
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        } else {
          // Fallback para respuestas sin paginación
          setPagination(prev => ({
            ...prev,
            total: componentesData.length,
            pages: 1,
            hasNext: false,
            hasPrev: false
          }));
        }

        // Guardar en cache
        componentesCache.set(cacheKey, {
          data: componentesData,
          pagination: response.data.pagination || pagination,
          timestamp: Date.now()
        });

        console.log(`💾 [useComponentes] Componentes guardados en caché: ${componentesData.length} items`);

        // Si hay aeronaveId, cargar estados de monitoreo en batch
        if (aeronaveId && componentesData.length > 0) {
          cargarEstadosMonitoreoBatch(aeronaveId);
        }
      }

    } catch (err: any) {
      console.error('Error al cargar componentes:', err);
      if (isMountedRef.current && lastRequestRef.current === requestId) {
        setError(`Error al cargar componentes: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      if (isMountedRef.current && lastRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [aeronaveId, debouncedFilters, pagination.limit]);

  // Función optimizada para cargar estados de monitoreo en batch
  const cargarEstadosMonitoreoBatch = useCallback(async (aeronaveIdParam: string) => {
    try {
      setEstadosLoading(true);
      
      // Usar endpoint optimizado que creamos
      const response = await axiosInstance.get(`/mantenimiento/componentes/estados-monitoreo/aeronave/${aeronaveIdParam}`);
      
      if (response.data.success && isMountedRef.current) {
        setEstadosMonitoreoBatch(response.data.data || {});
        console.log(`✅ [useComponentes] Estados de monitoreo batch cargados para ${Object.keys(response.data.data || {}).length} componentes`);
      }
      
    } catch (err: any) {
      console.error('Error al cargar estados de monitoreo batch:', err);
    } finally {
      if (isMountedRef.current) {
        setEstadosLoading(false);
      }
    }
  }, []);

  // Filtrar componentes localmente
  const filtrarComponentes = useCallback(() => {
    let filtered = [...componentes];
    
    // Aplicar filtros locales solo si no estamos usando filtros del servidor
    if (!enablePagination) {
      if (debouncedFilters.search) {
        const searchLower = debouncedFilters.search.toLowerCase();
        filtered = filtered.filter(comp =>
          comp.nombre.toLowerCase().includes(searchLower) ||
          comp.numeroSerie.toLowerCase().includes(searchLower) ||
          (comp.fabricante && comp.fabricante.toLowerCase().includes(searchLower))
        );
      }

      if (debouncedFilters.categoria) {
        filtered = filtered.filter(comp => comp.categoria === debouncedFilters.categoria);
      }

      if (debouncedFilters.estado) {
        filtered = filtered.filter(comp => comp.estado === debouncedFilters.estado);
      }

      if (debouncedFilters.alertas) {
        filtered = filtered.filter(comp => comp.alertasActivas);
      }
    }
    
    setFilteredComponentes(filtered);
  }, [componentes, debouncedFilters, enablePagination]);

  // Efectos
  useEffect(() => {
    isMountedRef.current = true;
    cargarComponentes();

    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [cargarComponentes]);

  useEffect(() => {
    filtrarComponentes();
  }, [filtrarComponentes]);

  // Auto-refresh
  useEffect(() => {
    if (enableAutoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          cargarComponentes(pagination.page, false); // Forzar recarga sin cache
        }
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [enableAutoRefresh, refreshInterval, pagination.page, cargarComponentes]);

  // Recargar cuando cambien los filtros (solo si usamos paginación del servidor)
  useEffect(() => {
    if (enablePagination) {
      cargarComponentes(1);
    }
  }, [debouncedFilters, enablePagination, cargarComponentes]);

  // Funciones de paginación
  const irAPagina = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    cargarComponentes(page);
  }, [cargarComponentes]);

  const paginaSiguiente = useCallback(() => {
    if (pagination.hasNext) {
      irAPagina(pagination.page + 1);
    }
  }, [pagination.hasNext, pagination.page, irAPagina]);

  const paginaAnterior = useCallback(() => {
    if (pagination.hasPrev) {
      irAPagina(pagination.page - 1);
    }
  }, [pagination.hasPrev, pagination.page, irAPagina]);

  // Función para refrescar datos
  const refrescarDatos = useCallback(() => {
    componentesCache.clear();
    console.log('🗑️ [useComponentes] Cache limpiado - recargando datos');
    cargarComponentes(pagination.page, false);
  }, [pagination.page, cargarComponentes]);

  // Función para obtener estados de monitoreo de un componente específico
  const obtenerEstadosMonitoreo = useCallback((componenteId: string) => {
    return estadosMonitoreoBatch[componenteId] || [];
  }, [estadosMonitoreoBatch]);

  // Funciones auxiliares
  const actualizarFiltros = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFilters({
      search: '',
      categoria: '',
      estado: '',
      alertas: false
    });
  }, []);

  return {
    // Datos
    componentes: enablePagination ? componentes : filteredComponentes,
    componentes_raw: componentes,
    pagination,
    estadosMonitoreoBatch,
    
    // Estados
    loading,
    error,
    estadosLoading,
    
    // Filtros
    filters,
    actualizarFiltros,
    limpiarFiltros,
    
    // Navegación
    irAPagina,
    paginaSiguiente,
    paginaAnterior,
    
    // Acciones
    refrescarDatos,
    cargarComponentes,
    obtenerEstadosMonitoreo,
    
    // Utilidades
    setComponentes,
    setLoading,
    setError
  };
};

// Hook específico para componentes de una aeronave (optimizado)
export const useComponentesAeronave = (aeronaveId: string | undefined) => {
  return useComponentes({
    aeronaveId,
    enablePagination: true,
    enableAutoRefresh: false // Deshabilitamos auto-refresh para aeronaves específicas
  });
};

// Hook para estadísticas de componentes con cache
export const useEstadisticasComponentes = () => {
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const cargarEstadisticas = useCallback(async (useCache = true) => {
    try {
      const cacheKey = 'componentes_stats';
      
      if (useCache) {
        const cached = componentesCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL * 2) { // Cache más largo para estadísticas
          setEstadisticas(cached.data);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      const response = await axiosInstance.get('/mantenimiento/componentes/stats');
      
      if (response.data.success) {
        setEstadisticas(response.data.data);
        
        // Guardar en cache
        componentesCache.set(cacheKey, {
          data: response.data.data,
          timestamp: Date.now()
        });
      }
      
    } catch (err: any) {
      console.error('Error al cargar estadísticas de componentes:', err);
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const refrescarEstadisticas = useCallback(() => {
    cargarEstadisticas(false);
  }, [cargarEstadisticas]);

  return {
    estadisticas,
    loading,
    error,
    refrescarEstadisticas
  };
};