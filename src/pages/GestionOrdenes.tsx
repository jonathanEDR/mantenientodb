import React, { useState, useCallback } from 'react';
import { 
  IOrdenTrabajo, 
  IComponente,
  TipoMantenimiento,
  PrioridadOrden,
  EstadoOrden,
  ComponenteCategoria,
  EstadoComponente
} from '../types/mantenimiento';
import { IAeronave } from '../types/inventario';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  OrdenesTable,
  OrdenesFilters,
  OrdenTrabajoModal
} from '../components/mantenimiento';
import { useModal } from '../hooks';
import { useOrdenes } from '../hooks/mantenimiento';
import { IFiltrosOrdenes, ICrearOrdenData } from '../utils/ordenesApi';

// Mock data temporal para aeronaves y componentes (estos vendrán de sus propias APIs más adelante)
const mockAeronaves: IAeronave[] = [
  {
    _id: 'aero1',
    matricula: 'XA-ABC',
    tipo: 'Helicóptero',
    modelo: 'Bell 407',
    fabricante: 'Bell',
    anoFabricacion: 2020,
    estado: 'Operativo',
    ubicacionActual: 'Hangar 1',
    horasVuelo: 1500,
    observaciones: 'En excelente estado',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    _id: 'aero2',
    matricula: 'XA-DEF',
    tipo: 'Helicóptero',
    modelo: 'AS350',
    fabricante: 'Airbus',
    anoFabricacion: 2019,
    estado: 'En Mantenimiento',
    ubicacionActual: 'Hangar 2',
    horasVuelo: 2200,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

const mockComponentes: IComponente[] = [
  {
    _id: 'comp1',
    numeroSerie: 'COMP-001',
    numeroParte: 'P123456',
    nombre: 'Motor Principal',
    categoria: ComponenteCategoria.MOTOR_PRINCIPAL,
    fabricante: 'Turbomeca',
    fechaFabricacion: '2024-01-01',
    fechaInstalacion: '2024-01-01',
    aeronaveActual: 'aero1',
    estado: EstadoComponente.INSTALADO,
    vidaUtil: [],
    historialUso: [],
    mantenimientoProgramado: [],
    ultimaInspeccion: '2024-08-01',
    proximaInspeccion: '2024-10-01',
    certificaciones: {
      numeroFormulario8130: '8130-001',
      fechaEmision8130: '2024-01-01',
      autoridad: 'DGAC'
    },
    ubicacionFisica: 'aero1',
    observaciones: '',
    alertasActivas: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-08-01'
  }
];

export default function GestionOrdenes() {
  // Hook principal para gestión de órdenes (reemplaza mock data)
  const {
    ordenes,
    loading,
    errors,
    crearNuevaOrden,
    actualizarOrdenExistente,
    eliminarOrdenExistente,
    cambiarEstadoOrdenExistente,
    aplicarFiltros,
    limpiarFiltros,
    clearError
  } = useOrdenes();

  // Mock data temporal hasta tener APIs específicas
  const [aeronaves] = useState<IAeronave[]>(mockAeronaves);
  const [componentes] = useState<IComponente[]>(mockComponentes);

  // Estados de filtros locales
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroTecnico, setFiltroTecnico] = useState('');

  // Hook para modal
  const {
    isOpen: modalAbierto,
    editingItem: ordenEditando,
    openModal: abrirModal,
    closeModal: cerrarModal
  } = useModal<IOrdenTrabajo>();

  // Aplicar filtros cuando cambien los valores locales
  const aplicarFiltrosLocal = useCallback(() => {
    const filtros: IFiltrosOrdenes = {};
    
    if (filtroTipo) filtros.tipo = filtroTipo as TipoMantenimiento;
    if (filtroEstado) filtros.estado = filtroEstado as EstadoOrden;
    if (filtroPrioridad) filtros.prioridad = filtroPrioridad as PrioridadOrden;
    if (filtroBusqueda) filtros.busqueda = filtroBusqueda;
    if (filtroTecnico) filtros.tecnico = filtroTecnico;

    aplicarFiltros(filtros);
  }, [filtroTipo, filtroEstado, filtroPrioridad, filtroBusqueda, filtroTecnico, aplicarFiltros]);

  // Limpiar filtros
  const limpiarFiltrosLocal = useCallback(() => {
    setFiltroTipo('');
    setFiltroEstado('');
    setFiltroPrioridad('');
    setFiltroBusqueda('');
    setFiltroTecnico('');
    limpiarFiltros();
  }, [limpiarFiltros]);

  // Handlers para el modal
  const handleCrearOrden = useCallback(async (data: ICrearOrdenData) => {
    try {
      const success = await crearNuevaOrden(data);
      if (success) {
        cerrarModal();
        // Aquí se podría mostrar una notificación de éxito
      }
    } catch (error) {
      console.error('Error al crear orden:', error);
      // Aquí se podría mostrar una notificación de error
    }
  }, [crearNuevaOrden, cerrarModal]);

  const handleActualizarOrden = useCallback(async (id: string, data: Partial<ICrearOrdenData>) => {
    try {
      const success = await actualizarOrdenExistente(id, data);
      if (success) {
        cerrarModal();
        // Aquí se podría mostrar una notificación de éxito
      }
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      // Aquí se podría mostrar una notificación de error
    }
  }, [actualizarOrdenExistente, cerrarModal]);

  const handleEliminarOrden = useCallback(async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta orden de trabajo?')) {
      try {
        const success = await eliminarOrdenExistente(id);
        if (success) {
          // Aquí se podría mostrar una notificación de éxito
        }
      } catch (error) {
        console.error('Error al eliminar orden:', error);
        // Aquí se podría mostrar una notificación de error
      }
    }
  }, [eliminarOrdenExistente]);

  const handleCambiarEstado = useCallback(async (id: string, nuevoEstado: EstadoOrden) => {
    try {
      const success = await cambiarEstadoOrdenExistente(id, nuevoEstado);
      if (success) {
        // Aquí se podría mostrar una notificación de éxito
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      // Aquí se podría mostrar una notificación de error
    }
  }, [cambiarEstadoOrdenExistente]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h1>
            <p className="text-gray-600">Administra las órdenes de mantenimiento</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nueva Orden
          </button>
        </div>

        {/* Mostrar errores si los hay */}
        {errors.ordenes && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al cargar órdenes</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errors.ordenes}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="bg-red-100 px-2 py-1 text-xs text-red-800 rounded hover:bg-red-200"
                    onClick={() => clearError('ordenes')}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <OrdenesFilters
          filtroTipo={filtroTipo}
          filtroEstado={filtroEstado}
          filtroPrioridad={filtroPrioridad}
          filtroBusqueda={filtroBusqueda}
          filtroTecnico={filtroTecnico}
          onTipoChange={setFiltroTipo}
          onEstadoChange={setFiltroEstado}
          onPrioridadChange={setFiltroPrioridad}
          onBusquedaChange={setFiltroBusqueda}
          onTecnicoChange={setFiltroTecnico}
          onAdd={aplicarFiltrosLocal}
          onClear={limpiarFiltrosLocal}
        />

        {/* Tabla de órdenes */}
        <OrdenesTable
          ordenes={ordenes}
          aeronaves={aeronaves}
          componentes={componentes}
          onEdit={abrirModal}
          onDelete={(orden) => handleEliminarOrden(orden._id)}
        />

        {/* Modal */}
        <OrdenTrabajoModal
          isOpen={modalAbierto}
          onClose={cerrarModal}
          orden={ordenEditando || undefined}
          aeronaves={aeronaves}
          componentes={componentes}
          onSave={ordenEditando ? 
            (data) => handleActualizarOrden(ordenEditando._id, data as Partial<ICrearOrdenData>) :
            (data) => handleCrearOrden(data as ICrearOrdenData)
          }
        />
      </div>
    </DashboardLayout>
  );
}