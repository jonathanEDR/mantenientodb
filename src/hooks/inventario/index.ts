// Hook Optimizado de Inventario con Cache Inteligente y Paginación
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  IAeronave,
  IEstadisticasInventario,
  ICrearAeronaveData,
  IAeronavesResponse,
  IEstadisticasInventarioResponse
} from '../../types/inventario';
import {
  obtenerAeronaves,
  obtenerEstadisticasInventario,
  crearAeronave,
  actualizarAeronave,
  eliminarAeronave
} from '../../utils/inventarioApi';
import { useDebounce } from '../useDebounce';

// CACHE GLOBAL MEJORADO CON TTL POR TIPO DE DATO
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  page?: number;
  filters?: any;
}

const inventarioCache = new Map<string, CacheEntry<any>>();
const pendingRequests = new Map<string, Promise<any>>(); // Request deduplication
const CACHE_TTL_AERONAVES = 2 * 60 * 1000; // 2 minutos para aeronaves
const CACHE_TTL_STATS = 5 * 60 * 1000; // 5 minutos para estadísticas

// Utilidades de cache
const getCacheKey = (type: string, page?: number, filters?: any) => {
  const filterStr = filters ? JSON.stringify(filters) : '';
  return `${type}_${page || 1}_${filterStr}`;
};

const isValidCache = (entry: CacheEntry<any>, ttl: number): boolean => {
  return entry && (Date.now() - entry.timestamp) < ttl;
};

