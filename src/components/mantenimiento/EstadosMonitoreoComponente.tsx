import React, { useState } from 'react';
import { IEstadoMonitoreoComponente, IFormEstadoMonitoreo } from '../../types/estadosMonitoreoComponente';
import { useEstadosMonitoreoSimple } from '../../hooks/useEstadosMonitoreoSimple';
import { 
  obtenerColorEstado, 
  formatearFechaMonitoreo,
  crearEstadoMonitoreoComponente,
  actualizarEstadoMonitoreoComponente,
  eliminarEstadoMonitoreoComponente,
  completarOverhaulEstado
} from '../../utils/estadosMonitoreoComponenteApi';
import ModalEstadoMonitoreo from './ModalEstadoMonitoreo';
import FiltrosEstadosMonitoreo from './FiltrosEstadosMonitoreo';
import { usePermissions } from '../../hooks/useRoles';
import SemaforoIndicador from '../semaforo/SemaforoIndicador';
import { calcularSemaforoSimple } from '../../utils/semaforoUtils';

interface EstadosMonitoreoComponenteProps {
  componenteId: string;
  numeroSerie: string;
  nombreComponente: string;
  className?: string;
}

const EstadosMonitoreoComponente: React.FC<EstadosMonitoreoComponenteProps> = ({
  componenteId,
  numeroSerie,
  nombreComponente,
  className = ''
}) => {
  const permissions = usePermissions();
  const {
    estados,
    loading,
    error,
    actualizarEstados
  } = useEstadosMonitoreoSimple(componenteId);

  // Estados para modales y filtros
  const [modalAbierto, setModalAbierto] = useState(false);
  const [estadoEditando, setEstadoEditando] = useState<IEstadoMonitoreoComponente | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Estados temporales para funcionalidad básica
  const estadosFiltrados = estados;

  // Calcular estadísticas
  const estadisticas = {
    total: estados.length,
    ok: estados.filter(e => e.estado === 'OK').length,
    proximos: estados.filter(e => e.estado === 'PROXIMO').length,
    vencidos: estados.filter(e => e.estado === 'VENCIDO').length,
    conAlertas: estados.filter(e => e.alertaActiva).length
  };

  const handleCrearEstado = () => {
    setEstadoEditando(null);
    setModalAbierto(true);
  };

  const handleEditarEstado = (estado: IEstadoMonitoreoComponente) => {
    setEstadoEditando(estado);
    setModalAbierto(true);
  };

  const handleGuardarEstado = async (datos: IFormEstadoMonitoreo): Promise<boolean> => {
    setGuardando(true);
    
    try {
      let resultado;
      
      if (estadoEditando) {
        // Modo edición - actualizar estado existente
        resultado = await actualizarEstadoMonitoreoComponente(estadoEditando._id, datos);
      } else {
        // Modo creación - crear nuevo estado
        resultado = await crearEstadoMonitoreoComponente(componenteId, datos);
      }

      if (resultado.success) {
        setModalAbierto(false);
        setEstadoEditando(null);
        // Esperar un momento antes de actualizar para asegurar que la BD se actualizó
        setTimeout(() => {
          actualizarEstados();
        }, 300);
        return true;
      } else {
        alert(`Error al guardar estado: ${resultado.error}`);
        return false;
      }
    } catch (error: any) {
      alert(`Error inesperado: ${error.message || 'Error desconocido'}`);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarEstado = async (estadoId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este estado de monitoreo?')) {
      return;
    }

    try {
      const resultado = await eliminarEstadoMonitoreoComponente(estadoId);
      
      if (resultado.success) {
        actualizarEstados();
      } else {
        alert(`Error al eliminar estado: ${resultado.error}`);
      }
    } catch (error: any) {
      alert(`Error inesperado: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleCompletarOverhaul = async (estado: IEstadoMonitoreoComponente) => {
    const observaciones = prompt(
      `¿Deseas agregar observaciones sobre el overhaul completado?\n\n` +
      `Componente: ${typeof estado.componenteId === 'object' ? estado.componenteId.numeroSerie : ''}\n` +
      `Control: ${typeof estado.catalogoControlId === 'object' ? estado.catalogoControlId.descripcionCodigo : ''}\n` +
      `Ciclo actual: ${estado.configuracionOverhaul?.cicloActual || 0} de ${estado.configuracionOverhaul?.ciclosOverhaul || 0}`
    );

    if (observaciones === null) {
      return; // Usuario canceló
    }

    try {
      const resultado = await completarOverhaulEstado(estado._id, observaciones || undefined);
      
      if (resultado.success) {
        const cicloNuevo = resultado.data?.configuracionOverhaul?.cicloActual || 0;
        const cicloTotal = resultado.data?.configuracionOverhaul?.ciclosOverhaul || 0;
        alert(`¡Overhaul completado exitosamente!\n\nCiclo ${cicloNuevo} de ${cicloTotal}`);
        actualizarEstados();
      } else {
        alert(`Error al completar overhaul: ${resultado.error}`);
      }
    } catch (error: any) {
      alert(`Error inesperado: ${error.message || 'Error desconocido'}`);
    }
  };

  const renderEstadisticas = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="text-lg font-bold text-blue-900">{estadisticas.total}</div>
        <div className="text-xs text-blue-600">Total Estados</div>
      </div>
      <div className="bg-green-50 rounded-lg p-3">
        <div className="text-lg font-bold text-green-900">{estadisticas.ok}</div>
        <div className="text-xs text-green-600">Al Día</div>
      </div>
      <div className="bg-yellow-50 rounded-lg p-3">
        <div className="text-lg font-bold text-yellow-900">{estadisticas.proximos}</div>
        <div className="text-xs text-yellow-600">Próximos</div>
      </div>
      <div className="bg-red-50 rounded-lg p-3">
        <div className="text-lg font-bold text-red-900">{estadisticas.vencidos}</div>
        <div className="text-xs text-red-600">Vencidos</div>
      </div>
      <div className="bg-orange-50 rounded-lg p-3">
        <div className="text-lg font-bold text-orange-900">{estadisticas.conAlertas}</div>
        <div className="text-xs text-orange-600">Con Alertas</div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Estados de Monitoreo
        </h3>
        <p className="text-sm text-gray-600">
          {numeroSerie} - {nombreComponente}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            mostrarFiltros 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filtros
        </button>
        <button
          onClick={actualizarEstados}
          disabled={loading}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <svg className={`w-4 h-4 inline mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
        {/* Botón Agregar Estado - Solo ADMINISTRADOR y MECANICO */}
        {(permissions.isAdmin || permissions.isMechanic) && (
          <button
            onClick={handleCrearEstado}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Estado
          </button>
        )}
      </div>
    </div>
  );

  const renderTablaEstados = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Control
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                TSO
                <div className="text-[10px] font-normal text-gray-400 normal-case mt-0.5">
                  Time Since Overhaul
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                TSN
                <div className="text-[10px] font-normal text-gray-400 normal-case mt-0.5">
                  Time Since New
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progreso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Próxima Revisión
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semáforo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estadosFiltrados.map((estado) => {
              const catalogoControl = typeof estado.catalogoControlId === 'object' 
                ? estado.catalogoControlId 
                : null;
              const porcentajeProgreso = Math.min((estado.valorActual / estado.valorLimite) * 100, 100);
              
              // Calcular horas restantes para el semáforo
              const horasRestantes = estado.valorLimite - estado.valorActual;
              
              // Determinar qué configuración de semáforo usar (overhaul o personalizada)
              const configuracionSemaforo = estado.configuracionOverhaul?.habilitarOverhaul 
                ? estado.configuracionOverhaul.semaforoPersonalizado
                : estado.configuracionPersonalizada?.semaforoPersonalizado;
              
              // ===== CALCULAR SEMÁFORO CON SINCRONIZACIÓN DE OVERHAUL =====
              // Solo pasa el estado, NO requiereOverhaul del backend
              // El semáforo se calcula basado en:
              // 1. Si estado = 'OVERHAUL_REQUERIDO' → ROJO
              // 2. Si horasRestantes <= 0 → ROJO (alcanzó límite)
              // 3. Evaluar según umbrales del semáforo
              
              // 🔍 DEBUG: Logs temporales para diagnosticar semáforo
              if (catalogoControl?.descripcionCodigo === 'TRR') {
                console.group('🔍 DEBUG SEMÁFORO - TRR');
                console.log('Estado DB:', estado.estado);
                console.log('Requiere Overhaul (backend):', estado.configuracionOverhaul?.requiereOverhaul);
                console.log('Valor Actual:', estado.valorActual);
                console.log('Valor Límite:', estado.valorLimite);
                console.log('Horas Restantes:', horasRestantes);
                console.log('Ciclo:', estado.configuracionOverhaul?.cicloActual, 'de', estado.configuracionOverhaul?.ciclosOverhaul);
                console.log('Intervalo Overhaul:', estado.configuracionOverhaul?.intervaloOverhaul);
                console.log('Configuración Semáforo:', JSON.stringify(configuracionSemaforo, null, 2));
                console.groupEnd();
              }
              
              const resultadoSemaforo = calcularSemaforoSimple(
                horasRestantes, 
                configuracionSemaforo,
                {
                  estado: estado.estado  // Solo pasar el estado, no requiereOverhaul
                }
              );
              
              // 🔍 DEBUG: Resultado del semáforo
              if (catalogoControl?.descripcionCodigo === 'TRR') {
                console.log('🔍 Resultado Semáforo TRR:', resultadoSemaforo);
              }
              
              // ===== CÁLCULO TSO y TSN =====
              // TSO = Time Since Overhaul (horas desde último overhaul)
              // Si tiene overhaul habilitado: TSO = valorActual % intervaloOverhaul
              // Si no tiene overhaul: TSO = valorActual
              const tso = estado.configuracionOverhaul?.habilitarOverhaul
                ? estado.valorActual % (estado.configuracionOverhaul.intervaloOverhaul || 1)
                : estado.valorActual;
              
              // TSN = Time Since New (horas que EXCEDEN el límite del control)
              // TSN SOLO acumula cuando valorActual > valorLimite
              // Mientras esté dentro del límite, TSN = 0
              const tsn = Math.max(0, estado.valorActual - estado.valorLimite);
              
              // Calcular horas excedidas si está vencido
              const horasExcedidas = estado.valorActual > estado.valorLimite 
                ? estado.valorActual - estado.valorLimite 
                : 0;
              
              return (
                <tr key={estado._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {catalogoControl?.descripcionCodigo || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Límite: {estado.valorLimite} {estado.unidad.toLowerCase()}
                      </div>
                    </div>
                  </td>
                  
                  {/* Columna TSO */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {tso} h
                    </div>
                    {horasExcedidas > 0 && (
                      <div className="text-xs font-medium text-red-600 mt-1">
                        +{horasExcedidas}h excedido
                      </div>
                    )}
                  </td>
                  
                  {/* Columna TSN */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-semibold text-gray-900">
                      {tsn} h
                    </div>
                    {estado.configuracionOverhaul?.habilitarOverhaul && (
                      <div className="text-xs text-gray-500 mt-1">
                        Ciclo {estado.configuracionOverhaul.cicloActual} de {estado.configuracionOverhaul.ciclosOverhaul}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          estado.estado === 'VENCIDO' ? 'bg-red-500' :
                          estado.estado === 'PROXIMO' ? 'bg-yellow-500' : 
                          estado.estado === 'OVERHAUL_REQUERIDO' ? 'bg-purple-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${porcentajeProgreso}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {porcentajeProgreso.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${obtenerColorEstado(estado.estado)}`}>
                      {estado.estado === 'OK' ? 'Al día' : 
                       estado.estado === 'PROXIMO' ? 'Próximo' : 
                       estado.estado === 'VENCIDO' ? 'Vencido' : 
                       estado.estado === 'OVERHAUL_REQUERIDO' ? 'Overhaul Requerido' : estado.estado}
                    </span>
                    {estado.alertaActiva && (
                      <div className="text-xs text-red-600 mt-1">
                        🔔 Alerta activa
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFechaMonitoreo(estado.fechaProximaRevision)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {configuracionSemaforo?.habilitado ? (
                      <SemaforoIndicador 
                        color={resultadoSemaforo.color}
                        descripcion={resultadoSemaforo.descripcion}
                        tamaño="md"
                        mostrarTexto={true}
                      />
                    ) : (
                      <span className="text-xs text-gray-500 italic">
                        Sin semáforo configurado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-2">
                      {/* Botones principales */}
                      <div className="flex space-x-2">
                        {/* Botón Editar - Solo ADMINISTRADOR y MECANICO */}
                        {(permissions.isAdmin || permissions.isMechanic) && (
                          <button
                            onClick={() => handleEditarEstado(estado)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Editar
                          </button>
                        )}
                        
                        {/* Botón Eliminar - Solo ADMINISTRADOR */}
                        {permissions.isAdmin && (
                          <button
                            onClick={() => handleEliminarEstado(estado._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      {/* Botón Completar Overhaul - Solo si requiere overhaul */}
                      {estado.configuracionOverhaul?.requiereOverhaul && 
                       estado.estado === 'OVERHAUL_REQUERIDO' && 
                       (permissions.isAdmin || permissions.isMechanic) && (
                        <button
                          onClick={() => handleCompletarOverhaul(estado)}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Completar Overhaul
                        </button>
                      )}

                      {/* Información de overhaul si está habilitado */}
                      {estado.configuracionOverhaul?.habilitarOverhaul && (
                        <div className="text-xs text-gray-500">
                          Ciclo {estado.configuracionOverhaul.cicloActual} de {estado.configuracionOverhaul.ciclosOverhaul}
                        </div>
                      )}

                      {/* Mensaje para roles sin permisos */}
                      {!permissions.isAdmin && !permissions.isMechanic && (
                        <span className="text-gray-500 text-xs italic">Solo visualización</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {estadosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No hay estados de monitoreo</div>
          <div className="text-gray-400 mt-2">
            {estadosFiltrados.length !== estadisticas.total 
              ? 'Prueba ajustando los filtros de búsqueda'
              : 'Agrega el primer estado de monitoreo para este componente'
            }
          </div>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-red-600 font-medium">Error</div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
        <button
          onClick={actualizarEstados}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {renderHeader()}
      
      {/* Filtros temporalmente deshabilitados */}
      
      {renderEstadisticas()}
      
      {loading && estadisticas.total === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Cargando estados de monitoreo...</span>
        </div>
      ) : (
        renderTablaEstados()
      )}

      {/* Modal para crear/editar estado */}
      <ModalEstadoMonitoreo
        abierto={modalAbierto}
        estado={estadoEditando}
        onCerrar={() => {
          setModalAbierto(false);
          setEstadoEditando(null);
        }}
        onGuardar={handleGuardarEstado}
        loading={guardando}
        componenteId={componenteId}
      />
    </div>
  );
};

export default EstadosMonitoreoComponente;