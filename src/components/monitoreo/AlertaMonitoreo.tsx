import React from 'react';
import { 
  IAlertaMonitoreo, 
  EstadoAlerta, 
  TipoAlerta 
} from '../../types/monitoreo';
import { 
  obtenerColoresAlerta,
  obtenerLabelEstado,
  obtenerLabelTipoAlerta,
  obtenerIconoTipoAlerta,
  formatearHoras,
  generarMensajeAlerta,
  formatearFechaRelativa
} from '../../utils/monitoreoUtils';

interface AlertaMonitoreoProps {
  alerta: IAlertaMonitoreo;
  mostrarDescripcionCompleta?: boolean;
  mostrarIcono?: boolean;
  mostrarTiempo?: boolean;
  mostrarPorcentaje?: boolean;
  tamano?: 'pequeno' | 'mediano' | 'grande';
  onClick?: (alerta: IAlertaMonitoreo) => void;
  className?: string;
}

/**
 * Componente para mostrar una alerta individual de monitoreo
 */
export const AlertaMonitoreo: React.FC<AlertaMonitoreoProps> = ({
  alerta,
  mostrarDescripcionCompleta = true,
  mostrarIcono = true,
  mostrarTiempo = true,
  mostrarPorcentaje = false,
  tamano = 'mediano',
  onClick,
  className = ''
}) => {
  const colores = obtenerColoresAlerta(alerta.estado);
  const labelEstado = obtenerLabelEstado(alerta.estado);
  const labelTipo = obtenerLabelTipoAlerta(alerta.tipoAlerta);
  const icono = obtenerIconoTipoAlerta(alerta.tipoAlerta);
  const mensaje = generarMensajeAlerta(alerta);

  // Clases CSS según el tamaño
  const clasesTomano = {
    pequeno: 'text-xs p-2',
    mediano: 'text-sm p-3',
    grande: 'text-base p-4'
  };

  // Clases CSS según el estado
  const clasesEstado = {
    [EstadoAlerta.VENCIDO]: `border-l-4 border-red-500 bg-red-50 ${colores.bg} ${colores.text}`,
    [EstadoAlerta.PROXIMO]: `border-l-4 border-yellow-500 bg-yellow-50 ${colores.bg} ${colores.text}`,
    [EstadoAlerta.OK]: `border-l-4 border-green-500 bg-green-50 ${colores.bg} ${colores.text}`
  };

  // Función para renderizar el icono
  const renderIcono = () => {
    if (!mostrarIcono) return null;

    return (
      <div className={`flex-shrink-0 mr-3 ${tamano === 'pequeno' ? 'text-lg' : tamano === 'grande' ? 'text-2xl' : 'text-xl'}`}>
        <span className={colores.icon} title={labelTipo}>
          {icono}
        </span>
      </div>
    );
  };

  // Función para renderizar la información temporal
  const renderTiempo = () => {
    if (!mostrarTiempo) return null;

    const tiempoInfo = alerta.estado === EstadoAlerta.VENCIDO && alerta.horasVencidas
      ? `Vencido: ${formatearHoras(alerta.horasVencidas)}h`
      : alerta.horasRestantes
        ? `Restantes: ${formatearHoras(alerta.horasRestantes)}h`
        : null;

    if (!tiempoInfo) return null;

    return (
      <div className={`text-xs ${colores.text} opacity-75 mt-1`}>
        {tiempoInfo}
      </div>
    );
  };

  // Función para renderizar el porcentaje completado
  const renderPorcentaje = () => {
    if (!mostrarPorcentaje) return null;

    return (
      <div className="mt-2">
        <div className="flex justify-between items-center text-xs mb-1">
          <span>Progreso</span>
          <span>{Math.round(alerta.porcentajeCompletado)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              alerta.estado === EstadoAlerta.VENCIDO
                ? 'bg-red-500'
                : alerta.estado === EstadoAlerta.PROXIMO
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(alerta.porcentajeCompletado, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  // Función para renderizar la fecha de próximo vencimiento
  const renderFechaVencimiento = () => {
    if (!alerta.fechaProximoVencimiento) return null;

    const fechaRelativa = formatearFechaRelativa(alerta.fechaProximoVencimiento);

    return (
      <div className={`text-xs ${colores.text} opacity-75 mt-1`}>
        Próximo vencimiento: {fechaRelativa}
      </div>
    );
  };

  // Función para renderizar el badge de prioridad
  const renderPrioridad = () => {
    const clasePrioridad = alerta.prioridad === 1 
      ? 'bg-red-100 text-red-800 border-red-200'
      : alerta.prioridad === 2
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
        : 'bg-blue-100 text-blue-800 border-blue-200';

    const textoPrioridad = alerta.prioridad === 1 
      ? 'Alta' 
      : alerta.prioridad === 2 
        ? 'Media' 
        : 'Baja';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${clasePrioridad}`}>
        {textoPrioridad}
      </span>
    );
  };

  const containerClasses = [
    'rounded-lg shadow-sm border transition-all duration-200',
    clasesEstado[alerta.estado],
    clasesTomano[tamano],
    onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      onClick={() => onClick?.(alerta)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(alerta);
        }
      }}
    >
      <div className="flex items-start">
        {renderIcono()}
        
        <div className="flex-1 min-w-0">
          {/* Header con título y estado */}
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-medium truncate ${tamano === 'pequeno' ? 'text-xs' : 'text-sm'}`}>
              {alerta.descripcionCodigo}
            </h4>
            
            <div className="flex items-center space-x-2 ml-2">
              {renderPrioridad()}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                alerta.estado === EstadoAlerta.VENCIDO
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : alerta.estado === EstadoAlerta.PROXIMO
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-green-100 text-green-800 border-green-200'
              }`}>
                {labelEstado}
              </span>
            </div>
          </div>

          {/* Descripción o mensaje */}
          {mostrarDescripcionCompleta && (
            <div className={`${colores.text} opacity-90 ${tamano === 'pequeno' ? 'text-xs' : 'text-sm'}`}>
              {mensaje}
            </div>
          )}

          {/* Información temporal */}
          {renderTiempo()}

          {/* Fecha de vencimiento */}
          {renderFechaVencimiento()}

          {/* Barra de progreso */}
          {renderPorcentaje()}

          {/* Información de horas si es relevante */}
          {tamano === 'grande' && (
            <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-medium">Horas inicial:</span>
                <span className="ml-1">{formatearHoras(alerta.horaInicial)}</span>
              </div>
              <div>
                <span className="font-medium">Horas final:</span>
                <span className="ml-1">{formatearHoras(alerta.horaFinal)}</span>
              </div>
              <div>
                <span className="font-medium">Horas actuales:</span>
                <span className="ml-1">{formatearHoras(alerta.horasActuales)}</span>
              </div>
              <div>
                <span className="font-medium">Tipo:</span>
                <span className="ml-1">{labelTipo}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente compacto para mostrar una alerta en espacios reducidos
 */
export const AlertaCompacta: React.FC<{ alerta: IAlertaMonitoreo; onClick?: (alerta: IAlertaMonitoreo) => void }> = ({ 
  alerta, 
  onClick 
}) => {
  return (
    <AlertaMonitoreo
      alerta={alerta}
      tamano="pequeno"
      mostrarDescripcionCompleta={false}
      mostrarTiempo={false}
      mostrarPorcentaje={false}
      onClick={onClick}
      className="mb-1"
    />
  );
};

/**
 * Componente expandido para mostrar una alerta con todos los detalles
 */
export const AlertaDetallada: React.FC<{ alerta: IAlertaMonitoreo; onClick?: (alerta: IAlertaMonitoreo) => void }> = ({ 
  alerta, 
  onClick 
}) => {
  return (
    <AlertaMonitoreo
      alerta={alerta}
      tamano="grande"
      mostrarDescripcionCompleta={true}
      mostrarTiempo={true}
      mostrarPorcentaje={true}
      onClick={onClick}
      className="mb-4"
    />
  );
};

export default AlertaMonitoreo;