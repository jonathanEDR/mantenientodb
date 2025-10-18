import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

// Variable global para la función de obtención de tokens
let globalGetToken: (() => Promise<string | null>) | null = null;

// Crear instancia de axios con configuración base
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    // ELIMINAR CACHE COMPLETAMENTE - HEADERS ANTI-CACHE
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
});

// Configurar reintentos automáticos (OPTIMIZADO para evitar loops con rate limiting)
axiosRetry(axiosInstance, {
  retries: 2, // Reducido a 2 reintentos
  retryDelay: (retryCount) => {
    // Delay exponencial más conservador: 1s, 2s
    return retryCount * 1000;
  },
  retryCondition: (error) => {
    // ⚠️ CRÍTICO: NO reintentar errores 429 (rate limit) para evitar loops
    if (error.response?.status === 429) {
      console.warn('⚠️ [AxiosConfig] Error 429 detectado - no se reintentará');
      return false;
    }
    
    // NO reintentar errores 4xx del cliente (bad request, unauthorized, etc.)
    if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
      if ((import.meta as any).env.DEV) {
        console.warn(`⚠️ [AxiosConfig] Error ${error.response.status} - no se reintentará`);
      }
      return false;
    }
    
    // Solo reintentar errores de red y errores 5xx del servidor
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           (error.response?.status ? error.response.status >= 500 : false);
  },
  onRetry: (retryCount, error, requestConfig) => {
    // Logs removidos para reducir ruido
  }
});

// Request interceptor - configurar headers de autenticación
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Logs removidos para reducir ruido
      
      if (globalGetToken) {
        const token = await globalGetToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if ((import.meta as any).env.DEV) {
          console.warn('⚠️ No se obtuvo token');
        }
      } else if ((import.meta as any).env.DEV) {
        console.error('❌ globalGetToken no configurado');
      }
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      // Continúa sin token si hay error
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => {
    // Logs removidos para reducir ruido
    return response;
  },
  async (error) => {
    // Logging específico por tipo de error
    if (error.response?.status === 429) {
      console.error('⚠️ RATE LIMIT: Demasiadas peticiones. Por favor espera un momento.');
    } else if (error.response?.status === 401) {
      if ((import.meta as any).env.DEV) {
        console.warn('🔐 Auth error 401 - Token expirado o inválido');
      }
    } else if (error.response?.status >= 500) {
      console.error('❌ Server error:', error.response?.status, error.response?.statusText);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('❌ Network Error - Backend no responde o CORS bloqueado');
    } else if ((import.meta as any).env.DEV) {
      console.error('❌ Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    }

    return Promise.reject(error);
  }
);

// Función para configurar el sistema de tokens
export const configureTokenSystem = (getToken: () => Promise<string | null>) => {
  globalGetToken = getToken;
};

export default axiosInstance;