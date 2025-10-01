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

// Función para configurar el token getter desde componentes React
export const setTokenGetter = (getToken: () => Promise<string | null>) => {
  globalGetToken = getToken;
};

// Interceptor para requests
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      let token = null;
      
      // Método 1: Usar el getter configurado desde React (preferido)
      if (globalGetToken) {
        token = await globalGetToken();
      }
      
      // Método 2: Fallback usando window.Clerk (menos confiable)
      if (!token && typeof window !== 'undefined') {
        if ((window as any).Clerk?.session?.getToken) {
          token = await (window as any).Clerk.session.getToken();
        } else if ((window as any).Clerk?.client?.session?.getToken) {
          token = await (window as any).Clerk.client.session.getToken();
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('No se pudo obtener token de Clerk:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Error de autenticación - Se requiere re-login');
      // Opcionalmente redirigir al login o limpiar sesión
    } else if (error.response?.status >= 500) {
      // Solo log errores del servidor para debugging
      console.error('Error del servidor:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    }
    // Errores 400-499 (client errors) no necesitan logging detallado
    
    return Promise.reject(error);
  }
);

// Función para configurar interceptores (mantenida para compatibilidad)
export const setupAxiosInterceptors = () => {
  // Los interceptores ya están configurados en la instancia
};

export default axiosInstance;
