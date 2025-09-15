import axiosInstance from './axiosConfig';
import { IInspeccion, EstadoInspeccion, TipoInspeccion } from '../types/mantenimiento';

// Interfaz para filtros de búsqueda
export interface IFiltrosInspecciones {
  estado?: EstadoInspeccion;
  tipo?: TipoInspeccion;
  aeronave?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  responsable?: string;
  prioridad?: string;
  busqueda?: string;
}

// Interfaz para crear/editar inspección
export interface ICrearInspeccionData {
  tipo: TipoInspeccion;
  aeronave: string;
  fechaProgramada: Date;
  inspectorAsignado?: string;
  observaciones?: string;
  documentos?: {
    nombre: string;
    url: string;
    tipo: string;
  }[];
}

// Interfaz para respuesta de API
interface IAPIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Interfaz para estadísticas
interface IEstadisticasInspecciones {
  total: number;
  porEstado: { [key: string]: number };
  porTipo: { [key: string]: number };
  vencimientosProximos: number;
  cumplimientoPromedio: number;
}

// ==================== FUNCIONES PRINCIPALES ====================

/**
 * Obtiene todas las inspecciones con filtros opcionales
 */
export const obtenerInspecciones = async (filtros?: IFiltrosInspecciones): Promise<IAPIResponse<IInspeccion[]>> => {
  try {
    const params = new URLSearchParams();
    
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const url = `/api/mantenimiento/inspecciones${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axiosInstance.get(url);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al obtener inspecciones:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Error al obtener inspecciones'
    };
  }
};

/**
 * Obtiene una inspección específica por ID
 */
export const obtenerInspeccionPorId = async (id: string): Promise<IAPIResponse<IInspeccion>> => {
  try {
    const response = await axiosInstance.get(`/api/mantenimiento/inspecciones/${id}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al obtener inspección:', error);
    return {
      success: false,
      data: {} as IInspeccion,
      message: error.response?.data?.message || 'Error al obtener inspección'
    };
  }
};

/**
 * Crea una nueva inspección
 */
export const crearInspeccion = async (inspeccionData: ICrearInspeccionData): Promise<IAPIResponse<IInspeccion>> => {
  try {
    const response = await axiosInstance.post('/api/mantenimiento/inspecciones', inspeccionData);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al crear inspección:', error);
    return {
      success: false,
      data: {} as IInspeccion,
      message: error.response?.data?.message || 'Error al crear inspección'
    };
  }
};

/**
 * Actualiza una inspección existente
 */
export const actualizarInspeccion = async (id: string, inspeccionData: Partial<ICrearInspeccionData>): Promise<IAPIResponse<IInspeccion>> => {
  try {
    const response = await axiosInstance.put(`/api/mantenimiento/inspecciones/${id}`, inspeccionData);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al actualizar inspección:', error);
    return {
      success: false,
      data: {} as IInspeccion,
      message: error.response?.data?.message || 'Error al actualizar inspección'
    };
  }
};

/**
 * Elimina una inspección
 */
export const eliminarInspeccion = async (id: string): Promise<IAPIResponse<boolean>> => {
  try {
    await axiosInstance.delete(`/api/mantenimiento/inspecciones/${id}`);
    
    return {
      success: true,
      data: true
    };
  } catch (error: any) {
    console.error('Error al eliminar inspección:', error);
    return {
      success: false,
      data: false,
      message: error.response?.data?.message || 'Error al eliminar inspección'
    };
  }
};

/**
 * Completa una inspección
 */
export const completarInspeccion = async (id: string, observaciones?: string): Promise<IAPIResponse<IInspeccion>> => {
  try {
    const data = {
      estado: EstadoInspeccion.COMPLETADA,
      fechaCompletacion: new Date(),
      observaciones
    };
    
    const response = await axiosInstance.patch(`/api/mantenimiento/inspecciones/${id}/completar`, data);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al completar inspección:', error);
    return {
      success: false,
      data: {} as IInspeccion,
      message: error.response?.data?.message || 'Error al completar inspección'
    };
  }
};

/**
 * Obtiene estadísticas de inspecciones
 */
export const obtenerEstadisticasInspecciones = async (): Promise<IAPIResponse<IEstadisticasInspecciones>> => {
  try {
    const response = await axiosInstance.get('/api/mantenimiento/inspecciones/estadisticas');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al obtener estadísticas de inspecciones:', error);
    return {
      success: false,
      data: {
        total: 0,
        porEstado: {},
        porTipo: {},
        vencimientosProximos: 0,
        cumplimientoPromedio: 0
      },
      message: error.response?.data?.message || 'Error al obtener estadísticas'
    };
  }
};

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Obtiene inspecciones vencidas
 */
export const obtenerInspeccionesVencidas = async (): Promise<IAPIResponse<IInspeccion[]>> => {
  try {
    const response = await axiosInstance.get('/api/mantenimiento/inspecciones/vencidas');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al obtener inspecciones vencidas:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Error al obtener inspecciones vencidas'
    };
  }
};

/**
 * Obtiene inspecciones próximas a vencer
 */
export const obtenerInspeccionesProximasVencer = async (dias: number = 7): Promise<IAPIResponse<IInspeccion[]>> => {
  try {
    const response = await axiosInstance.get(`/api/mantenimiento/inspecciones/proximas-vencer?dias=${dias}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al obtener inspecciones próximas a vencer:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Error al obtener inspecciones próximas a vencer'
    };
  }
};

/**
 * Obtiene inspecciones por aeronave
 */
export const obtenerInspeccionesPorAeronave = async (aeronaveId: string): Promise<IAPIResponse<IInspeccion[]>> => {
  try {
    const response = await axiosInstance.get(`/api/mantenimiento/inspecciones/aeronave/${aeronaveId}`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al obtener inspecciones por aeronave:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Error al obtener inspecciones por aeronave'
    };
  }
};

/**
 * Programa una inspección recurrente
 */
export const programarInspeccionRecurrente = async (
  inspeccionBase: ICrearInspeccionData, 
  intervaloDias: number, 
  repeticiones: number
): Promise<IAPIResponse<IInspeccion[]>> => {
  try {
    const data = {
      inspeccionBase,
      intervaloDias,
      repeticiones
    };
    
    const response = await axiosInstance.post('/api/mantenimiento/inspecciones/programar-recurrente', data);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al programar inspección recurrente:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Error al programar inspección recurrente'
    };
  }
};

/**
 * Genera reporte de inspección
 */
export const generarReporteInspeccion = async (id: string): Promise<IAPIResponse<{ url: string }>> => {
  try {
    const response = await axiosInstance.post(`/api/mantenimiento/inspecciones/${id}/reporte`);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error al generar reporte de inspección:', error);
    return {
      success: false,
      data: { url: '' },
      message: error.response?.data?.message || 'Error al generar reporte de inspección'
    };
  }
};

// ==================== VALIDACIONES ====================

/**
 * Valida los datos de una inspección antes de crear/actualizar
 */
export const validarDatosInspeccion = (datos: Partial<ICrearInspeccionData>): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];

  // Validaciones requeridas para creación
  if (!datos.tipo) {
    errores.push('El tipo de inspección es requerido');
  }

  if (!datos.aeronave) {
    errores.push('La aeronave es requerida');
  }

  if (!datos.fechaProgramada) {
    errores.push('La fecha programada es requerida');
  }

  // Validaciones de fechas
  if (datos.fechaProgramada) {
    const fechaProgramada = new Date(datos.fechaProgramada);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaProgramada < hoy) {
      errores.push('La fecha programada no puede ser anterior a hoy');
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
};