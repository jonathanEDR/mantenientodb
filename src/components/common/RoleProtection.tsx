import React from 'react';
import { UserRole } from '../../types/usuarios';
import { usePermissions, useCurrentUser } from '../../hooks/useRoles';

interface RoleProtectionProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  hideWhenNoAccess?: boolean;
}

// Componente para proteger contenido basado en roles
export const RoleProtection: React.FC<RoleProtectionProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = null,
  hideWhenNoAccess = true
}) => {
  const { userRole, loading } = useCurrentUser();
  const permissions = usePermissions();

  // Mostrar loading si aún está cargando
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  // Verificar roles requeridos
  const hasRequiredRole = requiredRoles.length === 0 || 
    (userRole && requiredRoles.includes(userRole));

  // Verificar permisos requeridos
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.some(permission => {
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
        case 'VIEW_DASHBOARD': return permissions.canViewDashboard;
        case 'VIEW_ADVANCED_REPORTS': return permissions.canViewAdvancedReports;
        case 'SYSTEM_CONFIG': return permissions.canAccessSystemConfig;
        default: return false;
      }
    });

  const hasAccess = hasRequiredRole && hasRequiredPermissions;

  // Si no tiene acceso
  if (!hasAccess) {
    if (hideWhenNoAccess) {
      return null; // No renderizar nada
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
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene acceso, renderizar el contenido
  return <>{children}</>;
};

// Componente específico para acciones administrativas
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleProtection 
    requiredRoles={[UserRole.ADMINISTRADOR]} 
    fallback={fallback}
    hideWhenNoAccess={true}
  >
    {children}
  </RoleProtection>
);

// Componente para acciones de mantenimiento
export const MaintenanceOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleProtection 
    requiredRoles={[UserRole.ADMINISTRADOR, UserRole.MECANICO]} 
    fallback={fallback}
    hideWhenNoAccess={true}
  >
    {children}
  </RoleProtection>
);

// Componente para inspecciones
export const InspectionCapable: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleProtection 
    requiredRoles={[UserRole.ADMINISTRADOR, UserRole.MECANICO, UserRole.ESPECIALISTA]} 
    fallback={fallback}
    hideWhenNoAccess={true}
  >
    {children}
  </RoleProtection>
);

// Hook para usar con botones y acciones específicas
export const useActionPermission = () => {
  const permissions = usePermissions();
  
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
    
    canAccessConfig: () => permissions.canAccessSystemConfig
  };
};

export default RoleProtection;