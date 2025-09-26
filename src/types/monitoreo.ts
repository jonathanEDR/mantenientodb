// Tipos e interfaces para el sistema de monitoreo en el frontend

export enum EstadoAlerta {
  OK = 'OK',
  PROXIMO = 'PROXIMO',
  VENCIDO = 'VENCIDO'
}

export enum TipoAlerta {
  PREVENTIVO = 'PREVENTIVO',
  CRITICO = 'CRITICO',
  INFORMATIVO = 'INFORMATIVO'
}

export enum NivelPrioridad {
  ALTA = 1,
  MEDIA = 2,
  BAJA = 3
}

// Interface para una alerta individual
export interface IAlertaMonitoreo {
  descripcionCodigo: string;
  horaInicial: number;
  horaFinal: number;
  horasActuales: number;
  estado: EstadoAlerta;
  tipoAlerta: TipoAlerta;
  horasRestantes?: number;
  horasVencidas?: number;
  porcentajeCompletado: number;
  fechaProximoVencimiento?: Date | string;
  prioridad: NivelPrioridad;
}

// Interface para el resumen de monitoreo de una aeronave
export interface IResumenMonitoreoAeronave {
  aeronaveId: string;
  matricula: string;
  horasVueloActuales: number;
  alertas: IAlertaMonitoreo[];
  totalAlertas: number;
  alertasCriticas: number;
  alertasProximas: number;
  alertasOk: number;
  ultimaActualizacion: Date | string;
}

// Interface para el resumen de toda la flota
export interface IResumenFlota {
  totalAeronaves: number;
  aeronavesConAlertas: number;
  totalAlertasCriticas: number;
  totalAlertasProximas: number;
  aeronaves: IResumenMonitoreoAeronave[];
  generadoEn: Date | string;
}

// Interface para la respuesta de la API
export interface IMonitoreoResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
}

// Interface para configuración de alertas
export interface IConfiguracionAlerta {
  porcentajeAlertaProxima: number;
  diasAnticipacion: number;
  horasMinimesTolerancia: number;
}

// Interface para estadísticas de monitoreo
export interface IEstadisticasMonitoreo {
  resumenGeneral: {
    totalAeronaves: number;
    aeronavesConAlertas: number;
    aeronavesOperativas: number;
    porcentajeOperatividad: number;
  };
  alertas: {
    totalCriticas: number;
    totalProximas: number;
    distribucionPorAeronave: {
      matricula: string;
      criticas: number;
      proximas: number;
      ok: number;
    }[];
  };
  generadoEn: Date;
}

// Interface para filtros de monitoreo
export interface IFiltrosMonitoreo {
  estados?: EstadoAlerta[];
  tiposAlerta?: TipoAlerta[];
  aeronaveIds?: string[];
  soloAeronavesConAlertas?: boolean;
}

// Interface props para componentes
export interface IIndicadorAlertasProps {
  aeronaveId: string;
  resumen?: IResumenMonitoreoAeronave;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

export interface IDetallesMonitoreoProps {
  aeronaveId: string;
  isOpen: boolean;
  onClose: () => void;
  resumen?: IResumenMonitoreoAeronave;
}

// Tipos para colores y estilos
export interface IColorAlerta {
  bg: string;
  text: string;
  border: string;
  icon: string;
}

export interface IColoresAlertas {
  [EstadoAlerta.OK]: IColorAlerta;
  [EstadoAlerta.PROXIMO]: IColorAlerta;
  [EstadoAlerta.VENCIDO]: IColorAlerta;
}

// Tipos para opciones de configuración
export interface IOpcionesMonitoreo {
  autoRefresh?: boolean;
  intervalRefresh?: number; // en segundos
  mostrarSoloAlertas?: boolean;
  configuracion?: Partial<IConfiguracionAlerta>;
}

// Tipos para hooks
export interface IUseMonitoreoReturn {
  resumen: IResumenMonitoreoAeronave | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export interface IUseMonitoreoFlotaReturn {
  resumenFlota: IResumenFlota | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export interface IUseEstadisticasMonitoreoReturn {
  estadisticas: IEstadisticasMonitoreo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

// Constantes
export const COLORES_ALERTAS: IColoresAlertas = {
  [EstadoAlerta.OK]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-500'
  },
  [EstadoAlerta.PROXIMO]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: 'text-yellow-500'
  },
  [EstadoAlerta.VENCIDO]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: 'text-red-500'
  }
};

export const ICONOS_TIPO_ALERTA = {
  [TipoAlerta.CRITICO]: '🚨',
  [TipoAlerta.PREVENTIVO]: '⚠️',
  [TipoAlerta.INFORMATIVO]: 'ℹ️'
};

export const LABELS_ESTADO = {
  [EstadoAlerta.OK]: 'OK',
  [EstadoAlerta.PROXIMO]: 'Próximo',
  [EstadoAlerta.VENCIDO]: 'Vencido'
};

export const LABELS_TIPO_ALERTA = {
  [TipoAlerta.CRITICO]: 'Crítico',
  [TipoAlerta.PREVENTIVO]: 'Preventivo',
  [TipoAlerta.INFORMATIVO]: 'Informativo'
};

// Configuración por defecto
export const CONFIG_MONITOREO_DEFECTO: IConfiguracionAlerta = {
  porcentajeAlertaProxima: 10,
  diasAnticipacion: 30,
  horasMinimesTolerancia: 5
};

export const OPCIONES_MONITOREO_DEFECTO: IOpcionesMonitoreo = {
  autoRefresh: false,
  intervalRefresh: 300, // 5 minutos
  mostrarSoloAlertas: false,
  configuracion: CONFIG_MONITOREO_DEFECTO
};