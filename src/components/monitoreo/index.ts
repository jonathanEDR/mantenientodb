// Componentes de monitoreo - Exportaciones principales

// Componente para alertas individuales
export { 
  default as AlertaMonitoreo,
  AlertaCompacta,
  AlertaDetallada
} from './AlertaMonitoreo';

// Componente para estado de aeronave
export { 
  default as EstadoMonitoreoAeronave,
  EstadoMonitoreoCompacto,
  EstadoMonitoreoMedio,
  EstadoMonitoreoPreview
} from './EstadoMonitoreoAeronave';

// Re-exportar tipos necesarios para usar los componentes
export type {
  IAlertaMonitoreo,
  IResumenMonitoreoAeronave,
  EstadoAlerta,
  TipoAlerta
} from '../../types/monitoreo';