import React, { useState, useEffect } from 'react';
import HistorialComponente from './componentes/HistorialComponente';
import ComponenteModal from './componentes/ComponenteModal';
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
  
  // Estados para el modal de crear/editar componente
  const [modalComponenteAbierto, setModalComponenteAbierto] = useState(false);
  const [componenteEditando, setComponenteEditando] = useState<IComponente | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
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
      const componentesData = response.data.data || [];
      
      // Log estratégico para gestión de horas
      if (componentesData.length > 0) {
        const resumenHoras = componentesData.map((comp: IComponente) => ({
          nombre: comp.nombre,
          numeroSerie: comp.numeroSerie,
          horas: comp.vidaUtil?.find(v => v.unidad === 'HORAS')?.acumulado || 0,
          horasLimite: comp.vidaUtil?.find(v => v.unidad === 'HORAS')?.limite || 0,
          estado: comp.estado
        }));
        
        console.log('📊 [HORAS] Componentes cargados para aeronave:', {
          aeronave: aeronave.matricula,
          totalComponentes: componentesData.length,
          resumenHoras
        });
      }
      
      setComponentes(componentesData);
      setError(null);
    } catch (error: any) {
      console.error('Error al cargar componentes:', error);
      setError('Error al cargar los componentes de la aeronave');
    } finally {
      setLoading(false);
    }
  };

  const filtrarComponentes = () => {
    let filtered = [...componentes];

    if (searchTerm) {
      filtered = filtered.filter(comp => 
        comp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.numeroParte.toLowerCase().includes(searchTerm.toLowerCase())
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
    setComponenteEditando(null);
    setModalComponenteAbierto(true);
  };

  const handleEditarComponente = (componente: IComponente) => {
    // Log estratégico para gestión de horas
    console.log('⚙️ [HORAS] Editando componente:', {
      nombre: componente.nombre,
      numeroSerie: componente.numeroSerie,
      horasAcumuladas: componente.vidaUtil?.find(v => v.unidad === 'HORAS')?.acumulado || 0,
      ciclosAcumulados: componente.vidaUtil?.find(v => v.unidad === 'CICLOS')?.acumulado || 0
    });
    setComponenteEditando(componente);
    setModalComponenteAbierto(true);
  };

  const cerrarModalComponente = () => {
    setModalComponenteAbierto(false);
    setComponenteEditando(null);
    setModalLoading(false);
  };

  const manejarGuardarComponente = async (componenteData: Partial<IComponente>) => {
    try {
      setModalLoading(true);
      
      // Asegurarse de que aeronaveActual tenga el ID correcto
      const dataToSend = {
        ...componenteData,
        aeronaveActual: aeronave._id,
        ubicacionFisica: aeronave.matricula
      };

      // Log estratégico para gestión de horas
      const horasData = dataToSend.vidaUtil?.find(v => v.unidad === 'HORAS');
      const ciclosData = dataToSend.vidaUtil?.find(v => v.unidad === 'CICLOS');
      
      console.log('💾 [HORAS] Guardando componente:', {
        operacion: componenteEditando ? 'ACTUALIZAR' : 'CREAR',
        nombre: dataToSend.nombre,
        numeroSerie: dataToSend.numeroSerie,
        aeronave: aeronave.matricula,
        horasAcumuladas: horasData?.acumulado || 0,
        horasLimite: horasData?.limite || 0,
        ciclosAcumulados: ciclosData?.acumulado || 0,
        ciclosLimite: ciclosData?.limite || 0
      });

      if (componenteEditando) {
        // Actualizar componente existente
        await axiosInstance.put(`/api/mantenimiento/componentes/${componenteEditando._id}`, dataToSend);
      } else {
        // Crear nuevo componente
        await axiosInstance.post('/api/mantenimiento/componentes', dataToSend);
      }
      
      await cargarComponentes();
      cerrarModalComponente();
    } catch (error: any) {
      console.error('Error al guardar componente:', error);
      alert(error.response?.data?.message || 'Error al guardar el componente');
    } finally {
      setModalLoading(false);
    }
  };

  const abrirHistorial = (componente: IComponente) => {
    // Log estratégico para gestión de horas
    console.log('📅 [HORAS] Abriendo historial de componente:', {
      nombre: componente.nombre,
      numeroSerie: componente.numeroSerie,
      horasAcumuladas: componente.vidaUtil?.find(v => v.unidad === 'HORAS')?.acumulado || 0,
      ultimaInspeccion: componente.proximaInspeccion || 'No programada'
    });
    setComponenteHistorial(componente);
    setHistorialAbierto(true);
  };

  const cerrarHistorial = () => {
    setHistorialAbierto(false);
    setComponenteHistorial(null);
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

  // Componente para la tarjeta de componente
  const ComponenteCard = ({ 
    componente, 
    onHistorial, 
    onEditar, 
    onEliminar 
  }: { 
    componente: IComponente;
    onHistorial: (comp: IComponente) => void;
    onEditar: (comp: IComponente) => void;
    onEliminar: (id: string) => void;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header de la tarjeta */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{componente.nombre}</h3>
            <p className="text-sm text-gray-500 mt-1">{componente.categoria}</p>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(componente.estado)}`}>
            <span className="mr-1">{getEstadoIcon(componente.estado)}</span>
            {componente.estado}
          </span>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">N° Serie:</span>
            <p className="font-medium text-gray-900">{componente.numeroSerie}</p>
          </div>
          <div>
            <span className="text-gray-500">N° Parte:</span>
            <p className="font-medium text-gray-900">{componente.numeroParte}</p>
          </div>
        </div>

        {componente.vidaUtil.some(v => v.unidad === 'HORAS') && (
          <div className="text-sm">
            <span className="text-gray-500">Horas Acumuladas:</span>
            <p className="font-medium text-gray-900">
              {componente.vidaUtil.find(v => v.unidad === 'HORAS')?.acumulado.toLocaleString() || 0} h
            </p>
          </div>
        )}

        {componente.vidaUtil.some(v => v.unidad === 'CICLOS') && (
          <div className="text-sm">
            <span className="text-gray-500">Ciclos Acumulados:</span>
            <p className="font-medium text-gray-900">
              {componente.vidaUtil.find(v => v.unidad === 'CICLOS')?.acumulado.toLocaleString() || 0}
            </p>
          </div>
        )}

        {componente.observaciones && (
          <div className="text-sm">
            <span className="text-gray-500">Observaciones:</span>
            <p className="text-gray-700 mt-1">{componente.observaciones}</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => onHistorial(componente)}
            className="flex-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
          >
            <span>📅</span>
            <span>Historial</span>
          </button>
          <button
            onClick={() => onHistorial(componente)}
            className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs font-medium hover:bg-indigo-200 transition-colors flex items-center justify-center space-x-1"
          >
            <span>👁️</span>
            <span>Ver Más</span>
          </button>
          <button
            onClick={() => onEditar(componente)}
            className="flex-1 bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium hover:bg-green-200 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onEliminar(componente._id!)}
            className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-medium hover:bg-red-200 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );

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
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComponentes.map((componente) => (
                  <ComponenteCard 
                    key={componente._id} 
                    componente={componente}
                    onHistorial={abrirHistorial}
                    onEditar={handleEditarComponente}
                    onEliminar={handleEliminarComponente}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Crear/Editar Componente para vista in-place */}
        {(() => {
          console.log('🔍 [IN-PLACE] Verificando si mostrar modal ComponenteModal:', { 
            modalComponenteAbierto, 
            componenteEditando: componenteEditando?.nombre || null 
          });
          return modalComponenteAbierto;
        })() && (
          <ComponenteModal
            isOpen={modalComponenteAbierto}
            componente={componenteEditando}
            aeronaves={[aeronave]}
            loading={modalLoading}
            onSubmit={manejarGuardarComponente}
            onClose={cerrarModalComponente}
          />
        )}

        {/* Modal de historial */}
        {historialAbierto && componenteHistorial && (
          <HistorialComponente
            componente={componenteHistorial}
            aeronaves={[aeronave]}
            onClose={cerrarHistorial}
            onUpdate={async (componenteId: string, data: any) => {
              await cargarComponentes();
            }}
          />
        )}
      </div>
    );
  }

  // Vista modal original
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✈️</span>
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
            className="text-white hover:text-gray-300 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Controles */}
        <div className="bg-gray-50 px-6 py-4 border-b space-y-4">
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

        {/* Contenido */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
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
                <ComponenteCard 
                  key={componente._id} 
                  componente={componente}
                  onHistorial={abrirHistorial}
                  onEditar={handleEditarComponente}
                  onEliminar={handleEliminarComponente}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal de Crear/Editar Componente */}
        {(() => {
          console.log('🔍 Verificando si mostrar modal ComponenteModal:', { 
            modalComponenteAbierto, 
            componenteEditando: componenteEditando?.nombre || null 
          });
          return modalComponenteAbierto;
        })() && (
          <ComponenteModal
            isOpen={modalComponenteAbierto}
            componente={componenteEditando}
            aeronaves={[aeronave]}
            loading={modalLoading}
            onSubmit={manejarGuardarComponente}
            onClose={cerrarModalComponente}
          />
        )}

        {/* Modal de Historial/Detalles del Componente */}
        {historialAbierto && componenteHistorial && (
          <HistorialComponente
            componente={componenteHistorial}
            aeronaves={[aeronave]}
            onClose={cerrarHistorial}
            onUpdate={async (componenteId: string, data: any) => {
              await cargarComponentes();
            }}
          />
        )}
      </div>

      {/* Modales compartidos (tanto para vista modal como in-place) */}
      {modalComponenteAbierto && (
        <ComponenteModal
          isOpen={modalComponenteAbierto}
          componente={componenteEditando}
          aeronaves={[aeronave]}
          loading={modalLoading}
          onSubmit={manejarGuardarComponente}
          onClose={cerrarModalComponente}
        />
      )}
    </div>
  );
};

export default ComponentesAeronave;