import React from 'react';
import { useAuth, useClerk } from '@clerk/clerk-react';

interface TokenRefreshButtonProps {
  className?: string;
}

/**
 * Componente de utilidad para renovar manualmente el token de Clerk
 * Útil para debugging y cuando hay problemas de tokens expirados
 */
const TokenRefreshButton: React.FC<TokenRefreshButtonProps> = ({ className = '' }) => {
  const { getToken, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastRefresh, setLastRefresh] = React.useState<Date | null>(null);

  const handleRefreshToken = async () => {
    if (!isSignedIn) {
      alert('No hay sesión activa para renovar');
      return;
    }

    try {
      setRefreshing(true);
      console.log('🔄 Forzando renovación de token...');
      
      // Forzar obtención de token fresco
      const freshToken = await getToken({ 
        skipCache: true,
        template: undefined 
      });
      
      if (freshToken) {
        console.log('✅ Token renovado exitosamente');
        setLastRefresh(new Date());
        
        // Verificar expiración
        try {
          const payload = JSON.parse(atob(freshToken.split('.')[1]));
          const exp = payload.exp;
          const expDate = new Date(exp * 1000);
          
          alert(`✅ Token renovado exitosamente!\n\nExpira: ${expDate.toLocaleString()}\n\nRecarga la página si persisten los errores 401.`);
        } catch (e) {
          alert('✅ Token renovado exitosamente!\n\nRecarga la página si persisten los errores 401.');
        }
      } else {
        alert('❌ No se pudo obtener token fresco. Intenta hacer logout/login.');
      }
    } catch (error: any) {
      console.error('💥 Error renovando token:', error);
      alert(`❌ Error renovando token: ${error.message}\n\nIntenta hacer logout/login.`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleForceLogout = async () => {
    if (confirm('¿Cerrar sesión y volver a autenticarse? Esto puede resolver problemas de tokens.')) {
      try {
        await signOut();
      } catch (error) {
        console.error('Error en logout:', error);
      }
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-yellow-800 font-medium">🔧 Herramientas de Autenticación</h3>
          <p className="text-yellow-700 text-sm mt-1">
            Si tienes errores 401, usa estas herramientas
            {lastRefresh && (
              <span className="block text-xs mt-1">
                Última renovación: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRefreshToken}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm font-medium"
          >
            {refreshing ? '🔄 Renovando...' : '🔄 Renovar Token'}
          </button>
          
          <button
            onClick={handleForceLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenRefreshButton;