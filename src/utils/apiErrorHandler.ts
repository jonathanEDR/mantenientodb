/**
 * Utilidades para manejar errores de API, especialmente errores 429 (Rate Limiting)
 */

export interface ApiErrorDetails {
  message: string;
  code: string;
  details?: string;
  status?: number;
  retryAfter?: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  exponentialBase: 2
};

/**
 * Calcula el delay para el siguiente intento usando exponential backoff
 */
export const calculateRetryDelay = (
  attemptNumber: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number => {
  const delay = config.baseDelay * Math.pow(config.exponentialBase, attemptNumber - 1);
  return Math.min(delay, config.maxDelay);
};

/**
 * Determina si un error es elegible para retry
 */
export const shouldRetryError = (error: any, attemptNumber: number, config: RetryConfig = DEFAULT_RETRY_CONFIG): boolean => {
  if (attemptNumber >= config.maxRetries) return false;

  const status = error?.response?.status || error?.status;

  // Retry para errores 429 (Rate Limit) y errores de red temporales
  return status === 429 ||
         status === 503 ||
         status === 502 ||
         error?.code === 'NETWORK_ERROR' ||
         error?.code === 'ECONNABORTED';
};

/**
 * Extrae información detallada del error
 */
export const extractErrorDetails = (error: any): ApiErrorDetails => {
  const status = error?.response?.status || error?.status;
  const statusText = error?.response?.statusText || '';
  const data = error?.response?.data;

  let message = 'Error desconocido';
  let code = 'UNKNOWN_ERROR';

  if (status === 429) {
    message = 'Demasiadas solicitudes. El sistema se está limitando automáticamente para mantener la estabilidad.';
    code = 'RATE_LIMIT_ERROR';
  } else if (status === 503) {
    message = 'Servicio temporalmente no disponible. Reintentando...';
    code = 'SERVICE_UNAVAILABLE';
  } else if (status === 502) {
    message = 'Error de conexión con el servidor. Reintentando...';
    code = 'BAD_GATEWAY';
  } else if (error?.code === 'NETWORK_ERROR') {
    message = 'Error de red. Verificando conexión...';
    code = 'NETWORK_ERROR';
  } else if (error?.message) {
    message = error.message;
    code = 'API_ERROR';
  }

  return {
    message,
    code,
    status,
    details: data?.message || statusText || error?.stack,
    retryAfter: data?.retryAfter || undefined
  };
};

/**
 * Función de retry con exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!shouldRetryError(error, attempt, config)) {
        throw error;
      }

      const delay = calculateRetryDelay(attempt, config);
      const errorDetails = extractErrorDetails(error);

      console.log(
        `API Error (${errorDetails.code}), retrying in ${delay}ms (attempt ${attempt}/${config.maxRetries + 1}):`,
        errorDetails.message
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Wrapper para operaciones de API con manejo automático de errores
 */
export const withErrorHandling = <T extends any[], R>(
  apiFunction: (...args: T) => Promise<R>,
  config?: Partial<RetryConfig>
) => {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  return async (...args: T): Promise<R> => {
    return retryWithBackoff(() => apiFunction(...args), mergedConfig);
  };
};

/**
 * Hook para manejar estados de error comunes
 */
export const useApiErrorHandler = () => {
  const formatErrorMessage = (error: ApiErrorDetails): string => {
    switch (error.code) {
      case 'RATE_LIMIT_ERROR':
        return 'El sistema está limitando las solicitudes para mantener un rendimiento óptimo. Por favor, espera un momento.';
      case 'NETWORK_ERROR':
        return 'Error de conexión. Verifica tu conexión a internet.';
      case 'SERVICE_UNAVAILABLE':
        return 'El servicio está temporalmente no disponible. Reintentando automáticamente...';
      default:
        return error.message;
    }
  };

  const isRetryableError = (error: ApiErrorDetails): boolean => {
    return ['RATE_LIMIT_ERROR', 'NETWORK_ERROR', 'SERVICE_UNAVAILABLE', 'BAD_GATEWAY'].includes(error.code);
  };

  return {
    formatErrorMessage,
    isRetryableError,
    extractErrorDetails
  };
};