import React, { useEffect, useState } from 'react';
import { useMonitoreoGranular, IResumenFlotaGranular, IAlertaComponente } from '../../hooks/useMonitoreoGranular';
import AlertaComponente from './AlertaComponente';
import ProtectedButton, { ProtectedClickable, useProtectedAction } from '../common/ProtectedButton';

interface MonitoreoGranularDashboardProps {
  onClickComponente?: (componenteId: string) => void;
  onClickAeronave?: (aeronaveId: string) => void;
}

const MonitoreoGranularDashboard: React.FC<MonitoreoGranularDashboardProps> = ({
  onClickComponente,
  onClickAeronave
}) => {
  const {
    resumenFlota,
    loading,
    error,
    cargarResumenFlota,
    limpiarError
  } = useMonitoreoGranular();

  const [mostrarTodasAlertas, setMostrarTodasAlertas] = useState(false);

  useEffect(() => {
    cargarResumenFlota();
  }, [cargarResumenFlota]);

  // Hook para proteger acciones
  const { executeProtected } = useProtectedAction(500); // 500ms debounce

  // Funciones para manejar clics protegidos
  const handleClickComponente = async (alerta: IAlertaComponente) => {
    await executeProtected(() => {
      if (onClickComponente) {
        onClickComponente(alerta.componenteId);
      }
    });
  };

  const handleClickAeronave = async (aeronaveId: string) => {
    await executeProtected(() => {
      if (onClickAeronave) {
        onClickAeronave(aeronaveId);
      }
    });
  };

  // Función protegida para refrescar datos
  const handleRefresh = async () => {
    await executeProtected(async () => {
      await cargarResumenFlota();
    });
  };

  // Función protegida para limpiar errores
  const handleClearError = async () => {
    await executeProtected(() => {
      limpiarError();
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error de Monitoreo</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <ProtectedButton
            onClick={handleClearError}
            className="text-red-600 hover:text-red-800 transition-colors"
            variant="custom"
            size="sm"
            title="Cerrar error"
          >
            ✕
          </ProtectedButton>
        </div>
        <ProtectedButton
          onClick={handleRefresh}
          className="mt-4"
          variant="danger"
          loadingText="Reintentando..."
        >
          Reintentar
        </ProtectedButton>
      </div>
    );
  }

  if (!resumenFlota) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <p className="text-gray-500">No hay datos de monitoreo disponibles</p>
      </div>
    );
  }

  const alertasAMostrar = mostrarTodasAlertas 
    ? resumenFlota.alertasPrioritarias 
    : resumenFlota.alertasPrioritarias.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-blue-900">📊 Monitoreo de Componentes</h2>
          <ProtectedButton
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            variant="custom"
            size="sm"
            title="Refrescar datos"
            loadingText="🔄"
          >
            🔄
          </ProtectedButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 rounded-xl p-4 text-center border border-blue-100/50">
            <div className="text-2xl font-bold text-blue-900">{resumenFlota.totalAeronaves}</div>
            <div className="text-xs text-blue-600 uppercase tracking-wider">Aeronaves</div>
          </div>
          
          <div className="bg-white/80 rounded-xl p-4 text-center border border-green-100/50">
            <div className="text-2xl font-bold text-green-900">{resumenFlota.totalComponentesMonitoreados}</div>
            <div className="text-xs text-green-600 uppercase tracking-wider">Componentes</div>
          </div>
          
          <div className="bg-white/80 rounded-xl p-4 text-center border border-orange-100/50">
            <div className="text-2xl font-bold text-orange-900">{resumenFlota.aeronavesConAlertas}</div>
            <div className="text-xs text-orange-600 uppercase tracking-wider">Con Alertas</div>
          </div>
          
          <div className="bg-white/80 rounded-xl p-4 text-center border border-red-100/50">
            <div className="text-2xl font-bold text-red-900">{resumenFlota.alertasPrioritarias.length}</div>
            <div className="text-xs text-red-600 uppercase tracking-wider">Críticas</div>
          </div>
        </div>
      </div>

      {/* Mensaje cuando no hay componentes monitoreados */}
      {resumenFlota.totalComponentesMonitoreados === 0 && (
        <div className="bg-amber-50 rounded-2xl shadow-lg p-6 border border-amber-200">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">No hay componentes monitoreados</h3>
            <p className="text-amber-700 text-sm mb-4">
              Para ver alertas de componentes, necesitas:
            </p>
            <ul className="text-amber-700 text-sm text-left space-y-1 mb-4 max-w-md mx-auto">
              <li>• Tener componentes instalados en las aeronaves</li>
              <li>• Configurar estados de monitoreo para los componentes</li>
              <li>• Establecer controles y límites de monitoreo</li>
            </ul>
            <div className="flex justify-center space-x-3">
              <ProtectedButton
                onClick={() => handleClickAeronave('')}
                variant="warning"
                size="sm"
                loadingText="Navegando..."
              >
                Gestionar Componentes
              </ProtectedButton>
            </div>
          </div>
        </div>
      )}

      {/* Alertas prioritarias de componentes */}
      {resumenFlota.alertasPrioritarias.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">🚨 Alertas Prioritarias de Componentes</h3>
            {resumenFlota.alertasPrioritarias.length > 5 && (
              <ProtectedButton
                onClick={() => executeProtected(() => {
                  setMostrarTodasAlertas(!mostrarTodasAlertas);
                })}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                variant="custom"
                size="sm"
              >
                {mostrarTodasAlertas ? 'Mostrar menos' : `Ver todas (${resumenFlota.alertasPrioritarias.length})`}
              </ProtectedButton>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alertasAMostrar.map((alerta, index) => (
              <AlertaComponente
                key={`${alerta.componenteId}-${index}`}
                alerta={alerta}
onClick={() => handleClickComponente(alerta)}
                compact={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resumen por aeronave */}
      {resumenFlota.aeronaves.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">✈️ Estado por Aeronave</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumenFlota.aeronaves
              .filter(aeronave => aeronave.alertasComponentes.length > 0)
              .sort((a, b) => b.resumen.componentesCriticos - a.resumen.componentesCriticos)
              .slice(0, 6)
              .map(aeronave => (
                <ProtectedClickable
                  key={aeronave.aeronaveId}
                  className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
                  onClick={() => handleClickAeronave(aeronave.aeronaveId)}
                  debounceMs={500}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{aeronave.matricula}</h4>
                      <p className="text-xs text-gray-600">{aeronave.tipo} • {aeronave.modelo}</p>
                    </div>
                    {aeronave.resumen.componentesCriticos > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                        {aeronave.resumen.componentesCriticos} críticos
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{aeronave.resumen.componentesOk}</div>
                      <div className="text-gray-500">OK</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-yellow-600">{aeronave.resumen.componentesProximos}</div>
                      <div className="text-gray-500">Próximos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">{aeronave.resumen.componentesVencidos}</div>
                      <div className="text-gray-500">Vencidos</div>
                    </div>
                  </div>
                </ProtectedClickable>
              ))}
          </div>
        </div>
      )}

      {/* Timestamp de actualización */}
      <div className="text-center text-xs text-gray-500">
        Última actualización: {new Date(resumenFlota.generadoEn).toLocaleString('es-ES')}
      </div>
    </div>
  );
};

export default MonitoreoGranularDashboard;