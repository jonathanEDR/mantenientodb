import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { IComponente } from '../../types/mantenimiento';
import { IAeronave } from '../../types/inventario';

// Tipos de acciones
export type MantenimientoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COMPONENTES'; payload: IComponente[] }
  | { type: 'SET_AERONAVES'; payload: IAeronave[] }
  | { type: 'ADD_COMPONENTE'; payload: IComponente }
  | { type: 'UPDATE_COMPONENTE'; payload: { id: string; componente: Partial<IComponente> } }
  | { type: 'DELETE_COMPONENTE'; payload: string }
  | { type: 'SET_SELECTED_COMPONENTE'; payload: IComponente | null }
  | { type: 'SET_FILTERS'; payload: Partial<MantenimientoFilters> }
  | { type: 'CLEAR_FILTERS' };

// Estado de filtros
export interface MantenimientoFilters {
  categoria: string;
  estado: string;
  busqueda: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  aeronaveId?: string;
}

// Estado del contexto
export interface MantenimientoState {
  // Datos
  componentes: IComponente[];
  aeronaves: IAeronave[];
  
  // Estado de carga
  loading: boolean;
  error: string | null;
  
  // Selección actual
  selectedComponente: IComponente | null;
  
  // Filtros
  filters: MantenimientoFilters;
  
  // Datos computados
  componentesFiltrados: IComponente[];
}

// Interfaz del contexto
export interface MantenimientoContextType extends MantenimientoState {
  // Acciones para componentes
  setComponentes: (componentes: IComponente[]) => void;
  addComponente: (componente: IComponente) => void;
  updateComponente: (id: string, componente: Partial<IComponente>) => void;
  deleteComponente: (id: string) => void;
  selectComponente: (componente: IComponente | null) => void;
  
  // Acciones para aeronaves
  setAeronaves: (aeronaves: IAeronave[]) => void;
  
  // Acciones de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones de filtros
  setFilters: (filters: Partial<MantenimientoFilters>) => void;
  clearFilters: () => void;
  
  // Utilidades
  getAeronaveNombre: (aeronaveId: string) => string;
  getComponentesByAeronave: (aeronaveId: string) => IComponente[];
  getComponentesByEstado: (estado: string) => IComponente[];
}

// Estado inicial
const initialFilters: MantenimientoFilters = {
  categoria: '',
  estado: '',
  busqueda: '',
  fechaDesde: undefined,
  fechaHasta: undefined,
  aeronaveId: undefined
};

const initialState: MantenimientoState = {
  componentes: [],
  aeronaves: [],
  loading: false,
  error: null,
  selectedComponente: null,
  filters: initialFilters,
  componentesFiltrados: []
};

// Función para filtrar componentes
const filterComponentes = (componentes: IComponente[], filters: MantenimientoFilters): IComponente[] => {
  return componentes.filter(componente => {
    // Filtro por categoría
    if (filters.categoria && componente.categoria !== filters.categoria) {
      return false;
    }

    // Filtro por estado
    if (filters.estado && componente.estado !== filters.estado) {
      return false;
    }

    // Filtro por aeronave
    if (filters.aeronaveId && componente.ubicacionFisica !== filters.aeronaveId) {
      return false;
    }

    // Filtro de búsqueda
    if (filters.busqueda) {
      const termino = filters.busqueda.toLowerCase();
      const coincide = 
        componente.nombre?.toLowerCase().includes(termino) ||
        componente.numeroSerie?.toLowerCase().includes(termino) ||
        componente.numeroParte?.toLowerCase().includes(termino) ||
        componente.fabricante?.toLowerCase().includes(termino);
      
      if (!coincide) return false;
    }

    // Filtro por fecha de instalación (desde)
    if (filters.fechaDesde && componente.fechaInstalacion) {
      const fechaItem = new Date(componente.fechaInstalacion);
      if (fechaItem < filters.fechaDesde) {
        return false;
      }
    }

    // Filtro por fecha de instalación (hasta)
    if (filters.fechaHasta && componente.fechaInstalacion) {
      const fechaItem = new Date(componente.fechaInstalacion);
      if (fechaItem > filters.fechaHasta) {
        return false;
      }
    }

    return true;
  });
};

