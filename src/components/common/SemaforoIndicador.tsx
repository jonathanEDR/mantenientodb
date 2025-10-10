/**
 * COMPONENTE DE SEMÁFORO PERSONALIZABLE
 * 
 * Muestra el estado visual del semáforo con colores, descripción y información adicional.
 * Soporta diferentes tamaños y modos de visualización.
 */

import React from 'react';
import { 
  ColorSemaforo, 
  IResultadoSemaforo,
  COLORES_CSS,
  COLORES_TAILWIND,
  ICONOS_SEMAFORO,
  formatearHoras,
  formatearPorcentaje
} from '../../types/semaforoPersonalizado';

interface SemaforoIndicadorProps {
  resultado: IResultadoSemaforo;
  tamaño?: 'pequeño' | 'mediano' | 'grande';
  mostrarDescripcion?: boolean;
  mostrarProgreso?: boolean;
  mostrarHoras?: boolean;
  onClick?: () => void;
  className?: string;
}

const SemaforoIndicador: React.FC<SemaforoIndicadorProps> = ({
  resultado,
  tamaño = 'mediano',
  mostrarDescripcion = true,
  mostrarProgreso = false,
  mostrarHoras = true,
  onClick,
  className = ''
}) => {
  
  // Configurar tamaños
  const tamaños = {
    pequeño: {
      circulo: 'w-3 h-3',
      icono: 'text-sm',
      texto: 'text-xs',
      contenedor: 'p-2'
    },
    mediano: {
      circulo: 'w-4 h-4',
      icono: 'text-base',
      texto: 'text-sm',
      contenedor: 'p-3'
    },
    grande: {
      circulo: 'w-6 h-6',
      icono: 'text-lg',
      texto: 'text-base',
      contenedor: 'p-4'
    }
  };

  const config = tamaños[tamaño];
  const colores = COLORES_TAILWIND[resultado.color];

  return (
    <div 
      className={`
        inline-flex items-center space-x-2 ${config.contenedor} rounded-lg border-2 
        ${colores.border} bg-white hover:shadow-md transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Indicador Visual */}
      <div className="flex items-center space-x-2">
        {/* Círculo de color */}
        <div 
          className={`${config.circulo} rounded-full flex-shrink-0`}
          style={{ backgroundColor: COLORES_CSS[resultado.color] }}
        />
        
        {/* Emoji del semáforo */}
        <span className={config.icono}>
          {ICONOS_SEMAFORO[resultado.color]}
        </span>
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        {/* Descripción */}
        {mostrarDescripcion && (
          <div className={`${config.texto} font-medium ${colores.text} truncate`}>
            {resultado.descripcion}
          </div>
        )}

        {/* Horas restantes */}
        {mostrarHoras && resultado.horasRestantes > 0 && (
          <div className={`${config.texto} text-gray-600`}>
            {formatearHoras(resultado.horasRestantes)} restantes
          </div>
        )}

        {/* Barra de progreso */}
        {mostrarProgreso && (
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, resultado.porcentajeProgreso)}%`,
                  backgroundColor: COLORES_CSS[resultado.color]
                }}
              />
            </div>
            <div className={`${config.texto} text-gray-500 mt-1`}>
              {formatearPorcentaje(resultado.porcentajeProgreso)} completado
            </div>
          </div>
        )}
      </div>

      {/* Indicador de atención */}
      {resultado.requiereAtencion && (
        <div className="flex-shrink-0">
          <svg className={`${config.circulo} text-red-500`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default SemaforoIndicador;