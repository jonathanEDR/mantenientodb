// Enums para catálogos
export enum EstadoCatalogo {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  OBSOLETO = 'OBSOLETO'
}

export enum EstadoControlMonitoreo {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO'
}

// Interface principal del catálogo de componentes
export interface ICatalogoComponente {
  _id?: string;
  codigo: string;
  descripcion: string;
  estado: EstadoCatalogo;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface principal del catálogo de control y monitoreo
export interface ICatalogoControlMonitoreo {
  _id?: string;
  descripcionCodigo: string;
  horaInicial: number;
  horaFinal: number;
  estado: EstadoControlMonitoreo;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos para formularios
export interface CatalogoComponenteFormData {
  codigo: string;
  descripcion: string;
  estado: EstadoCatalogo;
}

export interface CatalogoControlMonitoreoFormData {
  descripcionCodigo: string;
  horaInicial: number;
  horaFinal: number;
  estado: EstadoControlMonitoreo;
}

// Tipos para filtros
export interface CatalogoComponentesFiltros {
  busqueda?: string;
  estado?: EstadoCatalogo | '';
}

export interface CatalogoControlMonitoreoFiltros {
  busqueda?: string;
  estado?: EstadoControlMonitoreo | '';
}

// Helpers para labels
export const getEstadoLabel = (estado: EstadoCatalogo): string => {
  const labels = {
    [EstadoCatalogo.ACTIVO]: 'Activo',
    [EstadoCatalogo.INACTIVO]: 'Inactivo',
    [EstadoCatalogo.OBSOLETO]: 'Obsoleto'
  };
  return labels[estado] || estado;
};

export const getEstadoColor = (estado: EstadoCatalogo): string => {
  const colors = {
    [EstadoCatalogo.ACTIVO]: 'text-green-600 bg-green-100',
    [EstadoCatalogo.INACTIVO]: 'text-yellow-600 bg-yellow-100',
    [EstadoCatalogo.OBSOLETO]: 'text-red-600 bg-red-100'
  };
  return colors[estado] || 'text-gray-600 bg-gray-100';
};