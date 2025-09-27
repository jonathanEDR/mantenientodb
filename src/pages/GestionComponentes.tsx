import React from 'react';
import { IComponente } from '../types/mantenimiento';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  ComponentesTable,
  ComponentesFilters,
  ComponenteModal
} from '../components/mantenimiento';
import HistorialComponente from '../components/mantenimiento/componentes/HistorialComponente';
import EstadosMonitoreoComponente from '../components/mantenimiento/EstadosMonitoreoComponente';
import { useMantenimiento, useModal } from '../hooks';

export default function GestionComponentes() {
  const {
    componentes,
    aeronaves,
    loading,
    error,
    crearNuevoComponente,
    actualizarComponenteExistente,
    actualizarComponenteDesdeHistorial,
    eliminarComponenteExistente,
    obtenerAeronaveNombre
  } = useMantenimiento();

  const {
    isOpen: modalAbierto,
    loading: modalLoading,
    editingItem: componenteEditando,
    openModal: abrirModal,
    closeModal: cerrarModal,
    setLoading: setModalLoading
  } = useModal<IComponente>();

  // Estados de filtros locales (se pueden mover al context si es necesario)
  const [filtroCategoria, setFiltroCategoria] = React.useState('');
  const [filtroEstado, setFiltroEstado] = React.useState('');
  const [filtroBusqueda, setFiltroBusqueda] = React.useState('');

  // Estados para el módulo de historial
  const [componenteHistorial, setComponenteHistorial] = React.useState<IComponente | null>(null);
  const [historialAbierto, setHistorialAbierto] = React.useState(false);

  // Estados para el módulo de monitoreo
  const [componenteMonitoreo, setComponenteMonitoreo] = React.useState<IComponente | null>(null);
  const [monitoreoAbierto, setMonitoreoAbierto] = React.useState(false);

  // Filtrar componentes localmente
  const componentesFiltrados = React.useMemo(() => {
    return componentes.filter(componente => {
      const pasaCategoria = !filtroCategoria || componente.categoria === filtroCategoria;
      const pasaEstado = !filtroEstado || componente.estado === filtroEstado;
      const pasaBusqueda = !filtroBusqueda || 
        componente.nombre?.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        componente.numeroSerie?.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        componente.numeroParte?.toLowerCase().includes(filtroBusqueda.toLowerCase());
      
      return pasaCategoria && pasaEstado && pasaBusqueda;
    });
  }, [componentes, filtroCategoria, filtroEstado, filtroBusqueda]);

  const manejarGuardar = async (componenteData: Partial<IComponente>) => {
    try {
      setModalLoading(true);
      
      if (componenteEditando) {
        await actualizarComponenteExistente(componenteEditando._id!, componenteData);
      } else {
        await crearNuevoComponente(componenteData);
      }
      
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar componente:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const manejarEliminar = async (componente: IComponente) => {
    await eliminarComponenteExistente(componente);
  };

  const manejarVerDetalles = (componente: IComponente) => {
    setComponenteHistorial(componente);
    setHistorialAbierto(true);
  };

  const cerrarHistorial = () => {
    setHistorialAbierto(false);
    setComponenteHistorial(null);
  };

  const manejarVerMonitoreo = (componente: IComponente) => {
    setComponenteMonitoreo(componente);
    setMonitoreoAbierto(true);
  };

  const cerrarMonitoreo = () => {
    setMonitoreoAbierto(false);
    setComponenteMonitoreo(null);
  };

  const manejarActualizacionHistorial = async (componenteId: string, data: any) => {
    try {
      await actualizarComponenteDesdeHistorial(componenteId, data);
      // Actualizar el componente en el estado local
      if (componenteHistorial) {
        const componenteActualizado = { ...componenteHistorial, ...data };
        setComponenteHistorial(componenteActualizado);
      }
    } catch (error) {
      console.error('Error al actualizar componente desde historial:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error al cargar datos</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestión de Componentes
          </h1>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Componente
          </button>
        </div>

        {/* Filtros */}
        <ComponentesFilters
          filtroCategoria={filtroCategoria}
          filtroEstado={filtroEstado}
          filtroBusqueda={filtroBusqueda}
          onCategoriaChange={setFiltroCategoria}
          onEstadoChange={setFiltroEstado}
          onBusquedaChange={setFiltroBusqueda}
        />

        {/* Tabla */}
        <ComponentesTable
          componentes={componentesFiltrados}
          aeronaves={aeronaves}
          onEdit={abrirModal}
          onDelete={manejarEliminar}
          onViewDetails={manejarVerDetalles}
          onViewMonitoreo={manejarVerMonitoreo}
        />

        {/* Modal */}
        <ComponenteModal
          isOpen={modalAbierto}
          onClose={cerrarModal}
          onSubmit={manejarGuardar}
          componente={componenteEditando}
          aeronaves={aeronaves}
          loading={modalLoading}
        />

        {/* Módulo de Historial */}
        {historialAbierto && componenteHistorial && (
          <HistorialComponente
            componente={componenteHistorial}
            aeronaves={aeronaves}
            onClose={cerrarHistorial}
            onUpdate={manejarActualizacionHistorial}
          />
        )}

        {/* Módulo de Monitoreo */}
        {monitoreoAbierto && componenteMonitoreo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Estados de Monitoreo - {componenteMonitoreo.nombre}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Número de Serie: {componenteMonitoreo.numeroSerie} | 
                    Aeronave: {(() => {
                      const aeronaveActual = componenteMonitoreo.aeronaveActual;
                      if (!aeronaveActual) return 'No asignada';
                      if (typeof aeronaveActual === 'object') {
                        return `${aeronaveActual.matricula} - ${aeronaveActual.modelo}`;
                      }
                      return obtenerAeronaveNombre(aeronaveActual);
                    })()}
                  </p>
                </div>
                <button
                  onClick={cerrarMonitoreo}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-auto" style={{ maxHeight: 'calc(95vh - 80px)' }}>
                <EstadosMonitoreoComponente
                  componenteId={componenteMonitoreo._id!}
                  numeroSerie={componenteMonitoreo.numeroSerie}
                  nombreComponente={componenteMonitoreo.nombre}
                  className="p-6"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}