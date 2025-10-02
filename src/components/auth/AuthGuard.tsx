import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Usuario no autenticado - redirigir a login
      navigate('/sign-in', { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate]);

  // Mostrar loading mientras se carga
  if (!isLoaded) {
    return (
      fallback || (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      )
    );
  }

  // Usuario no autenticado - no mostrar contenido protegido
  if (!isSignedIn) {
    return null;
  }

  // Usuario autenticado - mostrar contenido
  return <>{children}</>;
}