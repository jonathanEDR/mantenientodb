import React from 'react';
import { ICatalogoControlMonitoreo } from '../../types/herramientas';

interface CatalogoControlMonitoreoTablaProps {
  elementos: ICatalogoControlMonitoreo[];
  onEditar: (elemento: ICatalogoControlMonitoreo) => void;
  onEliminar: (id: string) => void;
  isLoading?: boolean;
}

const CatalogoControlMonitoreoTabla: React.FC<CatalogoControlMonitoreoTablaProps> = ({
  elementos,
  onEditar,
  onEliminar,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (elementos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No hay elementos en el catálogo</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción/Código
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hora Inicial
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hora Final
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {elementos.map((elemento) => (
            <tr key={elemento._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {elemento.descripcionCodigo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {elemento.horaInicial} hrs
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {elemento.horaFinal} hrs
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    elemento.estado === 'ACTIVO'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {elemento.estado}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEditar(elemento)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Editar
                </button>
                <button
                  onClick={() => elemento._id && onEliminar(elemento._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CatalogoControlMonitoreoTabla;