import { IAeronave } from './inventario';

// Tipos para el módulo de mantenimiento

// Enums
export enum ComponenteCategoria {
  FUSELAJE = 'FUSELAJE',
  MOTOR_PRINCIPAL = 'MOTOR_PRINCIPAL',
  TRANSMISION_PRINCIPAL = 'TRANSMISION_PRINCIPAL',
  CUBO_ROTOR_PRINCIPAL = 'CUBO_ROTOR_PRINCIPAL',
  PALAS_ROTOR_PRINCIPAL = 'PALAS_ROTOR_PRINCIPAL',
  PLATO_CICLICO = 'PLATO_CICLICO',
  CAJA_30_GRADOS = 'CAJA_30_GRADOS',
  CUBO_ROTOR_COLA = 'CUBO_ROTOR_COLA',
  PALAS_ROTOR_COLA = 'PALAS_ROTOR_COLA',
  STARTER_GENERADOR = 'STARTER_GENERADOR',
  BATERIAS = 'BATERIAS',
  SISTEMA_HIDRAULICO = 'SISTEMA_HIDRAULICO',
  TREN_ATERRIZAJE = 'TREN_ATERRIZAJE',
  SISTEMA_ELECTRICO = 'SISTEMA_ELECTRICO',
  INSTRUMENTACION = 'INSTRUMENTACION',
  CONTROLES_VUELO = 'CONTROLES_VUELO',
  OTROS = 'OTROS'
}

export enum EstadoComponente {
  INSTALADO = 'INSTALADO',
  EN_ALMACEN = 'EN_ALMACEN',
  EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
  EN_REPARACION = 'EN_REPARACION',
  CONDENADO = 'CONDENADO',
  EN_OVERHAUL = 'EN_OVERHAUL',
  PENDIENTE_INSPECCION = 'PENDIENTE_INSPECCION'
}

export enum TipoMantenimiento {
  PREVENTIVO = 'PREVENTIVO',
  CORRECTIVO = 'CORRECTIVO',
  INSPECCION = 'INSPECCION',
  OVERHAUL = 'OVERHAUL',
  REPARACION = 'REPARACION',
  MODIFICACION = 'MODIFICACION',
  DIRECTIVA_AD = 'DIRECTIVA_AD',
  BOLETIN_SERVICIO = 'BOLETIN_SERVICIO'
}

export enum PrioridadOrden {
  CRITICA = 'CRITICA',
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAJA = 'BAJA'
}

export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  ESPERANDO_REPUESTOS = 'ESPERANDO_REPUESTOS',
  ESPERANDO_APROBACION = 'ESPERANDO_APROBACION',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  SUSPENDIDA = 'SUSPENDIDA'
}

// Interfaces para Componentes
export interface IVidaUtil {
  limite: number;
  unidad: 'HORAS' | 'CICLOS' | 'CALENDARIO_MESES' | 'CALENDARIO_ANOS';
  acumulado: number;
  restante?: number;
}

