import React, { useState } from 'react';
import { IAeronaveCardProps } from '../../types/inventario/index';
import { useResumenMonitoreo } from '../../hooks/monitoreo';
import { EstadoMonitoreoCompacto, AlertaCompacta } from '../monitoreo';
import { EstadoAlerta } from '../../types/monitoreo';
import { obtenerAlertasPrioritarias, calcularNivelCriticidad } from '../../utils/monitoreoUtils';

const AeronaveCard: React.FC<IAeronaveCardProps> = ({
  aeronave,
  onVerComponentes,
  onEditar,
  onEliminar,
  onGestionarHoras,
  obtenerColorEstado,
  onVerMonitoreo,
  onConfigurarMonitoreo
}) => {
  const [mostrarMonitoreo, setMostrarMonitoreo] = useState(true);
  const { resumen, loading: loadingMonitoreo } = useResumenMonitoreo(aeronave.matricula);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden group">
      {/* Header de la tarjeta */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{aeronave.matricula}</h3>
            <p className="text-sm text-gray-600">{aeronave.fabricante}</p>
          </div>
          <div className="flex items-center space-x-1">
            {aeronave.tipo === 'Helicóptero' ? (
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6 space-y-4">
        {/* Modelo y año */}
        <div>
          <div className="text-lg font-semibold text-gray-900">{aeronave.modelo}</div>
          <div className="text-sm text-gray-500">Año {aeronave.anoFabricacion} • {aeronave.tipo}</div>
        </div>

        {/* Estado */}
        <div className="flex items-center justify-center">
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(aeronave.estado)}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              aeronave.estado === 'Operativo' ? 'bg-green-400' :
              aeronave.estado === 'En Mantenimiento' ? 'bg-yellow-400' :
              'bg-red-400'
            }`}></div>
            {aeronave.estado}
          </span>
        </div>

        {/* Información adicional */}
        <div className="space-y-3">
          {/* Ubicación */}
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-600 truncate">{aeronave.ubicacionActual}</span>
          </div>

          {/* Horas de vuelo */}
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">{aeronave.horasVuelo.toLocaleString()} horas de vuelo</span>
          </div>

          {/* Observaciones (si existen) */}
          {aeronave.observaciones && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 line-clamp-2">{aeronave.observaciones}</p>
            </div>
          )}
        </div>

        {/* Sección de Monitoreo */}
        {mostrarMonitoreo && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Estado de Monitoreo
              </h4>
              <button
                onClick={() => setMostrarMonitoreo(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Ocultar monitoreo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingMonitoreo ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm text-gray-500">Cargando monitoreo...</span>
              </div>
            ) : resumen ? (
              <div className="space-y-3">
                {/* Indicador de estado general */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      calcularNivelCriticidad(resumen) === EstadoAlerta.VENCIDO
                        ? 'bg-red-500 animate-pulse'
                        : calcularNivelCriticidad(resumen) === EstadoAlerta.PROXIMO
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {resumen.alertasCriticas > 0
                          ? 'Requiere Atención'
                          : resumen.alertasProximas > 0
                            ? 'Monitorear'
                            : 'Al Día'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {resumen.totalAlertas} control{resumen.totalAlertas !== 1 ? 'es' : ''} monitoreado{resumen.totalAlertas !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {Math.round(((resumen.alertasOk / resumen.totalAlertas) * 100) || 0)}%
                    </div>
                    <div className="text-xs text-gray-500">Salud</div>
                  </div>
                </div>

                {/* Alertas prioritarias */}
                {(resumen.alertasCriticas > 0 || resumen.alertasProximas > 0) && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      Alertas Prioritarias:
                    </div>
                    {obtenerAlertasPrioritarias(resumen.alertas || []).slice(0, 2).map((alerta, index) => (
                      <AlertaCompacta
                        key={`${alerta.descripcionCodigo}-${index}`}
                        alerta={alerta}
                      />
                    ))}
                    {(resumen.alertasCriticas + resumen.alertasProximas) > 2 && (
                      <div className="text-xs text-blue-600 text-center">
                        +{(resumen.alertasCriticas + resumen.alertasProximas) - 2} alerta{((resumen.alertasCriticas + resumen.alertasProximas) - 2) !== 1 ? 's' : ''} más
                      </div>
                    )}
                  </div>
                )}

                {/* Botón para ver detalles */}
                <button
                  onClick={() => onVerMonitoreo?.(aeronave.matricula)}
                  className="w-full text-center text-xs text-blue-600 hover:text-blue-800 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Ver detalles del monitoreo
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500 mb-2">
                  No hay datos de monitoreo disponibles
                </div>
                <button
                  onClick={() => onConfigurarMonitoreo?.(aeronave.matricula)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Configurar monitoreo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Botón para mostrar monitoreo si está oculto */}
        {!mostrarMonitoreo && (
          <div className="border-t border-gray-200 pt-3">
            <button
              onClick={() => setMostrarMonitoreo(true)}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mostrar monitoreo
            </button>
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2">
          {/* Primera fila */}
          <button
            onClick={() => onVerComponentes(aeronave)}
            className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span>Componentes</span>
          </button>
          <button
            onClick={() => onGestionarHoras(aeronave)}
            className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Horas</span>
          </button>
          
          {/* Segunda fila */}
          <button
            onClick={() => onEditar(aeronave)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar</span>
          </button>
          <button
            onClick={() => onEliminar(aeronave)}
            className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AeronaveCard;