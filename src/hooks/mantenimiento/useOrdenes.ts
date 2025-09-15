import { useState, useEffect, useCallback } from 'react';
import { 
  IOrdenTrabajo, 
  EstadoOrden, 
  PrioridadOrden, 
  TipoMantenimiento 
} from '../../types/mantenimiento';
import {
  obtenerOrdenes,
  obtenerOrdenPorId,
  crearOrden,
  actualizarOrden,
  eliminarOrden,
  obtenerEstadisticasOrdenes,
  cambiarEstadoOrden,
  IFiltrosOrdenes,
  ICrearOrdenData
} from '../../utils/ordenesApi';

// Estados de carga
interface LoadingStates {
  ordenes: boolean;
  estadisticas: boolean;
  crear: boolean;
  actualizar: boolean;
  eliminar: boolean;
  cambiarEstado: boolean;
}

// Errores
interface ErrorStates {
  ordenes: string | null;
  estadisticas: string | null;
  crear: string | null;
  actualizar: string | null;
  eliminar: string | null;
  cambiarEstado: string | null;
}

// Estadísticas
interface EstadisticasOrdenes {
  total: number;
  porEstado: { [key: string]: number };
  porPrioridad: { [key: string]: number };
  porTipo: { [key: string]: number };
  enVencimiento: number;
  promedioDuracion: number;
}

