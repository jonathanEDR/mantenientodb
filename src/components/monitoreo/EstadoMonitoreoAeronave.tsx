import React, { useState } from 'react';
import { 
  IResumenMonitoreoAeronave, 
  IAlertaMonitoreo,
  EstadoAlerta 
} from '../../types/monitoreo';
import { 
  obtenerColoresAlerta,
  calcularNivelCriticidad,
  obtenerAlertasPrioritarias,
  calcularPorcentajeSalud,
  formatearHoras,
  generarResumenTextual,
  formatearFechaRelativa
} from '../../utils/monitoreoUtils';
import { AlertaMonitoreo, AlertaCompacta } from './AlertaMonitoreo';

interface EstadoMonitoreoAeronaveProps {
  resumen: IResumenMonitoreoAeronave;
  mostrarAlertas?: boolean;
  mostrarEstadisticas?: boolean;
  mostrarBarraSalud?: boolean;
  mostrarBotonDetalle?: boolean;
  limitarAlertas?: number;
  compacto?: boolean;
  onClickAlerta?: (alerta: IAlertaMonitoreo) => void;
  onClickDetalle?: (matricula: string) => void;
  className?: string;
}

/**
 * Componente para mostrar el estado completo de monitoreo de una aeronave
 */
export const EstadoMonitoreoAeronave: React.FC<EstadoMonitoreoAeronaveProps> = ({
  resumen,
  mostrarAlertas = true,
  mostrarEstadisticas = true,
  mostrarBarraSalud = true,
  mostrarBotonDetalle = true,
  limitarAlertas = 3,
  compacto = false,
  onClickAlerta,
  onClickDetalle,
  className = ''
}) => {
  const [mostrarTodasAlertas, setMostrarTodasAlertas] = useState(false);
  
  const nivelCriticidad = calcularNivelCriticidad(resumen);
  const colores = obtenerColoresAlerta(nivelCriticidad);
  const porcentajeSalud = calcularPorcentajeSalud(resumen);
  const resumenTextual = generarResumenTextual(resumen);
  const alertasPrioritarias = obtenerAlertasPrioritarias(resumen.alertas || []);
  
  // Filtrar alertas según el límite y estado de expansión
  const alertasAMostrar = mostrarTodasAlertas 
    ? resumen.alertas || []
    : alertasPrioritarias.slice(0, limitarAlertas);

  // Función para renderizar el indicador de salud
  const renderIndicadorSalud = () => {
    if (!mostrarBarraSalud) return null;

    const colorBarra = porcentajeSalud >= 80 
      ? 'bg-green-500' 
      : porcentajeSalud >= 60 
        ? 'bg-yellow-500' 
        : 'bg-red-500';

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="font-medium">Estado General</span>
          <span className={`font-bold ${colores.text}`}>
            {porcentajeSalud}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${colorBarra}`}
            style={{ width: `${porcentajeSalud}%` }}
          />
        </div>
        <div className={`text-xs mt-1 ${colores.text}`}>
          {resumenTextual}
        </div>
      </div>
    );
  };

  // Función para renderizar las estadísticas
  const renderEstadisticas = () => {
    if (!mostrarEstadisticas) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-gray-700">
            {resumen.totalAlertas}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        
        <div className="text-center p-2 bg-red-50 rounded-lg">
          <div className="text-xl font-bold text-red-600">
            {resumen.alertasCriticas}
          </div>
          <div className="text-xs text-red-500">Críticas</div>
        </div>
        
        <div className="text-center p-2 bg-yellow-50 rounded-lg">
          <div className="text-xl font-bold text-yellow-600">
            {resumen.alertasProximas}
          </div>
          <div className="text-xs text-yellow-500">Próximas</div>
        </div>
        
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">
            {resumen.alertasOk}
          </div>
          <div className="text-xs text-green-500">Al día</div>
        </div>
      </div>
    );
  };

  // Función para renderizar la información de horas
  const renderInfoHoras = () => {
    return (
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-blue-600 text-lg mr-2">✈️</span>
            <div>
              <div className="font-medium text-blue-900">
                {formatearHoras(resumen.horasVueloActuales)} horas
              </div>
              <div className="text-xs text-blue-600">
                Horas de vuelo actuales
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-600">
              Última actualización
            </div>
            <div className="text-sm font-medium text-blue-900">
              {formatearFechaRelativa(resumen.ultimaActualizacion)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Función para renderizar las alertas
  const renderAlertas = () => {
    if (!mostrarAlertas || !alertasAMostrar.length) return null;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-700">
            {mostrarTodasAlertas ? 'Todas las alertas' : 'Alertas prioritarias'}
          </h4>
          {(resumen.alertas?.length || 0) > limitarAlertas && (
            <button
              onClick={() => setMostrarTodasAlertas(!mostrarTodasAlertas)}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              {mostrarTodasAlertas 
                ? 'Mostrar menos' 
                : `Ver todas (${resumen.alertas?.length || 0})`
              }
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {alertasAMostrar.map((alerta, index) => (
            compacto ? (
              <AlertaCompacta
                key={`${alerta.descripcionCodigo}-${index}`}
                alerta={alerta}
                onClick={onClickAlerta}
              />
            ) : (
              <AlertaMonitoreo
                key={`${alerta.descripcionCodigo}-${index}`}
                alerta={alerta}
                tamano="mediano"
                onClick={onClickAlerta}
                className="hover:shadow-md transition-shadow"
              />
            )
          ))}
        </div>
      </div>
    );
  };

  // Función para renderizar el botón de detalle
  const renderBotonDetalle = () => {
    if (!mostrarBotonDetalle) return null;

    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onClickDetalle?.(resumen.matricula)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
        >
          Ver detalles completos
        </button>
      </div>
    );
  };

  // Función para renderizar el estado compacto
  const renderEstadoCompacto = () => {
    return (
      <div className={`p-3 rounded-lg border-l-4 ${colores.bg} ${colores.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              nivelCriticidad === EstadoAlerta.VENCIDO
                ? 'bg-red-500'
                : nivelCriticidad === EstadoAlerta.PROXIMO
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`} />
            <div>
              <div className="font-medium text-sm">
                {resumen.matricula}
              </div>
              <div className={`text-xs ${colores.text}`}>
                {resumenTextual}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold ${colores.text}`}>
              {porcentajeSalud}%
            </div>
            <div className="text-xs text-gray-500">
              {formatearHoras(resumen.horasVueloActuales)}h
            </div>
          </div>
        </div>
      </div>
    );
  };

  const containerClasses = [
    'bg-white border border-gray-200 rounded-lg p-4 shadow-sm',
    className
  ].filter(Boolean).join(' ');

  // Si es compacto, mostrar solo el estado resumido
  if (compacto) {
    return (
      <div className={containerClasses}>
        {renderEstadoCompacto()}
      </div>
    );
  }

  // Renderizado completo
  return (
    <div className={containerClasses}>
      {/* Header con matrícula y estado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full mr-3 ${
            nivelCriticidad === EstadoAlerta.VENCIDO
              ? 'bg-red-500'
              : nivelCriticidad === EstadoAlerta.PROXIMO
                ? 'bg-yellow-500'
                : 'bg-green-500'
          }`} />
          <h3 className="text-lg font-semibold text-gray-900">
            Aeronave {resumen.matricula}
          </h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          nivelCriticidad === EstadoAlerta.VENCIDO
            ? 'bg-red-100 text-red-800'
            : nivelCriticidad === EstadoAlerta.PROXIMO
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
        }`}>
          {nivelCriticidad === EstadoAlerta.VENCIDO
            ? 'Requiere Atención'
            : nivelCriticidad === EstadoAlerta.PROXIMO
              ? 'Monitorear'
              : 'Al Día'
          }
        </div>
      </div>

      {/* Información de horas de vuelo */}
      {renderInfoHoras()}

      {/* Indicador de salud */}
      {renderIndicadorSalud()}

      {/* Estadísticas */}
      {renderEstadisticas()}

      {/* Lista de alertas */}
      {renderAlertas()}

      {/* Botón de detalle */}
      {renderBotonDetalle()}
    </div>
  );
};

