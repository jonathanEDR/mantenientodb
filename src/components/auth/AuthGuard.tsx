import React, { useEffect, useState } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { nuclearCacheCleanup } from '../../utils/cacheCleanup';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const clerk = useClerk();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      if (!isLoaded) return;

      setIsValidating(true);

      try {
        if (!isSignedIn) {
          // Usuario no autenticado - limpiar y redirigir
          await nuclearCacheCleanup(clerk);
          navigate('/sign-in', { replace: true });
          return;
        }

        // Verificar que el token es válido
        try {
          const token = await getToken({ skipCache: true });
          if (!token) {
            throw new Error('No token available');
          }

          // Validar que el token no está expirado
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp <= now) {
            throw new Error('Token expired');
          }

          // Token válido - usuario autenticado correctamente
          setIsValidating(false);

        } catch (tokenError) {
          console.warn('Token validation failed:', tokenError);
          // Token inválido - limpiar y redirigir
          await nuclearCacheCleanup(clerk);
          navigate('/sign-in', { replace: true });
        }

      } catch (error) {
        console.error('Auth validation error:', error);
        // Error general - limpiar y redirigir
        await nuclearCacheCleanup(clerk);
        navigate('/sign-in', { replace: true });
      }
    };

    validateAuth();
  }, [isSignedIn, isLoaded, getToken, clerk, navigate]);

  // Mostrar loading mientras se carga o valida
  if (!isLoaded || isValidating) {
    return (
      fallback || (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validando autenticación...</p>
          </div>
        </div>
      )
    );
  }

  // Usuario no autenticado - no mostrar contenido protegido
  if (!isSignedIn) {
    return null;
  }

  // Usuario autenticado y validado - mostrar contenido
  return <>{children}</>;
}