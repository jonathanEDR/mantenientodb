/// <reference types="vite/client" />

import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

// Hook personalizado para hacer llamadas API autenticadas
export const useApiWithAuth = () => {
  const { getToken, isSignedIn } = useAuth();

  const makeRequest = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any) => {

    if (!isSignedIn) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const BASE_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';
      const fullUrl = `${BASE_URL}${url}`;
      
      const config = {
        method,
        url: fullUrl,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: data ? JSON.stringify(data) : undefined
      };
      
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error(`[API] Error detallado en ${method} ${url}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  };

  return {
    get: (url: string) => makeRequest('GET', url),
    post: (url: string, data: any) => makeRequest('POST', url, data),
    put: (url: string, data: any) => makeRequest('PUT', url, data),
    delete: (url: string) => makeRequest('DELETE', url)
  };
};