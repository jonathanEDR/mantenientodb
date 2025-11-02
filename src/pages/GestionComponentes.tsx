import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IComponente } from '../types/mantenimiento';
import { IAeronave } from '../types/inventario';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  ComponentesTable,
  ComponentesFilters,
  ComponenteModal
} from '../components/mantenimiento';
import HistorialComponente from '../components/mantenimiento/componentes/HistorialComponente';
import EstadosMonitoreoComponente from '../components/mantenimiento/EstadosMonitoreoComponente';
import { useModal } from '../hooks';
import { obtenerAeronaves } from '../utils/inventarioApi';
import { obtenerComponentes } from '../utils/mantenimientoApi';

export default function GestionComponentes() {
  // Hook para parámetros de URL
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados locales para datos
  const [componentes, setComponentes] = useState<IComponente[]>([]);
  const [aeronaves, setAeronaves] = useState<IAeronave[]>([]);
  const [loadingComponentes, setLoadingComponentes] = useState(true);
  const [loadingAeronaves, setLoadingAeronaves] = useState(true);
  const [errorComponentes, setErrorComponentes] = useState<string | null>(null);

  // Cargar componentes
  useEffect(() => {
    const fetchComponentes = async () => {
      try {
        setLoadingComponentes(true);
        const response = await obtenerComponentes();
        if (response.success && response.data) {
          setComponentes(response.data);
        }
        setErrorComponentes(null);
      } catch (error) {
        setErrorComponentes('Error al cargar componentes');
      } finally {
        setLoadingComponentes(false);
      }
    };
    fetchComponentes();
  }, []);

  // Cargar aeronaves
  useEffect(() => {
    const fetchAeronaves = async () => {
      try {
        setLoadingAeronaves(true);
        const response = await obtenerAeronaves();
        if (response.success && response.data) {
          setAeronaves(response.data);
        }
      } catch (error) {
        console.error('Error al cargar aeronaves:', error);
      } finally {
        setLoadingAeronaves(false);
      }
    };
    fetchAeronaves();
  }, []);

  // Efecto para manejar parámetros de URL
  useEffect(() => {
    const componenteId = searchParams.get('componenteId');
    const aeronaveId = searchParams.get('aeronaveId');
    const estadoId = searchParams.get('estadoId');
    
    if (componenteId && componentes.length > 0) {
      console.log('🔍 [COMPONENTES] Buscando componente por ID desde URL:', componenteId);
      
      // Buscar el componente específico
      const componenteEncontrado = componentes.find(comp => comp._id === componenteId);
      
      if (componenteEncontrado) {
        console.log('✅ [COMPONENTES] Componente encontrado:', componenteEncontrado.nombre);
        
        // Mostrar notificación de llegada desde dashboard
        setMostrarNotificacionDashboard(true);
        setComponenteDesdeDatabase(`${componenteEncontrado.numeroSerie || componenteEncontrado.nombre}`);
        
        // Si viene desde dashboard, mostrar información contextual
        if (aeronaveId) {
          console.log('📍 [COMPONENTES] Contexto de aeronave:', aeronaveId);
        }
        
        if (estadoId) {
          console.log('📋 [COMPONENTES] Enfoque en estado específico:', estadoId);
        }
        
        // Abrir directamente el módulo de monitoreo del componente
        setComponenteMonitoreo(componenteEncontrado);
        setMonitoreoAbierto(true);
        
        // Opcional: Filtrar para mostrar solo este componente
        setFiltroBusqueda(componenteEncontrado.numeroSerie || componenteEncontrado.nombre || '');
        
        // Ocultar notificación después de unos segundos
        setTimeout(() => {
          setMostrarNotificacionDashboard(false);
        }, 5000);
        
        // Limpiar los parámetros de URL después de procesar
        setTimeout(() => {
          setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.delete('componenteId');
            newParams.delete('aeronaveId');
            newParams.delete('estadoId');
            return newParams;
          });
        }, 1000); // Dar tiempo para que se procese antes de limpiar
      } else {
        console.warn('⚠️ [COMPONENTES] Componente no encontrado con ID:', componenteId);
      }
    }
  }, [componentes, searchParams, setSearchParams]);

  // Estados derivados
  const loading = loadingComponentes || loadingAeronaves;
  const error = errorComponentes ? 'Error al cargar componentes' : null;

  // Función auxiliar para obtener nombre de aeronave
  const obtenerAeronaveNombre = (aeronaveId: string): string => {
    const aeronave = aeronaves.find(a => a._id === aeronaveId);
    return aeronave ? `${aeronave.matricula} - ${aeronave.modelo}` : 'N/A';
  };

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

  // Estado para notificación de navegación desde dashboard
  const [mostrarNotificacionDashboard, setMostrarNotificacionDashboard] = React.useState(false);
  const [componenteDesdeDashboard, setComponenteDesdeDatabase] = React.useState<string>('');

  // Filtrar componentes localmente
  const componentesFiltrados = React.useMemo(() => {
    return componentes.filter((componente: IComponente) => {
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
      
      // Simulación de guardado - aquí irían las llamadas API directas
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recargar componentes después del guardado
      const fetchComponentes = async () => {
        const response = await obtenerComponentes();
        if (response.success && response.data) {
          setComponentes(response.data);
        }
      };
      await fetchComponentes();
      
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar componente:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const manejarEliminar = async (componente: IComponente) => {
    if (!componente._id) return;
    
    if (!confirm('¿Está seguro de eliminar este componente?')) return;
    
    try {
      // Simulación de eliminación - aquí iría la llamada API directa
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recargar componentes después de eliminar
      const fetchComponentes = async () => {
        const response = await obtenerComponentes();
        if (response.success && response.data) {
          setComponentes(response.data);
        }
      };
      await fetchComponentes();
    } catch (error) {
      console.error('Error al eliminar componente:', error);
    }
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
      // Simulación de actualización - aquí iría la llamada API directa
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizar el componente en el estado local
      if (componenteHistorial) {
        const componenteActualizado = { ...componenteHistorial, ...data };
        setComponenteHistorial(componenteActualizado);
      }
      
      // Recargar componentes
      const fetchComponentes = async () => {
        const response = await obtenerComponentes();
        if (response.success && response.data) {
          setComponentes(response.data);
        }
      };
      await fetchComponentes();
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
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Gestión de Componentes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Total: {componentesFiltrados.length} componentes 
              {componentesFiltrados.length !== componentes.length && 
                ` (filtrados de ${componentes.length})`
              } • Mostrando 3 por página para optimizar rendimiento
            </p>
          </div>
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

        {/* Notificación de navegación desde dashboard */}
        {mostrarNotificacionDashboard && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  📊 Navegaste desde el Dashboard de Monitoreo
                </h4>
                <p className="text-sm text-blue-700">
                  Se ha abierto automáticamente el monitoreo del componente <strong>{componenteDesdeDashboard}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setMostrarNotificacionDashboard(false)}
              className="text-blue-400 hover:text-blue-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

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

        {/* Módulo de Monitoreo - LAZY LOADING */}
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
                  <p className="text-xs text-blue-600 mt-1">
                    ⚡ Carga bajo demanda - Los estados se cargan solo cuando se necesitan
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
                {/* Solo renderizar cuando el modal está abierto (lazy loading) */}
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