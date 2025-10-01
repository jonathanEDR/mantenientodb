// API para herramientas - usando axiosInstance para consistencia
import axiosInstance from './axiosConfig';
import { 
  ICatalogoComponente, 
  CatalogoComponenteFormData,
  ICatalogoControlMonitoreo,
  CatalogoControlMonitoreoFormData
} from '../types/herramientas';

// ===== CATÁLOGO DE COMPONENTES =====

// Obtener todos los elementos del catálogo
export const obtenerCatalogoComponentes = async (filtros?: {
  busqueda?: string;
  estado?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros?.busqueda) params.append('search', filtros.busqueda);
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    const response = await axiosInstance.get(`/herramientas/catalogos/componentes?${params}`);
    
    return {
      success: true,
      data: response.data.elementos || response.data,
      message: 'Catálogos obtenidos exitosamente',
      total: response.data.total || 0,
      page: response.data.page || 1,
      totalPages: response.data.totalPages || 1
    };
  } catch (error: any) {
    console.error('Error al obtener catálogo de componentes:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener catálogos',
      data: []
    };
  }
};

// Obtener un elemento específico
export const obtenerCatalogoComponente = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/herramientas/catalogos/componentes/${id}`);
    return {
      success: true,
      data: response.data,
      message: 'Elemento obtenido exitosamente'
    };
  } catch (error: any) {
    console.error('Error al obtener elemento del catálogo:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener elemento',
      data: null
    };
  }
};

// Crear nuevo elemento
export const crearCatalogoComponente = async (data: CatalogoComponenteFormData) => {
  try {
    const response = await axiosInstance.post('/herramientas/catalogos/componentes', data);
    return {
      success: true,
      data: response.data,
      message: 'Elemento creado exitosamente'
    };
  } catch (error: any) {
    console.error('Error al crear elemento:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al crear elemento',
      data: null
    };
  }
};

// Actualizar elemento
export const actualizarCatalogoComponente = async (id: string, data: CatalogoComponenteFormData) => {
  try {
    const response = await axiosInstance.put(`/herramientas/catalogos/componentes/${id}`, data);
    return {
      success: true,
      data: response.data,
      message: 'Elemento actualizado exitosamente'
    };
  } catch (error: any) {
    console.error('Error al actualizar elemento:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al actualizar elemento',
      data: null
    };
  }
};

// Eliminar elemento
export const eliminarCatalogoComponente = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/herramientas/catalogos/componentes/${id}`);
    return {
      success: true,
      data: response.data,
      message: 'Elemento eliminado exitosamente'
    };
  } catch (error: any) {
    console.error('Error al eliminar elemento:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al eliminar elemento',
      data: null
    };
  }
};

// ===== CATÁLOGO DE CONTROL Y MONITOREO =====

// Obtener todos los elementos del catálogo de control y monitoreo
export const obtenerCatalogoControlMonitoreo = async (filtros?: {
  busqueda?: string;
  estado?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros?.busqueda) params.append('descripcionCodigo', filtros.busqueda);
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    const response = await axiosInstance.get(`/herramientas/catalogos/control-monitoreo?${params}`);
    
    return {
      success: true,
      data: response.data.elementos || [], // Los catálogos están en 'elementos'
      message: 'Catálogos obtenidos exitosamente',
      total: response.data.total || 0,
      page: response.data.page || 1,
      totalPages: response.data.totalPages || 1
    };
  } catch (error: any) {
    console.error('Error al obtener catálogo de control y monitoreo:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener catálogos',
      data: []
    };
  }
};

// Crear nuevo elemento en catálogo de control y monitoreo
export const crearCatalogoControlMonitoreo = async (data: CatalogoControlMonitoreoFormData) => {
  try {
    const response = await axiosInstance.post('/herramientas/catalogos/control-monitoreo', data);
    return {
      success: true,
      data: response.data,
      message: 'Control de monitoreo creado exitosamente'
    };
  } catch (error: any) {
    console.error('Error al crear control de monitoreo:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al crear control de monitoreo',
      data: null
    };
  }
};

// Actualizar elemento en catálogo de control y monitoreo
export const actualizarCatalogoControlMonitoreo = async (id: string, data: CatalogoControlMonitoreoFormData) => {
  try {
    const response = await axiosInstance.put(`/herramientas/catalogos/control-monitoreo/${id}`, data);
    return {
      success: true,
      data: response.data,
      message: 'Control de monitoreo actualizado exitosamente'
    };
  } catch (error: any) {
    console.error('Error al actualizar control de monitoreo:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al actualizar control de monitoreo',
      data: null
    };
  }
};

// Eliminar elemento del catálogo de control y monitoreo
export const eliminarCatalogoControlMonitoreo = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/herramientas/catalogos/control-monitoreo/${id}`);
    return {
      success: true,
      data: response.data,
      message: 'Control de monitoreo eliminado exitosamente'
    };
  } catch (error: any) {
    console.error('Error al eliminar control de monitoreo:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al eliminar control de monitoreo',
      data: null
    };
  }
};
