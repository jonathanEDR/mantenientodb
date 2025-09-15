import React from 'react';
import { IComponente } from '../types/mantenimiento';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  ComponentesTable,
  ComponentesFilters,
  ComponenteModal
} from '../components/mantenimiento';
import { useMantenimiento, useModal } from '../hooks';

export default function GestionComponentes() {
  const {
    componentes,
    aeronaves,
    loading,
    error,
    crearNuevoComponente,
    actualizarComponenteExistente,
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
          onAdd={() => abrirModal()}
        />

        {/* Tabla */}
        <ComponentesTable
          componentes={componentesFiltrados}
          aeronaves={aeronaves}
          onEdit={abrirModal}
          onDelete={manejarEliminar}
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
      </div>
    </DashboardLayout>
  );
}