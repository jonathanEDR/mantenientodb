import React, { useState, useEffect } from 'react';
import { 
  useMonitoreoCompleto, 
  type IMonitoreoCompletoResponse,
  type IComponenteMonitoreo,
  type IEstadoMonitoreoDetalle,
  type IAeronaveMonitoreo 
} from '../../hooks/useMonitoreoCompleto';

interface Props {
  onClickComponente?: (componenteId: string, aeronaveId: string) => void;
  onClickEstado?: (estadoId: string, componenteId: string) => void;
  onCompletarOverhaul?: (componenteId: string, estadoIds: string[]) => void;
  className?: string;
}

const MonitoreoAeronaveComponentes: React.FC<Props> = ({
  onClickComponente,
  onClickEstado,
  onCompletarOverhaul,
  className = ""
}) => {
  const [datos, setDatos] = useState<IMonitoreoCompletoResponse | null>(null);
  const [aeronaveExpandida, setAeronaveExpandida] = useState<string | null>(null);
  const [componenteExpandido, setComponenteExpandido] = useState<string | null>(null);
  
  // Hook personalizado
  const { 
    loading, 
    error: hookError, 
    obtenerMonitoreoCompleto, 
    completarOverhaul 
  } = useMonitoreoCompleto();

  // Cargar datos del monitoreo completo
  const cargarDatos = async () => {
    const response = await obtenerMonitoreoCompleto();
    if (response.success && response.data) {
      setDatos(response.data);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para manejar completar overhaul
  const handleCompletarOverhaul = async (componenteId: string, estadoIds: string[]) => {
    const response = await completarOverhaul(componenteId, estadoIds, 'Overhaul completado desde dashboard');
    if (response.success) {
      // Recargar datos después del overhaul
      await cargarDatos();
      onCompletarOverhaul?.(componenteId, estadoIds);
    }
  };

  // Función para obtener color según estado
  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'OK': return 'bg-green-100 text-green-800 border-green-200';
      case 'PROXIMO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'VENCIDO': return 'bg-red-100 text-red-800 border-red-200';
      case 'OVERHAUL_REQUERIDO': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para obtener color de progreso
  const obtenerColorProgreso = (progreso: number, estado: string) => {
    if (estado === 'OVERHAUL_REQUERIDO') return 'bg-purple-500';
    if (progreso >= 90) return 'bg-red-500';
    if (progreso >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (hookError) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">❌ Error</div>
          <p className="text-gray-600 mb-4">{hookError}</p>
          <button 
            onClick={cargarDatos}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Monitoreo Detallado de Componentes
            </h2>
            <p className="text-sm text-gray-500">
              Estado en tiempo real de todos los componentes por aeronave
            </p>
          </div>
          <button
            onClick={cargarDatos}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Actualizar
          </button>
        </div>
        
        {/* Resumen General */}
        {datos?.resumenGeneral && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{datos.resumenGeneral.totalAeronaves}</div>
              <div className="text-xs text-gray-600">Aeronaves</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{datos.resumenGeneral.totalComponentes}</div>
              <div className="text-xs text-gray-600">Componentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{datos.resumenGeneral.totalAlertas}</div>
              <div className="text-xs text-gray-600">Alertas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{datos.resumenGeneral.componentesRequierenOverhaul}</div>
              <div className="text-xs text-gray-600">Overhauls</div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Aeronaves */}
      <div className="p-6 space-y-4">
        {datos?.aeronaves.map((aeronave: IAeronaveMonitoreo) => (
          <div key={aeronave._id} className="border border-gray-200 rounded-lg">
            {/* Header de Aeronave */}
            <div 
              className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
              onClick={() => setAeronaveExpandida(
                aeronaveExpandida === aeronave._id ? null : aeronave._id
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {aeronaveExpandida === aeronave._id ? (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{aeronave.matricula}</h3>
                    <p className="text-sm text-gray-600">{aeronave.modelo} • {aeronave.horasVuelo}h vuelo</p>
                  </div>
                </div>
                
                {/* Resumen de la aeronave */}
                <div className="flex space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{aeronave.resumen.componentesOK}</div>
                    <div className="text-gray-500">OK</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">{aeronave.resumen.componentesProximos}</div>
                    <div className="text-gray-500">Próximos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">{aeronave.resumen.componentesVencidos}</div>
                    <div className="text-gray-500">Vencidos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{aeronave.resumen.componentesOverhaul}</div>
                    <div className="text-gray-500">Overhaul</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Componentes de la aeronave */}
            {aeronaveExpandida === aeronave._id && (
              <div className="border-t border-gray-200">
                {aeronave.componentes.map((componente: IComponenteMonitoreo) => (
                  <div key={componente._id} className="p-4 border-b border-gray-100 last:border-b-0">
                    {/* Header del componente */}
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => setComponenteExpandido(
                        componenteExpandido === componente._id ? null : componente._id
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 flex items-center justify-center">
                          {componenteExpandido === componente._id ? (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{componente.nombre}</h4>
                          <p className="text-sm text-gray-500">
                            {componente.numeroSerie} • {componente.horasAcumuladas}h acumuladas
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {componente.alertasActivas > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full">
                            {componente.alertasActivas} alerta{componente.alertasActivas > 1 ? 's' : ''}
                          </span>
                        )}
                        {componente.requiereOverhaul && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-full">
                            Overhaul Requerido
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Estados de monitoreo del componente */}
                    {componenteExpandido === componente._id && (
                      <div className="mt-3 ml-6 space-y-2">
                        {componente.estadosMonitoreo.map((estado: IEstadoMonitoreoDetalle) => (
                          <div 
                            key={estado._id}
                            className="bg-white border border-gray-200 rounded p-3 hover:shadow-sm cursor-pointer"
                            onClick={() => onClickEstado?.(estado._id, componente._id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm">{estado.controlId}</span>
                                  <span className={`px-2 py-1 text-xs rounded border ${obtenerColorEstado(estado.estado)}`}>
                                    {estado.estado}
                                  </span>
                                  {estado.alertaActiva && (
                                    <span className="text-red-500 text-xs">🔔 Alerta</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{estado.descripcionControl}</p>
                                
                                {/* Barra de progreso */}
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>{estado.valorActual} / {estado.valorLimite} {estado.unidad}</span>
                                    <span>{estado.progreso}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${obtenerColorProgreso(estado.progreso, estado.estado)}`}
                                      style={{ width: `${Math.min(estado.progreso, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Información de overhaul */}
                                {estado.configuracionOverhaul?.habilitarOverhaul && (
                                  <div className="mt-2 text-xs text-purple-600">
                                    Overhaul cada {estado.configuracionOverhaul.intervaloOverhaul}h 
                                    • Ciclo {estado.configuracionOverhaul.cicloActual}/{estado.configuracionOverhaul.ciclosOverhaul}
                                  </div>
                                )}
                              </div>
                              
                              <div className="ml-4 flex flex-col items-end space-y-1">
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClickEstado?.(estado._id, componente._id);
                                  }}
                                >
                                  Editar
                                </button>
                                {estado.configuracionOverhaul?.requiereOverhaul && (
                                  <button 
                                    className="text-purple-600 hover:text-purple-800 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompletarOverhaul(componente._id, [estado._id]);
                                    }}
                                  >
                                    Completar Overhaul
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonitoreoAeronaveComponentes;