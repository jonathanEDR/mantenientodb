import React, { useState, useEffect } from 'react';
import ComponenteModal fro  const handleNuevoComponente = () => {
    // TODO: Implementar modal de componente
    alert('Funcionalidad de nuevo componente en desarrollo');
    // setSelectedComponente(null);
    // setIsModalOpen(true);
  };

  const handleEditarComponente = (componente: IComponente) => {
    // TODO: Implementar modal de edición
    alert(`Editar componente: ${componente.nombre}`);
    // setSelectedComponente(componente);
    // setIsModalOpen(true);
  };

  const handleVerHistorial = (componente: IComponente) => {
    // TODO: Implementar modal de historial
    alert(`Ver historial de: ${componente.nombre}`);
    // setSelectedComponente(componente);
    // setIsHistorialOpen(true);
  };es/ComponenteModal';
import HistorialComponente from './componentes/HistorialComponente';
import { IAeronave } from '../../types/inventario';
import { IComponente, EstadoComponente, ComponenteCategoria } from '../../types/mantenimiento';
import axiosInstance from '../../utils/axiosConfig';

interface ComponentesAeronaveProps {
  aeronave: IAeronave;
  isOpen: boolean;
  onClose: () => void;
}

const ComponentesAeronave: React.FC<ComponentesAeronaveProps> = ({
  aeronave,
  isOpen,
  onClose
}) => {
  const [componentes, setComponentes] = useState<IComponente[]>([]);
  const [filteredComponentes, setFilteredComponentes] = useState<IComponente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);
  const [selectedComponente, setSelectedComponente] = useState<IComponente | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<EstadoComponente | ''>('');
  const [selectedPosicion, setSelectedPosicion] = useState<ComponenteCategoria | ''>('');

  useEffect(() => {
    if (isOpen && aeronave._id) {
      cargarComponentes();
    }
  }, [isOpen, aeronave._id]);

  useEffect(() => {
    filtrarComponentes();
  }, [componentes, searchTerm, selectedEstado, selectedPosicion]);

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
        comp.catalogoComponente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.catalogoComponente?.numeroPartes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEstado) {
      filtered = filtered.filter(comp => comp.estado === selectedEstado);
    }

    if (selectedPosicion) {
      filtered = filtered.filter(comp => comp.posicion === selectedPosicion);
    }

    setFilteredComponentes(filtered);
  };

  const handleNuevoComponente = () => {
    setSelectedComponente(null);
    setIsModalOpen(true);
  };

  const handleEditarComponente = (componente: Componente) => {
    setSelectedComponente(componente);
    setIsModalOpen(true);
  };

  const handleVerHistorial = (componente: Componente) => {
    setSelectedComponente(componente);
    setIsHistorialOpen(true);
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

  const handleComponenteChange = async () => {
    await cargarComponentes();
    setIsModalOpen(false);
  };

  const getEstadoColor = (estado: EstadoComponente) => {
    switch (estado) {
      case 'OPERATIVO':
        return 'text-green-600 bg-green-100';
      case 'EN_MANTENIMIENTO':
        return 'text-yellow-600 bg-yellow-100';
      case 'FUERA_SERVICIO':
        return 'text-red-600 bg-red-100';
      case 'EN_REPARACION':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: EstadoComponente) => {
    switch (estado) {
      case 'OPERATIVO':
        return <CheckCircle className="w-4 h-4" />;
      case 'EN_MANTENIMIENTO':
      case 'EN_REPARACION':
        return <Clock className="w-4 h-4" />;
      case 'FUERA_SERVICIO':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Box className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plane className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">
                Componentes - {aeronave.matricula}
              </h2>
              <p className="text-blue-200 text-sm">
                {aeronave.tipo} - {aeronave.modelo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controles */}
        <div className="bg-gray-50 px-6 py-4 border-b space-y-4">
          {/* Barra de búsqueda y botón nuevo */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
              <Plus className="w-5 h-5" />
              <span>Nuevo Componente</span>
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value as EstadoComponente | '')}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="OPERATIVO">Operativo</option>
                <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                <option value="EN_REPARACION">En Reparación</option>
                <option value="FUERA_SERVICIO">Fuera de Servicio</option>
              </select>
            </div>

            <select
              value={selectedPosicion}
              onChange={(e) => setSelectedPosicion(e.target.value as PosicionComponente | '')}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las posiciones</option>
              <option value="MOTOR">Motor</option>
              <option value="FUSELAJE">Fuselaje</option>
              <option value="ALAS">Alas</option>
              <option value="TREN_ATERRIZAJE">Tren de Aterrizaje</option>
              <option value="AVIONICOS">Aviónicos</option>
              <option value="HIDRAULICOS">Hidráulicos</option>
              <option value="ELECTRICOS">Eléctricos</option>
              <option value="OTROS">Otros</option>
            </select>

            {/* Estadísticas rápidas */}
            <div className="flex space-x-4 ml-auto">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total:</span> {filteredComponentes.length}
              </div>
              <div className="text-sm text-green-600">
                <span className="font-medium">Operativos:</span>{' '}
                {filteredComponentes.filter(c => c.estado === 'OPERATIVO').length}
              </div>
              <div className="text-sm text-yellow-600">
                <span className="font-medium">En Mantenimiento:</span>{' '}
                {filteredComponentes.filter(c => c.estado === 'EN_MANTENIMIENTO' || c.estado === 'EN_REPARACION').length}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando componentes...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={cargarComponentes}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : filteredComponentes.length === 0 ? (
            <div className="text-center py-12">
              <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
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
                <div
                  key={componente._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header de la tarjeta */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {componente.catalogoComponente?.nombre || 'Componente'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          S/N: {componente.numeroSerie}
                        </p>
                      </div>
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
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
                        {getEstadoIcon(componente.estado)}
                        <span>{componente.estado.replace('_', ' ')}</span>
                      </span>
                    </div>

                    {/* Posición */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Posición:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {componente.posicion?.replace('_', ' ') || 'No asignada'}
                      </span>
                    </div>

                    {/* Horas */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Horas:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {componente.horasVuelo || 0}h
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
                    {componente.catalogoComponente?.numeroPartes && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">P/N:</span>
                        <span className="text-xs font-mono text-gray-900">
                          {componente.catalogoComponente.numeroPartes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex space-x-2">
                    <button
                      onClick={() => handleVerHistorial(componente)}
                      className="flex-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Calendar className="w-3 h-3" />
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modales - Temporalmente comentados para testing */}
      {/*
      {isModalOpen && (
        <ComponenteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComponenteChange={handleComponenteChange}
          componente={selectedComponente}
          aeronaveActual={aeronave._id}
        />
      )}

      {isHistorialOpen && selectedComponente && (
        <HistorialComponente
          isOpen={isHistorialOpen}
          onClose={() => setIsHistorialOpen(false)}
          componente={selectedComponente}
        />
      )}
      */}
    </div>
  );
};

export default ComponentesAeronave;