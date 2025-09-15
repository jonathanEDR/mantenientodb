import React, { useState, useCallback } from 'react';
import { 
  IInspeccion,
  IComponente,
  TipoInspeccion,
  EstadoInspeccion,
  ResultadoInspeccion,
  ComponenteCategoria,
  EstadoComponente
} from '../types/mantenimiento';
import { IAeronave } from '../types/inventario';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  InspeccionesTable,
  InspeccionesFilters
} from '../components/mantenimiento';
import { useModal } from '../hooks';
import { useInspecciones } from '../hooks/mantenimiento';
import { IFiltrosInspecciones, ICrearInspeccionData } from '../utils/inspeccionesApi';

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

export default function GestionInspecciones() {
  // Hook principal para gestión de inspecciones (reemplaza mock data)
  const {
    inspecciones,
    loading,
    errors,
    crearNuevaInspeccion,
    actualizarInspeccionExistente,
    eliminarInspeccionExistente,
    completarInspeccionExistente,
    aplicarFiltros,
    limpiarFiltros,
    clearError,
    getInspeccionesVencidas,
    getInspeccionesProximasVencer
  } = useInspecciones();

  // Mock data temporal hasta tener APIs específicas
  const [aeronaves] = useState<IAeronave[]>(mockAeronaves);
  const [componentes] = useState<IComponente[]>(mockComponentes);

  // Estados de filtros locales
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroResultado, setFiltroResultado] = useState('');
  const [filtroInspector, setFiltroInspector] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  // Hook para modal
  const {
    isOpen: modalAbierto,
    editingItem: inspeccionEditando,
    openModal: abrirModal,
    closeModal: cerrarModal
  } = useModal<IInspeccion>();

  // Aplicar filtros cuando cambien los valores locales
  const aplicarFiltrosLocal = useCallback(() => {
    const filtros: IFiltrosInspecciones = {};
    
    if (filtroTipo) filtros.tipo = filtroTipo as TipoInspeccion;
    if (filtroEstado) filtros.estado = filtroEstado as EstadoInspeccion;
    if (filtroInspector) filtros.responsable = filtroInspector;
    if (filtroBusqueda) filtros.busqueda = filtroBusqueda;

    aplicarFiltros(filtros);
  }, [filtroTipo, filtroEstado, filtroInspector, filtroBusqueda, aplicarFiltros]);

  // Limpiar filtros
  const limpiarFiltrosLocal = useCallback(() => {
    setFiltroTipo('');
    setFiltroEstado('');
    setFiltroResultado('');
    setFiltroInspector('');
    setFiltroBusqueda('');
    limpiarFiltros();
  }, [limpiarFiltros]);

  // Handlers para el modal y operaciones CRUD
  const handleCrearInspeccion = useCallback(async (data: ICrearInspeccionData) => {
    try {
      const success = await crearNuevaInspeccion(data);
      if (success) {
        cerrarModal();
        // Aquí se podría mostrar una notificación de éxito
        console.log('Inspección creada exitosamente');
      }
    } catch (error) {
      console.error('Error al crear inspección:', error);
      // Aquí se podría mostrar una notificación de error
    }
  }, [crearNuevaInspeccion, cerrarModal]);

  const handleActualizarInspeccion = useCallback(async (id: string, data: Partial<ICrearInspeccionData>) => {
    try {
      const success = await actualizarInspeccionExistente(id, data);
      if (success) {
        cerrarModal();
        // Aquí se podría mostrar una notificación de éxito
        console.log('Inspección actualizada exitosamente');
      }
    } catch (error) {
      console.error('Error al actualizar inspección:', error);
      // Aquí se podría mostrar una notificación de error
    }
  }, [actualizarInspeccionExistente, cerrarModal]);

  const handleEliminarInspeccion = useCallback(async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta inspección?')) {
      try {
        const success = await eliminarInspeccionExistente(id);
        if (success) {
          // Aquí se podría mostrar una notificación de éxito
          console.log('Inspección eliminada exitosamente');
        }
      } catch (error) {
        console.error('Error al eliminar inspección:', error);
        // Aquí se podría mostrar una notificación de error
      }
    }
  }, [eliminarInspeccionExistente]);

  const handleCompletarInspeccion = useCallback(async (id: string, observaciones?: string) => {
    try {
      const success = await completarInspeccionExistente(id, observaciones);
      if (success) {
        // Aquí se podría mostrar una notificación de éxito
        console.log('Inspección completada exitosamente');
      }
    } catch (error) {
      console.error('Error al completar inspección:', error);
      // Aquí se podría mostrar una notificación de error
    }
  }, [completarInspeccionExistente]);

  // Funciones auxiliares para obtener información
  const getAeronaveNombre = useCallback((aeronaveId: string) => {
    const aeronave = aeronaves.find(a => a._id === aeronaveId);
    return aeronave ? `${aeronave.matricula} - ${aeronave.modelo}` : 'N/A';
  }, [aeronaves]);

  // Estadísticas rápidas
  const inspeccionesVencidas = getInspeccionesVencidas();
  const inspeccionesProximasVencer = getInspeccionesProximasVencer();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Inspecciones</h1>
            <p className="text-gray-600">Administra las inspecciones de aeronaves</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nueva Inspección
          </button>
        </div>

        {/* Alertas de inspecciones vencidas o próximas a vencer */}
        {(inspeccionesVencidas.length > 0 || inspeccionesProximasVencer.length > 0) && (
          <div className="space-y-3">
            {inspeccionesVencidas.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Inspecciones Vencidas ({inspeccionesVencidas.length})
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Hay {inspeccionesVencidas.length} inspecciones que ya han vencido y requieren atención inmediata.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {inspeccionesProximasVencer.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Inspecciones Próximas a Vencer ({inspeccionesProximasVencer.length})
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Hay {inspeccionesProximasVencer.length} inspecciones programadas para los próximos 3 días.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mostrar errores si los hay */}
        {errors.inspecciones && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al cargar inspecciones</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errors.inspecciones}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="bg-red-100 px-2 py-1 text-xs text-red-800 rounded hover:bg-red-200"
                    onClick={() => clearError('inspecciones')}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Inspecciones</dt>
                    <dd className="text-lg font-medium text-gray-900">{inspecciones.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">En Progreso</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inspecciones.filter(i => i.estado === EstadoInspeccion.EN_PROGRESO).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Vencidas</dt>
                    <dd className="text-lg font-medium text-gray-900">{inspeccionesVencidas.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completadas</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inspecciones.filter(i => i.estado === EstadoInspeccion.COMPLETADA).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <InspeccionesFilters
          filtroTipo={filtroTipo}
          filtroEstado={filtroEstado}
          filtroResultado={filtroResultado}
          filtroBusqueda={filtroBusqueda}
          filtroInspector={filtroInspector}
          onTipoChange={setFiltroTipo}
          onEstadoChange={setFiltroEstado}
          onResultadoChange={setFiltroResultado}
          onBusquedaChange={setFiltroBusqueda}
          onInspectorChange={setFiltroInspector}
          onAdd={aplicarFiltrosLocal}
          onClear={limpiarFiltrosLocal}
        />

        {/* Tabla de inspecciones */}
        <InspeccionesTable
          inspecciones={inspecciones}
          aeronaves={aeronaves}
          onEdit={abrirModal}
          onDelete={(inspeccion: IInspeccion) => handleEliminarInspeccion(inspeccion._id)}
        />

        {/* Modal para crear/editar inspecciones */}
        {/* Nota: Este modal necesitará ser creado o adaptado */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {inspeccionEditando ? 'Editar Inspección' : 'Nueva Inspección'}
                </h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data: ICrearInspeccionData = {
                    tipo: formData.get('tipo') as TipoInspeccion,
                    aeronave: formData.get('aeronave') as string,
                    fechaProgramada: new Date(formData.get('fechaProgramada') as string),
                    inspectorAsignado: formData.get('inspector') as string,
                    observaciones: formData.get('observaciones') as string
                  };
                  
                  if (inspeccionEditando) {
                    handleActualizarInspeccion(inspeccionEditando._id, data);
                  } else {
                    handleCrearInspeccion(data);
                  }
                }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Inspección
                    </label>
                    <select
                      name="tipo"
                      defaultValue={inspeccionEditando?.tipo || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      {Object.values(TipoInspeccion).map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aeronave
                    </label>
                    <select
                      name="aeronave"
                      defaultValue={inspeccionEditando?.aeronave || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar aeronave</option>
                      {aeronaves.map(aeronave => (
                        <option key={aeronave._id} value={aeronave._id}>
                          {aeronave.matricula} - {aeronave.modelo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Programada
                    </label>
                    <input
                      type="date"
                      name="fechaProgramada"
                      defaultValue={inspeccionEditando?.fechaProgramada?.split('T')[0] || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inspector Asignado
                    </label>
                    <input
                      type="text"
                      name="inspector"
                      defaultValue={inspeccionEditando?.inspectorAsignado || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del inspector"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      name="observaciones"
                      rows={3}
                      defaultValue={inspeccionEditando?.observaciones || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Observaciones adicionales"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading.crear || loading.actualizar}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading.crear || loading.actualizar ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}