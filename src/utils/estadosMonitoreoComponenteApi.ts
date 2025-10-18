import axiosInstance from './axiosConfig';
import { 
  IEstadoMonitoreoComponente, 
  IFormEstadoMonitoreo, 
  IResumenEstadosAeronave,
  IFiltrosEstadosMonitoreo 
} from '../types/estadosMonitoreoComponente';

// Obtener todos los estados de monitoreo de un componente
export const obtenerEstadosMonitoreoComponente = async (
  componenteId: string,
  signal?: AbortSignal
) => {
  try {
    const response = await axiosInstance.get(`/estados-monitoreo-componente/componente/${componenteId}`, {
      signal
    });
    return {
      success: true,
      data: response.data.data as IEstadoMonitoreoComponente[]
    };
  } catch (error: any) {
    // No reportar errores de cancelación
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      console.log(`🚫 [API] Request cancelado para componente ${componenteId}`);
      return {
        success: false,
        error: 'Request cancelado',
        data: []
      };
    }
    console.error('Error al obtener estados de monitoreo del componente:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener estados de monitoreo',
      data: []
    };
  }
};

// ✅ NUEVO: Obtener todos los estados de monitoreo de todos los componentes de una aeronave (1 solo request)
export const obtenerEstadosMonitoreoPorAeronave = async (aeronaveId: string) => {
  try {
    const response = await axiosInstance.get(`/mantenimiento/componentes/aeronave/id/${aeronaveId}`);

    if (!response.data.success) {
      return {
        success: false,
        error: 'Error al obtener componentes',
        data: {}
      };
    }

    const componentes = response.data.data;

    // Obtener estados de monitoreo de TODOS los componentes en paralelo
    const estadosPromises = componentes.map((comp: any) =>
      axiosInstance.get(`/estados-monitoreo-componente/componente/${comp._id}`)
        .then(res => ({ componenteId: comp._id, estados: res.data.data }))
        .catch(() => ({ componenteId: comp._id, estados: [] }))
    );

    const resultados = await Promise.all(estadosPromises);

    // Crear mapa: componenteId -> estados
    const estadosPorComponente: Record<string, IEstadoMonitoreoComponente[]> = {};
    resultados.forEach(({ componenteId, estados }) => {
      estadosPorComponente[componenteId] = estados;
    });

    return {
      success: true,
      data: estadosPorComponente
    };
  } catch (error: any) {
    console.error('Error al obtener estados de monitoreo por aeronave:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener estados de monitoreo',
      data: {}
    };
  }
};

// ✅ OPTIMIZADO: Usar el nuevo endpoint backend que obtiene componentes + estados en 2 queries
export const obtenerComponentesConEstadosPorAeronave = async (aeronaveId: string) => {
  try {
    console.log(`🚀 [OPTIMIZADO] Usando endpoint /con-estados para aeronave ${aeronaveId}`);

    const response = await axiosInstance.get(
      `/mantenimiento/componentes/aeronave/id/${aeronaveId}/con-estados`
    );

    if (!response.data.success) {
      return {
        success: false,
        error: 'Error al obtener componentes con estados',
        data: {},
        componentes: []
      };
    }

    console.log(`✅ [OPTIMIZADO] Cargados ${response.data.total} componentes con ${response.data.estadosTotal} estados en 2 queries`);

    return {
      success: true,
      data: response.data.estadosMap, // Mapa de componenteId -> estados
      componentes: response.data.data // Array de componentes
    };
  } catch (error: any) {
    console.error('Error al obtener componentes con estados:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener componentes con estados',
      data: {},
      componentes: []
    };
  }
};

// Crear nuevo estado de monitoreo para un componente
export const crearEstadoMonitoreoComponente = async (
  componenteId: string,
  datos: IFormEstadoMonitoreo
) => {
  try {
    const response = await axiosInstance.post(
      `/estados-monitoreo-componente/componente/${componenteId}`,
      datos
    );
    return {
      success: true,
      data: response.data.data as IEstadoMonitoreoComponente,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Error al crear estado de monitoreo:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al crear estado de monitoreo',
      data: null
    };
  }
};

// Actualizar estado de monitoreo
export const actualizarEstadoMonitoreoComponente = async (
  estadoId: string,
  datos: Partial<IFormEstadoMonitoreo>
) => {
  try {
    const response = await axiosInstance.put(
      `/estados-monitoreo-componente/${estadoId}`,
      datos
    );
    return {
      success: true,
      data: response.data.data as IEstadoMonitoreoComponente,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Error al actualizar estado de monitoreo:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al actualizar estado de monitoreo',
      data: null
    };
  }
};