export interface IHistorialUso {
  fechaInstalacion?: string;
  fechaRemocion?: string;
  aeronaveId?: string;
  horasIniciales: number;
  horasFinales?: number;
  motivoRemocion?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMantenimientoProgramado {
  tipo: string;
  proximoVencimiento?: string;
  horasProximoVencimiento?: number;
  alertaAnticipada: number;
  estado: 'VIGENTE' | 'VENCIDO' | 'PROXIMO';
}

export interface IComponente {
  _id: string;
  numeroSerie: string;
  numeroParte: string;
  nombre: string;
  categoria: string; // Código del catálogo de componentes
  fabricante: string;
  fechaFabricacion: string;
  fechaInstalacion?: string;
  aeronaveActual?: string | IAeronave; // Puede ser ObjectId string o datos poblados
  posicionInstalacion?: string;
  estado: EstadoComponente;
  vidaUtil: IVidaUtil[];
  historialUso: IHistorialUso[];
  mantenimientoProgramado: IMantenimientoProgramado[];
  ultimaInspeccion?: string;
  proximaInspeccion?: string;
  certificaciones?: {
    numeroFormulario8130?: string;
    fechaEmision8130?: string;
    autoridad?: string;
  };
  ubicacionFisica: string;
  observaciones?: string;
  documentos?: {
    tipo: string;
    url: string;
    fechaSubida: string;
  }[];
  alertasActivas: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para Órdenes de Trabajo
export interface IMaterialRequerido {
  numeroParte: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  disponible: boolean;
  proveedor?: string;
  costo?: number;
  fechaSolicitud: string;
  fechaRecepcion?: string;
}

export interface IRegistroTrabajo {
  _id: string;
  fecha: string;
  tecnico: string;
  horasInvertidas: number;
  descripcionTrabajo: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IItemInspeccion {
  item: string;
  descripcion: string;
  estado: 'CONFORME' | 'NO_CONFORME' | 'NO_APLICA';
  observaciones?: string;
  accionRequerida?: string;
  fechaInspeccion: string;
  inspector?: string;
}

export interface IOrdenTrabajo {
  _id: string;
  numeroOrden: string;
  aeronave: string;
  componente?: string;
  tipo: TipoMantenimiento;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadOrden;
  tecnicoAsignado?: string;
  supervisorAsignado?: string;
  fechaCreacion: string;
  fechaVencimiento?: string;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  estado: EstadoOrden;
  horasEstimadas: number;
  horasReales?: number;
  materialesRequeridos: IMaterialRequerido[];
  registrosTrabajo: IRegistroTrabajo[];
  itemsInspeccion: IItemInspeccion[];
  referenciaManual?: string;
  directivaAD?: string;
  boletinServicio?: string;
  observaciones?: string;
  documentosAdjuntos?: {
    nombre: string;
    tipo: string;
    url: string;
    fechaSubida: string;
  }[];
  certificacion?: {
    certificadoPor: string;
    numeroLicencia: string;
    fechaCertificacion: string;
    observacionesCertificacion: string;
  };
  aprobacion?: {
    aprobadoPor: string;
    fechaAprobacion: string;
    observacionesAprobacion: string;
  };
  costoTotal?: number;
  tiempoTotal?: number;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para Dashboard
export interface IEstadisticasComponentes {
  totalComponentes: number;
  componentesInstalados: number;
  componentesEnAlmacen: number;
  componentesEnReparacion: number;
  componentesConAlertas: number;
  porcentajeInstalados: number;
  distribucionPorCategoria: {
    _id: string;
    cantidad: number;
  }[];
}

export interface IEstadisticasOrdenes {
  totalOrdenes: number;
  ordenesPendientes: number;
  ordenesEnProceso: number;
  ordenesCompletadas: number;
  ordenesCriticas: number;
  porcentajeCompletadas: number;
  distribucionPorTipo: {
    _id: string;
    cantidad: number;
  }[];
  tiempoPromedioResolucion: number;
}

export interface IResumenDashboard {
  aeronaves: {
    total: number;
    operativas: number;
    enMantenimiento: number;
    porcentajeOperativas: number;
  };
  componentes: {
    total: number;
    conAlertas: number;
    vencidos: number;
    porcentajeAlertas: number;
  };
  ordenes: {
    total: number;
    pendientes: number;
    enProceso: number;
    criticas: number;
  };
  inspecciones: {
    pendientes: number;
    vencidas: number;
  };
  proximosVencimientos: IComponente[];
}

export interface IAlerta {
  tipo: string;
  severidad: 'critica' | 'alta' | 'media' | 'baja';
  mensaje: string;
  componente?: string;
  numeroOrden?: string;
  numeroInspeccion?: string;
  aeronave?: string;
  fechaVencimiento?: string;
  ordenesAbiertas?: number;
}

// Respuestas de API
export interface IComponentesResponse {
  success: boolean;
  data: IComponente[];
  total: number;
}

export interface IComponenteResponse {
  success: boolean;
  data: IComponente;
  message?: string;
}

export interface IOrdenesTrabajoResponse {
  success: boolean;
  data: IOrdenTrabajo[];
  total: number;
}

export interface IOrdenTrabajoResponse {
  success: boolean;
  data: IOrdenTrabajo;
  message?: string;
}

export interface IEstadisticasComponentesResponse {
  success: boolean;
  data: IEstadisticasComponentes;
}

export interface IEstadisticasOrdenesResponse {
  success: boolean;
  data: IEstadisticasOrdenes;
}

export interface IResumenDashboardResponse {
  success: boolean;
  data: IResumenDashboard;
}

export interface IAlertasResponse {
  success: boolean;
  data: {
    alertas: IAlerta[];
    resumen: {
      total: number;
      criticas: number;
      altas: number;
      medias: number;
    };
  };
}

// Formularios
export interface ICrearComponenteData {
  numeroSerie: string;
  numeroParte: string;
  nombre: string;
  categoria: string; // Código del catálogo de componentes
  fabricante: string;
  fechaFabricacion: string;
  aeronaveActual?: string; // ObjectId de la aeronave
  vidaUtil: IVidaUtil[];
  ubicacionFisica: string;
  observaciones?: string;
}

export interface ICrearOrdenTrabajoData {
  aeronave: string;
  componente?: string;
  tipo: TipoMantenimiento;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadOrden;
  tecnicoAsignado?: string;
  supervisorAsignado?: string;
  fechaVencimiento?: string;
  horasEstimadas: number;
  materialesRequeridos?: IMaterialRequerido[];
  referenciaManual?: string;
  directivaAD?: string;
  boletinServicio?: string;
  observaciones?: string;
}

// Tipos para Inspecciones
export enum TipoInspeccion {
  DIARIA = 'DIARIA',
  PREFLIGHT = 'PREFLIGHT',
  POSTFLIGHT = 'POSTFLIGHT',
  SEMANAL = 'SEMANAL',
  MENSUAL = 'MENSUAL',
  ANUAL = 'ANUAL',
  CONDICIONAL = 'CONDICIONAL'
}

export enum EstadoInspeccion {
  PROGRAMADA = 'PROGRAMADA',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADA = 'COMPLETADA',
  VENCIDA = 'VENCIDA',
  CANCELADA = 'CANCELADA'
}

export enum ResultadoInspeccion {
  CONFORME = 'CONFORME',
  NO_CONFORME = 'NO_CONFORME',
  CONDICIONAL = 'CONDICIONAL'
}

export interface IInspeccion {
  _id: string;
  numeroInspeccion?: string;
  aeronave: string;
  tipo: TipoInspeccion;
  estado: EstadoInspeccion;
  fechaProgramada: string;
  fechaRealizada?: string;
  inspectorAsignado?: string;
  inspectorRealizada?: string;
  resultado?: ResultadoInspeccion;
  itemsInspeccion?: IItemInspeccion[];
  observaciones?: string;
  documentosAdjuntos?: {
    nombre: string;
    tipo: string;
    url: string;
    fechaSubida: string;
  }[];
  createdAt: string;
  updatedAt: string;
}