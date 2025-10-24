// Interfaces para gestión de inventario de aeronaves
export interface IAeronave {
  _id: string;
  matricula: string;
  tipo: 'Helicóptero' | 'Avión';
  modelo: string;
  fabricante: string;
  anoFabricacion: number;
  estado: 'Operativo' | 'En Mantenimiento' | 'Fuera de Servicio' | 'En Reparación' | 'Inoperativo por Reportaje';
  ubicacionActual: string;
  horasVuelo: number;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAeronavesResponse {
  success: boolean;
  data: IAeronave[];
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IAeronaveResponse {
  success: boolean;
  data: IAeronave;
  message?: string;
}

export interface IEstadisticasInventario {
  totalAeronaves: number;
  helicopteros: number;
  aviones: number;
  operativas: number;
  enMantenimiento: number;
  fueraServicio: number;
  porcentajeOperativas: number;
}

export interface IEstadisticasInventarioResponse {
  success: boolean;
  data: IEstadisticasInventario;
}

export interface ICrearAeronaveData {
  matricula: string;
  tipo: 'Helicóptero' | 'Avión';
  modelo: string;
  fabricante: string;
  anoFabricacion: number;
  estado?: 'Operativo' | 'En Mantenimiento' | 'Fuera de Servicio' | 'En Reparación' | 'Inoperativo por Reportaje';
  ubicacionActual: string;
  horasVuelo?: number;
  observaciones?: string;
}

export interface IActualizarAeronaveData extends Partial<ICrearAeronaveData> {
  _id: string;
}

// ===== GESTIÓN DE HORAS Y PROPAGACIÓN =====

export enum EstadoAeronave {
  OPERATIVO = 'Operativo',
  EN_MANTENIMIENTO = 'En Mantenimiento',
  FUERA_DE_SERVICIO = 'Fuera de Servicio',
  EN_REPARACION = 'En Reparación',
  INOPERATIVO_POR_REPORTAJE = 'Inoperativo por Reportaje'
}

export interface IActualizacionHoras {
  aeronaveId: string;
  horasNuevas: number;
  horasAnteriores: number;
  incremento: number;
  propagarAComponentes: boolean;
  motivo?: string;
  observaciones?: string;
}

export interface IActualizacionHorasResponse {
  success: boolean;
  message: string;
  data: {
    aeronave: IAeronave;
    propagacion: {
      horasAnteriores: number;
      horasNuevas: number;
      incrementoHoras: number;
      componentesActualizados: number;
      componentesProcessados: Array<{
        componenteId: string;
        numeroSerie: string;
        nombre: string;
        actualizado: boolean;
        error?: string;
      }>;
    };
    proximosMantenimientos?: Array<{
      componenteId: string;
      numeroSerie: string;
      nombre: string;
      categoria: string;
      proximosVencimientos: Array<{
        tipo: string;
        limite: number;
        acumulado: number;
        restante: number;
      }>;
      proximaInspeccion?: Date;
    }>;
    warnings?: string[];
  };
}

export interface IGestionHorasData {
  horasVuelo: number;
  observacion?: string;
}

export interface IProximoMantenimiento {
  horasRestantes: number;
  tipoMantenimiento: string;
  fechaEstimada?: Date;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}

// Actualizar IAeronave para incluir campos de gestión de horas
export interface IAeronaveExtendida extends IAeronave {
  ultimaActualizacionHoras?: Date;
  proximoMantenimiento?: IProximoMantenimiento;
  totalComponentes?: number;
}