import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { usePermissions } from '../hooks/useRoles';

export default function GestionHerramientas() {
  const navigate = useNavigate();
  const permissions = usePermissions();

  // Verificar permisos de acceso a herramientas
  if (!permissions.canViewCatalogs) {
    return (
      <DashboardLayout>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-4">No tienes permisos para acceder al módulo de Herramientas</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Herramientas</h1>
              <p className="text-gray-600 mt-2">
                Gestiona catálogos y herramientas del sistema de mantenimiento
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/herramientas/catalogo-componentes"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Catálogo Componentes</span>
              </Link>
              <Link
                to="/herramientas/control-monitoreo"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Control y Monitoreo</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Módulos disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Catálogo de Componentes */}
          <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Catálogo de Componentes</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Gestiona el catálogo maestro de componentes con código, descripción y estado
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Administra los elementos del catálogo
                </div>
                <Link
                  to="/herramientas/catalogo-componentes"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Acceder →
                </Link>
              </div>
            </div>
          </div>

          {/* Catálogo de Control y Monitoreo */}
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Estado de Control y Monitoreo</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Gestiona el catálogo de estados de control y monitoreo con descripción, horas inicial y final, y estado
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Administra los elementos del catálogo de monitoreo
                </div>
                <Link
                  to="/herramientas/control-monitoreo"
                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  Acceder →
                </Link>
              </div>
            </div>
          </div>

          {/* Placeholder para futuros catálogos */}
          <div className="bg-gray-50 shadow rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-400">Futuras Herramientas</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Espacio para herramientas adicionales del sistema
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Pendiente
                </div>
                <span className="text-gray-400 font-medium text-sm">Próximamente</span>
              </div>
            </div>
          </div>

          {/* Otro placeholder */}
          <div className="bg-gray-50 shadow rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-400">Futuras Herramientas</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Espacio para herramientas adicionales del sistema
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Pendiente
                </div>
                <span className="text-gray-400 font-medium text-sm">Próximamente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Acerca del Módulo de Herramientas</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  El módulo de Herramientas está diseñado para gestionar catálogos maestros que alimentan 
                  otros módulos del sistema. Actualmente incluye el Catálogo de Componentes con los campos básicos:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Código:</strong> Identificador único del componente</li>
                  <li><strong>Descripción:</strong> Nombre o descripción del componente</li>
                  <li><strong>Estado:</strong> Activo, Inactivo o Obsoleto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}