import axiosInstance from './axiosConfig';
import { IComponente } from '../types/mantenimiento';
import { IEstadoMonitoreoComponente } from '../types/estadosMonitoreoComponente';

export interface IComponenteBatchResponse {
  success: boolean;
  data: IComponente[];
  estadosMap: Record<string, IEstadoMonitoreoComponente[]>;
  total: number;
  estadosTotal: number;
  error?: string;
}

/**
 * Obtener componentes con sus estados de monitoreo en una consulta optimizada por aeronave
 * Usa la ruta batch del backend que reduce N+1 consultas a solo 2 queries
 */
export const obtenerComponentesConEstadosPorAeronave = async (aeronaveId: string): Promise<IComponenteBatchResponse> => {
  try {
    const response = await axiosInstance.get(`/mantenimiento/componentes/aeronave/id/${aeronaveId}/con-estados`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener componentes con estados por aeronave:', error);
    return {
      success: false,
      data: [],
      estadosMap: {},
      total: 0,
      estadosTotal: 0,
      error: error.response?.data?.message || 'Error al obtener componentes con estados'
    };
  }
};

/**
 * Obtener todos los componentes agrupados por aeronave con sus estados
 * Optimizado para reducir el número de consultas al backend
 */
export const obtenerTodosComponentesConEstadosBatch = async (): Promise<{
  success: boolean;
  data: Record<string, IComponente[]>;
  estadosMap: Record<string, IEstadoMonitoreoComponente[]>;
  aeronaves: string[];
  totalComponentes: number;
  totalEstados: number;
  error?: string;
}> => {
  try {
    // Primero obtener la lista de aeronaves con componentes
    const responseAeronaves = await axiosInstance.get('/inventario/aeronaves');
    
    if (!responseAeronaves.data.success) {
      throw new Error(responseAeronaves.data.error || 'Error al obtener aeronaves');
    }

    const aeronaves = responseAeronaves.data.data;
    const componentesPorAeronave: Record<string, IComponente[]> = {};
    const estadosMapGlobal: Record<string, IEstadoMonitoreoComponente[]> = {};
    let totalComponentes = 0;
    let totalEstados = 0;

    // Hacer consultas batch por cada aeronave (en lugar de por cada componente)
    const promesasAeronaves = aeronaves.map(async (aeronave: any) => {
      const batchResponse = await obtenerComponentesConEstadosPorAeronave(aeronave._id);
      
      if (batchResponse.success) {
        componentesPorAeronave[aeronave._id] = batchResponse.data;
        
        // Combinar estados en el mapa global
        Object.keys(batchResponse.estadosMap).forEach(componenteId => {
          estadosMapGlobal[componenteId] = batchResponse.estadosMap[componenteId];
        });

        totalComponentes += batchResponse.total;
        totalEstados += batchResponse.estadosTotal;
      }
    });

    // Ejecutar todas las consultas en paralelo
    await Promise.all(promesasAeronaves);

    return {
      success: true,
      data: componentesPorAeronave,
      estadosMap: estadosMapGlobal,
      aeronaves: aeronaves.map((a: any) => a._id),
      totalComponentes,
      totalEstados
    };

  } catch (error: any) {
    console.error('Error al obtener todos los componentes con estados batch:', error);
    return {
      success: false,
      data: {},
      estadosMap: {},
      aeronaves: [],
      totalComponentes: 0,
      totalEstados: 0,
      error: error.message || 'Error al obtener componentes con estados'
    };
  }
};