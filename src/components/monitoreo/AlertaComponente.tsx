import React from 'react';
import { IAlertaComponente } from '../../hooks/useMonitoreoGranular';

interface AlertaComponenteProps {
  alerta: IAlertaComponente;
  onClick?: () => void;
  compact?: boolean;
}

const AlertaComponente: React.FC<AlertaComponenteProps> = ({ 
  alerta, 
  onClick, 
  compact = false 
}) => {
  
  // Función para obtener el color según el estado
  const getEstadoColor = (estado: string, criticidad: string) => {
    if (criticidad === 'CRITICA' || estado === 'VENCIDO') {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    if (estado === 'PROXIMO') {
      return criticidad === 'ALTA' 
        ? 'bg-orange-50 border-orange-200 text-orange-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    return 'bg-green-50 border-green-200 text-green-800';
  };

  // Función para obtener el icono según la criticidad
  const getCriticidadIcon = (criticidad: string) => {
    switch (criticidad) {
      case 'CRITICA': return '🔴';
      case 'ALTA': return '🟠';
      case 'MEDIA': return '🟡';
      default: return '🟢';
    }
  };

  // Función para obtener el progreso visual
  const getProgressColor = (progreso: number, estado: string) => {
    if (estado === 'VENCIDO') return 'bg-red-500';
    if (progreso >= 90) return 'bg-orange-500';
    if (progreso >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (compact) {
    return (
      <div 
        className={`p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 ${getEstadoColor(alerta.estado, alerta.criticidad)}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{getCriticidadIcon(alerta.criticidad)}</span>
            <div>
              <p className="text-xs font-semibold truncate">{alerta.nombre}</p>
              <p className="text-xs opacity-75">{alerta.numeroSerie}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold">{alerta.progreso}%</div>
            <div className="w-8 bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(alerta.progreso, alerta.estado)}`}
                style={{ width: `${Math.min(alerta.progreso, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-4 rounded-xl border cursor-pointer hover:shadow-lg transition-all duration-300 ${getEstadoColor(alerta.estado, alerta.criticidad)}`}
      onClick={onClick}
    >
      {/* Header con componente y criticidad */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{getCriticidadIcon(alerta.criticidad)}</span>
            <h3 className="font-bold text-sm">{alerta.nombre}</h3>
          </div>
          <p className="text-xs opacity-75">S/N: {alerta.numeroSerie} • {alerta.categoria}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${
            alerta.criticidad === 'CRITICA' ? 'bg-red-100 text-red-800' :
            alerta.criticidad === 'ALTA' ? 'bg-orange-100 text-orange-800' :
            alerta.criticidad === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {alerta.criticidad}
          </span>
        </div>
      </div>

      {/* Control y progreso */}
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium opacity-75 mb-1">Control:</p>
          <p className="text-sm font-semibold">{alerta.controlDescripcion}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs opacity-75 mb-1">Progreso:</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(alerta.progreso, alerta.estado)}`}
                  style={{ width: `${Math.min(alerta.progreso, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold min-w-[35px] text-right">{alerta.progreso}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="opacity-75">Actual:</span>
            <p className="font-semibold">{alerta.valorActual} {alerta.unidad.toLowerCase()}</p>
          </div>
          <div>
            <span className="opacity-75">Límite:</span>
            <p className="font-semibold">{alerta.valorLimite} {alerta.unidad.toLowerCase()}</p>
          </div>
        </div>

        {/* Próxima revisión */}
        <div className="pt-2 border-t border-current border-opacity-20">
          <p className="text-xs opacity-75">Próxima revisión:</p>
          <p className="text-xs font-semibold">
            {new Date(alerta.fechaProximaRevision).toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertaComponente;