/// <reference types="vite/client" />
/// <reference path="../types/clerk.d.ts" />
import axios from 'axios';
import { 
  IUsuariosResponse, 
  IEstadisticasUsuariosResponse,
  ICambiarRolRequest,
  ICambiarRolResponse,
  ICurrentUserResponse
} from '../types/usuarios';

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

// Obtener todos los usuarios
export const obtenerUsuarios = async (): Promise<IUsuariosResponse> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/users`, { headers });
  return response.data;
};

// Obtener estadísticas de usuarios
export const obtenerEstadisticasUsuarios = async (): Promise<IEstadisticasUsuariosResponse> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/users/stats`, { headers });
  return response.data;
};

// Cambiar rol de usuario (solo administradores)
export const cambiarRolUsuario = async (request: ICambiarRolRequest): Promise<ICambiarRolResponse> => {
  const headers = await getAuthHeaders();
  const response = await axios.put(`${BASE_URL}/users/${request.userId}/role`, 
    { newRole: request.newRole }, 
    { headers }
  );
  return response.data;
};

// Obtener permisos del usuario actual
export const obtenerPermisosUsuario = async (): Promise<ICurrentUserResponse> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/users/me/permissions`, { headers });
  return response.data;
};