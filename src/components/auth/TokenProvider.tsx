import React, { useEffect } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { configureTokenSystem } from '../../utils/axiosConfig';
import { nuclearCacheCleanup, checkForExpiredTokens } from '../../utils/cacheCleanup';
import { UserCacheDiagnostics } from '../../utils/userCacheDiagnostics';

interface TokenProviderProps {
  children: React.ReactNode;
}

export default function TokenProvider({ children }: TokenProviderProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const clerk = useClerk();

  useEffect(() => {
    if (!isLoaded) return;

    // Verificar y limpiar tokens expirados silenciosamente
    const foundExpiredTokens = checkForExpiredTokens();
    if (foundExpiredTokens) {
      // Limpieza automática sin logs molestos
      nuclearCacheCleanup(clerk).then(() => {
        window.location.reload();
      });
      return;
    }

    // ✅ Sistema optimizado de obtención de tokens
    const getTokenSimple = async (): Promise<string | null> => {
      if (!isSignedIn) {
        return null;
      }

      try {
        // Obtener token fresco para evitar cache issues
        const token = await getToken({ 
          skipCache: true,
          template: undefined 
        });
        
        if (!token) {
          throw new Error('Token null de Clerk');
        }

        // Validación de expiración
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          const exp = payload.exp;
          
          if (!exp) {
            return token; // Token sin expiración
          }

          // Verificar si está expirado
          if (exp <= now) {
            // Token expirado - ejecutar limpieza automática
            try {
              await nuclearCacheCleanup(clerk);
            } catch (cleanupError) {
              // Ignorar errores de limpieza
            }
            window.location.href = '/sign-in';
            return null;
          }

          return token;

        } catch (parseError) {
          // Si no se puede parsear, usar de todas formas
          return token;
        }
        
      } catch (error) {
        // En caso de error, limpiar y redirigir
        try {
          await nuclearCacheCleanup(clerk);
        } catch (e) {
          // Ignorar errores de limpieza
        }
        
        window.location.href = '/sign-in';
        return null;
      }
    };

    // Configurar el sistema único
    configureTokenSystem(getTokenSimple);
  }, [getToken, isSignedIn, isLoaded, clerk]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}