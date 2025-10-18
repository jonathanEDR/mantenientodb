/**
 * ===== SERVICIO OPTIMIZADO PARA EXPORTACIÓN PDF =====
 * 
 * Carga estados de monitoreo de múltiples componentes en UNA SOLA consulta
 * Evita el problema N+1 queries
 */

import axiosInstance from '../utils/axiosConfig';

export interface ComponenteConEstados {
  _id: string;
  numeroSerie: string;
  numeroParte: string;
  nombre: string;
  categoria?: string;
  categoriaId?: {
    nombre: string;
  };
  estado: string;
  vidaUtil: any;
  estadosMonitoreo: any[];
}

/**
 * Carga estados de monitoreo para múltiples componentes en UNA sola petición
 * @param componenteIds - Array de IDs de componentes
 * @returns Componentes con sus estados de monitoreo
 */
export const cargarEstadosMultiples = async (componenteIds: string[]): Promise<Map<string, any[]>> => {
  if (componenteIds.length === 0) {
    return new Map();
  }

  try {
    console.log(`📦 [BATCH SERVICE] Cargando estados para ${componenteIds.length} componentes en batch`, componenteIds);
    
    // ✅ UNA SOLA petición para todos los componentes usando endpoint batch
    // NOTA: axiosInstance ya incluye /api en baseURL, no duplicar
    const response = await axiosInstance.post('/estados-monitoreo-componente/batch', {
      componenteIds
    });

    console.log(`📦 [BATCH SERVICE] Respuesta del backend:`, response.data);

    if (response.data.success) {
      // Backend retorna estadosPorComponente como objeto { [componenteId]: EstadoMonitoreo[] }
      const estadosPorComponenteObj = response.data.data || {};
      const estadosPorComponente = new Map<string, any[]>();
      
      // Convertir objeto a Map
      Object.entries(estadosPorComponenteObj).forEach(([componenteId, estados]) => {
        estadosPorComponente.set(componenteId, estados as any[]);
      });

      return estadosPorComponente;
    }

    return new Map();
  } catch (error: any) {
    console.error('Error al cargar estados en batch:', error);
    // Si falla el batch, devolver mapa vacío y dejar que se carguen individualmente como fallback
    return new Map();
  }
};

/**
 * Combina componentes con sus estados de monitoreo de forma optimizada
 * @param componentes - Array de componentes
 * @returns Componentes con estados de monitoreo incluidos
 */
export const combinarComponentesConEstados = async (componentes: any[]): Promise<ComponenteConEstados[]> => {
  const componenteIds = componentes.map(c => c._id);
  
  // Cargar todos los estados en una sola petición
  const estadosPorComponente = await cargarEstadosMultiples(componenteIds);
  
  // Combinar componentes con sus estados
  return componentes.map(componente => ({
    ...componente,
    estadosMonitoreo: estadosPorComponente.get(componente._id) || []
  }));
};
