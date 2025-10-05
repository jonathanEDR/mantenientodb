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

// Configurar reintentos automáticos
axiosRetry(axiosInstance, {
  retries: 3, // Número de reintentos
  retryDelay: axiosRetry.exponentialDelay, // Delay exponencial entre reintentos
  retryCondition: (error) => {
    // Reintentar solo en errores de red o errores 5xx del servidor
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           (error.response?.status ? error.response.status >= 500 : false);
  },
  onRetry: (retryCount, error, requestConfig) => {
    if ((import.meta as any).env.DEV) {
      console.log(`🔄 Reintentando request (${retryCount}/3):`, requestConfig.url);
    }
  }
});

// Request interceptor - configurar headers de autenticación
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      console.log('🔑 [AxiosConfig] Obteniendo token para:', config.url);
      
      if (globalGetToken) {
        const token = await globalGetToken();
        if (token) {
          console.log('✅ [AxiosConfig] Token obtenido, length:', token.length);
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('⚠️ [AxiosConfig] No se obtuvo token');
        }
      } else {
        console.error('❌ [AxiosConfig] globalGetToken no está configurado');
      }
      
      console.log('📤 [AxiosConfig] Enviando request:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        hasAuth: !!config.headers.Authorization
      });
    } catch (error) {
      console.error('❌ [AxiosConfig] Error obteniendo token:', error);
      // Continúa sin token si hay error
    }
    return config;
  },
  (error) => {
    console.error('❌ [AxiosConfig] Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ [AxiosConfig] Response recibida:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('❌ [AxiosConfig] Error en response:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      responseData: error.response?.data
    });
    
    // Solo logear errores significativos en desarrollo
    if ((import.meta as any).env.DEV) {
      if (error.response?.status === 401) {
        console.warn('Auth error 401 - Token may be expired');
      } else if (error.response?.status >= 500) {
        console.error('Server error:', error.response?.status, error.response?.statusText);
      } else if (error.code === 'ERR_NETWORK') {
        console.error('❌ Network Error - Backend no responde o CORS bloqueado');
      }
    }

    return Promise.reject(error);
  }
);

// Función para configurar el sistema de tokens
export const configureTokenSystem = (getToken: () => Promise<string | null>) => {
  globalGetToken = getToken;
};

export default axiosInstance;