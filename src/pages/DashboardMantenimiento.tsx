import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { IResumenDashboard, IAlerta } from '../types/mantenimiento';
import { obtenerResumenDashboard, obtenerAlertas } from '../utils/mantenimientoApi';
import MonitoreoAeronaveComponentes from '../components/dashboard/MonitoreoAeronaveComponentes';
import ProtectedButton, { ProtectedClickable, useProtectedAction } from '../components/common/ProtectedButton';

const DashboardMantenimiento: React.FC = () => {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState<IResumenDashboard | null>(null);
  const [alertas, setAlertas] = useState<IAlerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para proteger acciones de navegación
  const { executeProtected } = useProtectedAction(300);

  // Hook de monitoreo viejo removido - ahora se maneja en MonitoreoGranularDashboard

  // Función para cargar datos del dashboard
  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar resumen y alertas en paralelo
      const [responseResumen, responseAlertas] = await Promise.all([
        obtenerResumenDashboard(),
        obtenerAlertas()
      ]);

      if (responseResumen.success) {
        setResumen(responseResumen.data);
      }

      if (responseAlertas.success) {
        setAlertas(responseAlertas.data.alertas);
      }

    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('Error al cargar los datos del dashboard de mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  // Función para obtener color según severidad
  const obtenerColorSeveridad = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para obtener icono según severidad
  const obtenerIconoSeveridad = (severidad: string) => {
    switch (severidad) {
      case 'critica':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'alta':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Mantenimiento</h1>
            <p className="text-gray-600">Resumen general del estado de mantenimiento de la flota</p>
          </div>
          <ProtectedButton
            onClick={async () => await executeProtected(cargarDatosDashboard)}
            variant="primary"
            loadingText="Actualizando..."
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </ProtectedButton>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <ProtectedButton
              onClick={async () => await executeProtected(cargarDatosDashboard)}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
              variant="custom"
              size="sm"
              loadingText="Reintentando..."
            >
              Reintentar
            </ProtectedButton>
          </div>
        )}

        {/* Tarjetas de Navegación Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gestión de Componentes */}
          <ProtectedClickable
            onClick={() => executeProtected(() => {
              console.log('📊 [DASHBOARD] Navegando a gestión de componentes');
              navigate('/mantenimiento/componentes');
            })}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500 p-6 group"
            debounceMs={300}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  Componentes
                </h3>
                <p className="text-sm text-gray-500">
                  Administrar componentes de aeronaves, inspecciones y alertas
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              <span>Acceder al módulo</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </ProtectedClickable>

          {/* Órdenes de Trabajo */}
          <ProtectedClickable
            onClick={() => executeProtected(() => {
              console.log('📊 [DASHBOARD] Navegando a órdenes de trabajo');
              navigate('/mantenimiento/ordenes');
            })}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500 p-6 group"
            debounceMs={300}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                  Órdenes de Trabajo
                </h3>
                <p className="text-sm text-gray-500">
                  Órdenes de mantenimiento y seguimiento de trabajos
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-orange-600 text-sm font-medium">
              <span>Acceder al módulo</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </ProtectedClickable>

          {/* Inspecciones */}
          <ProtectedClickable
            onClick={() => executeProtected(() => {
              console.log('📊 [DASHBOARD] Navegando a inspecciones');
              navigate('/mantenimiento/inspecciones');
            })}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500 p-6 group"
            debounceMs={300}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                  Inspecciones
                </h3>
                <p className="text-sm text-gray-500">
                  Control de inspecciones programadas y reportes de calidad
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
              <span>Acceder al módulo</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </ProtectedClickable>
        </div>

        {/* Resumen General */}
        {resumen && (
          <>
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Aeronaves */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aeronaves Operativas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {resumen.aeronaves.operativas}/{resumen.aeronaves.total}
                    </p>
                    <p className="text-sm text-green-600">{resumen.aeronaves.porcentajeOperativas}% operativas</p>
                  </div>
                </div>
              </div>

              {/* Componentes */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Componentes con Alertas</p>
                    <p className="text-2xl font-bold text-gray-900">{resumen.componentes.conAlertas}</p>
                    <p className="text-sm text-yellow-600">{resumen.componentes.porcentajeAlertas}% del total</p>
                  </div>
                </div>
              </div>

              {/* Órdenes Pendientes */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Órdenes Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{resumen.ordenes.pendientes}</p>
                    <p className="text-sm text-orange-600">{resumen.ordenes.criticas} críticas</p>
                  </div>
                </div>
              </div>

              {/* Inspecciones */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Inspecciones Vencidas</p>
                    <p className="text-2xl font-bold text-gray-900">{resumen.inspecciones.vencidas}</p>
                    <p className="text-sm text-red-600">{resumen.inspecciones.pendientes} pendientes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monitoreo Detallado de Componentes por Aeronave */}
            <MonitoreoAeronaveComponentes
              onClickComponente={(componenteId: string, aeronaveId: string) => {
                executeProtected(() => {
                  console.log('📊 [DASHBOARD] Navegando a componente:', componenteId, 'de aeronave:', aeronaveId);
                  navigate(`/mantenimiento/componentes?componenteId=${componenteId}&aeronaveId=${aeronaveId}`);
                });
              }}
              onClickEstado={(estadoId: string, componenteId: string) => {
                executeProtected(() => {
                  console.log('📊 [DASHBOARD] Navegando a componente desde estado:', componenteId, 'estadoId:', estadoId);
                  // Ambos clics van a la página de componentes, enfocados en el componente específico
                  navigate(`/mantenimiento/componentes?componenteId=${componenteId}&estadoId=${estadoId}`);
                });
              }}
              onCompletarOverhaul={(componenteId: string, estadoIds: string[]) => {
                console.log('✅ [DASHBOARD] Overhaul completado para componente:', componenteId, 'estados:', estadoIds);
                // Recargar datos del dashboard después del overhaul
                cargarDatosDashboard();
              }}
            />

            {/* Próximos Vencimientos */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Próximos Vencimientos (30 días)
                </h2>
              </div>
              
              {resumen?.proximosVencimientos.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">No hay vencimientos próximos en los siguientes 30 días</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Componente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aeronave
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Próxima Inspección
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resumen?.proximosVencimientos.map((componente) => (
                        <tr key={componente._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{componente.numeroSerie}</div>
                            <div className="text-sm text-gray-500">{componente.nombre}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof componente.aeronaveActual === 'string' 
                              ? componente.aeronaveActual 
                              : componente.aeronaveActual?.matricula || 'En almacén'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {componente.categoria}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {componente.proximaInspeccion ? 
                              new Date(componente.proximaInspeccion).toLocaleDateString('es-PE') : 
                              'No programada'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              componente.alertasActivas ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {componente.alertasActivas ? 'Con Alerta' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardMantenimiento;