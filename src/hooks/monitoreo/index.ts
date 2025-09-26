// Hooks de monitoreo - Exportaciones principales

// Hook principal para monitoreo de aeronave individual
export { 
  default as useMonitoreo,
  useResumenMonitoreo,
  useAlertasCriticas,
  useEstadoSalud
} from './useMonitoreo';

// Hook principal para monitoreo de flota
export { 
  default as useMonitoreoFlota,
  useEstadisticasFlota,
  useAeronavesConProblemas,
  useMonitoreoFlotaEnTiempoReal
} from './useMonitoreoFlota';

// Re-exportar tipos necesarios para usar los hooks
export type {
  IAlertaMonitoreo,
  IResumenMonitoreoAeronave,
  IResumenFlota,
  EstadoAlerta,
  TipoAlerta,
  NivelPrioridad
} from '../../types/monitoreo';