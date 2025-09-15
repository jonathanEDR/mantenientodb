// Interfaces para gestión de usuarios
export interface IUsuario {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUsuariosResponse {
  success: boolean;
  data: IUsuario[];
  total: number;
}

export interface IEstadisticasUsuarios {
  totalUsuarios: number;
  usuariosRecientes: number;
  usuariosActivos: number;
}

export interface IEstadisticasUsuariosResponse {
  success: boolean;
  data: IEstadisticasUsuarios;
}