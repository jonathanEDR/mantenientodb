// API para herramientas - versión simplificada
import { 
  ICatalogoComponente, 
  CatalogoComponenteFormData,
  ICatalogoControlMonitoreo,
  CatalogoControlMonitoreoFormData
} from '../types/herramientas';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Helper para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper para manejar respuestas
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en la solicitud');
  }
  return response.json();
};

// ===== CATÁLOGO DE COMPONENTES =====

// Obtener todos los elementos del catálogo
export const obtenerCatalogoComponentes = async (filtros?: {
  busqueda?: string;
  estado?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  
  if (filtros?.busqueda) params.append('search', filtros.busqueda);
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.page) params.append('page', filtros.page.toString());
  if (filtros?.limit) params.append('limit', filtros.limit.toString());

  const response = await fetch(`${API_URL}/api/herramientas/catalogos/componentes?${params}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

// Obtener un elemento específico
export const obtenerCatalogoComponente = async (id: string) => {
  const response = await fetch(`${API_URL}/api/herramientas/catalogos/componentes/${id}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

// Crear nuevo elemento
export const crearCatalogoComponente = async (data: CatalogoComponenteFormData) => {
  const response = await fetch(`${API_URL}/api/herramientas/catalogos/componentes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return handleResponse(response);
};

// Actualizar elemento
export const actualizarCatalogoComponente = async (id: string, data: CatalogoComponenteFormData) => {
  const response = await fetch(`${API_URL}/api/herramientas/catalogos/componentes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return handleResponse(response);
};

// Eliminar elemento
export const eliminarCatalogoComponente = async (id: string) => {
  const response = await fetch(`${API_URL}/api/herramientas/catalogos/componentes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

// ===== CATÁLOGO DE CONTROL Y MONITOREO =====

// Obtener todos los elementos del catálogo de control y monitoreo
export const obtenerCatalogoControlMonitoreo = async (filtros?: {
  busqueda?: string;
  estado?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  
  if (filtros?.busqueda) params.append('descripcionCodigo', filtros.busqueda);
  if (filtros?.estado) params.append('estado', filtros.estado);
  if (filtros?.page) params.append('page', filtros.page.toString());
  if (filtros?.limit) params.append('limit', filtros.limit.toString());

  const response = await fetch(`${API_URL}/api/herramientas/catalogos/control-monitoreo?${params}`, {
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};

// Crear nuevo elemento en catálogo de control y monitoreo
export const crearCatalogoControlMonitoreo = async (data: CatalogoControlMonitoreoFormData) => {
  const response = await fetch(`${API_URL}/api/herramientas/catalogos/control-monitoreo`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return handleResponse(response);
};

// Actualizar elemento en catálogo de control y monitoreo
export const actualizarCatalogoControlMonitoreo = async (id: string, data: CatalogoControlMonitoreoFormData) => {
  const response = await fetch(`${API_URL}/api/herramientas/catalogos/control-monitoreo/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  return handleResponse(response);
};

// Eliminar elemento del catálogo de control y monitoreo
export const eliminarCatalogoControlMonitoreo = async (id: string) => {
  const response = await fetch(`${API_URL}/api/herramientas/catalogos/control-monitoreo/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
};
