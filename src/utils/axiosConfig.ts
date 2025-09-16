import axios, { AxiosInstance } from 'axios';

// Crear instancia de axios con configuración base
const axiosInstance: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Obtener token de Clerk si está disponible
      const token = await (window as any).Clerk?.session?.getToken();
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
      console.warn('Error de autenticación:', error.response.data);
      // Opcionalmente redirigir al login
    }
    
    // Log de errores para debugging
    console.error('Error en API:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    return Promise.reject(error);
  }
);

// Función para configurar interceptores (mantenida para compatibilidad)
export const setupAxiosInterceptors = () => {
  console.log('Interceptores de axios ya configurados en la instancia');
};

export default axiosInstance;
