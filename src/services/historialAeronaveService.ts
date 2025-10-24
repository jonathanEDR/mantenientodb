import axios from '../utils/axiosConfig';

export interface IObservacionAeronaveHistorial {
  fecha: string;
  texto: string;
  usuario: string;
  tipo: 'observacion' | 'cambio_estado' | 'horas_actualizadas' | 'mantenimiento';
}

interface HistorialObservacionesAeronaveResponse {
  success: boolean;
  data: {
    aeronave: {
      _id: string;
      matricula: string;
      modelo: string;
      tipo: string;
    };
    historial: IObservacionAeronaveHistorial[];
    total: number;
  };
  message: string;
}

export const historialAeronaveService = {
  
  // Obtener historial de observaciones de una aeronave
  async obtenerHistorialObservaciones(
    aeronaveId: string,
    opciones?: {
      limite?: number;
      tipo?: 'observacion' | 'cambio_estado' | 'horas_actualizadas' | 'mantenimiento';
    }
  ): Promise<HistorialObservacionesAeronaveResponse> {
    const params = new URLSearchParams();
    
    if (opciones?.limite) {
      params.append('limite', opciones.limite.toString());
    }
    
    if (opciones?.tipo) {
      params.append('tipo', opciones.tipo);
    }

    const response = await axios.get(
      `/inventario/${aeronaveId}/historial-observaciones?${params.toString()}`
    );
    return response.data;
  },

  // Agregar una observación al historial de una aeronave
  async agregarObservacion(
    aeronaveId: string,
    observacion: string,
    tipo: 'observacion' | 'cambio_estado' | 'horas_actualizadas' | 'mantenimiento' = 'observacion'
  ): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(`/inventario/${aeronaveId}/observaciones`, {
      observacion,
      tipo
    });
    return response.data;
  }

};