// Hook principal para gestión de órdenes
export const useOrdenes = () => {
  const [ordenes, setOrdenes] = useState<IOrdenTrabajo[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasOrdenes | null>(null);
  const [filtros, setFiltros] = useState<IFiltrosOrdenes>({});
  
  const [loading, setLoading] = useState<LoadingStates>({
    ordenes: false,
    estadisticas: false,
    crear: false,
    actualizar: false,
    eliminar: false,
    cambiarEstado: false
  });

  const [errors, setErrors] = useState<ErrorStates>({
    ordenes: null,
    estadisticas: null,
    crear: null,
    actualizar: null,
    eliminar: null,
    cambiarEstado: null
  });

  // Limpiar error específico
  const clearError = useCallback((tipo: keyof ErrorStates) => {
    setErrors(prev => ({ ...prev, [tipo]: null }));
  }, []);

  // Cargar órdenes
  const cargarOrdenes = useCallback(async (filtrosOpcionales?: IFiltrosOrdenes) => {
    try {
      setLoading(prev => ({ ...prev, ordenes: true }));
      setErrors(prev => ({ ...prev, ordenes: null }));
      
      const filtrosAUsar = filtrosOpcionales || filtros;
      const response = await obtenerOrdenes(filtrosAUsar);
      
      if (response.success) {
        setOrdenes(response.data);
      } else {
        throw new Error(response.message || 'Error al cargar órdenes');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, ordenes: mensaje }));
      console.error('Error en cargarOrdenes:', error);
    } finally {
      setLoading(prev => ({ ...prev, ordenes: false }));
    }
  }, [filtros]);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, estadisticas: true }));
      setErrors(prev => ({ ...prev, estadisticas: null }));
      
      const response = await obtenerEstadisticasOrdenes();
      
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

  // Crear orden
  const crearNuevaOrden = useCallback(async (ordenData: ICrearOrdenData): Promise<boolean> => {
    try {
      setLoading(prev => ({ ...prev, crear: true }));
      setErrors(prev => ({ ...prev, crear: null }));
      
      const response = await crearOrden(ordenData);
      
      if (response.success) {
        // Recargar órdenes para incluir la nueva
        await cargarOrdenes();
        await cargarEstadisticas();
        return true;
      } else {
        throw new Error(response.message || 'Error al crear orden');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, crear: mensaje }));
      console.error('Error en crearNuevaOrden:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, crear: false }));
    }
  }, [cargarOrdenes, cargarEstadisticas]);

  // Actualizar orden
  const actualizarOrdenExistente = useCallback(async (id: string, ordenData: Partial<ICrearOrdenData>): Promise<boolean> => {
    try {
      setLoading(prev => ({ ...prev, actualizar: true }));
      setErrors(prev => ({ ...prev, actualizar: null }));
      
      const response = await actualizarOrden(id, ordenData);
      
      if (response.success) {
        // Actualizar orden en el estado local
        setOrdenes(prev => prev.map(orden => 
          orden._id === id ? { ...orden, ...response.data } : orden
        ));
        await cargarEstadisticas();
        return true;
      } else {
        throw new Error(response.message || 'Error al actualizar orden');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, actualizar: mensaje }));
      console.error('Error en actualizarOrdenExistente:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, actualizar: false }));
    }
  }, [cargarEstadisticas]);

  // Eliminar orden
  const eliminarOrdenExistente = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(prev => ({ ...prev, eliminar: true }));
      setErrors(prev => ({ ...prev, eliminar: null }));
      
      const response = await eliminarOrden(id);
      
      if (response.success) {
        // Remover orden del estado local
        setOrdenes(prev => prev.filter(orden => orden._id !== id));
        await cargarEstadisticas();
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar orden');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, eliminar: mensaje }));
      console.error('Error en eliminarOrdenExistente:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, eliminar: false }));
    }
  }, [cargarEstadisticas]);

  // Cambiar estado de orden
  const cambiarEstadoOrdenExistente = useCallback(async (id: string, nuevoEstado: EstadoOrden): Promise<boolean> => {
    try {
      setLoading(prev => ({ ...prev, cambiarEstado: true }));
      setErrors(prev => ({ ...prev, cambiarEstado: null }));
      
      const response = await cambiarEstadoOrden(id, nuevoEstado);
      
      if (response.success) {
        // Actualizar estado en el estado local
        setOrdenes(prev => prev.map(orden => 
          orden._id === id ? { ...orden, estado: nuevoEstado } : orden
        ));
        await cargarEstadisticas();
        return true;
      } else {
        throw new Error(response.message || 'Error al cambiar estado');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, cambiarEstado: mensaje }));
      console.error('Error en cambiarEstadoOrdenExistente:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, cambiarEstado: false }));
    }
  }, [cargarEstadisticas]);

  // Aplicar filtros
  const aplicarFiltros = useCallback((nuevosFiltros: IFiltrosOrdenes) => {
    setFiltros(nuevosFiltros);
    cargarOrdenes(nuevosFiltros);
  }, [cargarOrdenes]);

  // Limpiar filtros
  const limpiarFiltros = useCallback(() => {
    const filtrosVacios = {};
    setFiltros(filtrosVacios);
    cargarOrdenes(filtrosVacios);
  }, [cargarOrdenes]);

  // Efectos
  useEffect(() => {
    cargarOrdenes();
    cargarEstadisticas();
  }, []);

  // Funciones de utilidad
  const getOrdenPorId = useCallback((id: string): IOrdenTrabajo | undefined => {
    return ordenes.find(orden => orden._id === id);
  }, [ordenes]);

  const getOrdenesPorEstado = useCallback((estado: EstadoOrden): IOrdenTrabajo[] => {
    return ordenes.filter(orden => orden.estado === estado);
  }, [ordenes]);

  const getOrdenesPorPrioridad = useCallback((prioridad: PrioridadOrden): IOrdenTrabajo[] => {
    return ordenes.filter(orden => orden.prioridad === prioridad);
  }, [ordenes]);

  const getOrdenesVencidas = useCallback((): IOrdenTrabajo[] => {
    const hoy = new Date();
    return ordenes.filter(orden => {
      if (!orden.fechaVencimiento) return false;
      const vencimiento = new Date(orden.fechaVencimiento);
      return vencimiento < hoy && orden.estado !== EstadoOrden.COMPLETADA;
    });
  }, [ordenes]);

  return {
    // Estado
    ordenes,
    estadisticas,
    filtros,
    loading,
    errors,
    
    // Funciones principales
    cargarOrdenes,
    cargarEstadisticas,
    crearNuevaOrden,
    actualizarOrdenExistente,
    eliminarOrdenExistente,
    cambiarEstadoOrdenExistente,
    
    // Funciones de filtros
    aplicarFiltros,
    limpiarFiltros,
    
    // Funciones de utilidad
    getOrdenPorId,
    getOrdenesPorEstado,
    getOrdenesPorPrioridad,
    getOrdenesVencidas,
    clearError
  };
};

// Hook específico para una orden individual
export const useOrden = (id?: string) => {
  const [orden, setOrden] = useState<IOrdenTrabajo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarOrden = useCallback(async (ordenId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await obtenerOrdenPorId(ordenId);
      
      if (response.success) {
        setOrden(response.data);
      } else {
        throw new Error(response.message || 'Error al cargar orden');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      setError(mensaje);
      console.error('Error en cargarOrden:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      cargarOrden(id);
    }
  }, [id, cargarOrden]);

  return {
    orden,
    loading,
    error,
    cargarOrden,
    clearError: () => setError(null)
  };
};