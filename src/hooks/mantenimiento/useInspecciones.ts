import { useState, useEffect, useCallback } from 'react';
import { 
  IInspeccion, 
  EstadoInspeccion, 
  TipoInspeccion, 
  ResultadoInspeccion 
} from '../../types/mantenimiento';
import {
  obtenerInspecciones,
  obtenerInspeccionPorId,
  crearInspeccion,
  actualizarInspeccion,
  eliminarInspeccion,
  obtenerEstadisticasInspecciones,
  completarInspeccion,
  IFiltrosInspecciones,
  ICrearInspeccionData
} from '../../utils/inspeccionesApi';

// Estados de carga
interface LoadingStates {
  inspecciones: boolean;
  estadisticas: boolean;
  crear: boolean;
  actualizar: boolean;
  eliminar: boolean;
  completar: boolean;
}

// Errores
interface ErrorStates {
  inspecciones: string | null;
  estadisticas: string | null;
  crear: string | null;
  actualizar: string | null;
  eliminar: string | null;
  completar: string | null;
}

// Estadísticas
interface EstadisticasInspecciones {
  total: number;
  porEstado: { [key: string]: number };
  porTipo: { [key: string]: number };
  vencimientosProximos: number;
  cumplimientoPromedio: number;
}

// Hook principal para gestión de inspecciones
export const useInspecciones = () => {
  const [inspecciones, setInspecciones] = useState<IInspeccion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasInspecciones | null>(null);
  const [filtros, setFiltros] = useState<IFiltrosInspecciones>({});
  
  const [loading, setLoading] = useState<LoadingStates>({
    inspecciones: false,
    estadisticas: false,
    crear: false,
    actualizar: false,
    eliminar: false,
    completar: false
  });

  const [errors, setErrors] = useState<ErrorStates>({
    inspecciones: null,
    estadisticas: null,
    crear: null,
    actualizar: null,
    eliminar: null,
    completar: null
  });

  // Limpiar error específico
  const clearError = useCallback((tipo: keyof ErrorStates) => {
    setErrors(prev => ({ ...prev, [tipo]: null }));
  }, []);

  // Cargar inspecciones
  const cargarInspecciones = useCallback(async (filtrosOpcionales?: IFiltrosInspecciones) => {
    try {
      setLoading(prev => ({ ...prev, inspecciones: true }));
      setErrors(prev => ({ ...prev, inspecciones: null }));
      
      const filtrosAUsar = filtrosOpcionales || filtros;
      const response = await obtenerInspecciones(filtrosAUsar);
      
      if (response.success) {
        setInspecciones(response.data);
      } else {
        throw new Error(response.message || 'Error al cargar inspecciones');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, inspecciones: mensaje }));
      console.error('Error en cargarInspecciones:', error);
    } finally {
      setLoading(prev => ({ ...prev, inspecciones: false }));
    }
  }, [filtros]);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, estadisticas: true }));
      setErrors(prev => ({ ...prev, estadisticas: null }));
      
      const response = await obtenerEstadisticasInspecciones();
      
      if (response.success) {
        setEstadisticas(response.data);
      } else {
        throw new Error(response.message || 'Error al cargar estadísticas');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, estadisticas: mensaje }));
      console.error('Error en cargarEstadisticas:', error);
    } finally {
      setLoading(prev => ({ ...prev, estadisticas: false }));
    }
  }, []);

  // Crear inspección
  const crearNuevaInspeccion = useCallback(async (inspeccionData: ICrearInspeccionData): Promise<boolean> => {
    try {
      setLoading(prev => ({ ...prev, crear: true }));
      setErrors(prev => ({ ...prev, crear: null }));
      
      const response = await crearInspeccion(inspeccionData);
      
      if (response.success) {
        // Recargar inspecciones para incluir la nueva
        await cargarInspecciones();
        await cargarEstadisticas();
        return true;
      } else {
        throw new Error(response.message || 'Error al crear inspección');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, crear: mensaje }));
      console.error('Error en crearNuevaInspeccion:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, crear: false }));
    }
  }, [cargarInspecciones, cargarEstadisticas]);

  // Actualizar inspección
  const actualizarInspeccionExistente = useCallback(async (id: string, inspeccionData: Partial<ICrearInspeccionData>): Promise<boolean> => {
    try {
      setLoading(prev => ({ ...prev, actualizar: true }));
      setErrors(prev => ({ ...prev, actualizar: null }));
      
      const response = await actualizarInspeccion(id, inspeccionData);
      
      if (response.success) {
        // Actualizar inspección en el estado local
        setInspecciones(prev => prev.map(inspeccion => 
          inspeccion._id === id ? { ...inspeccion, ...response.data } : inspeccion
        ));
        await cargarEstadisticas();
        return true;
      } else {
        throw new Error(response.message || 'Error al actualizar inspección');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, actualizar: mensaje }));
      console.error('Error en actualizarInspeccionExistente:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, actualizar: false }));
    }
  }, [cargarEstadisticas]);

  // Eliminar inspección
  const eliminarInspeccionExistente = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(prev => ({ ...prev, eliminar: true }));
      setErrors(prev => ({ ...prev, eliminar: null }));
      
      const response = await eliminarInspeccion(id);
      
      if (response.success) {
        // Remover inspección del estado local
        setInspecciones(prev => prev.filter(inspeccion => inspeccion._id !== id));
        await cargarEstadisticas();
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar inspección');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, eliminar: mensaje }));
      console.error('Error en eliminarInspeccionExistente:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, eliminar: false }));
    }
  }, [cargarEstadisticas]);

  // Completar inspección
  const completarInspeccionExistente = useCallback(async (id: string, observaciones?: string): Promise<boolean> => {
    try {
      setLoading(prev => ({ ...prev, completar: true }));
      setErrors(prev => ({ ...prev, completar: null }));
      
      const response = await completarInspeccion(id, observaciones);
      
      if (response.success) {
        // Actualizar inspección en el estado local
        setInspecciones(prev => prev.map(inspeccion => 
          inspeccion._id === id ? { ...inspeccion, ...response.data } : inspeccion
        ));
        await cargarEstadisticas();
        return true;
      } else {
        throw new Error(response.message || 'Error al completar inspección');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, completar: mensaje }));
      console.error('Error en completarInspeccionExistente:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, completar: false }));
    }
  }, [cargarEstadisticas]);

  // Aplicar filtros
  const aplicarFiltros = useCallback((nuevosFiltros: IFiltrosInspecciones) => {
    setFiltros(nuevosFiltros);
    cargarInspecciones(nuevosFiltros);
  }, [cargarInspecciones]);

  // Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    const filtrosVacios = {};
    setFiltros(filtrosVacios);
    cargarInspecciones(filtrosVacios);
  }, [cargarInspecciones]);

  // Efectos
  useEffect(() => {
    cargarInspecciones();
    cargarEstadisticas();
  }, []);

  // Funciones de utilidad
  const getInspeccionPorId = useCallback((id: string): IInspeccion | undefined => {
    return inspecciones.find(inspeccion => inspeccion._id === id);
  }, [inspecciones]);

  const getInspeccionesPorEstado = useCallback((estado: EstadoInspeccion): IInspeccion[] => {
    return inspecciones.filter(inspeccion => inspeccion.estado === estado);
  }, [inspecciones]);

  const getInspeccionesPorTipo = useCallback((tipo: TipoInspeccion): IInspeccion[] => {
    return inspecciones.filter(inspeccion => inspeccion.tipo === tipo);
  }, [inspecciones]);

  const getInspeccionesVencidas = useCallback((): IInspeccion[] => {
    const hoy = new Date();
    return inspecciones.filter(inspeccion => {
      if (!inspeccion.fechaProgramada) return false;
      const fechaProgramada = new Date(inspeccion.fechaProgramada);
      return fechaProgramada < hoy && inspeccion.estado !== EstadoInspeccion.COMPLETADA;
    });
  }, [inspecciones]);

  const getInspeccionesProximasVencer = useCallback((): IInspeccion[] => {
    const hoy = new Date();
    const enTresDias = new Date();
    enTresDias.setDate(hoy.getDate() + 3);
    
    return inspecciones.filter(inspeccion => {
      if (!inspeccion.fechaProgramada) return false;
      const fechaProgramada = new Date(inspeccion.fechaProgramada);
      return fechaProgramada >= hoy && 
             fechaProgramada <= enTresDias && 
             inspeccion.estado !== EstadoInspeccion.COMPLETADA;
    });
  }, [inspecciones]);

  return {
    // Estado
    inspecciones,
    estadisticas,
    filtros,
    loading,
    errors,
    
    // Funciones principales
    cargarInspecciones,
    cargarEstadisticas,
    crearNuevaInspeccion,
    actualizarInspeccionExistente,
    eliminarInspeccionExistente,
    completarInspeccionExistente,
    
    // Funciones de filtros
    aplicarFiltros,
    limpiarFiltros,
    
    // Funciones de utilidad
    getInspeccionPorId,
    getInspeccionesPorEstado,
    getInspeccionesPorTipo,
    getInspeccionesVencidas,
    getInspeccionesProximasVencer,
    clearError
  };
};

// Hook específico para una inspección individual
export const useInspeccion = (id?: string) => {
  const [inspeccion, setInspeccion] = useState<IInspeccion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarInspeccion = useCallback(async (inspeccionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await obtenerInspeccionPorId(inspeccionId);
      
      if (response.success) {
        setInspeccion(response.data);
      } else {
        throw new Error(response.message || 'Error al cargar inspección');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setError(mensaje);
      console.error('Error en cargarInspeccion:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      cargarInspeccion(id);
    }
  }, [id, cargarInspeccion]);

  return {
    inspeccion,
    loading,
    error,
    cargarInspeccion,
    clearError: () => setError(null)
  };
};