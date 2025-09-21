import React, { useState } from 'react';
import { IAeronave, IGestionHorasData, IActualizacionHorasResponse, EstadoAeronave } from '../../types/inventario';
import { 
  actualizarHorasConPropagacion, 
  actualizarEstadoAeronave, 
  actualizarObservacionesAeronave 
} from '../../utils/inventarioApi';

interface GestionHorasAeronaveProps {
  aeronave: IAeronave;
  onActualizado: (aeronave: IAeronave) => void;
  onCerrar: () => void;
}

interface FormData {
  horasAgregadas: number;
  estado: EstadoAeronave;
  observaciones: string;
}

const GestionHorasAeronave: React.FC<GestionHorasAeronaveProps> = ({
  aeronave,
  onActualizado,
  onCerrar
}) => {
  const [formData, setFormData] = useState<FormData>({
    horasAgregadas: 0,
    estado: aeronave.estado as EstadoAeronave,
    observaciones: aeronave.observaciones || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resultado, setResultado] = useState<IActualizacionHorasResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'horasAgregadas' ? parseFloat(value) || 0 : value
    }));
    
    // Limpiar mensajes cuando el usuario modifica los datos
    setError(null);
    setSuccess(null);
  };

  const handleActualizarHoras = async () => {
    if (formData.horasAgregadas < 0) {
      setError('Las horas agregadas no pueden ser negativas');
      return;
    }

    if (formData.horasAgregadas === 0) {
      setError('Debe agregar al menos 0.1 horas');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const horasNuevasTotales = (aeronave.horasVuelo || 0) + formData.horasAgregadas;
      
      const gestionData: IGestionHorasData = {
        horasVuelo: horasNuevasTotales,
        observacion: formData.observaciones
      };

      const response = await actualizarHorasConPropagacion(aeronave._id, gestionData);
      setResultado(response);
      setSuccess(`Horas actualizadas exitosamente. ${response.data.propagacion.componentesActualizados} componentes afectados.`);
      
      // Actualizar la aeronave en el componente padre
      onActualizado(response.data.aeronave);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar horas');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarEstado = async () => {
    if (formData.estado === aeronave.estado) {
      setError('Seleccione un estado diferente al actual');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const aeronaveActualizada = await actualizarEstadoAeronave(aeronave._id, formData.estado);
      setSuccess(`Estado actualizado a: ${formData.estado}`);
      onActualizado(aeronaveActualizada.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarObservaciones = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const aeronaveActualizada = await actualizarObservacionesAeronave(aeronave._id, formData.observaciones);
      setSuccess('Observaciones actualizadas exitosamente');
      onActualizado(aeronaveActualizada.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar observaciones');
    } finally {
      setLoading(false);
    }
  };

  const horasActuales = aeronave.horasVuelo || 0;
  const horasTotalesNuevas = horasActuales + formData.horasAgregadas;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Gestión de Horas - {aeronave.matricula}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {aeronave.tipo} {aeronave.modelo} - {aeronave.fabricante}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Mensajes de estado */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Éxito</h3>
                  <div className="mt-2 text-sm text-green-700">{success}</div>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Horas de Vuelo */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-blue-900 mb-4">Actualizar Horas de Vuelo</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas Actuales
                </label>
                <input
                  type="number"
                  value={horasActuales}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas a Agregar *
                </label>
                <input
                  type="number"
                  name="horasAgregadas"
                  value={formData.horasAgregadas}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej: 5.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Horas Nuevo
                </label>
                <input
                  type="number"
                  value={horasTotalesNuevas.toFixed(1)}
                  disabled
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    formData.horasAgregadas > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                />
              </div>
            </div>

            <button
              onClick={handleActualizarHoras}
              disabled={loading || formData.horasAgregadas <= 0}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Actualizando...' : 'Actualizar Horas y Propagar'}
            </button>

            {formData.horasAgregadas > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                ⚠️ Se agregarán {formData.horasAgregadas} horas y se propagarán automáticamente a todos los componentes instalados
              </p>
            )}
          </div>

          {/* Sección de Estado */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-yellow-900 mb-4">Actualizar Estado</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Actual
                </label>
                <input
                  type="text"
                  value={aeronave.estado}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Estado *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
                >
                  <option value="Operativo">Operativo</option>
                  <option value="En Mantenimiento">En Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                  <option value="En Reparación">En Reparación</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleActualizarEstado}
              disabled={loading || formData.estado === aeronave.estado}
              className="w-full md:w-auto px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Actualizando...' : 'Actualizar Estado'}
            </button>
          </div>

          {/* Sección de Observaciones */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Observaciones</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones de la Aeronave
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Ingrese observaciones sobre la aeronave..."
              />
            </div>

            <button
              onClick={handleActualizarObservaciones}
              disabled={loading}
              className="w-full md:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Actualizando...' : 'Actualizar Observaciones'}
            </button>
          </div>

          {/* Resultado de la propagación */}
          {resultado && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-green-900 mb-3">Resultado de la Propagación</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{resultado.data.propagacion.incrementoHoras}</div>
                  <div className="text-sm text-gray-600">Horas Agregadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{resultado.data.propagacion.componentesActualizados}</div>
                  <div className="text-sm text-gray-600">Componentes Actualizados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{resultado.data.propagacion.horasAnteriores}</div>
                  <div className="text-sm text-gray-600">Horas Anteriores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{resultado.data.propagacion.horasNuevas}</div>
                  <div className="text-sm text-gray-600">Horas Totales</div>
                </div>
              </div>

              {resultado.data.proximosMantenimientos && resultado.data.proximosMantenimientos.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-orange-900 mb-2">⚠️ Componentes con Mantenimientos Próximos:</h5>
                  <ul className="list-disc list-inside text-sm text-orange-800">
                    {resultado.data.proximosMantenimientos.map((comp: any, index: number) => (
                      <li key={index}>
                        {comp.nombre} ({comp.numeroSerie}) - {comp.categoria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestionHorasAeronave;