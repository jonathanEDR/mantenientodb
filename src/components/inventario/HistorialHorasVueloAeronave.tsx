import React, { useState, useEffect } from 'react';
import {
  historialHorasVueloService,
  IHistorialHorasVueloResponse,
  IFiltrosHistorialHoras
} from '../../services/historialHorasVueloService';

interface Props {
  aeronaveId: string;
  matricula: string;
  isOpen: boolean;
  onClose: () => void;
}

const HistorialHorasVueloAeronave: React.FC<Props> = ({
  aeronaveId,
  matricula,
  isOpen,
  onClose
}) => {
  const [historialData, setHistorialData] = useState<IHistorialHorasVueloResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<IFiltrosHistorialHoras>({
    limite: 50
  });

  // Cargar historial al abrir el modal
  useEffect(() => {
    if (isOpen && aeronaveId) {
      cargarHistorial();
    }
  }, [isOpen, aeronaveId, filtros]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await historialHorasVueloService.obtenerHistorialHorasVuelo(aeronaveId, filtros);
      setHistorialData(response);
    } catch (err: any) {
      console.error('Error al cargar historial de horas:', err);
      setError(err.message || 'Error al cargar el historial de horas de vuelo');
      setHistorialData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroMotivo = (motivo: string) => {
    setFiltros(prev => ({
      ...prev,
      motivo: prev.motivo === motivo ? undefined : motivo as any
    }));
  };

  const clearFiltros = () => {
    setFiltros({
      limite: 50
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Historial de Horas de Vuelo
              </h2>
              <p className="text-blue-100 mt-1">
                Aeronave: <span className="font-semibold">{matricula}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Estadísticas y Filtros */}
        {historialData && (
          <div className="bg-gray-50 p-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">Horas Actuales</div>
                <div className="text-2xl font-bold text-blue-600">
                  {historialHorasVueloService.formatearHoras(historialData.data.aeronave.horasActuales)}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">Total Registros</div>
                <div className="text-2xl font-bold text-green-600">
                  {historialData.data.estadisticas.totalRegistros}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">Horas Acumuladas</div>
                <div className="text-2xl font-bold text-purple-600">
                  {historialHorasVueloService.formatearHoras(historialData.data.estadisticas.totalHorasAcumuladas)}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">Promedio por Vuelo</div>
                <div className="text-2xl font-bold text-orange-600">
                  {historialHorasVueloService.formatearHoras(historialData.data.estadisticas.promedioIncrementoPorVuelo)}
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Filtrar por motivo:</span>
              {['VUELO', 'MANTENIMIENTO', 'INSPECCION', 'OVERHAUL', 'CORRECCION', 'OTROS'].map(motivo => (
                <button
                  key={motivo}
                  onClick={() => handleFiltroMotivo(motivo)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filtros.motivo === motivo
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`}
                >
                  {historialHorasVueloService.formatearMotivo(motivo)}
                </button>
              ))}
              
              {filtros.motivo && (
                <button
                  onClick={clearFiltros}
                  className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                >
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contenido del historial */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando historial...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {historialData && historialData.data.historial.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No se encontraron registros en el historial de horas de vuelo</p>
            </div>
          )}

          {historialData && historialData.data.historial.length > 0 && (
            <div className="space-y-4">
              {historialData.data.historial.map((entrada, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          historialHorasVueloService.obtenerColorMotivo(entrada.motivo)
                        }`}>
                          {historialHorasVueloService.formatearMotivo(entrada.motivo)}
                        </span>
                        
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          historialHorasVueloService.obtenerColorIncremento(entrada.incremento)
                        }`}>
                          {historialHorasVueloService.formatearIncremento(entrada.incremento)} horas
                        </span>
                        
                        <span className="text-sm text-gray-500">
                          {historialHorasVueloService.formatearTiempoTranscurrido(entrada.fecha)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Horas anteriores:</span>
                          <span className="ml-1 font-medium">
                            {historialHorasVueloService.formatearHoras(entrada.horasAnteriores)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Horas nuevas:</span>
                          <span className="ml-1 font-medium">
                            {historialHorasVueloService.formatearHoras(entrada.horasNuevas)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Registrado por:</span>
                          <span className="ml-1 font-medium">{entrada.usuarioNombre || entrada.usuario}</span>
                        </div>
                      </div>

                      {entrada.observacion && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="text-gray-600">Observación:</span>
                          <span className="ml-1">{entrada.observacion}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 md:mt-0 md:ml-4 text-right">
                      <div className="text-xs text-gray-500">
                        {historialHorasVueloService.formatearFecha(entrada.fecha)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {historialData && (
                <>Mostrando {historialData.data.historial.length} registros</>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialHorasVueloAeronave;