import React from 'react';
import { IFiltrosEstadosMonitoreo, UNIDADES_MONITOREO, CRITICIDADES, ESTADOS_MONITOREO } from '../../types/estadosMonitoreoComponente';

interface FiltrosEstadosMonitoreoProps {
  filtros: IFiltrosEstadosMonitoreo;
  onAplicarFiltros: (filtros: Partial<IFiltrosEstadosMonitoreo>) => void;
  onLimpiarFiltros: () => void;
}

const FiltrosEstadosMonitoreo: React.FC<FiltrosEstadosMonitoreoProps> = ({
  filtros,
  onAplicarFiltros,
  onLimpiarFiltros
}) => {
  const handleInputChange = (campo: keyof IFiltrosEstadosMonitoreo, valor: any) => {
    onAplicarFiltros({ [campo]: valor });
  };

  const hayFiltrosActivos = () => {
    return (
      (filtros.estado && filtros.estado !== 'TODOS') ||
      (filtros.criticidad && filtros.criticidad !== 'TODAS') ||
      (filtros.unidad && filtros.unidad !== 'TODAS') ||
      filtros.alertaActiva !== undefined ||
      (filtros.busqueda && filtros.busqueda.trim() !== '')
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Filtros de Estados</h4>
        {hayFiltrosActivos() && (
          <button
            onClick={onLimpiarFiltros}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Filtro por búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            value={filtros.busqueda || ''}
            onChange={(e) => handleInputChange('busqueda', e.target.value)}
            placeholder="Control, componente..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filtros.estado || 'TODOS'}
            onChange={(e) => handleInputChange('estado', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="TODOS">Todos los estados</option>
            {ESTADOS_MONITOREO.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por criticidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Criticidad
          </label>
          <select
            value={filtros.criticidad || 'TODAS'}
            onChange={(e) => handleInputChange('criticidad', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="TODAS">Todas las criticidades</option>
            {CRITICIDADES.map((criticidad) => (
              <option key={criticidad.value} value={criticidad.value}>
                {criticidad.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por unidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad
          </label>
          <select
            value={filtros.unidad || 'TODAS'}
            onChange={(e) => handleInputChange('unidad', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="TODAS">Todas las unidades</option>
            {UNIDADES_MONITOREO.map((unidad) => (
              <option key={unidad.value} value={unidad.value}>
                {unidad.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros adicionales */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filtros.alertaActiva === true}
            onChange={(e) => handleInputChange('alertaActiva', e.target.checked ? true : undefined)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Solo con alertas activas</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filtros.alertaActiva === false}
            onChange={(e) => handleInputChange('alertaActiva', e.target.checked ? false : undefined)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Sin alertas</span>
        </label>
      </div>

      {/* Indicador de filtros activos */}
      {hayFiltrosActivos() && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          
          {filtros.estado && filtros.estado !== 'TODOS' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Estado: {ESTADOS_MONITOREO.find(e => e.value === filtros.estado)?.label}
              <button
                onClick={() => handleInputChange('estado', 'TODOS')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}

          {filtros.criticidad && filtros.criticidad !== 'TODAS' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Criticidad: {CRITICIDADES.find(c => c.value === filtros.criticidad)?.label}
              <button
                onClick={() => handleInputChange('criticidad', 'TODAS')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}

          {filtros.unidad && filtros.unidad !== 'TODAS' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Unidad: {UNIDADES_MONITOREO.find(u => u.value === filtros.unidad)?.label}
              <button
                onClick={() => handleInputChange('unidad', 'TODAS')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}

          {filtros.alertaActiva !== undefined && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {filtros.alertaActiva ? 'Con alertas' : 'Sin alertas'}
              <button
                onClick={() => handleInputChange('alertaActiva', undefined)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}

          {filtros.busqueda && filtros.busqueda.trim() !== '' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Búsqueda: "{filtros.busqueda}"
              <button
                onClick={() => handleInputChange('busqueda', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FiltrosEstadosMonitoreo;