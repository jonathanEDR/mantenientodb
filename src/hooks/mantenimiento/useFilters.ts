import { useState, useMemo, useCallback } from 'react';
import { IComponente } from '../../types/mantenimiento';

export interface FiltrosMantenimiento {
  categoria: string;
  estado: string;
  busqueda: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  aeronaveId?: string;
}

export interface UseFiltersReturn<T> {
  // Estado de filtros
  filtros: FiltrosMantenimiento;
  
  // Acciones de filtros
  setFiltroCategoria: (categoria: string) => void;
  setFiltroEstado: (estado: string) => void;
  setFiltroBusqueda: (busqueda: string) => void;
  setFiltroFechaDesde: (fecha?: Date) => void;
  setFiltroFechaHasta: (fecha?: Date) => void;
  setFiltroAeronave: (aeronaveId?: string) => void;
  limpiarFiltros: () => void;
  
  // Datos filtrados
  datosFiltrados: T[];
  
  // Utilidades
  hayFiltrosActivos: boolean;
  conteoFiltros: number;
}

const filtrosIniciales: FiltrosMantenimiento = {
  categoria: '',
  estado: '',
  busqueda: '',
  fechaDesde: undefined,
  fechaHasta: undefined,
  aeronaveId: undefined
};

export const useFilters = <T extends IComponente>(datos: T[]): UseFiltersReturn<T> => {
  const [filtros, setFiltros] = useState<FiltrosMantenimiento>(filtrosIniciales);

  // Acciones para actualizar filtros individuales
  const setFiltroCategoria = useCallback((categoria: string) => {
    setFiltros(prev => ({ ...prev, categoria }));
  }, []);

  const setFiltroEstado = useCallback((estado: string) => {
    setFiltros(prev => ({ ...prev, estado }));
  }, []);

  const setFiltroBusqueda = useCallback((busqueda: string) => {
    setFiltros(prev => ({ ...prev, busqueda }));
  }, []);

  const setFiltroFechaDesde = useCallback((fechaDesde?: Date) => {
    setFiltros(prev => ({ ...prev, fechaDesde }));
  }, []);

  const setFiltroFechaHasta = useCallback((fechaHasta?: Date) => {
    setFiltros(prev => ({ ...prev, fechaHasta }));
  }, []);

  const setFiltroAeronave = useCallback((aeronaveId?: string) => {
    setFiltros(prev => ({ ...prev, aeronaveId }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(filtrosIniciales);
  }, []);

  // Lógica de filtrado
  const datosFiltrados = useMemo(() => {
    return datos.filter(item => {
      // Filtro por categoría
      if (filtros.categoria && item.categoria !== filtros.categoria) {
        return false;
      }

      // Filtro por estado
      if (filtros.estado && item.estado !== filtros.estado) {
        return false;
      }

      // Filtro por aeronave
      if (filtros.aeronaveId && item.ubicacionFisica !== filtros.aeronaveId) {
        return false;
      }

      // Filtro de búsqueda (nombre, número de serie, número de parte)
      if (filtros.busqueda) {
        const termino = filtros.busqueda.toLowerCase();
        const coincide = 
          item.nombre?.toLowerCase().includes(termino) ||
          item.numeroSerie?.toLowerCase().includes(termino) ||
          item.numeroParte?.toLowerCase().includes(termino) ||
          item.fabricante?.toLowerCase().includes(termino);
        
        if (!coincide) return false;
      }

      // Filtro por fecha de instalación (desde)
      if (filtros.fechaDesde && item.fechaInstalacion) {
        const fechaItem = new Date(item.fechaInstalacion);
        if (fechaItem < filtros.fechaDesde) {
          return false;
        }
      }

      // Filtro por fecha de instalación (hasta)
      if (filtros.fechaHasta && item.fechaInstalacion) {
        const fechaItem = new Date(item.fechaInstalacion);
        if (fechaItem > filtros.fechaHasta) {
          return false;
        }
      }

      return true;
    });
  }, [datos, filtros]);

  // Utilidades
  const hayFiltrosActivos = useMemo(() => {
    return !!(
      filtros.categoria ||
      filtros.estado ||
      filtros.busqueda ||
      filtros.fechaDesde ||
      filtros.fechaHasta ||
      filtros.aeronaveId
    );
  }, [filtros]);

  const conteoFiltros = useMemo(() => {
    let count = 0;
    if (filtros.categoria) count++;
    if (filtros.estado) count++;
    if (filtros.busqueda) count++;
    if (filtros.fechaDesde) count++;
    if (filtros.fechaHasta) count++;
    if (filtros.aeronaveId) count++;
    return count;
  }, [filtros]);

  return {
    // Estado de filtros
    filtros,
    
    // Acciones de filtros
    setFiltroCategoria,
    setFiltroEstado,
    setFiltroBusqueda,
    setFiltroFechaDesde,
    setFiltroFechaHasta,
    setFiltroAeronave,
    limpiarFiltros,
    
    // Datos filtrados
    datosFiltrados,
    
    // Utilidades
    hayFiltrosActivos,
    conteoFiltros
  };
};