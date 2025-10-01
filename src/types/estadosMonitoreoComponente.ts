// Tipos para estados de monitoreo por componente

export interface IEstadoMonitoreoComponente {
  _id: string;
  componenteId: string | IComponenteBasico;
  catalogoControlId: string | ICatalogoControlMonitoreo;
  valorActual: number;
  valorLimite: number;
  unidad: 'HORAS' | 'CICLOS' | 'DIAS' | 'MESES' | 'ANOS';
  estado: 'OK' | 'PROXIMO' | 'VENCIDO' | 'OVERHAUL_REQUERIDO';
  fechaProximaRevision: string;
  fechaUltimaActualizacion: string;
  alertaActiva: boolean;
  observaciones?: string;
  // Campos para unificación de sistemas
  basadoEnAeronave: boolean;
  offsetInicial: number;
  // Configuración de Overhauls
  configuracionOverhaul?: IConfiguracionOverhaul;
  configuracionPersonalizada?: IConfiguracionPersonalizada;
  createdAt?: string;
  updatedAt?: string;
}

export interface IConfiguracionPersonalizada {
  alertaAnticipada: number; // Horas antes del vencimiento para alertar
  criticidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  requiereParoAeronave: boolean;
}

export interface IConfiguracionOverhaul {
  habilitarOverhaul: boolean;
  intervaloOverhaul: number; // Horas entre overhauls
  ciclosOverhaul: number; // Número máximo de overhauls permitidos
  cicloActual: number; // Ciclo actual (0 = primer uso, 1 = primer overhaul, etc.)
  horasUltimoOverhaul: number; // Horas cuando se hizo el último overhaul
  proximoOverhaulEn: number; // Horas cuando debe hacerse el próximo overhaul
  requiereOverhaul: boolean; // Si actualmente requiere overhaul
  fechaUltimoOverhaul?: string; // Cuando se completó el último overhaul
  observacionesOverhaul?: string;
}

export interface IComponenteBasico {
  _id: string;
  numeroSerie: string;
  nombre: string;
  categoria: string;
}

export interface ICatalogoControlMonitoreo {
  _id: string;
  descripcionCodigo: string;
  horaInicial: number;
  horaFinal: number;
  estado: 'ACTIVO' | 'INACTIVO';
}

// Tipos para las respuestas de la API
export interface IResumenEstadosAeronave {
  totalEstados: number;
  estadosOK: number;
  estadosProximos: number;
  estadosVencidos: number;
  estadosPorComponente: IEstadosPorComponente[];
}

export interface IEstadosPorComponente {
  componente: IComponenteBasico;
  estados: IEstadoMonitoreoComponente[];
  resumen: {
    total: number;
    ok: number;
    proximos: number;
    vencidos: number;
  };
}

// Tipos para formularios
export interface IFormEstadoMonitoreo {
  catalogoControlId: string;
  valorActual: number;
  valorLimite: number;
  unidad: 'HORAS' | 'CICLOS' | 'DIAS' | 'MESES' | 'ANOS';
  observaciones?: string;
  basadoEnAeronave?: boolean;
  offsetInicial?: number;
  configuracionOverhaul?: IConfiguracionOverhaul;
  configuracionPersonalizada?: IConfiguracionPersonalizada;
}

// Tipos para filtros y búsquedas
export interface IFiltrosEstadosMonitoreo {
  estado?: 'OK' | 'PROXIMO' | 'VENCIDO' | 'TODOS';
  criticidad?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' | 'TODAS';
  unidad?: 'HORAS' | 'CICLOS' | 'DIAS' | 'MESES' | 'ANOS' | 'TODAS';
  alertaActiva?: boolean;
  busqueda?: string;
}

// Tipos para estadísticas
export interface IEstadisticasMonitoreoComponente {
  totalComponentesMonitoreados: number;
  componentesConAlertas: number;
  componentesOK: number;
  componentesProximos: number;
  componentesVencidos: number;
  distribuccionPorCategoria: {
    categoria: string;
    total: number;
    conAlertas: number;
  }[];
  proximosVencimientos: {
    componenteId: string;
    numeroSerie: string;
    nombre: string;
    categoria: string;
    diasRestantes: number;
    criticidad: string;
  }[];
}

// Constantes útiles
export const UNIDADES_MONITOREO = [
  { value: 'HORAS', label: 'Horas' },
  { value: 'CICLOS', label: 'Ciclos' },
  { value: 'DIAS', label: 'Días' },
  { value: 'MESES', label: 'Meses' },
  { value: 'ANOS', label: 'Años' }
] as const;

export const CRITICIDADES = [
  { value: 'BAJA', label: 'Baja', color: 'text-green-600 bg-green-50' },
  { value: 'MEDIA', label: 'Media', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'ALTA', label: 'Alta', color: 'text-orange-600 bg-orange-50' },
  { value: 'CRITICA', label: 'Crítica', color: 'text-red-600 bg-red-50' }
] as const;

export const ESTADOS_MONITOREO = [
  { value: 'OK', label: 'Al día', color: 'text-green-600 bg-green-50' },
  { value: 'PROXIMO', label: 'Próximo', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'VENCIDO', label: 'Vencido', color: 'text-red-600 bg-red-50' },
  { value: 'OVERHAUL_REQUERIDO', label: 'Overhaul Requerido', color: 'text-purple-600 bg-purple-50' }
] as const;