// Reducer
const mantenimientoReducer = (state: MantenimientoState, action: MantenimientoAction): MantenimientoState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_COMPONENTES':
      const componentesFiltrados = filterComponentes(action.payload, state.filters);
      return { 
        ...state, 
        componentes: action.payload, 
        componentesFiltrados
      };

    case 'SET_AERONAVES':
      return { ...state, aeronaves: action.payload };

    case 'ADD_COMPONENTE':
      const nuevosComponentes = [...state.componentes, action.payload];
      const nuevosFiltrados = filterComponentes(nuevosComponentes, state.filters);
      return { 
        ...state, 
        componentes: nuevosComponentes,
        componentesFiltrados: nuevosFiltrados
      };

    case 'UPDATE_COMPONENTE':
      const componentesActualizados = state.componentes.map(c => 
        c._id === action.payload.id ? { ...c, ...action.payload.componente } : c
      );
      const actualizadosFiltrados = filterComponentes(componentesActualizados, state.filters);
      return { 
        ...state, 
        componentes: componentesActualizados,
        componentesFiltrados: actualizadosFiltrados
      };

    case 'DELETE_COMPONENTE':
      const componentesRestantes = state.componentes.filter(c => c._id !== action.payload);
      const restantesFiltrados = filterComponentes(componentesRestantes, state.filters);
      return { 
        ...state, 
        componentes: componentesRestantes,
        componentesFiltrados: restantesFiltrados,
        selectedComponente: state.selectedComponente?._id === action.payload ? null : state.selectedComponente
      };

    case 'SET_SELECTED_COMPONENTE':
      return { ...state, selectedComponente: action.payload };

    case 'SET_FILTERS':
      const newFilters = { ...state.filters, ...action.payload };
      const filteredComponentes = filterComponentes(state.componentes, newFilters);
      return { 
        ...state, 
        filters: newFilters,
        componentesFiltrados: filteredComponentes
      };

    case 'CLEAR_FILTERS':
      return { 
        ...state, 
        filters: initialFilters,
        componentesFiltrados: state.componentes
      };

    default:
      return state;
  }
};

// Crear contexto
const MantenimientoContext = createContext<MantenimientoContextType | undefined>(undefined);

// Provider component
export const MantenimientoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(mantenimientoReducer, initialState);

  // Acciones para componentes
  const setComponentes = (componentes: IComponente[]) => {
    dispatch({ type: 'SET_COMPONENTES', payload: componentes });
  };

  const addComponente = (componente: IComponente) => {
    dispatch({ type: 'ADD_COMPONENTE', payload: componente });
  };

  const updateComponente = (id: string, componente: Partial<IComponente>) => {
    dispatch({ type: 'UPDATE_COMPONENTE', payload: { id, componente } });
  };

  const deleteComponente = (id: string) => {
    dispatch({ type: 'DELETE_COMPONENTE', payload: id });
  };

  const selectComponente = (componente: IComponente | null) => {
    dispatch({ type: 'SET_SELECTED_COMPONENTE', payload: componente });
  };

  // Acciones para aeronaves
  const setAeronaves = (aeronaves: IAeronave[]) => {
    dispatch({ type: 'SET_AERONAVES', payload: aeronaves });
  };

  // Acciones de estado
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  // Acciones de filtros
  const setFilters = (filters: Partial<MantenimientoFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  // Utilidades
  const getAeronaveNombre = (aeronaveId: string): string => {
    if (!aeronaveId) return 'N/A';
    const aeronave = state.aeronaves.find(a => a._id === aeronaveId);
    return aeronave ? `${aeronave.matricula} - ${aeronave.modelo}` : 'N/A';
  };

  const getComponentesByAeronave = (aeronaveId: string): IComponente[] => {
    return state.componentes.filter(c => c.ubicacionFisica === aeronaveId);
  };

  const getComponentesByEstado = (estado: string): IComponente[] => {
    return state.componentes.filter(c => c.estado === estado);
  };

  const contextValue: MantenimientoContextType = {
    ...state,
    
    // Acciones para componentes
    setComponentes,
    addComponente,
    updateComponente,
    deleteComponente,
    selectComponente,
    
    // Acciones para aeronaves
    setAeronaves,
    
    // Acciones de estado
    setLoading,
    setError,
    
    // Acciones de filtros
    setFilters,
    clearFilters,
    
    // Utilidades
    getAeronaveNombre,
    getComponentesByAeronave,
    getComponentesByEstado
  };

  return (
    <MantenimientoContext.Provider value={contextValue}>
      {children}
    </MantenimientoContext.Provider>
  );
};

// Hook para usar el contexto
export const useMantenimientoContext = (): MantenimientoContextType => {
  const context = useContext(MantenimientoContext);
  if (context === undefined) {
    throw new Error('useMantenimientoContext debe ser usado dentro de MantenimientoProvider');
  }
  return context;
};