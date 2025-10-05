import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import axiosInstance from '../utils/axiosConfig';
import DashboardLayout from '../components/layout/DashboardLayout';
import TokenRefreshButton from '../components/common/TokenRefreshButton';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const registerUserInDB = async () => {
      if (!user || !isLoaded) return;

      try {
        setError(null);

        // Verificar si el usuario ya está en la BD
        // El token se agrega automáticamente por el interceptor de axios
        const response = await axiosInstance.get('/auth/me');

        setDbUser(response.data.user);
        console.log('Usuario encontrado en BD:', response.data.user);

      } catch (error: any) {
        // Si no está en BD (404), registrarlo
        if (error.response?.status === 404) {
          console.log('Usuario no encontrado en BD, registrando...');
          setIsRegistering(true);

          try {
            const userData = {
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Usuario',
              email: user.primaryEmailAddress?.emailAddress,
              clerkId: user.id
            };

            console.log('Enviando datos de registro:', userData);

            const registerResponse = await axiosInstance.post('/auth/register', userData);
            setDbUser(registerResponse.data.user);
            console.log('✅ Usuario registrado exitosamente en BD:', registerResponse.data.user);

          } catch (registerError: any) {
            console.error('❌ Error registrando usuario:', {
              status: registerError.response?.status,
              statusText: registerError.response?.statusText,
              data: registerError.response?.data,
              message: registerError.message,
              code: registerError.code
            });

            // Mensajes de error más descriptivos
            let errorMessage = 'Error al registrar usuario';
            if (registerError.code === 'ERR_NETWORK') {
              errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
            } else if (registerError.response?.data?.error) {
              errorMessage = registerError.response.data.error;
            } else if (registerError.message) {
              errorMessage = `Error al registrar usuario: ${registerError.message}`;
            }

            setError(errorMessage);
          } finally {
            setIsRegistering(false);
          }
        } else {
          console.error('❌ Error verificando usuario:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            code: error.code
          });

          // Mensajes de error más descriptivos
          let errorMessage = 'Error al verificar usuario';
          if (error.code === 'ERR_NETWORK') {
            errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 5000.';
          } else if (error.response?.status === 401) {
            errorMessage = 'Token de autenticación inválido o expirado. Intenta cerrar sesión y volver a iniciar.';
          } else if (error.response?.status === 403) {
            errorMessage = 'Acceso denegado. Tu usuario puede estar inactivo.';
          } else if (error.response?.status >= 500) {
            errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = `Error al verificar usuario: ${error.message}`;
          }

          setError(errorMessage);
        }
      }
    };

    registerUserInDB();
  }, [user?.id, isLoaded]); // ✅ Solo depender de user.id, no de getToken

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  const slides = [
    { id: '1', title: 'Resumen', content: 'Estado de la cuenta y registro en BD' },
    { id: '2', title: 'Acciones', content: 'Opciones para actualizar perfil y cerrar sesión' }
  ];

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bienvenido, {user?.firstName}!</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">⚠️ Error: {error}</div>
        )}

        {/* Herramientas de debug para autenticación */}
        <TokenRefreshButton className="mb-4" />

        <div className="space-y-2 mb-6">
          <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
          <p><strong>ID de Clerk:</strong> {user?.id}</p>
          <p><strong>Estado:</strong> ✅ Autenticado</p>
          {isRegistering && <p><strong>Estado BD:</strong> 🔄 Registrando...</p>}
          {dbUser && <p><strong>Estado BD:</strong> ✅ Registrado en MongoDB</p>}
        </div>

        {dbUser && (
          <div className="mt-4 p-4 bg-green-50 rounded">
            <h3 className="font-semibold">Datos en Base de Datos:</h3>
            <p><strong>Nombre:</strong> {dbUser.name}</p>
            <p><strong>Email:</strong> {dbUser.email}</p>
            <p><strong>ID BD:</strong> {dbUser._id}</p>
            <p><strong>Registrado:</strong> {new Date(dbUser.createdAt).toLocaleString()}</p>
          </div>
        )}

        {!dbUser && !isRegistering && !error && (
          <div className="mt-4 p-4 bg-yellow-50 rounded">
            <p className="text-yellow-700">🔄 Verificando registro en base de datos...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