// Hook principal optimizado
export const useInventario = (initialPage = 1, initialFilters = {}) => {
  const [aeronaves, setAeronaves] = useState<IAeronave[]>([]);
  const [estadisticas, setEstadisticas] = useState<IEstadisticasInventario | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros con debounce
  const [filters, setFilters] = useState(initialFilters);
  const debouncedFilters = useDebounce(filters, 500); // 500ms de debounce
  
  const isMountedRef = useRef(true);
  const lastRequestRef = useRef<number>(0);

  // Función optimizada para cargar aeronaves con cache y paginación
  const cargarAeronaves = useCallback(async (page = 1, useCache = true) => {
    const requestId = Date.now();
    lastRequestRef.current = requestId;

    try {
      const cacheKey = getCacheKey('aeronaves', page, debouncedFilters);
      
      // 🚀 REQUEST DEDUPLICATION: Verificar si hay una petición en progreso
      if (pendingRequests.has(cacheKey)) {
        setLoading(true); // ✅ FIX: Establecer loading mientras esperamos
        const result = await pendingRequests.get(cacheKey);
        
        // Actualizar estado cuando la petición reutilizada termine
        if (isMountedRef.current && result?.success) {
          setAeronaves(result.data);
          setLoading(false);
        }
        return result;
      }
      
      // Verificar cache
      if (useCache) {
        const cachedEntry = inventarioCache.get(cacheKey);
        if (cachedEntry && isValidCache(cachedEntry, CACHE_TTL_AERONAVES)) {
          // Caché hit
          
          if (!isMountedRef.current || lastRequestRef.current !== requestId) return;
          
          setAeronaves(cachedEntry.data.data);
          setPagination(cachedEntry.data.pagination || pagination);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      // Crear promise y guardarlo en pendingRequests
      const requestPromise = obtenerAeronaves()
        .then(response => {
          // Response recibida
          
          // Verificar si la petición sigue siendo válida
          if (!isMountedRef.current || lastRequestRef.current !== requestId) {
            // Petición obsoleta
            return response;
          }

          if (response.success) {
            setAeronaves(response.data);
            
            // Guardar en cache
            inventarioCache.set(cacheKey, {
              data: response,
              timestamp: Date.now(),
              page,
              filters: debouncedFilters
            });

            // Guardadas en caché
          }
          
          return response;
        })
        .catch(error => {
          console.error('❌ [useInventario] Error en petición:', error);
          throw error;
        })
        .finally(() => {
          // Limpiar petición pendiente
          pendingRequests.delete(cacheKey);
          
          if (isMountedRef.current && lastRequestRef.current === requestId) {
            // Loading false
            setLoading(false);
          } else {
            // Componente desmontado
          }
        });

      // Guardar promise para deduplicación
      pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;

    } catch (err) {
      console.error('Error al cargar aeronaves:', err);
      if (isMountedRef.current && lastRequestRef.current === requestId) {
        setError('Error al cargar las aeronaves');
        setLoading(false);
      }
    }
  }, [debouncedFilters, pagination.limit]);

  // Función optimizada para cargar estadísticas con cache de larga duración
  const cargarEstadisticas = useCallback(async (useCache = true) => {
    try {
      const cacheKey = 'estadisticas';
      
      // 🚀 REQUEST DEDUPLICATION: Verificar si hay una petición en progreso
      if (pendingRequests.has(cacheKey)) {
        // Reutilizando petición de estadísticas
        const result = await pendingRequests.get(cacheKey);
        
        // Actualizar estado cuando la petición reutilizada termine
        if (isMountedRef.current && result?.success) {
          setEstadisticas(result.data);
        }
        return result;
      }
      
      // Verificar cache
      if (useCache) {
        const cachedEntry = inventarioCache.get(cacheKey);
        if (cachedEntry && isValidCache(cachedEntry, CACHE_TTL_STATS)) {
          // Estadísticas desde caché
          if (isMountedRef.current) {
            setEstadisticas(cachedEntry.data.data);
          }
          return;
        }
      }

      // Crear promise y guardarlo en pendingRequests
      const requestPromise = obtenerEstadisticasInventario()
        .then(response => {
          if (!isMountedRef.current) return response;

          if (response.success) {
            setEstadisticas(response.data);

            // Guardar en cache
            inventarioCache.set(cacheKey, {
              data: response,
              timestamp: Date.now()
            });

            // Estadísticas guardadas en caché
          }
          
          return response;
        })
        .finally(() => {
          // Limpiar petición pendiente
          pendingRequests.delete(cacheKey);
        });

      // Guardar promise para deduplicación
      pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;

    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      if (isMountedRef.current) {
        setError('Error al cargar estadísticas');
      }
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    isMountedRef.current = true;
    
    // Cargar aeronaves y estadísticas en paralelo
    const loadInitialData = async () => {
      // Cargando datos iniciales
      try {
        await Promise.all([
          cargarAeronaves(pagination.page),
          cargarEstadisticas()
        ]);
        // Datos iniciales cargados
      } catch (error) {
        console.error('❌ [useInventario] Error cargando datos iniciales:', error);
      }
    };
    
    loadInitialData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Recargar aeronaves cuando cambien los filtros
  useEffect(() => {
    if (pagination.page === 1) {
      cargarAeronaves(1);
    } else {
      // Si no es la primera página, volver a la página 1
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [debouncedFilters]);

  // Funciones de paginación
  const irAPagina = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    cargarAeronaves(page);
  }, [cargarAeronaves]);

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

  // Función para refrescar datos (forzar recarga)
  const refrescarDatos = useCallback(() => {
    // Limpiar cache y peticiones pendientes
    inventarioCache.clear();
    pendingRequests.clear();
    // Cache limpiado
    
    Promise.all([
      cargarAeronaves(pagination.page, false),
      cargarEstadisticas(false)
    ]);
  }, [pagination.page, cargarAeronaves, cargarEstadisticas]);

  // Función para invalidar cache después de operaciones CRUD
  const invalidarCache = useCallback(() => {
    inventarioCache.clear();
    refrescarDatos();
  }, [refrescarDatos]);

  return {
    // Datos
    aeronaves,
    estadisticas,
    pagination,
    
    // Estados
    loading,
    error,
    
    // Filtros
    filters,
    setFilters,
    
    // Navegación
    irAPagina,
    paginaSiguiente,
    paginaAnterior,
    
    // Acciones
    refrescarDatos,
    invalidarCache,
    
    // Funciones de carga (para uso externo)
    cargarAeronaves,
    cargarEstadisticas,
    
    // Setters (para compatibilidad)
    setAeronaves,
    setEstadisticas,
    setLoading,
    setError
  };
};

// Hook optimizado para formulario con validación
export const useFormularioAeronave = (onSuccess: () => void) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [aeronaveEditando, setAeronaveEditando] = useState<IAeronave | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formulario, setFormulario] = useState<ICrearAeronaveData>({
    matricula: '',
    tipo: 'Helicóptero',
    modelo: '',
    fabricante: '',
    anoFabricacion: new Date().getFullYear(),
    estado: 'Operativo',
    ubicacionActual: '',
    horasVuelo: 0,
    observaciones: ''
  });

  // Validación de formulario
  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formulario.matricula.trim()) {
      newErrors.matricula = 'La matrícula es requerida';
    }
    if (!formulario.modelo.trim()) {
      newErrors.modelo = 'El modelo es requerido';
    }
    if (!formulario.fabricante.trim()) {
      newErrors.fabricante = 'El fabricante es requerido';
    }
    if (!formulario.ubicacionActual.trim()) {
      newErrors.ubicacionActual = 'La ubicación actual es requerida';
    }
    
    // Validación mejorada para año de fabricación
    const currentYear = new Date().getFullYear();
    const anoFabricacion = Number(formulario.anoFabricacion);
    
    if (isNaN(anoFabricacion) || anoFabricacion < 1900 || anoFabricacion > currentYear + 1) {
      newErrors.anoFabricacion = `Año de fabricación debe estar entre 1900 y ${currentYear + 1}`;
    }

    // Validación para horas de vuelo
    const horasVuelo = Number(formulario.horasVuelo);
    if (isNaN(horasVuelo) || horasVuelo < 0) {
      newErrors.horasVuelo = 'Las horas de vuelo deben ser un número válido mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de cambios con validación en tiempo real
  const manejarCambioFormulario = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormulario((prev: ICrearAeronaveData) => {
      // Manejo especial para campos numéricos
      if (name === 'anoFabricacion') {
        // Permitir campo vacío temporalmente, pero asegurar que se mantenga como número
        if (value === '') {
          return { ...prev, [name]: '' as any }; // Temporal para UX
        }
        const numericValue = parseInt(value, 10);
        return {
          ...prev,
          [name]: isNaN(numericValue) ? new Date().getFullYear() : numericValue
        };
      }
      
      if (name === 'horasVuelo') {
        const numericValue = value === '' ? 0 : parseFloat(value);
        return {
          ...prev,
          [name]: isNaN(numericValue) ? 0 : Math.max(0, numericValue)
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
  }, [errors]);

  // Función para resetear formulario
  const resetearFormulario = useCallback(() => {
    setFormulario({
      matricula: '',
      tipo: 'Helicóptero',
      modelo: '',
      fabricante: '',
      anoFabricacion: new Date().getFullYear(),
      estado: 'Operativo',
      ubicacionActual: '',
      horasVuelo: 0,
      observaciones: ''
    });
    setErrors({});
  }, []);

  // Función para editar aeronave
  const editarAeronave = useCallback((aeronave: IAeronave) => {
    setAeronaveEditando(aeronave);
    setFormulario({
      matricula: aeronave.matricula || '',
      tipo: aeronave.tipo || 'Helicóptero',
      modelo: aeronave.modelo || '',
      fabricante: aeronave.fabricante || '',
      anoFabricacion: aeronave.anoFabricacion && !isNaN(aeronave.anoFabricacion) 
        ? aeronave.anoFabricacion 
        : new Date().getFullYear(),
      estado: aeronave.estado || 'Operativo',
      ubicacionActual: aeronave.ubicacionActual || '',
      horasVuelo: aeronave.horasVuelo && !isNaN(aeronave.horasVuelo) 
        ? aeronave.horasVuelo 
        : 0,
      observaciones: aeronave.observaciones || ''
    });
    setMostrarFormulario(true);
    setErrors({});
  }, []);

  // Función para enviar formulario con validación
  const manejarEnvioFormulario = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);

      // Normalizar datos antes del envío para asegurar tipos correctos
      const datosNormalizados = {
        ...formulario,
        anoFabricacion: typeof formulario.anoFabricacion === 'string' && formulario.anoFabricacion === '' 
          ? new Date().getFullYear() 
          : Number(formulario.anoFabricacion),
        horasVuelo: Number(formulario.horasVuelo) || 0,
      };

      if (aeronaveEditando) {
        // Actualizar aeronave existente
        const response = await actualizarAeronave(aeronaveEditando._id, datosNormalizados);
        if (response.success) {
          alert('Aeronave actualizada exitosamente');
          setMostrarFormulario(false);
          setAeronaveEditando(null);
          resetearFormulario();
          onSuccess();
        }
      } else {
        // Crear nueva aeronave
        const response = await crearAeronave(datosNormalizados);
        if (response.success) {
          alert('Aeronave creada exitosamente');
          setMostrarFormulario(false);
          resetearFormulario();
          onSuccess();
        }
      }
    } catch (err: any) {
      console.error('Error al guardar aeronave:', err);
      alert(err.response?.data?.message || 'Error al guardar la aeronave');
    } finally {
      setLoading(false);
    }
  }, [formulario, aeronaveEditando, validarFormulario, resetearFormulario, onSuccess]);

  // Función para abrir formulario de nueva aeronave
  const nuevaAeronave = useCallback(() => {
    setMostrarFormulario(true);
    setAeronaveEditando(null);
    resetearFormulario();
  }, [resetearFormulario]);

  // Función para cerrar formulario
  const cerrarFormulario = useCallback(() => {
    setMostrarFormulario(false);
    setAeronaveEditando(null);
    resetearFormulario();
  }, [resetearFormulario]);

  return {
    mostrarFormulario,
    aeronaveEditando,
    formulario,
    loading,
    errors,
    manejarCambioFormulario,
    manejarEnvioFormulario,
    editarAeronave,
    nuevaAeronave,
    cerrarFormulario,
    resetearFormulario,
    validarFormulario
  };
};

// Hook para vista de inventario con estado persistente
export const useVistaInventario = () => {
  const [vistaComponentes, setVistaComponentes] = useState(false);
  const [aeronaveSeleccionada, setAeronaveSeleccionada] = useState<IAeronave | null>(null);
  const [vistaEnTarjetas, setVistaEnTarjetas] = useState(() => {
    // Recuperar preferencia del localStorage
    const saved = localStorage.getItem('inventario-vista-tarjetas');
    return saved ? JSON.parse(saved) : true;
  });

  // Guardar preferencia de vista
  const toggleVistaEnTarjetas = useCallback(() => {
    setVistaEnTarjetas((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('inventario-vista-tarjetas', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // Función para ver componentes de aeronave
  const verComponentesAeronave = useCallback((aeronave: IAeronave) => {
    setAeronaveSeleccionada(aeronave);
    setVistaComponentes(true);
  }, []);

  // Función para volver a vista de aeronaves
  const volverAeronaves = useCallback(() => {
    setVistaComponentes(false);
    setAeronaveSeleccionada(null);
  }, []);

  return {
    vistaComponentes,
    aeronaveSeleccionada,
    vistaEnTarjetas,
    verComponentesAeronave,
    volverAeronaves,
    toggleVistaEnTarjetas
  };
};

// Funciones utilitarias (sin cambios)
export const obtenerColorEstado = (estado: string) => {
  switch (estado) {
    case 'Operativo':
      return 'bg-green-100 text-green-800';
    case 'En Mantenimiento':
      return 'bg-yellow-100 text-yellow-800';
    case 'Fuera de Servicio':
      return 'bg-red-100 text-red-800';
    case 'En Reparación':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};