import React, { useState, useCallback } from 'react';

interface ProtectedButtonProps {
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  loadingText?: string;
  debounceMs?: number;
}

/**
 * Botón protegido contra múltiples clics
 * - Previene doble clic automáticamente
 * - Muestra estado de carga durante ejecución
 * - Soporte para acciones asíncronas
 * - Debounce opcional para clics muy rápidos
 */
const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  title,
  type = 'button',
  variant = 'custom',
  size = 'md',
  loadingText,
  debounceMs = 300
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Clases base según variante
  const getVariantClasses = (variant: string) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300`;
      case 'secondary':
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300`;
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300`;
      case 'success':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 disabled:bg-yellow-300`;
      default:
        return baseClasses;
    }
  };

  // Clases de tamaño
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  // Manejador de clic protegido
  const handleProtectedClick = useCallback(async () => {
    const now = Date.now();

    // Verificar debounce
    if (now - lastClickTime < debounceMs) {
      console.log('🛡️ [PROTECTED BUTTON] Click ignorado por debounce');
      return;
    }

    // Verificar si ya está procesando
    if (isProcessing) {
      console.log('🛡️ [PROTECTED BUTTON] Click ignorado - ya procesando');
      return;
    }

    // Verificar si está deshabilitado
    if (disabled) {
      console.log('🛡️ [PROTECTED BUTTON] Click ignorado - botón deshabilitado');
      return;
    }

    try {
      console.log('✅ [PROTECTED BUTTON] Ejecutando acción');
      setIsProcessing(true);
      setLastClickTime(now);

      await onClick();

    } catch (error) {
      console.error('❌ [PROTECTED BUTTON] Error en acción:', error);
      // Podrías emitir un evento o notificación aquí si tienes un sistema global
    } finally {
      setIsProcessing(false);
    }
  }, [onClick, disabled, isProcessing, lastClickTime, debounceMs]);

  // Determinar si el botón debe estar deshabilitado
  const isDisabled = disabled || isProcessing;

  // Construir clases finales
  const finalClasses = `
    ${getVariantClasses(variant)}
    ${getSizeClasses(size)}
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${isProcessing ? 'animate-pulse' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={finalClasses}
      onClick={handleProtectedClick}
      disabled={isDisabled}
      title={title}
    >
      {isProcessing && (
        <svg
          className="w-4 h-4 mr-2 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {isProcessing && loadingText ? loadingText : children}
    </button>
  );
};

export default ProtectedButton;

// Hook personalizado para protección de funciones
export const useProtectedAction = (debounceMs: number = 300) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(0);

  const executeProtected = useCallback(async (action: () => void | Promise<void>) => {
    const now = Date.now();

    if (now - lastActionTime < debounceMs || isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      setLastActionTime(now);
      await action();
    } catch (error) {
      console.error('Error en acción protegida:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [debounceMs, isProcessing, lastActionTime]);

  return {
    executeProtected,
    isProcessing
  };
};

// Componente especializado para elementos clickeables que no son botones
interface ProtectedClickableProps {
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  debounceMs?: number;
  as?: keyof JSX.IntrinsicElements;
}

export const ProtectedClickable: React.FC<ProtectedClickableProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  debounceMs = 300,
  as: Component = 'div'
}) => {
  const { executeProtected, isProcessing } = useProtectedAction(debounceMs);

  const handleClick = useCallback(() => {
    if (!disabled) {
      executeProtected(onClick);
    }
  }, [executeProtected, onClick, disabled]);

  const finalClasses = `
    ${className}
    ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${isProcessing ? 'animate-pulse' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Component
      className={finalClasses}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </Component>
  );
};