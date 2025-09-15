/// <reference types="vite/client" />

// Configuración centralizada para llamadas API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = {
  // Para desarrollo: usa proxy de Vite (/api/*)
  // Para producción: usa URL completa
  get register() {
    return API_BASE_URL ? `${API_BASE_URL}/api/auth/register` : '/api/auth/register';
  },

  get me() {
    return API_BASE_URL ? `${API_BASE_URL}/api/auth/me` : '/api/auth/me';
  },

  // Método helper para determinar si usar proxy o URL completa
  get isUsingProxy() {
    return !API_BASE_URL;
  }
};

export default apiClient;
