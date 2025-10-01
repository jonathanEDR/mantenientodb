/// <reference types="vite/client" />
/// <reference path="../types/clerk.d.ts" />
import axiosInstance from './axiosConfig';
import { IResumenFlota, IMonitoreoResponse } from '../types/monitoreo';
import { withErrorHandling } from './apiErrorHandler';

// Obtener resumen de monitoreo de la flota completa
// Función base para obtener resumen de flota (sin error handling)
const _obtenerResumenFlotaBase = async (): Promise<IResumenFlota> => {
  const response = await axiosInstance.get('/monitoreo/flota');
  return response.data;
};

// Función base para obtener monitoreo de aeronave (sin error handling)
const _obtenerMonitoreoAeronaveBase = async (matricula: string): Promise<IMonitoreoResponse<any>> => {
  const response = await axiosInstance.get(`/monitoreo/aeronave/${encodeURIComponent(matricula)}`);
  return response.data;
};

// Función base para obtener alertas de aeronave (sin error handling)
const _obtenerAlertasAeronaveBase = async (aeronaveId: string): Promise<IMonitoreoResponse<any>> => {
  const response = await axiosInstance.get(`/monitoreo/aeronave/${aeronaveId}/alertas`);
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
  const response = await axiosInstance.get('/monitoreo/estadisticas');
  return response.data;
};
