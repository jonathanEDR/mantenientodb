import React, { useState, useEffect } from 'react';
import HistorialComponente from './componentes/HistorialComponente';
import { IAeronave } from '../../types/inventario';
import { IComponente, EstadoComponente, ComponenteCategoria } from '../../types/mantenimiento';
import axiosInstance from '../../utils/axiosConfig';

interface ComponentesAeronaveProps {
  aeronave: IAeronave;
  isOpen: boolean;
  onClose: () => void;
  isInPlace?: boolean; // Nueva prop para indicar si se muestra en lugar
}

const ComponentesAeronave: React.FC<ComponentesAeronaveProps> = ({
  aeronave,
  isOpen,
  onClose,
  isInPlace = false
}) => {
  const [componentes, setComponentes] = useState<IComponente[]>([]);
  const [filteredComponentes, setFilteredComponentes] = useState<IComponente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el modal de detalles/historial
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [componenteHistorial, setComponenteHistorial] = useState<IComponente | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<EstadoComponente | ''>('');
  const [selectedCategoria, setSelectedCategoria] = useState<ComponenteCategoria | ''>('');

  useEffect(() => {
    if (isOpen && aeronave._id) {
      cargarComponentes();
    }
  }, [isOpen, aeronave._id]);

  useEffect(() => {
    filtrarComponentes();
  }, [componentes, searchTerm, selectedEstado, selectedCategoria]);

  const cargarComponentes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/mantenimiento/componentes/aeronave/id/${aeronave._id}`);
      setComponentes(response.data.data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error al cargar componentes:', error);
      setError('Error al cargar los componentes de la aeronave');
    } finally {
      setLoading(false);
    }
  };

  const filtrarComponentes = () => {
    let filtered = componentes;

    if (searchTerm) {
      filtered = filtered.filter(comp =>
        comp.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.numeroParte?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEstado) {
      filtered = filtered.filter(comp => comp.estado === selectedEstado);
    }

    if (selectedCategoria) {
      filtered = filtered.filter(comp => comp.categoria === selectedCategoria);
    }

    setFilteredComponentes(filtered);
  };

  const handleNuevoComponente = () => {
    alert('Funcionalidad de nuevo componente en desarrollo');
  };

  const handleEditarComponente = (componente: IComponente) => {
    alert(`Editar componente: ${componente.nombre}`);
  };

  const handleVerMas = (componente: IComponente) => {
    setComponenteHistorial(componente);
    setHistorialAbierto(true);
  };

  const handleVerHistorial = (componente: IComponente) => {
    // Misma funcionalidad que Ver Más
    handleVerMas(componente);
  };

  const cerrarHistorial = () => {
    setHistorialAbierto(false);
    setComponenteHistorial(null);
  };

  const manejarActualizacionHistorial = async (componenteId: string, data: any) => {
    try {
      // Actualizar el componente en el backend
      await axiosInstance.put(`/api/mantenimiento/componentes/${componenteId}/historial`, data);
      
      // Actualizar el componente en el estado local
      if (componenteHistorial) {
        const componenteActualizado = { ...componenteHistorial, ...data };
        setComponenteHistorial(componenteActualizado);
      }
      
      // Recargar la lista de componentes
      await cargarComponentes();
    } catch (error) {
      console.error('Error al actualizar componente desde historial:', error);
      throw error;
    }
  };

  const handleEliminarComponente = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este componente?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/mantenimiento/componentes/${id}`);
      await cargarComponentes();
    } catch (error: any) {
      console.error('Error al eliminar componente:', error);
      alert('Error al eliminar el componente');
    }
  };

  const getEstadoColor = (estado: EstadoComponente) => {
    switch (estado) {
      case EstadoComponente.INSTALADO:
        return 'text-green-600 bg-green-100';
      case EstadoComponente.EN_MANTENIMIENTO:
      case EstadoComponente.EN_REPARACION:
        return 'text-yellow-600 bg-yellow-100';
      case EstadoComponente.CONDENADO:
        return 'text-red-600 bg-red-100';
      case EstadoComponente.EN_ALMACEN:
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: EstadoComponente) => {
    switch (estado) {
      case EstadoComponente.INSTALADO:
        return '✓';
      case EstadoComponente.EN_MANTENIMIENTO:
      case EstadoComponente.EN_REPARACION:
        return '⏱';
      case EstadoComponente.CONDENADO:
        return '⚠';
      case EstadoComponente.EN_ALMACEN:
        return '📦';
      default:
        return '•';
    }
  };

  if (!isOpen) return null;

  // Si es vista en lugar (no modal), retornar solo el contenido sin el modal wrapper
  if (isInPlace) {
    return (
      <div className="space-y-6">
        {/* Controles */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Barra de búsqueda y botón nuevo */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre, número de serie o parte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleNuevoComponente}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Nuevo Componente</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">🔽</span>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value as EstadoComponente | '')}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value={EstadoComponente.INSTALADO}>Instalado</option>
                <option value={EstadoComponente.EN_ALMACEN}>En Almacén</option>
                <option value={EstadoComponente.EN_MANTENIMIENTO}>En Mantenimiento</option>
                <option value={EstadoComponente.EN_REPARACION}>En Reparación</option>
                <option value={EstadoComponente.CONDENADO}>Condenado</option>
              </select>
            </div>

            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value as ComponenteCategoria | '')}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              <option value={ComponenteCategoria.MOTOR_PRINCIPAL}>Motor Principal</option>
              <option value={ComponenteCategoria.FUSELAJE}>Fuselaje</option>
              <option value={ComponenteCategoria.TRANSMISION_PRINCIPAL}>Transmisión Principal</option>
              <option value={ComponenteCategoria.CUBO_ROTOR_PRINCIPAL}>Cubo Rotor Principal</option>
              <option value={ComponenteCategoria.PALAS_ROTOR_PRINCIPAL}>Palas Rotor Principal</option>
              <option value={ComponenteCategoria.SISTEMA_HIDRAULICO}>Sistema Hidráulico</option>
              <option value={ComponenteCategoria.SISTEMA_ELECTRICO}>Sistema Eléctrico</option>
              <option value={ComponenteCategoria.OTROS}>Otros</option>
            </select>

            {/* Estadísticas rápidas */}
            <div className="flex space-x-4 ml-auto">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total:</span> {filteredComponentes.length}
              </div>
              <div className="text-sm text-green-600">
                <span className="font-medium">Instalados:</span>{' '}
                {filteredComponentes.filter(c => c.estado === EstadoComponente.INSTALADO).length}
              </div>
              <div className="text-sm text-yellow-600">
                <span className="font-medium">En Mantenimiento:</span>{' '}
                {filteredComponentes.filter(c => c.estado === EstadoComponente.EN_MANTENIMIENTO || c.estado === EstadoComponente.EN_REPARACION).length}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando componentes...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <span className="text-6xl">⚠️</span>
              <p className="text-red-600 mb-4 mt-4">{error}</p>
              <button
                onClick={cargarComponentes}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : filteredComponentes.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">📦</span>
              <p className="text-gray-600 mb-4 mt-4">
                {componentes.length === 0 
                  ? 'No hay componentes registrados para esta aeronave'
                  : 'No se encontraron componentes con los filtros aplicados'
                }
              </p>
              <button
                onClick={handleNuevoComponente}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agregar Primer Componente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComponentes.map((componente) => (
                <ComponenteCard key={componente._id} componente={componente} />
              ))}
            </div>
          )}
        </div>

        {/* Modal de historial */}
        {historialAbierto && componenteHistorial && (
          <HistorialComponente
            componente={componenteHistorial}
            onClose={cerrarHistorial}
            onActualizarComponente={manejarActualizacionHistorial}
          />
        )}
      </div>
    );
  }

  // Componente para la tarjeta de componente
  const ComponenteCard = ({ componente }: { componente: IComponente }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header de la tarjeta */}
      <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {componente.nombre || 'Componente'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          S/N: {componente.numeroSerie}
                        </p>
                      </div>
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600">
                          ⋮
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4 space-y-3">
                    {/* Estado */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Estado:</span>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(componente.estado)}`}>
                        <span>{getEstadoIcon(componente.estado)}</span>
                        <span>{componente.estado.replace('_', ' ')}</span>
                      </span>
                    </div>

                    {/* Categoría */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Categoría:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {componente.categoria?.replace('_', ' ') || 'No asignada'}
                      </span>
                    </div>

                    {/* Posición */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Posición:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {componente.posicionInstalacion || 'No asignada'}
                      </span>
                    </div>

                    {/* Fecha instalación */}
                    {componente.fechaInstalacion && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Instalado:</span>
                        <span className="text-xs font-medium text-gray-900">
                          {new Date(componente.fechaInstalacion).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Número de parte */}
                    {componente.numeroParte && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">P/N:</span>
                        <span className="text-xs font-mono text-gray-900">
                          {componente.numeroParte}
                        </span>
                      </div>
                    )}

                    {/* Fabricante */}
                    {componente.fabricante && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Fabricante:</span>
                        <span className="text-xs font-medium text-gray-900">
                          {componente.fabricante}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex flex-col space-y-2">
                    {/* Botón Ver Más - Principal */}
                    <button
                      onClick={() => handleVerMas(componente)}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>👁️</span>
                      <span>Ver Más</span>
                    </button>
                    
                    {/* Botones secundarios */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerHistorial(componente)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>📅</span>
                        <span>Historial</span>
                      </button>
                      <button
                        onClick={() => handleEditarComponente(componente)}
                        className="flex-1 bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminarComponente(componente._id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Historial/Detalles del Componente */}
      {historialAbierto && componenteHistorial && (
        <HistorialComponente
          componente={componenteHistorial}
          aeronaves={[aeronave]} // Pasamos la aeronave actual
          onClose={cerrarHistorial}
          onUpdate={manejarActualizacionHistorial}
        />
      )}
    </div>
  );
};

export default ComponentesAeronave;