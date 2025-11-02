import axiosInstance from '../utils/axiosConfig';

export interface IHistorialHorasVuelo {
  fecha: Date;
  horasAnteriores: number;
  horasNuevas: number;
  incremento: number;
  usuario: string;
  usuarioNombre?: string;
  usuarioInfo?: {
    name: string;
    email: string;
  };
  observacion?: string;
  motivo: 'VUELO' | 'MANTENIMIENTO' | 'CORRECCION' | 'INSPECCION' | 'OVERHAUL' | 'OTROS';
}

export interface IAeronaveResumen {
  _id: string;
  matricula: string;
  modelo: string;
  tipo: 'HELICOPTERO' | 'AVION';
  horasActuales: number;
}

export interface IEstadisticasHistorial {
  totalRegistros: number;
  totalHorasAcumuladas: number;
  promedioIncrementoPorVuelo: number;
  ultimoIncremento: number;
}

export interface IHistorialHorasVueloResponse {
  success: boolean;
  data: {
    aeronave: IAeronaveResumen;
    historial: IHistorialHorasVuelo[];
    estadisticas: IEstadisticasHistorial;
  };
  message: string;
}

export interface IFiltrosHistorialHoras {
  limite?: number;
  motivo?: 'VUELO' | 'MANTENIMIENTO' | 'CORRECCION' | 'INSPECCION' | 'OVERHAUL' | 'OTROS';
}

class HistorialHorasVueloService {
  /**
   * Obtiene el historial de horas de vuelo de una aeronave específica
   */
  async obtenerHistorialHorasVuelo(
    aeronaveId: string, 
    filtros: IFiltrosHistorialHoras = {}
  ): Promise<IHistorialHorasVueloResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filtros.limite) {
        params.append('limite', filtros.limite.toString());
      }
      
      if (filtros.motivo) {
        params.append('motivo', filtros.motivo);
      }

      const response = await axiosInstance.get(
        `/inventario/${aeronaveId}/historial-horas-vuelo?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener historial de horas de vuelo:', error);
      
      // Manejo de errores específicos
      if (error.response?.status === 404) {
        throw new Error('Aeronave no encontrada');
      } else if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver el historial de horas de vuelo');
      } else if (error.response?.status === 500) {
        throw new Error('Error interno del servidor al obtener el historial');
      }
      
      throw new Error(error.response?.data?.message || 'Error al obtener el historial de horas de vuelo');
    }
  }

  /**
   * Formatea el motivo para mostrar en la interfaz
   */
  formatearMotivo(motivo: string): string {
    const motivosMap: Record<string, string> = {
      'VUELO': 'Vuelo',
      'MANTENIMIENTO': 'Mantenimiento',
      'CORRECCION': 'Corrección',
      'INSPECCION': 'Inspección',
      'OVERHAUL': 'Overhaul',
      'OTROS': 'Otros'
    };
    
    return motivosMap[motivo] || motivo;
  }

  /**
   * Obtiene el color de la etiqueta según el motivo
   */
  obtenerColorMotivo(motivo: string): string {
    const coloresMap: Record<string, string> = {
      'VUELO': 'bg-blue-100 text-blue-800',
      'MANTENIMIENTO': 'bg-yellow-100 text-yellow-800',
      'CORRECCION': 'bg-red-100 text-red-800',
      'INSPECCION': 'bg-green-100 text-green-800',
      'OVERHAUL': 'bg-purple-100 text-purple-800',
      'OTROS': 'bg-gray-100 text-gray-800'
    };
    
    return coloresMap[motivo] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Formatea las horas para mostrar con decimales
   */
  formatearHoras(horas: number): string {
    return horas.toFixed(1);
  }

  /**
   * Formatea el incremento de horas con signo
   */
  formatearIncremento(incremento: number): string {
    const signo = incremento > 0 ? '+' : '';
    return `${signo}${incremento.toFixed(1)}`;
  }

  /**
   * Determina si el incremento es positivo, negativo o neutro
   */
  obtenerTipoIncremento(incremento: number): 'positivo' | 'negativo' | 'neutro' {
    if (incremento > 0) return 'positivo';
    if (incremento < 0) return 'negativo';
    return 'neutro';
  }

  /**
   * Obtiene el color del incremento según su valor
   */
  obtenerColorIncremento(incremento: number): string {
    const tipo = this.obtenerTipoIncremento(incremento);
    
    switch (tipo) {
      case 'positivo':
        return 'text-green-600 bg-green-50';
      case 'negativo':
        return 'text-red-600 bg-red-50';
      case 'neutro':
        return 'text-gray-600 bg-gray-50';
    }
  }

  /**
   * Formatea la fecha para mostrar en la interfaz
   */
  formatearFecha(fecha: string | Date): string {
    const fechaObj = new Date(fecha);
    
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima'
    }).format(fechaObj);
  }

  /**
   * Calcula la diferencia en días desde una fecha
   */
  calcularDiasDesde(fecha: string | Date): number {
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Formatea el tiempo transcurrido desde una fecha
   */
  formatearTiempoTranscurrido(fecha: string | Date): string {
    const dias = this.calcularDiasDesde(fecha);
    
    if (dias === 0) {
      return 'Hoy';
    } else if (dias === 1) {
      return 'Ayer';
    } else if (dias < 7) {
      return `Hace ${dias} días`;
    } else if (dias < 30) {
      const semanas = Math.floor(dias / 7);
      return `Hace ${semanas} semana${semanas > 1 ? 's' : ''}`;
    } else if (dias < 365) {
      const meses = Math.floor(dias / 30);
      return `Hace ${meses} mes${meses > 1 ? 'es' : ''}`;
    } else {
      const años = Math.floor(dias / 365);
      return `Hace ${años} año${años > 1 ? 's' : ''}`;
    }
  }
}

export const historialHorasVueloService = new HistorialHorasVueloService();