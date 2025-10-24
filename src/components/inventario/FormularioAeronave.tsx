import React from 'react';
import { IAeronave, ICrearAeronaveData } from '../../types/inventario';

interface FormularioAeronaveProps {
  formulario: ICrearAeronaveData;
  aeronaveEditando: IAeronave | null;
  loading: boolean;
  onCambio: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onEnvio: (e: React.FormEvent) => void;
  onCerrar: () => void;
}

const FormularioAeronave: React.FC<FormularioAeronaveProps> = ({
  formulario,
  aeronaveEditando,
  loading,
  onCambio,
  onEnvio,
  onCerrar
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {aeronaveEditando ? 'Editar Aeronave' : 'Nueva Aeronave'}
          </h3>
        </div>

        <form onSubmit={onEnvio} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matrícula *
              </label>
              <input
                type="text"
                name="matricula"
                value={formulario.matricula}
                onChange={onCambio}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ej: LV-ABC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                name="tipo"
                value={formulario.tipo}
                onChange={onCambio}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Helicóptero">Helicóptero</option>
                <option value="Avión">Avión</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo *
              </label>
              <input
                type="text"
                name="modelo"
                value={formulario.modelo}
                onChange={onCambio}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ej: Bell 206"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fabricante *
              </label>
              <input
                type="text"
                name="fabricante"
                value={formulario.fabricante}
                onChange={onCambio}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ej: Bell Helicopter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año de Fabricación *
              </label>
              <input
                type="number"
                name="anoFabricacion"
                value={formulario.anoFabricacion || ''}
                onChange={onCambio}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                placeholder={`Ej: ${new Date().getFullYear()}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={formulario.estado}
                onChange={onCambio}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Operativo">Operativo</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
                <option value="En Reparación">En Reparación</option>
                <option value="Inoperativo por Reportaje">Inoperativo por Reportaje</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación Actual *
              </label>
              <input
                type="text"
                name="ubicacionActual"
                value={formulario.ubicacionActual}
                onChange={onCambio}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ej: Hangar A - Base Principal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas de Vuelo
              </label>
              <input
                type="number"
                name="horasVuelo"
                value={formulario.horasVuelo || 0}
                onChange={onCambio}
                min="0"
                step="0.1"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formulario.observaciones}
              onChange={onCambio}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (aeronaveEditando ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioAeronave;