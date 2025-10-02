/// <reference types="vite/client" />
/// <reference path="../types/clerk.d.ts" />
import axiosInstance from './axiosConfig';
import {
  IAeronavesResponse,
  IAeronaveResponse,
  IEstadisticasInventarioResponse,
  ICrearAeronaveData,
  IActualizarAeronaveData,
  IActualizacionHorasResponse,
  IGestionHorasData,
  IProximoMantenimiento,
  EstadoAeronave
} from '../types/inventario';

// Obtener todas las aeronaves con paginación y filtros
export const obtenerAeronaves = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: string;
  estado?: string;
}): Promise<IAeronavesResponse> => {
  const response = await axiosInstance.get('/inventario', { params });
  return response.data;
};

// Obtener estadísticas de inventario
export const obtenerEstadisticasInventario = async (): Promise<IEstadisticasInventarioResponse> => {
  const response = await axiosInstance.get('/inventario/stats');
  return response.data;
};

// Obtener una aeronave por ID
export const obtenerAeronave = async (id: string): Promise<IAeronaveResponse> => {
  const response = await axiosInstance.get(`/inventario/${id}`);
  return response.data;
};

// Crear nueva aeronave
export const crearAeronave = async (data: ICrearAeronaveData): Promise<IAeronaveResponse> => {
  const response = await axiosInstance.post('/inventario', data);
  return response.data;
};

// Actualizar aeronave
export const actualizarAeronave = async (id: string, data: Partial<ICrearAeronaveData>): Promise<IAeronaveResponse> => {
  const response = await axiosInstance.put(`/inventario/${id}`, data);
  return response.data;
};

// Eliminar aeronave
export const eliminarAeronave = async (id: string): Promise<IAeronaveResponse> => {
  const response = await axiosInstance.delete(`/inventario/${id}`);
  return response.data;
};

// ===== GESTIÓN DE HORAS CON PROPAGACIÓN =====

// Actualizar horas de aeronave con propagación automática a componentes
export const actualizarHorasConPropagacion = async (
  aeronaveId: string,
  data: {
    horasVuelo: number;
    propagarAComponentes?: boolean;
    motivo?: string;
    observaciones?: string;
  }
): Promise<IActualizacionHorasResponse> => {
  const response = await axiosInstance.put(
    `/inventario/${aeronaveId}/horas-con-propagacion`,
    data
  );
  return response.data;
};

// Actualizar estado de aeronave
export const actualizarEstadoAeronave = async (
  aeronaveId: string,
  estado: EstadoAeronave
): Promise<IAeronaveResponse> => {
  const response = await axiosInstance.put(
    `/inventario/${aeronaveId}/estado`,
    { estado }
  );
  return response.data;
};

// Actualizar observaciones de aeronave (reemplaza, no acumula)
export const actualizarObservacionesAeronave = async (
  aeronaveId: string,
  observaciones: string
): Promise<IAeronaveResponse> => {
  const response = await axiosInstance.put(
    `/inventario/${aeronaveId}/observaciones`,
    { observaciones }
  );
  return response.data;
};

// Gestión completa de aeronave (horas, estado, observaciones)
export const gestionarAeronave = async (
  aeronaveId: string,
  data: IGestionHorasData
): Promise<IActualizacionHorasResponse> => {
  const response = await axiosInstance.put(
    `/inventario/${aeronaveId}/gestion-completa`,
    data
  );
  return response.data;
};

// Obtener próximo mantenimiento basado en horas
export const obtenerProximoMantenimiento = async (
  aeronaveId: string
): Promise<{ success: boolean; data: IProximoMantenimiento }> => {
  const response = await axiosInstance.get(
    `/inventario/${aeronaveId}/proximo-mantenimiento`
  );
  return response.data;
};
