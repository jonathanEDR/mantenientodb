import React, { useEffect } from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { setTokenGetter } from '../../utils/axiosConfig';

interface TokenProviderProps {
  children: React.ReactNode;
}

export default function TokenProvider({ children }: TokenProviderProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const clerk = useClerk();

  useEffect(() => {
    if (!isLoaded) return; // Esperar a que Clerk se cargue

    // Configurar el token getter en la instancia de axios
    const tokenGetter = async (options?: { skipCache?: boolean }): Promise<string | null> => {
      if (!isSignedIn) {
        console.warn('🔐 Usuario no autenticado - redirigiendo a login');
        // Si no está autenticado, forzar redirect a login
        window.location.href = '/sign-in';
        return null;
      }

      try {
        const skipCache = options?.skipCache !== false; // Default true
        console.log(`🔄 Solicitando token ${skipCache ? 'fresco (skipCache)' : 'con cache'}...`);

        // Obtener token con skipCache controlable
        const token = await getToken({
          skipCache, // Usar el parámetro pasado
          template: undefined // Usar template por defecto
        });

        if (token) {
          // Verificar que el token no esté expirado
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            const exp = payload.exp;

            if (exp && exp > now) {
              const ttl = exp - now;
              console.log(`✅ Token válido (TTL: ${ttl}s, expira: ${new Date(exp * 1000).toLocaleTimeString()})`);
              return token;
            } else {
              console.error('⚠️ Token expirado recibido de Clerk - sesión completamente expirada');
              console.error('🔒 Forzando logout y redirect a login...');

              // Limpiar sesión y redirigir
              await clerk.signOut();
              sessionStorage.clear();
              localStorage.removeItem('clerk-db-jwt');
              window.location.href = '/sign-in';
              return null;
            }
          } catch (parseError) {
            console.warn('⚠️ No se pudo verificar expiración del token, usando de todas formas');
            return token;
          }
        } else {
          console.error('❌ Clerk no pudo proveer un token - sesión expirada');
          console.error('🔒 Forzando logout y redirect a login...');

          // Limpiar sesión y redirigir
          await clerk.signOut();
          sessionStorage.clear();
          localStorage.removeItem('clerk-db-jwt');
          window.location.href = '/sign-in';
          return null;
        }
      } catch (error) {
        console.error('💥 Error crítico obteniendo token:', error);

        // Si hay un error crítico, también hacer logout
        try {
          await clerk.signOut();
        } catch (e) {
          // Ignorar errores de logout
        }
        sessionStorage.clear();
        localStorage.removeItem('clerk-db-jwt');
        window.location.href = '/sign-in';
        return null;
      }
    };

    setTokenGetter(tokenGetter);
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