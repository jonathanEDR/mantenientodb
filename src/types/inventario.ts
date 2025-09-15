// Interfaces para gestión de inventario de aeronaves
export interface IAeronave {
  _id: string;
  matricula: string;
  tipo: 'Helicóptero' | 'Avión';
  modelo: string;
  fabricante: string;
  anoFabricacion: number;
  estado: 'Operativo' | 'En Mantenimiento' | 'Fuera de Servicio' | 'En Reparación';
  ubicacionActual: string;
  horasVuelo: number;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAeronavesResponse {
  success: boolean;
  data: IAeronave[];
  total: number;
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
  estado?: 'Operativo' | 'En Mantenimiento' | 'Fuera de Servicio' | 'En Reparación';
  ubicacionActual: string;
  horasVuelo?: number;
  observaciones?: string;
}

export interface IActualizarAeronaveData extends Partial<ICrearAeronaveData> {
  _id: string;
}