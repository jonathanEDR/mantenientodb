import React from 'react';
import { CatalogoComponentesFiltros, EstadoCatalogo, getEstadoLabel } from '../../types/herramientas';

interface CatalogoComponentesFiltrosProps {
  filtros: CatalogoComponentesFiltros;
  onFiltrosChange: (filtros: CatalogoComponentesFiltros) => void;
  onLimpiarFiltros: () => void;
}

const CatalogoComponentesFiltrosComponent: React.FC<CatalogoComponentesFiltrosProps> = ({
  filtros,
  onFiltrosChange,
  onLimpiarFiltros
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFiltrosChange({
      ...filtros,
      [name]: value
    });
  };

  const hayFiltrosActivos = filtros.busqueda || filtros.estado;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Búsqueda general */}
        <div>
          <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            id="busqueda"
            name="busqueda"
            value={filtros.busqueda || ''}
            onChange={handleInputChange}
            placeholder="Buscar por código o descripción..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            value={filtros.estado || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {Object.values(EstadoCatalogo).map((estado) => (
              <option key={estado} value={estado}>
                {getEstadoLabel(estado)}
              </option>
            ))}
          </select>
        </div>

        {/* Botón limpiar filtros */}
        <div className="flex items-end">
          <button
            onClick={onLimpiarFiltros}
            disabled={!hayFiltrosActivos}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {hayFiltrosActivos && (
        <div className="mt-3 text-sm text-gray-600">
          Filtros activos: {filtros.busqueda && `Búsqueda: "${filtros.busqueda}"`}
          {filtros.busqueda && filtros.estado && ', '}
          {filtros.estado && `Estado: ${getEstadoLabel(filtros.estado)}`}
        </div>
      )}
    </div>
  );
};

export default CatalogoComponentesFiltrosComponent;