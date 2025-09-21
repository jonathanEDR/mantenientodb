import { useState, useEffect } from 'react';
import { UserRole, ICurrentUser, IRolePermissions } from '../types/usuarios';
import { obtenerPermisosUsuario } from '../utils/usuariosApi';

// Hook personalizado para cargar datos del usuario
export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);
  const [permissions, setPermissions] = useState<IRolePermissions | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await obtenerPermisosUsuario();
      
      if (response.success && response.user) {
        setCurrentUser(response.user);
        setPermissions(response.user.permissions);
        setUserRole(response.user.role);
      } else {
        throw new Error('No se pudo obtener información del usuario');
      }
    } catch (err) {
      console.error('Error al cargar datos del usuario:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return {
    currentUser,
    permissions,
    userRole,
    loading,
    error,
    refreshUser
  };
};

// Hook para verificar permisos específicos
export const usePermissions = () => {
  const { permissions, userRole } = useCurrentUser();
  
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
                          userRole === UserRole.ESPECIALISTA
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
    canAccess: hasAccess
  };
};