import React from 'react';
import { ICatalogoComponente, getEstadoLabel, getEstadoColor } from '../../types/herramientas';

interface CatalogoComponentesTableProps {
  elementos: ICatalogoComponente[];
  loading: boolean;
  onEdit: (elemento: ICatalogoComponente) => void;
  onDelete: (elemento: ICatalogoComponente) => void;
}

const CatalogoComponentesTable: React.FC<CatalogoComponentesTableProps> = ({
  elementos,
  loading,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando elementos...</span>
        </div>
      </div>
    );
  }

  if (elementos.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="text-center text-gray-500">
          <p>No hay elementos en el catálogo</p>
          <p className="text-sm mt-2">Usa el botón "Nuevo Elemento" para agregar el primer elemento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {elementos.map((elemento) => (
              <tr key={elemento._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {elemento.codigo}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {elemento.descripcion}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(elemento.estado)}`}>
                    {getEstadoLabel(elemento.estado)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {elemento.createdAt ? new Date(elemento.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(elemento)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Editar elemento"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(elemento)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Eliminar elemento"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogoComponentesTable;