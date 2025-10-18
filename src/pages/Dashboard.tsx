import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import DashboardLayout from '../components/layout/DashboardLayout';
import { usePermissions } from '../hooks/useRoles';
import DebugInfo from '../components/common/DebugInfo';
import { obtenerEstadisticasUsuarios } from '../utils/usuariosApi';
import { obtenerEstadisticasInventario } from '../utils/inventarioApi';
import { obtenerResumenDashboard } from '../utils/mantenimientoApi';

// Tipos para métricas generales
interface IMetricasGenerales {
  usuarios: {
    total: number;
    activos: number;
    conectados: number;
  };
  inventario: {
    totalItems: number;
    itemsBajoStock: number;
    herramientasDisponibles: number;
  };
  mantenimiento: {
    componentesOperativos: number;
    ordenesAbiertas: number;
    inspeccionesPendientes: number;
  };
  sistema: {
    ultimaActualizacion: string;
    estado: 'operativo' | 'mantenimiento' | 'error';
  };
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [dbUser, setDbUser] = useState<any>(null);
  const [metricas, setMetricas] = useState<IMetricasGenerales | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del usuario y métricas generales
  const cargarDatos = async () => {
    if (!user || !isLoaded) return;

    try {
      setLoading(true);
      setError(null);

      // Verificar/registrar usuario y cargar métricas en paralelo
      const promises = [];

      // 1. Verificar si el usuario está en BD
      const userPromise = axiosInstance.get('/auth/me').catch(async (error) => {
        if (error.response?.status === 404) {
          // Si no está en BD, registrarlo
          setIsRegistering(true);
          const userData = {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Usuario',
            email: user.primaryEmailAddress?.emailAddress,
            clerkId: user.id
          };
          return axiosInstance.post('/auth/register', userData);
        }
        throw error;
      });
      promises.push(userPromise);

      // 2. Cargar métricas generales (solo si tiene permisos)
      if (permissions.canViewDashboard) {
        const metricasPromise = cargarMetricasGenerales();
        promises.push(metricasPromise);
      }

      const results = await Promise.all(promises);
      
      // Procesar resultado de usuario
      const userResult = results[0] as any;
      setDbUser(userResult.data?.user || userResult.data);

      // Procesar métricas si están disponibles
      if (results.length > 1 && results[1]) {
        setMetricas(results[1] as IMetricasGenerales);
      }

    } catch (error: any) {
      console.error('❌ Error cargando datos del dashboard:', error);
      
      let errorMessage = 'Error al cargar los datos del dashboard';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      } else if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para acceder a esta información.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsRegistering(false);
    }
  };

  // Función para cargar métricas generales del sistema con datos reales
  const cargarMetricasGenerales = async (): Promise<IMetricasGenerales> => {
    try {
      // Cargar datos en paralelo desde las APIs reales
      const [usuariosResponse, inventarioResponse, mantenimientoResponse] = await Promise.allSettled([
        obtenerEstadisticasUsuarios(),
        obtenerEstadisticasInventario(),
        obtenerResumenDashboard()
      ]);

      // Procesar estadísticas de usuarios
      const usuariosStats = usuariosResponse.status === 'fulfilled' && usuariosResponse.value.success
        ? usuariosResponse.value.data
        : { totalUsuarios: 0, usuariosActivos: 0, usuariosRecientes: 0, usuariosPorRol: {} };

      // Procesar estadísticas de inventario
      const inventarioStats = inventarioResponse.status === 'fulfilled' && inventarioResponse.value.success
        ? inventarioResponse.value.data
        : { totalAeronaves: 0, operativas: 0, enMantenimiento: 0 };

      // Procesar estadísticas de mantenimiento
      const mantenimientoStats = mantenimientoResponse.status === 'fulfilled' && mantenimientoResponse.value.success
        ? mantenimientoResponse.value.data
        : { 
            componentes: { total: 0, conAlertas: 0 },
            ordenes: { pendientes: 0, criticas: 0 },
            inspecciones: { pendientes: 0 }
          };

      return {
        usuarios: {
          total: usuariosStats.totalUsuarios,
          activos: usuariosStats.usuariosActivos,
          conectados: usuariosStats.usuariosRecientes // Aproximación: usuarios recientes como "conectados"
        },
        inventario: {
          totalItems: inventarioStats.totalAeronaves,
          itemsBajoStock: inventarioStats.enMantenimiento || 0,
          herramientasDisponibles: inventarioStats.operativas || 0
        },
        mantenimiento: {
          componentesOperativos: mantenimientoStats.componentes.total - mantenimientoStats.componentes.conAlertas,
          ordenesAbiertas: mantenimientoStats.ordenes.pendientes,
          inspeccionesPendientes: mantenimientoStats.inspecciones.pendientes
        },
        sistema: {
          ultimaActualizacion: new Date().toISOString(),
          estado: mantenimientoStats.ordenes.criticas > 0 ? 'mantenimiento' as const : 'operativo' as const
        }
      };
    } catch (error) {
      console.error('Error cargando métricas:', error);
      // Fallback con datos básicos en caso de error
      return {
        usuarios: { total: 0, activos: 0, conectados: 0 },
        inventario: { totalItems: 0, itemsBajoStock: 0, herramientasDisponibles: 0 },
        mantenimiento: { componentesOperativos: 0, ordenesAbiertas: 0, inspeccionesPendientes: 0 },
        sistema: { ultimaActualizacion: new Date().toISOString(), estado: 'error' as const }
      };
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [user?.id, isLoaded, permissions.canViewDashboard]);

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {!isLoaded ? 'Cargando autenticación...' : 'Cargando dashboard...'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header del Dashboard */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenido, {user?.firstName || 'Usuario'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Panel de control principal - Sistema de Inventario y Mantenimiento
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {metricas ? `Última actualización: ${new Date().toLocaleString('es-PE')}` : 'Cargando...'}
              </span>
            </div>
            <button
              onClick={cargarDatos}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>

        {/* Manejo de errores */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Estados de carga */}
        {isRegistering && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">Configurando tu cuenta por primera vez...</span>
            </div>
          </div>
        )}

        {/* Navegación Rápida - Módulos Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mantenimiento */}
          {permissions.canViewDashboard && (
            <div 
              onClick={() => navigate('/mantenimiento')}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 border-blue-500 p-6 group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Mantenimiento</h3>
                  <p className="text-sm text-gray-600">Gestión de componentes y órdenes de trabajo</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                <span>Acceder al módulo</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}

          {/* Inventario */}
          <div 
            onClick={() => navigate('/inventario')}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 border-green-500 p-6 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Inventario</h3>
                <p className="text-sm text-gray-600">Control de stock y gestión de equipos</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
              <span>Acceder al módulo</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Herramientas */}
          <div 
            onClick={() => navigate('/herramientas')}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 border-orange-500 p-6 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Herramientas</h3>
                <p className="text-sm text-gray-600">Administración de herramientas y equipos</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-orange-600 text-sm font-medium">
              <span>Acceder al módulo</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Métricas Generales del Sistema */}
        {metricas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Usuarios */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{metricas.usuarios.activos}</p>
                  <p className="text-sm text-purple-600">de {metricas.usuarios.total} registrados</p>
                </div>
              </div>
            </div>

            {/* Inventario */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aeronaves Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{metricas.inventario.totalItems}</p>
                  <p className="text-sm text-orange-600">{metricas.inventario.itemsBajoStock} en mantenimiento</p>
                </div>
              </div>
            </div>

            {/* Mantenimiento */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Componentes Operativos</p>
                  <p className="text-2xl font-bold text-gray-900">{metricas.mantenimiento.componentesOperativos}</p>
                  <p className="text-sm text-orange-600">{metricas.mantenimiento.ordenesAbiertas} órdenes pendientes</p>
                </div>
              </div>
            </div>

            {/* Estado del Sistema */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  metricas.sistema.estado === 'operativo' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <svg className={`w-5 h-5 ${
                    metricas.sistema.estado === 'operativo' ? 'text-green-600' : 'text-red-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Estado del Sistema</p>
                  <p className={`text-2xl font-bold ${
                    metricas.sistema.estado === 'operativo' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {metricas.sistema.estado === 'operativo' ? 'Operativo' : 'Mantenimiento'}
                  </p>
                  <p className="text-sm text-gray-500">Todos los servicios funcionando</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información del Perfil de Usuario */}
        {dbUser && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Mi Perfil</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Información Personal</h3>
                  <dl className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-600">Nombre:</dt>
                      <dd className="text-gray-900 font-medium">{dbUser.name}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-600">Email:</dt>
                      <dd className="text-gray-900">{dbUser.email}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-600">Rol:</dt>
                      <dd className="text-gray-900 font-medium">
                        {permissions.isAdmin ? 'Administrador' : 
                         permissions.isMechanic ? 'Mecánico' : 
                         permissions.isSpecialist ? 'Especialista' :
                         permissions.isPilot ? 'Piloto' : 'Usuario'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Estado de la Cuenta</h3>
                  <dl className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-600">Estado:</dt>
                      <dd className="text-green-600 font-medium">✅ Activo</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-600">Registrado:</dt>
                      <dd className="text-gray-900">{new Date(dbUser.createdAt).toLocaleDateString('es-PE')}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-600">Última sesión:</dt>
                      <dd className="text-gray-900">{new Date().toLocaleDateString('es-PE')}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Información técnica solo para administradores */}
              {permissions.isAdmin && (
                <DebugInfo dbUser={dbUser} />
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
