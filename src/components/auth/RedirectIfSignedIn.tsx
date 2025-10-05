import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface RedirectIfSignedInProps {
  children: React.ReactNode;
  to?: string;
}

/**
 * Redirige automáticamente a los usuarios autenticados desde páginas públicas
 * Usado para evitar que usuarios logueados vean páginas de login/registro
 */
export default function RedirectIfSignedIn({ children, to = '/dashboard' }: RedirectIfSignedInProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('✅ Usuario ya autenticado, redirigiendo a:', to);
      // Usuario ya autenticado - redirigir al dashboard
      navigate(to, { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate, to]);

  // Mostrar loading mientras se carga
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Usuario autenticado - no mostrar contenido (porque se está redirigiendo)
  if (isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  // Usuario no autenticado - mostrar contenido
  return <>{children}</>;
}