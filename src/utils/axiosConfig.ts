import axios, { AxiosInstance } from 'axios';

// Crear instancia de axios con configuración base
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000';
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable global para almacenar la función getToken
let globalGetToken: (() => Promise<string | null>) | null = null;
let tokenGetter: ((options?: { skipCache?: boolean }) => Promise<string | null>) | null = null;

// Función para obtener el tokenGetter
const getTokenGetter = () => tokenGetter;

// Función para configurar el tokenGetter (llamada desde TokenProvider)
export const setTokenGetter = (getter: (options?: { skipCache?: boolean }) => Promise<string | null>) => {
  tokenGetter = getter;
};

// Función para configurar getToken (mantenida para compatibilidad)
export const setTokenFunction = (getToken: () => Promise<string | null>) => {
  globalGetToken = getToken;
};

// Interceptor para requests - agregar token automáticamente
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      let token = null;

      // Primero intentar con tokenGetter (más avanzado)
      if (tokenGetter) {
        try {
          token = await tokenGetter({ skipCache: false });
        } catch (error) {
          console.warn('⚠️ Error con tokenGetter, intentando globalGetToken:', error);
        }
      }

      // Fallback a globalGetToken si tokenGetter falla
      if (!token && globalGetToken) {
        try {
          token = await globalGetToken();
        } catch (error) {
          console.warn('⚠️ Error con globalGetToken:', error);
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('💥 Error crítico obteniendo token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses con retry automático para 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.warn('🚨 Token vencido o inválido, forzando refresh...');

      // Primero intentar con tokenGetter (más robusto)
      if (tokenGetter) {
        try {
          console.log('🔄 Obteniendo token fresco con skipCache via tokenGetter...');
          const newToken = await tokenGetter({ skipCache: true });
          if (newToken) {
            console.log('✅ Token fresco obtenido, reintentando request...');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } else {
            console.error('❌ tokenGetter devolvió null - sesión probablemente expirada');
          }
        } catch (retryError: any) {
          console.error('💥 Error con tokenGetter skipCache:', retryError?.message || retryError);
          // Si es un error de sesión expirada, redirigir inmediatamente
          if (retryError?.message?.includes('session') || retryError?.message?.includes('expired')) {
            console.error('🔒 Sesión expirada detectada, redirigiendo a login...');
            window.location.href = '/sign-in';
            return Promise.reject(error);
          }
        }
      }

      // Fallback a globalGetToken si tokenGetter falla
      if (globalGetToken) {
        try {
          console.log('🔄 Fallback: usando globalGetToken...');
          const newToken = await globalGetToken();
          if (newToken) {
            console.log('✅ Token obtenido via globalGetToken fallback, reintentando...');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (retryError) {
          console.error('💥 Error con globalGetToken fallback:', retryError);
        }
      }

      console.error('❌ No se pudo refrescar el token - redirigiendo a login');
      // Limpiar storage antes de redirigir
      sessionStorage.clear();
      localStorage.removeItem('clerk-db-jwt');
      window.location.href = '/sign-in';

    } else if (error.response?.status >= 500) {
      // Solo log errores del servidor para debugging
      console.error('💥 Error del servidor:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    }

    return Promise.reject(error);
  }
);

// Función para configurar interceptores (mantenida para compatibilidad)
export const setupAxiosInterceptors = () => {
  // Los interceptores ya están configurados en la instancia
};

export default axiosInstance;