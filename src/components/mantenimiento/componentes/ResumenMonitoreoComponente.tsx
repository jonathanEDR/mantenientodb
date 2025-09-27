import React from 'react';
import { useEstadosMonitoreoComponente } from '../../../hooks/useEstadosMonitoreoComponente';

interface ResumenMonitoreoComponenteProps {
  componenteId: string;
  className?: string;
  compactMode?: boolean;
}

const ResumenMonitoreoComponente: React.FC<ResumenMonitoreoComponenteProps> = ({
  componenteId,
  className = '',
  compactMode = false
}) => {
  const { estadosFiltrados, loading } = useEstadosMonitoreoComponente(componenteId);
  
  if (loading) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        Cargando controles...
      </div>
    );
  }

  // Si no hay estados, mostrar mensaje
  if (estadosFiltrados.length === 0) {
    return (
      <div className={`text-xs text-gray-400 italic ${className}`}>
        Sin controles definidos
      </div>
    );
  }

  // En modo compacto, mostrar solo los primeros controles más críticos
  const estadosAMostrar = compactMode ? estadosFiltrados.slice(0, 2) : estadosFiltrados;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'OK':
        return 'text-green-600';
      case 'PROXIMO':
        return 'text-yellow-600';
      case 'VENCIDO':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = (progreso: number) => {
    if (progreso >= 80) return 'bg-gradient-to-r from-green-400 to-emerald-500';
    if (progreso >= 60) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
    return 'bg-gradient-to-r from-red-400 to-rose-500';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {estadosAMostrar.map((estado, index) => {
        // Calcular progreso basado en valorActual/valorLimite
        const progreso = (estado.valorActual / estado.valorLimite) * 100;
        const catalogoControl = typeof estado.catalogoControlId === 'object' ? estado.catalogoControlId : null;
        
        return (
          <div key={estado._id || index} className="flex items-center space-x-4 bg-white/80 rounded-lg p-3 border border-blue-100/30">
            {/* Nombre del control */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-blue-800 truncate">
                {catalogoControl?.descripcionCodigo || 'Control'}
              </div>
              <div className="text-xs text-blue-600/70 mt-0.5">
                {estado.valorActual} / {estado.valorLimite} {estado.unidad.toLowerCase()}
              </div>
            </div>
            
            {/* Progreso visual mejorado */}
            <div className="flex items-center space-x-3">
              <div className="w-16 bg-gray-200/80 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${getProgressColor(progreso)}`}
                  style={{ width: `${Math.min(progreso, 100)}%` }}
                ></div>
              </div>
              <span className={`text-xs font-bold ${getEstadoColor(estado.estado)} min-w-[35px] text-right`}>
                {Math.round(progreso)}%
              </span>
            </div>
          </div>
        );
      })}
      
      {/* Mostrar indicador si hay más controles */}
      {compactMode && estadosFiltrados.length > 2 && (
        <div className="text-xs text-gray-400 italic">
          +{estadosFiltrados.length - 2} controles más...
        </div>
      )}
    </div>
  );
};

export default ResumenMonitoreoComponente;