import React, { useState } from 'react';
import { IEstadoMonitoreoComponente, IFormEstadoMonitoreo } from '../../types/estadosMonitoreoComponente';
import { useEstadosMonitoreoComponente } from '../../hooks/useEstadosMonitoreoComponente';
import { obtenerColorEstado, obtenerColorCriticidad, formatearFechaMonitoreo } from '../../utils/estadosMonitoreoComponenteApi';
import ModalEstadoMonitoreo from './ModalEstadoMonitoreo';
import FiltrosEstadosMonitoreo from './FiltrosEstadosMonitoreo';

interface EstadosMonitoreoComponenteProps {
  componenteId: string;
  numeroSerie: string;
  nombreComponente: string;
  className?: string;
}

const EstadosMonitoreoComponente: React.FC<EstadosMonitoreoComponenteProps> = ({
  componenteId,
  numeroSerie,
  nombreComponente,
  className = ''
}) => {
  const {
    estadosFiltrados,
    loading,
    error,
    filtros,
    crearEstado,
    actualizarEstado,
    eliminarEstado,
    aplicarFiltros,
    limpiarFiltros,
    obtenerEstadisticas,
    refrescar
  } = useEstadosMonitoreoComponente(componenteId);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [estadoEditando, setEstadoEditando] = useState<IEstadoMonitoreoComponente | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const estadisticas = obtenerEstadisticas();

  const handleCrearEstado = () => {
    setEstadoEditando(null);
    setModalAbierto(true);
  };

  const handleEditarEstado = (estado: IEstadoMonitoreoComponente) => {
    setEstadoEditando(estado);
    setModalAbierto(true);
  };

  const handleGuardarEstado = async (datos: IFormEstadoMonitoreo) => {
    let exito = false;

    if (estadoEditando) {
      // Actualizar estado existente
      exito = await actualizarEstado(estadoEditando._id, datos);
    } else {
      // Crear nuevo estado
      exito = await crearEstado(componenteId, datos);
    }

    if (exito) {
      setModalAbierto(false);
      setEstadoEditando(null);
    }

    return exito;
  };

  const handleEliminarEstado = async (estadoId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este estado de monitoreo?')) {
      await eliminarEstado(estadoId);
    }
  };

  const renderEstadisticas = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="text-lg font-bold text-blue-900">{estadisticas.total}</div>
        <div className="text-xs text-blue-600">Total Estados</div>
      </div>
      <div className="bg-green-50 rounded-lg p-3">
        <div className="text-lg font-bold text-green-900">{estadisticas.ok}</div>
        <div className="text-xs text-green-600">Al Día</div>
      </div>
      <div className="bg-yellow-50 rounded-lg p-3">
        <div className="text-lg font-bold text-yellow-900">{estadisticas.proximos}</div>
        <div className="text-xs text-yellow-600">Próximos</div>
      </div>
      <div className="bg-red-50 rounded-lg p-3">
        <div className="text-lg font-bold text-red-900">{estadisticas.vencidos}</div>
        <div className="text-xs text-red-600">Vencidos</div>
      </div>
      <div className="bg-orange-50 rounded-lg p-3">
        <div className="text-lg font-bold text-orange-900">{estadisticas.conAlertas}</div>
        <div className="text-xs text-orange-600">Con Alertas</div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Estados de Monitoreo
        </h3>
        <p className="text-sm text-gray-600">
          {numeroSerie} - {nombreComponente}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            mostrarFiltros 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filtros
        </button>
        <button
          onClick={refrescar}
          disabled={loading}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <svg className={`w-4 h-4 inline mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
        <button
          onClick={handleCrearEstado}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Estado
        </button>
      </div>
    </div>
  );

  const renderTablaEstados = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Control
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progreso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Próxima Revisión
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criticidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estadosFiltrados.map((estado) => {
              const catalogoControl = typeof estado.catalogoControlId === 'object' 
                ? estado.catalogoControlId 
                : null;
              const porcentajeProgreso = Math.min((estado.valorActual / estado.valorLimite) * 100, 100);
              
              return (
                <tr key={estado._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {catalogoControl?.descripcionCodigo || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {estado.valorActual} / {estado.valorLimite} {estado.unidad.toLowerCase()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          estado.estado === 'VENCIDO' ? 'bg-red-500' :
                          estado.estado === 'PROXIMO' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${porcentajeProgreso}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {porcentajeProgreso.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${obtenerColorEstado(estado.estado)}`}>
                      {estado.estado === 'OK' ? 'Al día' : 
                       estado.estado === 'PROXIMO' ? 'Próximo' : 'Vencido'}
                    </span>
                    {estado.alertaActiva && (
                      <div className="text-xs text-red-600 mt-1">
                        🔔 Alerta activa
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFechaMonitoreo(estado.fechaProximaRevision)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      obtenerColorCriticidad(estado.configuracionPersonalizada?.criticidad || 'MEDIA')
                    }`}>
                      {estado.configuracionPersonalizada?.criticidad || 'MEDIA'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditarEstado(estado)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarEstado(estado._id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {estadosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No hay estados de monitoreo</div>
          <div className="text-gray-400 mt-2">
            {estadosFiltrados.length !== estadisticas.total 
              ? 'Prueba ajustando los filtros de búsqueda'
              : 'Agrega el primer estado de monitoreo para este componente'
            }
          </div>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-red-600 font-medium">Error</div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
        <button
          onClick={refrescar}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {renderHeader()}
      
      {mostrarFiltros && (
        <FiltrosEstadosMonitoreo
          filtros={filtros}
          onAplicarFiltros={aplicarFiltros}
          onLimpiarFiltros={limpiarFiltros}
        />
      )}
      
      {renderEstadisticas()}
      
      {loading && estadisticas.total === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Cargando estados de monitoreo...</span>
        </div>
      ) : (
        renderTablaEstados()
      )}

      {/* Modal para crear/editar estado */}
      <ModalEstadoMonitoreo
        abierto={modalAbierto}
        estado={estadoEditando}
        onCerrar={() => {
          setModalAbierto(false);
          setEstadoEditando(null);
        }}
        onGuardar={handleGuardarEstado}
        loading={loading}
      />
    </div>
  );
};

export default EstadosMonitoreoComponente;