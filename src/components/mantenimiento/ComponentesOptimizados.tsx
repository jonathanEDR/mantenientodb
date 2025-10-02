import React from 'react';
import { useComponentesConEstadosBatch } from '../../hooks/queries/useComponentesBatch';
import { IComponente } from '../../types/mantenimiento';
import { IEstadoMonitoreoComponente } from '../../types/estadosMonitoreoComponente';

interface ComponentesOptimizadosProps {
  className?: string;
}

/**
 * Componente de ejemplo que demuestra el uso del batch loading optimizado
 * Reduce N+1 consultas a consultas agrupadas por aeronave
 */
const ComponentesOptimizados: React.FC<ComponentesOptimizadosProps> = ({ className = '' }) => {
  const { 
    data, 
    isLoading, 
    error 
  } = useComponentesConEstadosBatch();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
        <h3 className="text-red-800 font-medium">Error al cargar componentes</h3>
        <p className="text-red-600 mt-1">{error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  const { componentes, componentesPorAeronave, estadosMap, totalComponentes, totalEstados } = data;

  return (
    <div className={className}>
      {/* Header con estadísticas de optimización */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <h3 className="text-green-800 font-medium flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Carga Optimizada por Lotes (Batch Loading)
        </h3>
        <div className="text-green-700 mt-2 text-sm">
          <p>✅ {totalComponentes} componentes y {totalEstados} estados cargados</p>
          <p>⚡ Reducción de consultas: De ~{totalComponentes + 1} requests a solo {Object.keys(componentesPorAeronave).length + 1} requests</p>
          <p>🎯 Mejora de performance: ~{Math.round((1 - (Object.keys(componentesPorAeronave).length + 1) / (totalComponentes + 1)) * 100)}% menos consultas</p>
        </div>
      </div>

      {/* Lista de componentes agrupados por aeronave */}
      <div className="space-y-6">
        {Object.entries(componentesPorAeronave).map(([aeronaveId, componentesAeronave]) => (
          <div key={aeronaveId} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Aeronave {aeronaveId} 
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({componentesAeronave.length} componentes)
                </span>
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {componentesAeronave.map((componente: IComponente) => {
                  const estadosComponente = estadosMap[componente._id!] || [];
                  const estadosCriticos = estadosComponente.filter(e => e.estado === 'VENCIDO' || e.estado === 'OVERHAUL_REQUERIDO');
                  
                  return (
                    <div key={componente._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {componente.nombre}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            S/N: {componente.numeroSerie}
                          </p>
                        </div>
                        
                        {estadosCriticos.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            {estadosCriticos.length} crítico{estadosCriticos.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-600">
                        <p>{estadosComponente.length} estados monitoreados</p>
                        <p>Estado: <span className="font-medium">{componente.estado}</span></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer con información de cache */}
      <div className="mt-6 text-xs text-gray-500 bg-gray-50 rounded-md p-3">
        💡 <strong>Tip:</strong> Los datos se mantienen en cache por 30 segundos para evitar consultas innecesarias.
        El batch loading agrupa las consultas por aeronave para maximizar la eficiencia.
      </div>
    </div>
  );
};

export default ComponentesOptimizados;