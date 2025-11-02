import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserButton, useUser, useClerk } from '@clerk/clerk-react';
import { usePermissions } from '../../hooks/useRoles';
import { RoleProtection, AdminOnly, MaintenanceOnly, InspectionCapable } from '../common/RoleProtection';

type SidebarProps = {
  className?: string;
  onClose?: () => void;
  showClose?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export default function Sidebar({ className = '', onClose, showClose = false, collapsed = false, onToggleCollapse }: SidebarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const permissions = usePermissions();

  // Filtrar secciones de navegación basado en permisos y roles específicos
  const getFilteredNavigationSections = () => {
    const sections = [];

    // ADMINISTRADOR: Acceso completo a todo el sistema
    if (permissions.isAdmin) {
      // Dashboard Principal (solo administradores)
      if (permissions.canViewDashboard) {
        sections.push({
          title: 'DASHBOARD',
          items: [
            {
              to: '/dashboard',
              label: 'Dashboard Principal',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ),
              requiresPermission: 'VIEW_DASHBOARD'
            }
          ]
        });
      }

      // Gestión de Usuarios (solo administradores tienen acceso completo)
      if (permissions.canViewUsers || permissions.canManageUsers) {
        sections.push({
          title: 'USUARIOS',
          items: [
            {
              to: '/personal',
              label: 'Personal',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
              requiresPermission: 'VIEW_USERS'
            }
          ]
        });
      }

      // Inventario (administradores)
      if (permissions.canViewInventory) {
        sections.push({
          title: 'INVENTARIO',
          items: [
            {
              to: '/inventario',
              label: 'Inventario',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                </svg>
              ),
              requiresPermission: 'VIEW_INVENTORY'
            }
          ]
        });
      }
    } 
    // OTROS ROLES (MECANICO, ESPECIALISTA, PILOTO): Solo Inventario y Personal
    else if (permissions.isMechanic || permissions.isSpecialist || permissions.isPilot) {
      // Personal (acceso limitado para otros roles)
      if (permissions.canViewUsers) {
        sections.push({
          title: 'PERSONAL',
          items: [
            {
              to: '/personal',
              label: 'Personal',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
              requiresPermission: 'VIEW_USERS'
            }
          ]
        });
      }

      // Inventario (acceso para todos los roles)
      if (permissions.canViewInventory) {
        sections.push({
          title: 'INVENTARIO',
          items: [
            {
              to: '/inventario',
              label: 'Inventario',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                </svg>
              ),
              requiresPermission: 'VIEW_INVENTORY'
            }
          ]
        });
      }
    }

    // SOLO ADMINISTRADORES: Secciones adicionales de Mantenimiento y Herramientas
    if (permissions.isAdmin) {
      // Sección Mantenimiento (solo para administradores)
      const maintenanceItems = [];
      
      if (permissions.canViewDashboard) {
        maintenanceItems.push({
          to: '/mantenimiento',
          label: 'Dashboard Mantenimiento',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          requiresPermission: 'VIEW_DASHBOARD'
        });
      }

      if (maintenanceItems.length > 0) {
        sections.push({
          title: 'MANTENIMIENTO',
          items: maintenanceItems
        });
      }

      // Sección Herramientas (solo para administradores)
      const herramientasItems = [];
      
      if (permissions.canViewCatalogs) {
        herramientasItems.push({
          to: '/herramientas',
          label: 'Dashboard Herramientas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
          ),
          requiresPermission: 'VIEW_CATALOGS'
        });
      }

      if (herramientasItems.length > 0) {
        sections.push({
          title: 'HERRAMIENTAS',
          items: herramientasItems
        });
      }
    }

    return sections;
  };

  const filteredSections = getFilteredNavigationSections();
  
  return (
    <div className={`h-screen ${collapsed ? 'w-16' : 'w-64'} bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${className}`}>
      {/* Header del Sidebar */}
      <div className="bg-white border-b border-gray-200 p-4 relative">
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Botón toggle para desktop */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute top-4 right-4 hidden lg:block p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
        )}
        
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">TC</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Panel Super</h1>
              <h2 className="text-lg font-bold text-gray-900">Admin</h2>
            </div>
          )}
        </div>
      </div>

      {/* Navegación por secciones */}
      <nav className="flex-1 overflow-y-auto py-4">
        {filteredSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!collapsed && (
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
            )}
            <div className="space-y-1 px-2">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        
        {/* Mensaje si no hay permisos */}
        {filteredSections.length === 0 && (
          <div className="px-4 py-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            {!collapsed && (
              <p className="text-sm text-gray-500">
                No tienes permisos para acceder a ninguna sección.
              </p>
            )}
          </div>
        )}
      </nav>

      {/* Footer con información del usuario */}
      <div className="border-t border-gray-200 p-4">
        {!collapsed ? (
          <>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-bold">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.primaryEmailAddress?.emailAddress || ''}
                </p>
              </div>
              
              {/* Botón de cerrar sesión visible */}
              <button
                onClick={() => signOut()}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
            
            {/* Botón de configuración de cuenta */}
            <div className="flex items-center space-x-2">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "hidden",
                    userButtonPopoverCard: "bg-white",
                    userButtonPopoverActionButton: "text-sm"
                  }
                }}
              />
              <span className="text-xs text-gray-500">Configurar cuenta</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {/* Avatar en modo colapsado */}
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-bold">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Botón de cerrar sesión en modo colapsado */}
            <button
              onClick={() => signOut()}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
