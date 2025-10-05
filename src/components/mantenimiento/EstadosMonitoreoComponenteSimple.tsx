import React from 'react';
import { useEstadosMonitoreoSimple } from '../../hooks/useEstadosMonitoreoSimple';

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
    estados,
    loading,
    error,
    actualizarEstados
  } = useEstadosMonitoreoSimple(componenteId);



  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Cargando estados de monitoreo...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  // Calcular estadísticas simples
  const estadisticas = {
    total: estados.length,
    ok: estados.filter(e => e.estado === 'OK').length,
    proximos: estados.filter(e => e.estado === 'PROXIMO').length,
    vencidos: estados.filter(e => e.estado === 'VENCIDO').length,
    conAlertas: estados.filter(e => e.alertaActiva).length
  };

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Estados de Monitoreo</h3>
        <p className="text-sm text-gray-600">{numeroSerie} - {nombreComponente}</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
          <div className="text-sm font-medium text-blue-600">Total Estados</div>
          <div className="text-lg font-bold text-blue-900">{estadisticas.total}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
          <div className="text-sm font-medium text-green-600">Al Día</div>
          <div className="text-lg font-bold text-green-900">{estadisticas.ok}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
          <div className="text-sm font-medium text-yellow-600">Próximos</div>
          <div className="text-lg font-bold text-yellow-900">{estadisticas.proximos}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
          <div className="text-sm font-medium text-red-600">Vencidos</div>
          <div className="text-lg font-bold text-red-900">{estadisticas.vencidos}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
          <div className="text-sm font-medium text-orange-600">Con Alertas</div>
          <div className="text-lg font-bold text-orange-900">{estadisticas.conAlertas}</div>
        </div>
      </div>

      {/* Botón actualizar */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={actualizarEstados}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Lista de estados */}
      {estados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">No hay estados de monitoreo</p>
          <p className="text-gray-400 text-sm">Agregue el primer estado de monitoreo para este componente</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CONTROL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROGRESO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTADO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRÓXIMA REVISIÓN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRITICIDAD</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estados.map((estado) => (
                <tr key={estado._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Control: {typeof estado.catalogoControlId === 'string' ? estado.catalogoControlId : estado.catalogoControlId._id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {estado.unidad}: {estado.valorActual}/{estado.valorLimite}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (estado.valorActual / estado.valorLimite) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((estado.valorActual / estado.valorLimite) * 100)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${{
                      'OK': 'bg-green-100 text-green-800',
                      'PROXIMO': 'bg-yellow-100 text-yellow-800',
                      'VENCIDO': 'bg-red-100 text-red-800',
                      'OVERHAUL_REQUERIDO': 'bg-purple-100 text-purple-800'
                    }[estado.estado] || 'bg-gray-100 text-gray-800'}`}>
                      {estado.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {estado.fechaProximaRevision ? new Date(estado.fechaProximaRevision).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {estado.configuracionPersonalizada?.criticidad && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${{
                        'ALTA': 'bg-red-100 text-red-800',
                        'MEDIA': 'bg-yellow-100 text-yellow-800',
                        'BAJA': 'bg-green-100 text-green-800',
                        'CRITICA': 'bg-red-100 text-red-800'
                      }[estado.configuracionPersonalizada.criticidad] || 'bg-gray-100 text-gray-800'}`}>
                        {estado.configuracionPersonalizada.criticidad}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EstadosMonitoreoComponente;