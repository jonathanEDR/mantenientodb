/// <reference types="vite/client" />
/// <reference path="../types/clerk.d.ts" />
import axios from 'axios';
import { 
  IAeronavesResponse, 
  IAeronaveResponse, 
  IEstadisticasInventarioResponse,
  ICrearAeronaveData,
  IActualizarAeronaveData
} from '../types/inventario';

// Configurar base URL para las API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

// Función helper para obtener token de Clerk
const getAuthHeaders = async () => {
  try {
    // Intentar obtener el token de diferentes maneras
    let token = null;
    
    // Método 1: Usando window.Clerk
    if (typeof window !== 'undefined' && window.Clerk?.session) {
      token = await window.Clerk.session.getToken();
    }
    
    // Método 2: Desde localStorage/sessionStorage si es necesario
    if (!token && typeof window !== 'undefined') {
      // Aquí podrías implementar otra lógica para obtener el token
    }

    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.warn('Error al obtener token de autenticación:', error);
    return {};
  }
};

// Obtener todas las aeronaves
export const obtenerAeronaves = async (): Promise<IAeronavesResponse> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/inventario`, { headers });
  return response.data;
};

// Obtener estadísticas de inventario
export const obtenerEstadisticasInventario = async (): Promise<IEstadisticasInventarioResponse> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/inventario/stats`, { headers });
  return response.data;
};

// Obtener una aeronave por ID
export const obtenerAeronave = async (id: string): Promise<IAeronaveResponse> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/inventario/${id}`, { headers });
  return response.data;
};

// Crear nueva aeronave
export const crearAeronave = async (data: ICrearAeronaveData): Promise<IAeronaveResponse> => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${BASE_URL}/inventario`, data, { headers });
  return response.data;
};

// Actualizar aeronave
export const actualizarAeronave = async (id: string, data: Partial<ICrearAeronaveData>): Promise<IAeronaveResponse> => {
  const headers = await getAuthHeaders();
  const response = await axios.put(`${BASE_URL}/inventario/${id}`, data, { headers });
  return response.data;
};

// Eliminar aeronave
export const eliminarAeronave = async (id: string): Promise<IAeronaveResponse> => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${BASE_URL}/inventario/${id}`, { headers });
  return response.data;
};