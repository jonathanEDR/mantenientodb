import axiosInstance from './axiosConfig';
import { IOrdenTrabajo, TipoMantenimiento, PrioridadOrden, EstadoOrden } from '../types/mantenimiento';

// Interfaces para respuestas de la API
export interface IOrdenesResponse {
  success: boolean;
  data: IOrdenTrabajo[];
  total: number;
  message?: string;
}

export interface IOrdenResponse {
  success: boolean;
  data: IOrdenTrabajo;
  message?: string;
}

export interface IEstadisticasOrdenesResponse {
  success: boolean;
  data: {
    total: number;
    porEstado: { [key: string]: number };
    porPrioridad: { [key: string]: number };
    porTipo: { [key: string]: number };
    enVencimiento: number;
    promedioDuracion: number;
  };
  message?: string;
}

// Filtros para búsqueda de órdenes
export interface IFiltrosOrdenes {
  estado?: EstadoOrden;
  prioridad?: PrioridadOrden;
  tipo?: TipoMantenimiento;
  aeronave?: string;
  tecnico?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
}

// Datos para crear/actualizar órdenes
export interface ICrearOrdenData {
  numeroOrden: string;
  aeronave: string;
  componente?: string;
  tipo: TipoMantenimiento;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadOrden;
  tecnicoAsignado?: string;
  supervisorAsignado?: string;
  fechaVencimiento?: string;
  estado?: EstadoOrden;
  horasEstimadas: number;
  observaciones?: string;
}

// ============ FUNCIONES DE API ============

/**
 * Obtener todas las órdenes de trabajo con filtros opcionales
 */
export const obtenerOrdenes = async (filtros?: IFiltrosOrdenes): Promise<IOrdenesResponse> => {
  try {
    // Construir query parameters
    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const url = params.toString() ? `/mantenimiento/ordenes?${params.toString()}` : '/mantenimiento/ordenes';

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error al obtener órdenes de trabajo:', error);
    throw error;
  }
};

/**
 * Obtener una orden de trabajo por ID
 */
export const obtenerOrdenPorId = async (id: string): Promise<IOrdenResponse> => {
  try {
    const response = await axiosInstance.get(`/mantenimiento/ordenes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener orden ${id}:`, error);
    throw error;
  }
};

/**
 * Crear una nueva orden de trabajo
 */
export const crearOrden = async (ordenData: ICrearOrdenData): Promise<IOrdenResponse> => {
  try {
    const response = await axiosInstance.post('/mantenimiento/ordenes', ordenData);
    return response.data;
  } catch (error) {
    console.error('Error al crear orden de trabajo:', error);
    throw error;
  }
};

/**
 * Actualizar una orden de trabajo existente
 */
export const actualizarOrden = async (id: string, ordenData: Partial<ICrearOrdenData>): Promise<IOrdenResponse> => {
  try {
    const response = await axiosInstance.put(`/mantenimiento/ordenes/${id}`, ordenData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar orden ${id}:`, error);
    throw error;
  }
};

/**
 * Eliminar una orden de trabajo
 */
export const eliminarOrden = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.delete(`/mantenimiento/ordenes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar orden ${id}:`, error);
    throw error;
  }
};

/**
 * Obtener estadísticas de órdenes de trabajo
 */
export const obtenerEstadisticasOrdenes = async (): Promise<IEstadisticasOrdenesResponse> => {
  try {
    const response = await axiosInstance.get('/mantenimiento/ordenes/stats');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de órdenes:', error);
    throw error;
  }
};

/**
 * Cambiar estado de una orden de trabajo
 */
export const cambiarEstadoOrden = async (id: string, nuevoEstado: EstadoOrden): Promise<IOrdenResponse> => {
  try {
    const response = await axiosInstance.patch(`/mantenimiento/ordenes/${id}/estado`, { estado: nuevoEstado });
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado de orden ${id}:`, error);
    throw error;
  }
};

/**
 * Asignar técnico a una orden de trabajo
 */
export const asignarTecnico = async (id: string, tecnicoId: string): Promise<IOrdenResponse> => {
  try {
    const response = await axiosInstance.patch(`/mantenimiento/ordenes/${id}/asignar-tecnico`, { tecnicoAsignado: tecnicoId });
    return response.data;
  } catch (error) {
    console.error(`Error al asignar técnico a orden ${id}:`, error);
    throw error;
  }
};

/**
 * Completar una orden de trabajo
 */
export const completarOrden = async (
  id: string,
  datos: {
    horasReales: number;
    observaciones?: string;
    certificacion?: any
  }
): Promise<IOrdenResponse> => {
  try {
    const response = await axiosInstance.patch(`/mantenimiento/ordenes/${id}/completar`, datos);
    return response.data;
  } catch (error) {
    console.error(`Error al completar orden ${id}:`, error);
    throw error;
  }
};

/**
 * Obtener órdenes vencidas o próximas a vencer
 */
export const obtenerOrdenesVencidas = async (dias?: number): Promise<IOrdenesResponse> => {
  try {
    const params = dias ? `?dias=${dias}` : '';
    const response = await axiosInstance.get(`/mantenimiento/ordenes/vencidas${params}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener órdenes vencidas:', error);
    throw error;
  }
};

export default {
  obtenerOrdenes,
  obtenerOrdenPorId,
  crearOrden,
  actualizarOrden,
  eliminarOrden,
  obtenerEstadisticasOrdenes,
  cambiarEstadoOrden,
  asignarTecnico,
  completarOrden,
  obtenerOrdenesVencidas
};
