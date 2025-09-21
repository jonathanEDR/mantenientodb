/// <reference types="vite/client" />
/// <reference path="../types/clerk.d.ts" />
import axiosInstance from './axiosConfig';
import {
  IComponentesResponse,
  IComponenteResponse,
  IEstadisticasComponentesResponse,
  IOrdenesTrabajoResponse,
  IOrdenTrabajoResponse,
  IEstadisticasOrdenesResponse,
  IResumenDashboardResponse,
  IAlertasResponse,
  ICrearComponenteData,
  ICrearOrdenTrabajoData
} from '../types/mantenimiento';

// ========== APIs de Componentes ==========

// Obtener todos los componentes
export const obtenerComponentes = async (filtros?: {
  categoria?: string;
  estado?: string;
  aeronave?: string;
  search?: string;
}): Promise<IComponentesResponse> => {
  const params = new URLSearchParams();
  
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await axiosInstance.get(`/api/mantenimiento/componentes?${params}`);
  return response.data;
};

// Obtener estadísticas de componentes
export const obtenerEstadisticasComponentes = async (): Promise<IEstadisticasComponentesResponse> => {
  const response = await axiosInstance.get(`/api/mantenimiento/componentes/stats`);
  return response.data;
};

// Obtener componentes con alertas
export const obtenerComponentesConAlertas = async (): Promise<IComponentesResponse> => {
  const response = await axiosInstance.get(`/api/mantenimiento/componentes/alertas`);
  return response.data;
};

// Obtener componentes por aeronave
export const obtenerComponentesPorAeronave = async (matricula: string): Promise<IComponentesResponse> => {
  const response = await axiosInstance.get(`/api/mantenimiento/componentes/aeronave/${matricula}`);
  return response.data;
};

// Obtener un componente específico
export const obtenerComponente = async (id: string): Promise<IComponenteResponse> => {
  const response = await axiosInstance.get(`/api/mantenimiento/componentes/${id}`);
  return response.data;
};

// Crear nuevo componente
export const crearComponente = async (data: ICrearComponenteData): Promise<IComponenteResponse> => {
  const response = await axiosInstance.post(`/api/mantenimiento/componentes`, data);
  return response.data;
};

// Actualizar componente
export const actualizarComponente = async (id: string, data: Partial<ICrearComponenteData>): Promise<IComponenteResponse> => {
  const response = await axiosInstance.put(`/api/mantenimiento/componentes/${id}`, data);
  return response.data;
};

// Actualizar componente desde historial (con registros adicionales)
export const actualizarComponenteHistorial = async (id: string, data: any): Promise<IComponenteResponse> => {
  const response = await axiosInstance.put(`/api/mantenimiento/componentes/${id}/historial`, data);
  return response.data;
};

// Instalar componente en aeronave
export const instalarComponente = async (
  id: string, 
  data: { aeronaveId: string; ubicacion: string; fechaInstalacion: Date }
): Promise<IComponenteResponse> => {
  const response = await axiosInstance.put(`/api/mantenimiento/componentes/${id}/instalar`, data);
  return response.data;
};

// Remover componente de aeronave
export const removerComponente = async (
  id: string, 
  data: { fechaRemocion: Date; motivo: string }
): Promise<IComponenteResponse> => {
  const response = await axiosInstance.put(`/api/mantenimiento/componentes/${id}/remover`, data);
  return response.data;
};

// Eliminar componente
export const eliminarComponente = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/mantenimiento/componentes/${id}`);
};

// ========== APIs de Órdenes de Trabajo ==========

// Obtener todas las órdenes de trabajo
export const obtenerOrdenesTrabajo = async (filtros?: {
  estado?: string;
  prioridad?: string;
  tipo?: string;
  tecnico?: string;
  aeronave?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
}): Promise<IOrdenesTrabajoResponse> => {
  const params = new URLSearchParams();
  
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await axiosInstance.get(`/api/mantenimiento/ordenes?${params}`);
  return response.data;
};

// Obtener estadísticas de órdenes
export const obtenerEstadisticasOrdenes = async (): Promise<IEstadisticasOrdenesResponse> => {
  const response = await axiosInstance.get(`/api/mantenimiento/ordenes/stats`);
  return response.data;
};

// Obtener órdenes próximas a vencer
export const obtenerOrdenesVencimientos = async (dias?: number): Promise<IOrdenesTrabajoResponse> => {
  const params = dias ? `?dias=${dias}` : '';
  const response = await axiosInstance.get(`/api/mantenimiento/ordenes/vencimientos${params}`);
  return response.data;
};

// Obtener órdenes de un técnico
export const obtenerOrdenesPorTecnico = async (
  tecnicoId: string, 
  filtros?: { estado?: string; fechaDesde?: string; fechaHasta?: string }
): Promise<IOrdenesTrabajoResponse> => {
  const params = new URLSearchParams();
  
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  
  const queryString = params.toString() ? `?${params}` : '';
  const response = await axiosInstance.get(`/api/mantenimiento/ordenes/tecnico/${tecnicoId}${queryString}`);
  return response.data;
};

// Obtener una orden específica
export const obtenerOrdenTrabajo = async (id: string): Promise<IOrdenTrabajoResponse> => {
  const response = await axiosInstance.get(`/api/mantenimiento/ordenes/${id}`);
  return response.data;
};

// Crear nueva orden de trabajo
export const crearOrdenTrabajo = async (data: ICrearOrdenTrabajoData): Promise<IOrdenTrabajoResponse> => {
  const response = await axiosInstance.post(`/api/mantenimiento/ordenes`, data);
  return response.data;
};

// Actualizar orden de trabajo
export const actualizarOrdenTrabajo = async (id: string, data: Partial<ICrearOrdenTrabajoData>): Promise<IOrdenTrabajoResponse> => {
  const response = await axiosInstance.put(`/api/mantenimiento/ordenes/${id}`, data);
  return response.data;
};

// Cambiar estado de orden
export const cambiarEstadoOrden = async (
  id: string, 
  data: { estado: string; observaciones?: string }
): Promise<IOrdenTrabajoResponse> => {
  const response = await axiosInstance.put(`/api/mantenimiento/ordenes/${id}/estado`, data);
  return response.data;
};

// Registrar trabajo realizado
export const registrarTrabajo = async (
  id: string, 
  data: {
    descripcion: string;
    horasLaboradas: number;
    materiales?: Array<{ nombre: string; cantidad: number; costo: number }>;
    observaciones?: string;
  }
): Promise<IOrdenTrabajoResponse> => {
  const response = await axiosInstance.post(`/api/mantenimiento/ordenes/${id}/trabajo`, data);
  return response.data;
};

// Eliminar orden de trabajo
export const eliminarOrdenTrabajo = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/mantenimiento/ordenes/${id}`);
};

// ========== APIs de Dashboard ==========

// Obtener resumen del dashboard
export const obtenerResumenDashboard = async (): Promise<IResumenDashboardResponse> => {
  const response = await axiosInstance.get(`/api/mantenimiento/dashboard/resumen`);
  return response.data;
};

// Obtener alertas activas
export const obtenerAlertas = async (): Promise<IAlertasResponse> => {
  const response = await axiosInstance.get(`/api/mantenimiento/dashboard/alertas`);
  return response.data;
};