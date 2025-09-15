import React, { useState, useEffect } from 'react';
import { obtenerOrdenesTrabajo, eliminarOrdenTrabajo } from '../utils/mantenimientoApi';
import { obtenerComponentes } from '../utils/mantenimientoApi';
import { obtenerAeronaves } from '../utils/inventarioApi';
import { IOrdenTrabajo, EstadoOrden, PrioridadOrden, IComponente } from '../types/mantenimiento';
import { IAeronave } from '../types/inventario';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function GestionOrdenesTrabajo() {
  const [ordenes, setOrdenes] = useState<IOrdenTrabajo[]>([]);
  const [componentes, setComponentes] = useState<IComponente[]>([]);
  const [aeronaves, setAeronaves] = useState<IAeronave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoOrden | ''>('');
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadOrden | ''>('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ordenEditando, setOrdenEditando] = useState<IOrdenTrabajo | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ordenesData, componentesData, aeronavesData] = await Promise.all([
        obtenerOrdenesTrabajo(),
        obtenerComponentes(),
        obtenerAeronaves()
      ]);
      // Extraer datos según la estructura de las respuestas
      setOrdenes(Array.isArray(ordenesData) ? ordenesData : ordenesData.data || []);
      setComponentes(Array.isArray(componentesData) ? componentesData : componentesData.data || []);
      setAeronaves(Array.isArray(aeronavesData) ? aeronavesData : aeronavesData.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const ordenesFiltradas = ordenes.filter(orden => {
    const pasaEstado = !filtroEstado || orden.estado === filtroEstado;
    const pasaPrioridad = !filtroPrioridad || orden.prioridad === filtroPrioridad;
    return pasaEstado && pasaPrioridad;
  });

  const obtenerColorEstado = (estado: EstadoOrden) => {
    switch (estado) {
      case EstadoOrden.PENDIENTE: return 'bg-yellow-100 text-yellow-800';
      case EstadoOrden.EN_PROCESO: return 'bg-blue-100 text-blue-800';
      case EstadoOrden.COMPLETADA: return 'bg-green-100 text-green-800';
      case EstadoOrden.CANCELADA: return 'bg-red-100 text-red-800';
      case EstadoOrden.SUSPENDIDA: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerColorPrioridad = (prioridad: PrioridadOrden) => {
    switch (prioridad) {
      case PrioridadOrden.CRITICA: return 'bg-red-100 text-red-800';
      case PrioridadOrden.ALTA: return 'bg-orange-100 text-orange-800';
      case PrioridadOrden.MEDIA: return 'bg-yellow-100 text-yellow-800';
      case PrioridadOrden.BAJA: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerNombreAeronave = (aeronaveId: string) => {
    const aeronave = aeronaves.find(a => a._id === aeronaveId);
    return aeronave ? `${aeronave.matricula} - ${aeronave.modelo}` : 'N/A';
  };

  const manejarEliminar = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta orden de trabajo?')) {
      try {
        await eliminarOrdenTrabajo(id);
        await cargarDatos();
      } catch (error) {
        console.error('Error al eliminar orden de trabajo:', error);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Órdenes de Trabajo</h1>
          <p className="text-gray-600">Administra las órdenes de mantenimiento de las aeronaves</p>
        </div>

      {/* Filtros y acciones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoOrden | '')}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos los estados</option>
              <option value={EstadoOrden.PENDIENTE}>Pendiente</option>
              <option value={EstadoOrden.EN_PROCESO}>En proceso</option>
              <option value={EstadoOrden.COMPLETADA}>Completada</option>
              <option value={EstadoOrden.CANCELADA}>Cancelada</option>
              <option value={EstadoOrden.SUSPENDIDA}>Suspendida</option>
            </select>

            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value as PrioridadOrden | '')}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todas las prioridades</option>
              <option value={PrioridadOrden.CRITICA}>Crítica</option>
              <option value={PrioridadOrden.ALTA}>Alta</option>
              <option value={PrioridadOrden.MEDIA}>Media</option>
              <option value={PrioridadOrden.BAJA}>Baja</option>
            </select>
          </div>

          <button
            onClick={() => setModalAbierto(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Orden de Trabajo
          </button>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden de Trabajo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aeronave
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Vencimiento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordenesFiltradas.map((orden) => (
                <tr key={orden._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{orden.numeroOrden}</div>
                      <div className="text-sm text-gray-500">{orden.titulo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{obtenerNombreAeronave(orden.aeronave)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{orden.tipo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorPrioridad(orden.prioridad)}`}>
                      {orden.prioridad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(orden.estado)}`}>
                      {orden.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {orden.fechaVencimiento 
                      ? new Date(orden.fechaVencimiento).toLocaleDateString()
                      : 'No programada'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {setOrdenEditando(orden); setModalAbierto(true);}}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Ver/Editar
                    </button>
                    <button
                      onClick={() => manejarEliminar(orden._id)}
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

        {ordenesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No se encontraron órdenes de trabajo</div>
          </div>
        )}
      </div>

      {/* Modal simplificado */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {ordenEditando ? `Orden: ${ordenEditando.numeroOrden}` : 'Nueva Orden de Trabajo'}
              </h3>
              <button
                onClick={() => {setModalAbierto(false); setOrdenEditando(null);}}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {ordenEditando ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título:</label>
                  <p className="text-gray-900">{ordenEditando.titulo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción:</label>
                  <p className="text-gray-900">{ordenEditando.descripcion}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo:</label>
                    <p className="text-gray-900">{ordenEditando.tipo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prioridad:</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorPrioridad(ordenEditando.prioridad)}`}>
                      {ordenEditando.prioridad}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aeronave:</label>
                  <p className="text-gray-900">{obtenerNombreAeronave(ordenEditando.aeronave)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(ordenEditando.estado)}`}>
                    {ordenEditando.estado}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horas Estimadas:</label>
                  <p className="text-gray-900">{ordenEditando.horasEstimadas}h</p>
                </div>
                {ordenEditando.observaciones && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Observaciones:</label>
                    <p className="text-gray-900">{ordenEditando.observaciones}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Funcionalidad de creación de órdenes de trabajo próximamente disponible.
                </p>
                <p className="text-sm text-gray-400">
                  Por ahora puedes ver y gestionar las órdenes existentes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}