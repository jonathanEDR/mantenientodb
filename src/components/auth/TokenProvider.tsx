import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { configureTokenSystem } from '../../utils/axiosConfig';

interface TokenProviderProps {
  children: React.ReactNode;
}

export default function TokenProvider({ children }: TokenProviderProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    // Sistema simple de obtención de tokens
    const getTokenSimple = async (): Promise<string | null> => {
      if (!isSignedIn) {
        return null;
      }

      try {
        // Obtener token fresco
        const token = await getToken({ skipCache: true });
        return token;
      } catch (error) {
        console.error('❌ [TokenProvider] Error obteniendo token:', error);
        return null;
      }
    };

    // Configurar el sistema de tokens
    configureTokenSystem(getTokenSimple);
  }, [getToken, isSignedIn, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}