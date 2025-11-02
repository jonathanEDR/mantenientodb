// Enum para roles de usuario (debe coincidir con el backend)
export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  MECANICO = 'MECANICO',
  PILOTO = 'PILOTO',
  ESPECIALISTA = 'ESPECIALISTA'
}

// Interfaces para gestión de usuarios
export interface IUsuario {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  role: UserRole;
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
  usuariosPorRol: {
    [key in UserRole]: number;
  };
}

export interface IEstadisticasUsuariosResponse {
  success: boolean;
  data: IEstadisticasUsuarios;
}

// Interfaces adicionales para gestión de roles
export interface ICambiarRolRequest {
  userId: string;
  newRole: UserRole;
}

export interface IRolePermissions {
  canManageUsers: boolean;
  canViewUsers: boolean;
  canCreateComponents: boolean;
  canEditComponents: boolean;
  canDeleteComponents: boolean;
  canViewComponents: boolean;
  canCreateWorkOrders: boolean;
  canEditWorkOrders: boolean;
  canDeleteWorkOrders: boolean;
  canViewWorkOrders: boolean;
  canCompleteWorkOrders: boolean;
  canCreateInspections: boolean;
  canEditInspections: boolean;
  canDeleteInspections: boolean;
  canViewInspections: boolean;
  canCertifyInspections: boolean;
  canCreateInventory: boolean;
  canEditInventory: boolean;
  canDeleteInventory: boolean;
  canViewInventory: boolean;
  canCreateCatalogs: boolean;
  canEditCatalogs: boolean;
  canDeleteCatalogs: boolean;
  canViewCatalogs: boolean;
  canViewDashboard: boolean;
  canViewAdvancedReports: boolean;
  canViewMonitoring: boolean;
  canManageMonitoring: boolean;
  canAccessSystemConfig: boolean;
}

// Información completa del usuario logueado
export interface ICurrentUser extends IUsuario {
  permissions: IRolePermissions;
}

// Respuestas de la API
export interface ICambiarRolResponse {
  success: boolean;
  message: string;
  user?: IUsuario;
}

export interface ICurrentUserResponse {
  success: boolean;
  user: ICurrentUser;
  roleInfo?: {
    role: UserRole;
    hierarchy: { level: number; description: string };
    allPermissions: string[];
  };
}