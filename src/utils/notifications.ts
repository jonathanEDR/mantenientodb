import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

/**
 * Sistema centralizado de notificaciones
 */

// Configuración por defecto
const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 5000;
const SUCCESS_DURATION = 3000;

export const notifications = {
  /**
   * Mostrar notificación de éxito
   */
  success: (message: string, duration = SUCCESS_DURATION) => {
    return toast.success(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    });
  },

  /**
   * Mostrar notificación de error
   */
  error: (message: string, duration = ERROR_DURATION) => {
    return toast.error(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    });
  },

  /**
   * Mostrar notificación de advertencia
   */
  warning: (message: string, duration = DEFAULT_DURATION) => {
    return toast(message, {
      duration,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  },

  /**
   * Mostrar notificación de información
   */
  info: (message: string, duration = DEFAULT_DURATION) => {
    return toast(message, {
      duration,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
    });
  },

  /**
   * Mostrar notificación de carga/loading
   */
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },

  /**
   * Cerrar una notificación específica
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Cerrar todas las notificaciones
   */
  dismissAll: () => {
    toast.dismiss();
  },

  /**
   * Actualizar una notificación existente
   */
  update: (toastId: string, message: string, type: 'success' | 'error' | 'loading') => {
    if (type === 'success') {
      toast.success(message, { id: toastId });
    } else if (type === 'error') {
      toast.error(message, { id: toastId });
    } else {
      toast.loading(message, { id: toastId });
    }
  },

  /**
   * Promise toast - muestra loading, luego success o error según resultado
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(
      promise,
      messages,
      {
        position: 'top-right',
        success: {
          duration: SUCCESS_DURATION,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        error: {
          duration: ERROR_DURATION,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
      }
    );
  },
};

/**
 * Extraer mensaje de error de diferentes fuentes
 */
export const extractErrorMessage = (error: unknown): string => {
  // Si es un AxiosError
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<any>;

    // Prioridad: mensaje del backend > mensaje genérico según status
    const backendMessage = axiosError.response?.data?.message ||
                          axiosError.response?.data?.error;

    if (backendMessage) return backendMessage;

    // Mensajes según código de estado
    const status = axiosError.response?.status;
    switch (status) {
      case 400:
        return 'Solicitud incorrecta. Verifica los datos enviados.';
      case 401:
        return 'No autorizado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'Conflicto. El recurso ya existe.';
      case 422:
        return 'Datos de validación incorrectos.';
      case 429:
        return 'Demasiadas solicitudes. Por favor, espera un momento.';
      case 500:
        return 'Error interno del servidor. Intenta nuevamente.';
      case 503:
        return 'Servicio no disponible. Intenta más tarde.';
      default:
        return axiosError.message || 'Error de conexión con el servidor.';
    }
  }

  // Si es un error estándar
  if (error instanceof Error) {
    return error.message;
  }

  // Si es un string
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'Ha ocurrido un error inesperado.';
};

/**
 * Manejar error y mostrar notificación
 */
export const handleError = (error: unknown, customMessage?: string) => {
  const errorMessage = customMessage || extractErrorMessage(error);
  notifications.error(errorMessage);

  // Log en desarrollo
  if ((import.meta as any).env.DEV) {
    console.error('❌ Error capturado:', error);
  }
};

/**
 * Wrapper para operaciones async con notificaciones automáticas
 */
export const withNotifications = async <T,>(
  operation: () => Promise<T>,
  messages?: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: any) => string);
  }
): Promise<T> => {
  const loadingToast = messages?.loading ? notifications.loading(messages.loading) : null;

  try {
    const result = await operation();

    if (loadingToast) {
      notifications.dismiss(loadingToast);
    }

    if (messages?.success) {
      const successMessage = typeof messages.success === 'function'
        ? messages.success(result)
        : messages.success;
      notifications.success(successMessage);
    }

    return result;
  } catch (error) {
    if (loadingToast) {
      notifications.dismiss(loadingToast);
    }

    const errorMessage = messages?.error
      ? typeof messages.error === 'function'
        ? messages.error(error)
        : messages.error
      : extractErrorMessage(error);

    notifications.error(errorMessage);
    throw error;
  }
};

export default notifications;
