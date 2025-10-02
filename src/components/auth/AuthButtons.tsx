import React from 'react';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { nuclearCacheCleanup } from '../../utils/cacheCleanup';

export default function AuthButtons() {
  const clerk = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // 1. Limpieza nuclear de caches antes del signOut
      await nuclearCacheCleanup(clerk);
      
      // 2. SignOut de Clerk
      await clerk.signOut();
      
      // 3. Limpiar una vez más después del signOut
      await nuclearCacheCleanup(clerk);
      
      // 4. Redirigir a la página principal
      navigate('/', { replace: true });
      
      // 5. Recargar la página para asegurar limpieza completa
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      // En caso de error, forzar limpieza y redirección
      await nuclearCacheCleanup(clerk);
      window.location.href = '/';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <Link to="/sign-in">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl">
            Iniciar Sesión
          </button>
        </Link>
        <Link to="/sign-up">
          <button className="px-4 py-2 bg-transparent border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-800/50 hover:border-slate-500 transition-all duration-300">
            Registrarse
          </button>
        </Link>
      </SignedOut>

      <SignedIn>
        <Link to="/dashboard">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl">
            Dashboard
          </button>
        </Link>
        <div className="ml-2">
          <UserButton 
            afterSignOutUrl="/"
            userProfileMode="modal"
            afterMultiSessionSingleSignOutUrl="/"
            signInUrl="/sign-in"
          />
        </div>
        {/* Botón de cierre de sesión alternativo */}
        <button
          onClick={handleSignOut}
          className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors duration-200 text-sm"
          title="Cerrar sesión completa"
        >
          Salir
        </button>
      </SignedIn>
    </div>
  );
}