// Eliminar estado de monitoreo
export const eliminarEstadoMonitoreoComponente = async (estadoId: string) => {
  try {
    const response = await axiosInstance.delete(`/estados-monitoreo-componente/${estadoId}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Error al eliminar estado de monitoreo:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al eliminar estado de monitoreo'
    };
  }
};

// Obtener resumen de estados por aeronave
export const obtenerResumenEstadosAeronave = async (aeronaveId: string) => {
  try {
    const response = await axiosInstance.get(
      `/estados-monitoreo-componente/aeronave/${aeronaveId}/resumen`
    );
    return {
      success: true,
      data: response.data.data as IResumenEstadosAeronave
    };
  } catch (error: any) {
    console.error('Error al obtener resumen de estados de aeronave:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener resumen de estados',
      data: null
    };
  }
};

// Función auxiliar para formatear fechas
export const formatearFechaMonitoreo = (fecha: string): string => {
  const fechaObj = new Date(fecha);
  return fechaObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Función auxiliar para calcular días restantes
export const calcularDiasRestantes = (fechaProximaRevision: string, valorActual: number, valorLimite: number): number => {
  const ahora = new Date();
  const fechaRevision = new Date(fechaProximaRevision);
  
  // Si es basado en horas, calculamos basándose en el progreso
  const progreso = valorActual / valorLimite;
  if (progreso >= 1) return 0; // Ya vencido
  
  // Calcular días restantes basándose en la fecha
  const diferencia = fechaRevision.getTime() - ahora.getTime();
  const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diasRestantes);
};

// Función auxiliar para obtener el color del estado
export const obtenerColorEstado = (estado: 'OK' | 'PROXIMO' | 'VENCIDO' | 'OVERHAUL_REQUERIDO'): string => {
  switch (estado) {
    case 'OK':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'PROXIMO':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'VENCIDO':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'OVERHAUL_REQUERIDO':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Función auxiliar para obtener el color de la criticidad
export const obtenerColorCriticidad = (criticidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'): string => {
  switch (criticidad) {
    case 'BAJA':
      return 'text-green-600 bg-green-50';
    case 'MEDIA':
      return 'text-yellow-600 bg-yellow-50';
    case 'ALTA':
      return 'text-orange-600 bg-orange-50';
    case 'CRITICA':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Función para filtrar estados según los filtros aplicados
export const filtrarEstados = (
  estados: IEstadoMonitoreoComponente[], 
  filtros: IFiltrosEstadosMonitoreo
): IEstadoMonitoreoComponente[] => {
  return estados.filter(estado => {
    // Filtro por estado
    if (filtros.estado && filtros.estado !== 'TODOS' && estado.estado !== filtros.estado) {
      return false;
    }

    // Filtro por criticidad - TODO: Implementar cuando se agregue criticidad al modelo
    // if (filtros.criticidad && 
    //     filtros.criticidad !== 'TODAS' && 
    //     estado.configuracionPersonalizada?.criticidad !== filtros.criticidad) {
    //   return false;
    // }

    // Filtro por unidad
    if (filtros.unidad && filtros.unidad !== 'TODAS' && estado.unidad !== filtros.unidad) {
      return false;
    }

    // Filtro por alerta activa
    if (filtros.alertaActiva !== undefined && estado.alertaActiva !== filtros.alertaActiva) {
      return false;
    }

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const catalogoControl = typeof estado.catalogoControlId === 'object' 
        ? estado.catalogoControlId.descripcionCodigo 
        : '';
      const componente = typeof estado.componenteId === 'object'
        ? `${estado.componenteId.numeroSerie} ${estado.componenteId.nombre}`
        : '';
      
      if (!catalogoControl.toLowerCase().includes(busqueda) && 
          !componente.toLowerCase().includes(busqueda) &&
          !estado.observaciones?.toLowerCase().includes(busqueda)) {
        return false;
      }
    }

    return true;
  });
};

// Completar overhaul de un estado de monitoreo
export const completarOverhaulEstado = async (
  estadoId: string,
  observaciones?: string
) => {
  try {
    const response = await axiosInstance.post(
      `/estados-monitoreo-componente/${estadoId}/completar-overhaul`,
      { observaciones }
    );
    return {
      success: true,
      data: response.data.data as IEstadoMonitoreoComponente,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Error al completar overhaul:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al completar overhaul',
      data: null
    };
  }
};