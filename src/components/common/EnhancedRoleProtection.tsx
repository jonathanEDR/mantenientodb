import React from 'react';
import { UserRole } from '../../types/usuarios';
import { usePermissions, useCurrentUser, useRoleInfo } from '../../hooks/useRoles';

interface EnhancedRoleProtectionProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  fallback?: React.ReactNode;
  hideWhenNoAccess?: boolean;
  showLoadingState?: boolean;
  debugMode?: boolean;
}

// Componente de protección mejorado
export const EnhancedRoleProtection: React.FC<EnhancedRoleProtectionProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAllPermissions = false,
  fallback = null,
  hideWhenNoAccess = true,
  showLoadingState = true,
  debugMode = false
}) => {
  const { userRole, loading, isAuthenticated } = useCurrentUser();
  const permissions = usePermissions();
  const roleInfo = useRoleInfo();

  // Debug en desarrollo
  if (debugMode && import.meta.env.DEV) {
    console.log('🔒 EnhancedRoleProtection Debug:', {
      userRole,
      roleLevel: roleInfo.roleLevel,
      requiredRoles,
      requiredPermissions,
      requireAllPermissions,
      isAuthenticated,
      loading
    });
  }

  // Mostrar loading personalizable
  if (loading && showLoadingState) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    if (hideWhenNoAccess) {
      return null;
    }
    return fallback || (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Debes iniciar sesión para acceder a este contenido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Función helper para verificar permisos individuales
  const checkPermission = (permission: string): boolean => {
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
      case 'VIEW_MONITORING': return permissions.canViewMonitoring;
      case 'MANAGE_MONITORING': return permissions.canManageMonitoring;
      case 'SYSTEM_CONFIG': return permissions.canAccessSystemConfig;
      default: return false;
    }
  };

  // Verificar roles requeridos
  const hasRequiredRole = requiredRoles.length === 0 || 
    (userRole && requiredRoles.includes(userRole));

  // Verificar permisos requeridos (mejorado con lógica AND/OR)
  const hasRequiredPermissions = requiredPermissions.length === 0 || (() => {
    const permissionResults = requiredPermissions.map(checkPermission);
    return requireAllPermissions 
      ? permissionResults.every(Boolean) 
      : permissionResults.some(Boolean);
  })();

  // Verificar acceso combinado
  const hasAccess = hasRequiredRole && hasRequiredPermissions;

  if (!hasAccess) {
    if (hideWhenNoAccess) {
      return null;
    }
    
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No tienes permisos suficientes para ver este contenido.
              {debugMode && import.meta.env.DEV && (
                <div className="mt-2 text-xs">
                  <strong>Debug:</strong> Rol actual: {userRole}, 
                  Roles requeridos: {requiredRoles.join(', ') || 'Ninguno'}, 
                  Permisos requeridos: {requiredPermissions.join(', ') || 'Ninguno'}
                </div>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene acceso, renderizar el contenido
  return <>{children}</>;
};

// Componentes específicos mejorados
export const AdminOnlyEnhanced: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  debugMode?: boolean;
}> = ({ children, fallback, debugMode = false }) => (
  <EnhancedRoleProtection 
    requiredRoles={[UserRole.ADMINISTRADOR]} 
    fallback={fallback}
    hideWhenNoAccess={true}
    debugMode={debugMode}
  >
    {children}
  </EnhancedRoleProtection>
);

export const MaintenanceOnlyEnhanced: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  debugMode?: boolean;
}> = ({ children, fallback, debugMode = false }) => (
  <EnhancedRoleProtection 
    requiredRoles={[UserRole.ADMINISTRADOR, UserRole.MECANICO]} 
    fallback={fallback}
    hideWhenNoAccess={true}
    debugMode={debugMode}
  >
    {children}
  </EnhancedRoleProtection>
);

export const InspectionCapableEnhanced: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  debugMode?: boolean;
}> = ({ children, fallback, debugMode = false }) => (
  <EnhancedRoleProtection 
    requiredRoles={[UserRole.ADMINISTRADOR, UserRole.MECANICO, UserRole.ESPECIALISTA]} 
    fallback={fallback}
    hideWhenNoAccess={true}
    debugMode={debugMode}
  >
    {children}
  </EnhancedRoleProtection>
);

// Hook para acciones específicas mejorado
export const useEnhancedActionPermission = () => {
  const permissions = usePermissions();
  const roleInfo = useRoleInfo();
  
  return {
    // Funciones helper para verificar acciones específicas
    canCreateComponent: () => permissions.canCreateComponents,
    canEditComponent: () => permissions.canEditComponents,
    canDeleteComponent: () => permissions.canDeleteComponents,
    
    canCreateWorkOrder: () => permissions.canCreateWorkOrders,
    canEditWorkOrder: () => permissions.canEditWorkOrders,
    canDeleteWorkOrder: () => permissions.canDeleteWorkOrders,
    canCompleteWorkOrder: () => permissions.canCompleteWorkOrders,
    
    canCreateInspection: () => permissions.canCreateInspections,
    canEditInspection: () => permissions.canEditInspections,
    canDeleteInspection: () => permissions.canDeleteInspections,
    canCertifyInspection: () => permissions.canCertifyInspections,
    
    canManageUser: () => permissions.canManageUsers,
    canViewUsers: () => permissions.canViewUsers,
    
    canAccessConfig: () => permissions.canAccessSystemConfig,
    
    // Información de contexto mejorada
    roleLevel: roleInfo.roleLevel,
    roleDescription: roleInfo.roleDescription,
    activePermissionsCount: roleInfo.activePermissions.length,
    
    // Helper para verificar si puede gestionar un rol específico
    canManageRole: (targetRole: UserRole) => permissions.canManageRole(targetRole)
  };
};

export default EnhancedRoleProtection;