import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMonitoreoFlota } from '../hooks/monitoreo';
import DashboardLayout from '../components/layout/DashboardLayout';
import { EstadoMonitoreoPreview, AlertaMonitoreo } from '../components/monitoreo';
import { 
  EstadoAlerta, 
  TipoAlerta, 
  IResumenMonitoreoAeronave,
  IAlertaMonitoreo
} from '../types/monitoreo';
import {
  calcularNivelCriticidad,
  formatearHoras,
  generarResumenTextual,
  exportarMonitoreoCSV
} from '../utils/monitoreoUtils';

interface FiltrosMonitoreo {
  busqueda: string;
  estadosSeleccionados: EstadoAlerta[];
  tiposAlertaSeleccionados: TipoAlerta[];
  soloConAlertas: boolean;
  ordenPor: 'alfabetico' | 'criticidad' | 'horas';
}

const MonitoreoFlota: React.FC = () => {
  // Obtener parámetros de la URL
  const [searchParams] = useSearchParams();
  const matriculaURL = searchParams.get('matricula');

  // Estado del monitoreo
  const {
    resumenFlota,
    aeronavesFiltrasdas,
    aplicarFiltros,
    estadisticas,
    loading,
    error,
    refetch,
    obtenerAeronavesOrdenadas
  } = useMonitoreoFlota();

  // Estados locales
  const [filtros, setFiltros] = useState<FiltrosMonitoreo>({
    busqueda: matriculaURL || '',
    estadosSeleccionados: [],
    tiposAlertaSeleccionados: [],
    soloConAlertas: false,
    ordenPor: 'criticidad'
  });

  // Efecto para actualizar filtros cuando cambie la URL
  useEffect(() => {
    if (matriculaURL && matriculaURL !== filtros.busqueda) {
      setFiltros(prev => ({ ...prev, busqueda: matriculaURL }));
    }
  }, [matriculaURL]);

  const [aeronaveSeleccionada, setAeronaveSeleccionada] = useState<IResumenMonitoreoAeronave | null>(null);
  const [mostrarDetalleAlerta, setMostrarDetalleAlerta] = useState<IAlertaMonitoreo | null>(null);
  const [vistaActual, setVistaActual] = useState<'tarjetas' | 'lista'>('tarjetas');

  // Aplicar filtros cuando cambien
  useMemo(() => {
    aplicarFiltros({
      soloConAlertas: filtros.soloConAlertas,
      estadosPermitidos: filtros.estadosSeleccionados.length > 0 ? filtros.estadosSeleccionados : undefined,
      tiposAlertaPermitidos: filtros.tiposAlertaSeleccionados.length > 0 ? filtros.tiposAlertaSeleccionados : undefined
    });
  }, [filtros, aplicarFiltros]);

  // Filtrar y ordenar aeronaves
  const aeronavesProcessadas = useMemo(() => {
    let aeronaves = obtenerAeronavesOrdenadas(filtros.ordenPor);

    // Filtro por búsqueda
    if (filtros.busqueda) {
      aeronaves = aeronaves.filter(aeronave =>
        aeronave.matricula.toLowerCase().includes(filtros.busqueda.toLowerCase())
      );
    }

    return aeronaves;
  }, [aeronavesFiltrasdas, filtros, obtenerAeronavesOrdenadas]);

  // Función para exportar datos
  const handleExportarCSV = () => {
    if (resumenFlota) {
      const csvData = exportarMonitoreoCSV(resumenFlota);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monitoreo-flota-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  // Función para renderizar el header con estadísticas
  const renderHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoreo de Flota</h1>
          <p className="text-gray-600 mt-1">
            Estado general del mantenimiento preventivo
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refetch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
          <button
            onClick={handleExportarCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">
            {estadisticas.totalAeronaves}
          </div>
          <div className="text-sm text-blue-600">Total Aeronaves</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-900">
            {estadisticas.promedioSalud}%
          </div>
          <div className="text-sm text-green-600">Salud Promedio</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-900">
            {estadisticas.totalAlertasCriticas}
          </div>
          <div className="text-sm text-red-600">Alertas Críticas</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-900">
            {estadisticas.totalAlertasProximas}
          </div>
          <div className="text-sm text-yellow-600">Próximas a Vencer</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-900">
            {estadisticas.aeronavesConProblemas}
          </div>
          <div className="text-sm text-purple-600">Requieren Atención</div>
        </div>
      </div>
    </div>
  );

  // Función para renderizar los filtros
  const renderFiltros = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar Matrícula
          </label>
          <input
            type="text"
            value={filtros.busqueda}
            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
            placeholder="Ej: XA-ABC"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estados
          </label>
          <select
            multiple
            value={filtros.estadosSeleccionados}
            onChange={(e) => {
              const valores = Array.from(e.target.selectedOptions, option => option.value as EstadoAlerta);
              setFiltros({ ...filtros, estadosSeleccionados: valores });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={EstadoAlerta.VENCIDO}>Vencido</option>
            <option value={EstadoAlerta.PROXIMO}>Próximo</option>
            <option value={EstadoAlerta.OK}>Al día</option>
          </select>
        </div>

        {/* Ordenar por */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            value={filtros.ordenPor}
            onChange={(e) => setFiltros({ ...filtros, ordenPor: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="criticidad">Criticidad</option>
            <option value="alfabetico">Matrícula</option>
            <option value="horas">Horas de Vuelo</option>
          </select>
        </div>

        {/* Opciones adicionales */}
        <div className="flex flex-col space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filtros.soloConAlertas}
              onChange={(e) => setFiltros({ ...filtros, soloConAlertas: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Solo con alertas</span>
          </label>
          
          <div className="flex items-center space-x-2 mt-2">
            <button
              onClick={() => setVistaActual('tarjetas')}
              className={`p-2 rounded ${vistaActual === 'tarjetas' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setVistaActual('lista')}
              className={`p-2 rounded ${vistaActual === 'lista' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Función para renderizar la vista de tarjetas
  const renderVistaTarjetas = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {aeronavesProcessadas.map((aeronave) => (
        <EstadoMonitoreoPreview
          key={aeronave.aeronaveId}
          resumen={aeronave}
          onClickAlerta={(alerta) => setMostrarDetalleAlerta(alerta)}
          onClickDetalle={(matricula) => setAeronaveSeleccionada(aeronave)}
        />
      ))}
    </div>
  );

  // Función para renderizar la vista de lista
  const renderVistaLista = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aeronave
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alertas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salud
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {aeronavesProcessadas.map((aeronave) => {
              const nivelCriticidad = calcularNivelCriticidad(aeronave);
              const resumenTextual = generarResumenTextual(aeronave);
              const porcentajeSalud = Math.round(((aeronave.alertasOk / aeronave.totalAlertas) * 100) || 0);

              return (
                <tr key={aeronave.aeronaveId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        nivelCriticidad === EstadoAlerta.VENCIDO
                          ? 'bg-red-500'
                          : nivelCriticidad === EstadoAlerta.PROXIMO
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`} />
                      <div className="text-sm font-medium text-gray-900">
                        {aeronave.matricula}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      nivelCriticidad === EstadoAlerta.VENCIDO
                        ? 'bg-red-100 text-red-800'
                        : nivelCriticidad === EstadoAlerta.PROXIMO
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {resumenTextual}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearHoras(aeronave.horasVueloActuales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      {aeronave.alertasCriticas > 0 && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                          {aeronave.alertasCriticas} críticas
                        </span>
                      )}
                      {aeronave.alertasProximas > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          {aeronave.alertasProximas} próximas
                        </span>
                      )}
                      {aeronave.alertasCriticas === 0 && aeronave.alertasProximas === 0 && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Al día
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            porcentajeSalud >= 80 ? 'bg-green-500' : porcentajeSalud >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${porcentajeSalud}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">
                        {porcentajeSalud}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setAeronaveSeleccionada(aeronave)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading && !resumenFlota) {
    return (
      <DashboardLayout title="Monitoreo de Flota">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-gray-600">Cargando monitoreo de flota...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Monitoreo de Flota">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">Error al cargar el monitoreo</div>
          <div className="text-red-500 text-sm mb-4">{error.message}</div>
          <button
            onClick={refetch}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Monitoreo de Flota">
      <div className="space-y-6">
        {renderHeader()}
        {renderFiltros()}
        
        {aeronavesProcessadas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-500 text-lg">No se encontraron aeronaves</div>
            <div className="text-gray-400 mt-2">
              Prueba ajustando los filtros de búsqueda
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Mostrando {aeronavesProcessadas.length} de {estadisticas.totalAeronaves} aeronaves
              </div>
            </div>
            
            {vistaActual === 'tarjetas' ? renderVistaTarjetas() : renderVistaLista()}
          </>
        )}

      {/* Modal de detalle de aeronave */}
      {aeronaveSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalle de Monitoreo - {aeronaveSeleccionada.matricula}
                </h2>
                <button
                  onClick={() => setAeronaveSeleccionada(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <EstadoMonitoreoPreview
                resumen={aeronaveSeleccionada}
                onClickAlerta={(alerta) => setMostrarDetalleAlerta(alerta)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle de alerta */}
      {mostrarDetalleAlerta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Detalle de Alerta
                </h2>
                <button
                  onClick={() => setMostrarDetalleAlerta(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <AlertaMonitoreo
                alerta={mostrarDetalleAlerta}
                tamano="grande"
                mostrarPorcentaje={true}
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default MonitoreoFlota;