/**
 * Componente compacto para mostrar el estado en espacios reducidos
 */
export const EstadoMonitoreoCompacto: React.FC<{
  resumen: IResumenMonitoreoAeronave;
  onClick?: (matricula: string) => void;
}> = ({ resumen, onClick }) => {
  return (
    <EstadoMonitoreoAeronave
      resumen={resumen}
      compacto={true}
      mostrarAlertas={false}
      mostrarEstadisticas={false}
      mostrarBarraSalud={false}
      mostrarBotonDetalle={false}
      onClickDetalle={onClick}
    />
  );
};

/**
 * Componente medio - compacto pero con información completa para dashboard
 */
export const EstadoMonitoreoMedio: React.FC<{
  resumen: IResumenMonitoreoAeronave;
  onClickAlerta?: (alerta: IAlertaMonitoreo) => void;
  onClickDetalle?: (matricula: string) => void;
}> = ({ resumen, onClickAlerta, onClickDetalle }) => {
  return (
    <EstadoMonitoreoAeronave
      resumen={resumen}
      mostrarAlertas={true}
      mostrarEstadisticas={false}
      mostrarBarraSalud={true}
      mostrarBotonDetalle={false}
      limitarAlertas={3}
      compacto={false}
      onClickAlerta={onClickAlerta}
      onClickDetalle={onClickDetalle}
      className="hover:shadow-md transition-shadow cursor-pointer"
    />
  );
};

/**
 * Componente de vista previa con alertas limitadas
 */
export const EstadoMonitoreoPreview: React.FC<{
  resumen: IResumenMonitoreoAeronave;
  onClickAlerta?: (alerta: IAlertaMonitoreo) => void;
  onClickDetalle?: (matricula: string) => void;
}> = ({ resumen, onClickAlerta, onClickDetalle }) => {
  return (
    <EstadoMonitoreoAeronave
      resumen={resumen}
      mostrarAlertas={true}
      mostrarEstadisticas={true}
      mostrarBarraSalud={true}
      mostrarBotonDetalle={true}
      limitarAlertas={2}
      compacto={false}
      onClickAlerta={onClickAlerta}
      onClickDetalle={onClickDetalle}
    />
  );
};

export default EstadoMonitoreoAeronave;