/// <reference types="vite/client" />
/// <reference path="../types/clerk.d.ts" />
import axios from 'axios';
import { IResumenFlota, IMonitoreoResponse } from '../types/monitoreo';
import { withErrorHandling } from './apiErrorHandler';

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

// Obtener resumen de monitoreo de la flota completa
// Función base para obtener resumen de flota (sin error handling)
const _obtenerResumenFlotaBase = async (): Promise<IResumenFlota> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/monitoreo/flota`, { headers });
  return response.data;
};

// Función base para obtener monitoreo de aeronave (sin error handling)
const _obtenerMonitoreoAeronaveBase = async (matricula: string): Promise<IMonitoreoResponse<any>> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/monitoreo/aeronave/${encodeURIComponent(matricula)}`, { headers });
  return response.data;
};

// Función base para obtener alertas de aeronave (sin error handling)
const _obtenerAlertasAeronaveBase = async (aeronaveId: string): Promise<IMonitoreoResponse<any>> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/monitoreo/aeronave/${aeronaveId}/alertas`, { headers });
  return response.data;
};

// Configuración dinámica basada en variables de entorno
const API_CONFIG = {
  maxRetries: Number(import.meta.env.VITE_API_RETRY_MAX) || 2,
  baseDelay: Number(import.meta.env.VITE_API_RETRY_DELAY) || 1000,
  maxDelay: 5000
};

// Funciones exportadas con manejo de errores y retry automático
export const obtenerResumenFlota = withErrorHandling(_obtenerResumenFlotaBase, API_CONFIG);

export const obtenerMonitoreoAeronave = withErrorHandling(_obtenerMonitoreoAeronaveBase, API_CONFIG);

export const obtenerAlertasAeronave = withErrorHandling(_obtenerAlertasAeronaveBase, API_CONFIG);

// Obtener estadísticas generales de monitoreo  
export const obtenerEstadisticasMonitoreo = async (): Promise<any> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/monitoreo/estadisticas`, { headers });
  return response.data;
};

// Exportar configuración para uso interno
export { getAuthHeaders, BASE_URL };