import { useState, useEffect, useCallback } from 'react';
import { UserRole, ICurrentUser, IRolePermissions } from '../types/usuarios';
import { obtenerPermisosUsuario } from '../utils/usuariosApi';

// Tipos para información de rol
interface IUserRoleInfo {
  role: UserRole;
  hierarchy: { level: number; description: string };
  allPermissions: string[];
}

// Hook personalizado para cargar datos del usuario (mejorado)
export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);
  const [permissions, setPermissions] = useState<IRolePermissions | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roleInfo, setRoleInfo] = useState<IUserRoleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await obtenerPermisosUsuario();
      
      if (response.success && response.user) {
        setCurrentUser(response.user);
        setPermissions(response.user.permissions);
        setUserRole(response.user.role);
        
        // Información adicional del rol si está disponible
        if (response.roleInfo) {
          setRoleInfo(response.roleInfo);
        }
        
        console.log('✅ Datos de usuario cargados:', {
          user: response.user.email,
          role: response.user.role,
          permissionsCount: Object.keys(response.user.permissions).filter(key => 
            response.user.permissions[key as keyof IRolePermissions]
          ).length
        });
      } else {
        throw new Error('No se pudo obtener información del usuario');
      }
    } catch (err) {
      console.error('❌ Error al cargar datos del usuario:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Limpiar datos en caso de error
      setCurrentUser(null);
      setPermissions(null);
      setUserRole(null);
      setRoleInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    currentUser,
    permissions,
    userRole,
    roleInfo,
    loading,
    error,
    refreshUser,
    isAuthenticated: !!currentUser && !!userRole
  };
};

// Nota: El hook useAuth se encuentra en context/AuthProvider.tsx

// Hook mejorado para verificar permisos específicos
export const usePermissions = () => {
  const { permissions, userRole, roleInfo } = useCurrentUser();
  
  return {
    // Permisos de usuarios
    canManageUsers: permissions?.canManageUsers || false,
    canViewUsers: permissions?.canViewUsers || false,
    
    // Permisos de componentes
    canCreateComponents: permissions?.canCreateComponents || false,
    canEditComponents: permissions?.canEditComponents || false,
    canDeleteComponents: permissions?.canDeleteComponents || false,
    canViewComponents: permissions?.canViewComponents || false,
    
    // Permisos de órdenes de trabajo
    canCreateWorkOrders: permissions?.canCreateWorkOrders || false,
    canEditWorkOrders: permissions?.canEditWorkOrders || false,
    canDeleteWorkOrders: permissions?.canDeleteWorkOrders || false,
    canViewWorkOrders: permissions?.canViewWorkOrders || false,
    canCompleteWorkOrders: permissions?.canCompleteWorkOrders || false,
    
    // Permisos de inspecciones
    canCreateInspections: permissions?.canCreateInspections || false,
    canEditInspections: permissions?.canEditInspections || false,
    canDeleteInspections: permissions?.canDeleteInspections || false,
    canViewInspections: permissions?.canViewInspections || false,
    canCertifyInspections: permissions?.canCertifyInspections || false,
    
    // Permisos de inventario
    canCreateInventory: permissions?.canCreateInventory || false,
    canEditInventory: permissions?.canEditInventory || false,
    canDeleteInventory: permissions?.canDeleteInventory || false,
    canViewInventory: permissions?.canViewInventory || false,
    
    // Permisos de catálogos
    canCreateCatalogs: permissions?.canCreateCatalogs || false,
    canEditCatalogs: permissions?.canEditCatalogs || false,
    canDeleteCatalogs: permissions?.canDeleteCatalogs || false,
    canViewCatalogs: permissions?.canViewCatalogs || false,
    
    // Permisos de dashboard y reportes
    canViewDashboard: permissions?.canViewDashboard || false,
    canViewAdvancedReports: permissions?.canViewAdvancedReports || false,
    
    // Permisos de monitoreo
    canViewMonitoring: permissions?.canViewMonitoring || false,
    canManageMonitoring: permissions?.canManageMonitoring || false,
    
    // Permisos de configuración
    canAccessSystemConfig: permissions?.canAccessSystemConfig || false,
    
    // Helpers para verificar roles específicos
    isAdmin: userRole === UserRole.ADMINISTRADOR,
    isMechanic: userRole === UserRole.MECANICO,
    isSpecialist: userRole === UserRole.ESPECIALISTA,
    isPilot: userRole === UserRole.COPILOTO,
    
    // Helper para verificar múltiples roles
    hasAnyRole: (roles: UserRole[]) => userRole ? roles.includes(userRole) : false,
    
    // Helper para verificar si puede realizar acciones administrativas
    canDoAdminActions: userRole === UserRole.ADMINISTRADOR,
    
    // Helper para verificar si puede realizar acciones de mantenimiento
    canDoMaintenanceActions: userRole === UserRole.ADMINISTRADOR || userRole === UserRole.MECANICO,
    
    // Helper para verificar si puede realizar inspecciones
    canDoInspectionActions: userRole === UserRole.ADMINISTRADOR || 
                          userRole === UserRole.MECANICO || 
                          userRole === UserRole.ESPECIALISTA,
    
    // Información del rol (nivel jerárquico)
    roleLevel: roleInfo?.hierarchy?.level || 0,
    roleDescription: roleInfo?.hierarchy?.description || '',
    
    // Helper para verificar si un rol es superior a otro
    canManageRole: (targetRole: UserRole) => {
      const roleLevels = {
        [UserRole.ADMINISTRADOR]: 4,
        [UserRole.MECANICO]: 3,
        [UserRole.ESPECIALISTA]: 2,
        [UserRole.COPILOTO]: 1
      };
      
      const currentLevel = userRole ? roleLevels[userRole] : 0;
      const targetLevel = roleLevels[targetRole];
      
      return currentLevel >= targetLevel;
    }
  };
};

