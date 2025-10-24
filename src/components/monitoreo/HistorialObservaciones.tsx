import React, { useState, useEffect } from 'react';
import { estadosMonitoreoComponenteService } from '../../services/estadosMonitoreoComponenteService';
import { IObservacionHistorial } from '../../types/estadosMonitoreoComponente';

// Iconos SVG simples
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
);

const MessageIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <path d="M12 9v4"></path>
    <path d="m12 17 .01 0"></path>
  </svg>
);

const ToolIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);

const RefreshIcon = ({ spinning }: { spinning?: boolean }) => (
  <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
  </svg>
);

interface HistorialObservacionesProps {
  estadoId: string;
  componenteNombre?: string;
  onClose: () => void;
}

const HistorialObservaciones: React.FC<HistorialObservacionesProps> = ({
  estadoId,
  componenteNombre,
  onClose
}) => {
  const [historial, setHistorial] = useState<IObservacionHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [limite, setLimite] = useState<number>(50);

  const tiposObservacion = [
    { value: 'todos', label: 'Todos', icon: MessageIcon },
    { value: 'observacion', label: 'Observaciones', icon: MessageIcon },
    { value: 'cambio_estado', label: 'Cambios de Estado', icon: AlertIcon },
    { value: 'overhaul', label: 'Overhauls', icon: RefreshIcon },
    { value: 'mantenimiento', label: 'Mantenimiento', icon: ToolIcon }
  ];

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const opciones: any = { limite };
      
      if (filtroTipo !== 'todos') {
        opciones.tipo = filtroTipo as any;
      }

      const response = await estadosMonitoreoComponenteService.obtenerHistorialObservaciones(
        estadoId,
        opciones
      );

      setHistorial(response.data.historial);
      setError(null);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('Error al cargar el historial de observaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [estadoId, filtroTipo, limite]);

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerIconoTipo = (tipo: string) => {
    const tipoInfo = tiposObservacion.find(t => t.value === tipo);
    const IconComponent = tipoInfo?.icon || MessageIcon;
    return <IconComponent />;
  };

  const obtenerColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'observacion':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cambio_estado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overhaul':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'mantenimiento':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Historial de Observaciones
            </h2>
            {componenteNombre && (
              <p className="text-sm text-gray-600 mt-1">
                Componente: {componenteNombre}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterIcon />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tiposObservacion.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mostrar:</span>
              <select
                value={limite}
                onChange={(e) => setLimite(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25 registros</option>
                <option value={50}>50 registros</option>
                <option value={100}>100 registros</option>
              </select>
            </div>

            <button
              onClick={cargarHistorial}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              <RefreshIcon spinning={loading} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-blue-600">
                <RefreshIcon spinning={true} />
              </div>
              <span className="ml-2 text-gray-600">Cargando historial...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mx-auto mb-4 flex justify-center">
                <AlertIcon />
              </div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={cargarHistorial}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mx-auto mb-4 flex justify-center">
                <MessageIcon />
              </div>
              <p className="text-gray-600">No hay observaciones registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map((observacion, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${obtenerColorTipo(observacion.tipo)} flex items-center gap-1`}>
                        {obtenerIconoTipo(observacion.tipo)}
                        {tiposObservacion.find(t => t.value === observacion.tipo)?.label || observacion.tipo}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ClockIcon />
                        {formatearFecha(observacion.fecha)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <UserIcon />
                      {observacion.usuario}
                    </div>
                  </div>
                  
                  <div className="text-gray-900">
                    {observacion.texto}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con información */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {historial.length} registros
            </span>
            <span>
              Filtro: {tiposObservacion.find(t => t.value === filtroTipo)?.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialObservaciones;