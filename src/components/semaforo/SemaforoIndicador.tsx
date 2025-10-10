import React from 'react';
import { ColorSemaforo, COLORES_CSS, COLORES_CSS_CLARO, COLORES_TAILWIND, ICONOS_SEMAFORO } from '../../types/semaforoPersonalizado';

interface SemaforoIndicadorProps {
  color: ColorSemaforo;
  descripcion?: string;
  tamaño?: 'sm' | 'md' | 'lg';
  mostrarTexto?: boolean;
  className?: string;
}

/**
 * Componente visual para mostrar el semáforo de estado
 * Muestra un círculo de color con icono opcional y descripción
 */
const SemaforoIndicador: React.FC<SemaforoIndicadorProps> = ({ 
  color, 
  descripcion,
  tamaño = 'md',
  mostrarTexto = true,
  className = ''
}) => {
  // Obtener colores y configuración
  const colorPrincipal = COLORES_CSS[color];
  const colorFondo = COLORES_CSS_CLARO[color];
  const icono = ICONOS_SEMAFORO[color];

  // Tamaños del círculo
  const tamañosCirculo = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  // Tamaños del texto
  const tamañosTexto = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Círculo de color */}
      <div 
        className={`${tamañosCirculo[tamaño]} rounded-full border-2 flex items-center justify-center`}
        style={{ 
          backgroundColor: colorFondo,
          borderColor: colorPrincipal
        }}
      >
        {tamaño === 'lg' && (
          <span className="text-xs">{icono}</span>
        )}
      </div>

      {/* Texto descriptivo */}
      {mostrarTexto && descripcion && (
        <span 
          className={`font-medium ${tamañosTexto[tamaño]}`}
          style={{ color: colorPrincipal }}
        >
          {descripcion}
        </span>
      )}
    </div>
  );
};

export default SemaforoIndicador;
