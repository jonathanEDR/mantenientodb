import React from 'react';
import { IAeronaveListProps } from '../../types/inventario/index';
import AeronaveCard from './AeronaveCard';

const AeronaveList: React.FC<IAeronaveListProps> = ({
  aeronaves,
  vistaEnTarjetas,
  onVerComponentes,
  onEditar,
  onEliminar,
  onGestionarHoras,
  obtenerColorEstado,
  onVerMonitoreo,
  onConfigurarMonitoreo
}) => {
  if (aeronaves.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">No se encontraron aeronaves</p>
        <p className="text-gray-400 mt-2">Agrega tu primera aeronave para comenzar</p>
      </div>
    );
  }

  return (
    <>
      {/* Header de lista */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          Lista de Aeronaves ({aeronaves.length})
        </h2>
      </div>

      {vistaEnTarjetas ? (
        /* Vista de tarjetas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {aeronaves.map((aeronave) => (
            <AeronaveCard
              key={aeronave._id}
              aeronave={aeronave}
              onVerComponentes={onVerComponentes}
              onEditar={onEditar}
              onEliminar={onEliminar}
              onGestionarHoras={onGestionarHoras}
              obtenerColorEstado={obtenerColorEstado}
              onVerMonitoreo={onVerMonitoreo}
              onConfigurarMonitoreo={onConfigurarMonitoreo}
            />
          ))}
        </div>
      ) : (
        /* Vista de tabla */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matrícula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas de Vuelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aeronaves.map((aeronave) => (
                  <tr key={aeronave._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{aeronave.matricula}</div>
                      <div className="text-sm text-gray-500">{aeronave.fabricante}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{aeronave.tipo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{aeronave.modelo}</div>
                      <div className="text-sm text-gray-500">Año {aeronave.anoFabricacion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(aeronave.estado)}`}>
                        {aeronave.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {aeronave.ubicacionActual}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {aeronave.horasVuelo.toLocaleString()} h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => onVerComponentes(aeronave)}
                        className="text-green-600 hover:text-green-900"
                        title="Ver componentes"
                      >
                        Componentes
                      </button>
                      <button
                        onClick={() => onGestionarHoras(aeronave)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Gestionar horas"
                      >
                        Horas
                      </button>
                      <button
                        onClick={() => onEditar(aeronave)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar aeronave"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onEliminar(aeronave)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar aeronave"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default AeronaveList;