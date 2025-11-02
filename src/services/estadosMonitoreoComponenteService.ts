import axios from '../utils/axiosConfig';
import { IEstadoMonitoreoComponente, IObservacionHistorial } from '../types/estadosMonitoreoComponente';

interface HistorialObservacionesResponse {
  success: boolean;
  data: {
    componente: any;
    historial: IObservacionHistorial[];
    total: number;
  };
  message: string;
}

interface ActualizarEstadoData {
  valorActual?: number;
  valorLimite?: number;
  unidad?: string;
  fechaProximaRevision?: string;
  observaciones?: string;
  configuracionPersonalizada?: any;
  configuracionOverhaul?: any;
}

export const estadosMonitoreoComponenteService = {
  
  // Obtener historial de observaciones
  async obtenerHistorialObservaciones(
    estadoId: string,
    opciones?: {
      limite?: number;
      tipo?: 'observacion' | 'cambio_estado' | 'overhaul' | 'mantenimiento';
    }
  ): Promise<HistorialObservacionesResponse> {
    const params = new URLSearchParams();
    
    if (opciones?.limite) {
      params.append('limite', opciones.limite.toString());
    }
    
    if (opciones?.tipo) {
      params.append('tipo', opciones.tipo);
    }

    const response = await axios.get(
      `/estados-monitoreo-componente/${estadoId}/historial-observaciones?${params.toString()}`
    );
    return response.data;
  },

  // Actualizar estado con nueva observación
  async actualizarEstadoConObservacion(
    estadoId: string,
    datos: ActualizarEstadoData
  ): Promise<{ success: boolean; data: IEstadoMonitoreoComponente; message: string }> {
    const response = await axios.put(`/estados-monitoreo-componente/${estadoId}`, datos);
    return response.data;
  },

  // Agregar solo una observación (sin cambiar otros campos)
  async agregarObservacion(
    estadoId: string,
    observacion: string
  ): Promise<{ success: boolean; data: IEstadoMonitoreoComponente; message: string }> {
    const response = await axios.put(`/estados-monitoreo-componente/${estadoId}`, {
      observaciones: observacion
    });
    return response.data;
  },

  // Obtener estado completo con historial
  async obtenerEstadoCompleto(estadoId: string): Promise<{ 
    success: boolean; 
    data: IEstadoMonitoreoComponente; 
    message: string 
  }> {
    const response = await axios.get(`/estados-monitoreo-componente/${estadoId}`);
    return response.data;
  }

};