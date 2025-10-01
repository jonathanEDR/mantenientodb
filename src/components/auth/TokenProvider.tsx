import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setTokenGetter } from '../../utils/axiosConfig';

interface TokenProviderProps {
  children: React.ReactNode;
}

export default function TokenProvider({ children }: TokenProviderProps) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    // Configurar el token getter en la instancia de axios
    const tokenGetter = async () => {
      if (!isSignedIn) {
        return null;
      }
      
      try {
        const token = await getToken();
        return token;
      } catch (error) {
        console.warn('Error al obtener token en TokenProvider:', error);
        return null;
      }
    };

    setTokenGetter(tokenGetter);
  }, [getToken, isSignedIn]);

  return <>{children}</>;
}