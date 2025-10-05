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
      console.log('🔄 [TokenProvider] Clerk aún no está loaded');
      return;
    }

    console.log('✅ [TokenProvider] Clerk loaded, configurando token system', {
      isSignedIn,
      isLoaded
    });

    // Sistema simple de obtención de tokens
    const getTokenSimple = async (): Promise<string | null> => {
      console.log('🔑 [TokenProvider] getTokenSimple llamado', { isSignedIn });
      
      if (!isSignedIn) {
        console.warn('⚠️ [TokenProvider] Usuario no está signed in');
        return null;
      }

      try {
        console.log('🔄 [TokenProvider] Obteniendo token de Clerk...');
        // Obtener token fresco
        const token = await getToken({ skipCache: true });
        console.log('✅ [TokenProvider] Token obtenido:', token ? `${token.substring(0, 20)}...` : 'null');
        return token;
      } catch (error) {
        console.error('❌ [TokenProvider] Error obteniendo token:', error);
        return null;
      }
    };

    // Configurar el sistema de tokens
    console.log('⚙️ [TokenProvider] Configurando configureTokenSystem');
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