// Hook para verificar si el usuario puede acceder a una ruta específica
export const useRouteAccess = (requiredPermissions: string[]) => {
  const { permissions, loading } = useCurrentUser();
  
  const hasAccess = () => {
    if (!permissions) return false;
    
    return requiredPermissions.some(permission => {
      switch (permission) {
        case 'MANAGE_USERS': return permissions.canManageUsers;
        case 'VIEW_USERS': return permissions.canViewUsers;
        case 'CREATE_COMPONENTS': return permissions.canCreateComponents;
        case 'EDIT_COMPONENTS': return permissions.canEditComponents;
        case 'DELETE_COMPONENTS': return permissions.canDeleteComponents;
        case 'VIEW_COMPONENTS': return permissions.canViewComponents;
        case 'CREATE_WORK_ORDERS': return permissions.canCreateWorkOrders;
        case 'EDIT_WORK_ORDERS': return permissions.canEditWorkOrders;
        case 'DELETE_WORK_ORDERS': return permissions.canDeleteWorkOrders;
        case 'VIEW_WORK_ORDERS': return permissions.canViewWorkOrders;
        case 'COMPLETE_WORK_ORDERS': return permissions.canCompleteWorkOrders;
        case 'CREATE_INSPECTIONS': return permissions.canCreateInspections;
        case 'EDIT_INSPECTIONS': return permissions.canEditInspections;
        case 'DELETE_INSPECTIONS': return permissions.canDeleteInspections;
        case 'VIEW_INSPECTIONS': return permissions.canViewInspections;
        case 'CERTIFY_INSPECTIONS': return permissions.canCertifyInspections;
        case 'CREATE_INVENTORY': return permissions.canCreateInventory;
        case 'EDIT_INVENTORY': return permissions.canEditInventory;
        case 'DELETE_INVENTORY': return permissions.canDeleteInventory;
        case 'VIEW_INVENTORY': return permissions.canViewInventory;
        case 'CREATE_CATALOGS': return permissions.canCreateCatalogs;
        case 'EDIT_CATALOGS': return permissions.canEditCatalogs;
        case 'DELETE_CATALOGS': return permissions.canDeleteCatalogs;
        case 'VIEW_CATALOGS': return permissions.canViewCatalogs;
        case 'VIEW_DASHBOARD': return permissions.canViewDashboard;
        case 'VIEW_ADVANCED_REPORTS': return permissions.canViewAdvancedReports;
        case 'SYSTEM_CONFIG': return permissions.canAccessSystemConfig;
        default: return false;
      }
    });
  };

  return {
    hasAccess: hasAccess(),
    loading,
    permissions,
    canAccess: hasAccess
  };
};

// Nota: El AuthProvider se encuentra en context/AuthProvider.tsx

// Hook para obtener información del rol actual
export const useRoleInfo = () => {
  const { userRole, roleInfo, permissions } = useCurrentUser();
  
  return {
    role: userRole,
    roleLevel: roleInfo?.hierarchy?.level || 0,
    roleDescription: roleInfo?.hierarchy?.description || '',
    allPermissions: roleInfo?.allPermissions || [],
    activePermissions: permissions ? Object.keys(permissions).filter(key => 
      permissions[key as keyof IRolePermissions]
    ) : []
  };
};