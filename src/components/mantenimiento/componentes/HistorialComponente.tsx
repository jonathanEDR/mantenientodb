import React, { useState, useEffect } from 'react';
import { IComponente, EstadoComponente } from '../../../types/mantenimiento';
import { IAeronave } from '../../../types/inventario';
import EstadosMonitoreoComponente from '../EstadosMonitoreoComponente';
import { usePermissions } from '../../../hooks/useRoles';

interface HistorialComponenteProps {
  componente: IComponente;
  aeronaves: IAeronave[];
  onClose: () => void;
  onUpdate: (componenteId: string, data: any) => Promise<void>;
  initialTab?: 'info' | 'estado' | 'observaciones' | 'historial' | 'monitoreo';
}

interface RegistroHistorial {
  fecha: string;
  tipo: 'HORAS' | 'ESTADO' | 'OBSERVACION' | 'INSTALACION';
  descripcion: string;
  valorAnterior?: string;
  valorNuevo?: string;
  usuario?: string;
}

export default function HistorialComponente({
  componente,
  aeronaves,
  onClose,
  onUpdate,
  initialTab = 'info'
}: HistorialComponenteProps) {
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState<'info' | 'estado' | 'observaciones' | 'historial' | 'monitoreo'>(initialTab);
  const [loading, setLoading] = useState(false);
  
  // Estados para formularios
  const [estadoFormData, setEstadoFormData] = useState({
    nuevoEstado: componente.estado,
    fechaCambio: new Date().toISOString().split('T')[0],
    razonCambio: '',
    ubicacionFisica: componente.ubicacionFisica || ''
  });

  const [observacionesFormData, setObservacionesFormData] = useState({
    nuevaObservacion: '',
    fechaObservacion: new Date().toISOString().split('T')[0]
  });

  // Historial simulado (en el futuro vendría del backend)
  const [historial, setHistorial] = useState<RegistroHistorial[]>([
    {
      fecha: componente.fechaInstalacion || componente.fechaFabricacion,
      tipo: 'INSTALACION',
      descripcion: 'Componente creado en el sistema',
      valorNuevo: componente.estado
    }
  ]);

  const obtenerNombreAeronave = (aeronaveId?: string | IAeronave) => {
    if (!aeronaveId) return 'No asignada';
    
    // Si aeronaveId es un objeto (poblado)
    if (typeof aeronaveId === 'object' && aeronaveId !== null) {
      const aeronave = aeronaveId as IAeronave;
      return `${aeronave.matricula} - ${aeronave.modelo}`;
    }
    
    // Si es un string (ObjectId)
    const aeronave = aeronaves.find(a => a._id === aeronaveId);
    return aeronave ? `${aeronave.matricula} - ${aeronave.modelo}` : 'N/A';
  };

  const calcularHorasTotales = () => {
    return componente.vidaUtil?.reduce((total, vida) => {
      return total + (vida.acumulado || 0);
    }, 0) || 0;
  };

  const manejarCambioEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      await onUpdate(componente._id, {
        estado: estadoFormData.nuevoEstado,
        ubicacionFisica: estadoFormData.ubicacionFisica,
        observaciones: `${componente.observaciones || ''}\n[${estadoFormData.fechaCambio}] Estado cambiado de ${componente.estado} a ${estadoFormData.nuevoEstado}. Razón: ${estadoFormData.razonCambio}`.trim()
      });

      // Agregar al historial
      const nuevoRegistro: RegistroHistorial = {
        fecha: estadoFormData.fechaCambio,
        tipo: 'ESTADO',
        descripcion: `Estado cambiado: ${estadoFormData.razonCambio}`,
        valorAnterior: componente.estado,
        valorNuevo: estadoFormData.nuevoEstado
      };
      
      setHistorial([nuevoRegistro, ...historial]);
      
      alert('Estado actualizado exitosamente');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const manejarNuevaObservacion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const observacionConFecha = `[${observacionesFormData.fechaObservacion}] ${observacionesFormData.nuevaObservacion}`;
      const observacionesActualizadas = componente.observaciones 
        ? `${componente.observaciones}\n${observacionConFecha}`
        : observacionConFecha;

      await onUpdate(componente._id, {
        observaciones: observacionesActualizadas
      });

      // Agregar al historial
      const nuevoRegistro: RegistroHistorial = {
        fecha: observacionesFormData.fechaObservacion,
        tipo: 'OBSERVACION',
        descripcion: observacionesFormData.nuevaObservacion
      };
      
      setHistorial([nuevoRegistro, ...historial]);
      
      // Limpiar formulario
      setObservacionesFormData({
        nuevaObservacion: '',
        fechaObservacion: new Date().toISOString().split('T')[0]
      });
      
      alert('Observación agregada exitosamente');
    } catch (error) {
      console.error('Error al agregar observación:', error);
      alert('Error al agregar la observación');
    } finally {
      setLoading(false);
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'INSTALADO':
      case 'OPERATIVO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EN_ALMACEN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EN_MANTENIMIENTO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EN_REPARACION':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'FUERA_DE_SERVICIO':
      case 'CONDENADO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const obtenerIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'HORAS':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'ESTADO':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'OBSERVACION':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'INSTALACION':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{componente.nombre}</h2>
              <p className="text-blue-100">S/N: {componente.numeroSerie} | P/N: {componente.numeroParte}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'info', label: 'Información', icon: '📋' },
              { id: 'estado', label: 'Cambio de Estado', icon: '🔄' },
              { id: 'observaciones', label: 'Observaciones', icon: '📝' },
              { id: 'monitoreo', label: 'Estados Monitoreo', icon: '📊' },
              { id: 'historial', label: 'Historial', icon: '📜' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Estado Actual</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${obtenerColorEstado(componente.estado)}`}>
                    {componente.estado.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Aeronave Asignada</h3>
                  <p className="text-gray-600">{obtenerNombreAeronave(componente.aeronaveActual)}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Horas Acumuladas</h3>
                  <p className="text-2xl font-bold text-blue-600">{calcularHorasTotales()}</p>
                  <p className="text-sm text-gray-500">horas de operación</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Ubicación</h3>
                  <p className="text-gray-600">{componente.ubicacionFisica || 'No especificada'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Fabricante</h3>
                  <p className="text-gray-600">{componente.fabricante}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Fecha de Fabricación</h3>
                  <p className="text-gray-600">
                    {new Date(componente.fechaFabricacion).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {componente.observaciones && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Observaciones Actuales</h3>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">{componente.observaciones}</pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'estado' && (
            <form onSubmit={manejarCambioEstado} className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Estado Actual</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${obtenerColorEstado(componente.estado)}`}>
                  {componente.estado.replace(/_/g, ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Estado *
                  </label>
                  <select
                    value={estadoFormData.nuevoEstado}
                    onChange={(e) => setEstadoFormData({...estadoFormData, nuevoEstado: e.target.value as EstadoComponente})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="INSTALADO">Instalado</option>
                    <option value="EN_ALMACEN">En Almacén</option>
                    <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                    <option value="EN_REPARACION">En Reparación</option>
                    <option value="FUERA_DE_SERVICIO">Fuera de Servicio</option>
                    <option value="CONDENADO">Condenado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Cambio *
                  </label>
                  <input
                    type="date"
                    value={estadoFormData.fechaCambio}
                    onChange={(e) => setEstadoFormData({...estadoFormData, fechaCambio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación Física
                </label>
                <input
                  type="text"
                  value={estadoFormData.ubicacionFisica}
                  onChange={(e) => setEstadoFormData({...estadoFormData, ubicacionFisica: e.target.value})}
                  placeholder="Ej: Hangar A, Taller de reparaciones, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón del Cambio *
                </label>
                <textarea
                  value={estadoFormData.razonCambio}
                  onChange={(e) => setEstadoFormData({...estadoFormData, razonCambio: e.target.value})}
                  placeholder="Describe la razón del cambio de estado..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Cambiando Estado...' : 'Cambiar Estado'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'observaciones' && (
            <div className="space-y-6">
              {/* Formulario para agregar observaciones - Solo ADMINISTRADOR y ESPECIALISTA */}
              {(permissions.isAdmin || permissions.isSpecialist) && (
                <form onSubmit={manejarNuevaObservacion} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva Observación *
                      </label>
                      <textarea
                        value={observacionesFormData.nuevaObservacion}
                        onChange={(e) => setObservacionesFormData({...observacionesFormData, nuevaObservacion: e.target.value})}
                        placeholder="Escribe tu observación aquí..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha *
                      </label>
                      <input
                        type="date"
                        value={observacionesFormData.fechaObservacion}
                        onChange={(e) => setObservacionesFormData({...observacionesFormData, fechaObservacion: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Agregando...' : 'Agregar Observación'}
                    </button>
                  </div>
                </form>
              )}

              {/* Mensaje informativo para roles sin permisos de escritura */}
              {!(permissions.isAdmin || permissions.isSpecialist) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Solo lectura</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Puedes ver las observaciones existentes, pero no agregar nuevas. Solo administradores y especialistas pueden crear observaciones.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {componente.observaciones && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Observaciones Existentes</h3>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {componente.observaciones}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'monitoreo' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estados de Monitoreo</h3>
              <EstadosMonitoreoComponente 
                componenteId={componente._id!}
                numeroSerie={componente.numeroSerie}
                nombreComponente={componente.nombre}
                className="bg-white"
              />
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Cambios</h3>
              
              <div className="space-y-4">
                {historial.map((registro, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {obtenerIconoTipo(registro.tipo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {registro.descripcion}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(registro.fecha).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {(registro.valorAnterior || registro.valorNuevo) && (
                        <div className="mt-1 text-xs text-gray-600">
                          {registro.valorAnterior && (
                            <span>Anterior: {registro.valorAnterior}</span>
                          )}
                          {registro.valorAnterior && registro.valorNuevo && (
                            <span className="mx-2">→</span>
                          )}
                          {registro.valorNuevo && (
                            <span>Nuevo: {registro.valorNuevo}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {historial.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay registros en el historial
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}