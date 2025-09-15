import React, { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [dbUser, setDbUser] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const registerUserInDB = async () => {
      if (!user || !isLoaded) return;

      try {
        setError(null);

        // Obtener token de Clerk
        const token = await getToken();
        // DEBUG: mostrar preview seguro del token para verificar su forma (no imprimir entero en prod)
        try {
          const preview = token ? `${String(token).slice(0, 12)}...${String(token).slice(-12)}` : token;
          const segments = token ? String(token).split('.')?.length : 0;
          // eslint-disable-next-line no-console
          console.log('[DEBUG] clerk token preview:', preview, 'segments:', segments);
        } catch (e) {
          // ignore
        }
        if (!token) {
          setError('No se pudo obtener el token de autenticación');
          return;
        }

        // Verificar si el usuario ya está en la BD
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

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

            const registerResponse = await axios.post('/api/auth/register', userData);
            setDbUser(registerResponse.data.user);
            console.log('✅ Usuario registrado exitosamente en BD:', registerResponse.data.user);

          } catch (registerError: any) {
            console.error('❌ Error registrando usuario:', registerError);
            setError(registerError.response?.data?.error || 'Error al registrar usuario');
          } finally {
            setIsRegistering(false);
          }
        } else {
          console.error('❌ Error verificando usuario:', error);
          setError(error.response?.data?.error || 'Error al verificar usuario');
        }
      }
    };

    registerUserInDB();
  }, [user, isLoaded, getToken]);

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
