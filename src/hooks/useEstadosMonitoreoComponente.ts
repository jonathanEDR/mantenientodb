import { useState, useEffect, useCallback } from 'react';
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
  filtrarEstados
} from '../utils/estadosMonitoreoComponenteApi';

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

  // Cargar estados de monitoreo
  const cargarEstados = useCallback(async (targetComponenteId: string) => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await obtenerEstadosMonitoreoComponente(targetComponenteId);
      
      if (resultado.success) {
        setEstados(resultado.data);
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
    }
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
  }, []);

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

  // Cargar estados inicial si se proporciona componenteId
  useEffect(() => {
    if (componenteId) {
      cargarEstados(componenteId);
    }
  }, [componenteId, cargarEstados]);

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
    aplicarFiltros,
    limpiarFiltros,
    obtenerEstadisticas,
    refrescar
  };
};