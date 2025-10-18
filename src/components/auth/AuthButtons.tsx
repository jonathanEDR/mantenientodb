import React, { useState } from 'react';
import { SignedIn, SignedOut, UserButton, useClerk, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';

export default function AuthButtons() {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  
  // Estados para controlar los modales
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleSignOut = async () => {
    try {
      // SignOut simple sin cache
      await clerk.signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      window.location.href = '/';
    }
  };

  const handleDashboardClick = () => {
    if (isSignedIn) {
      navigate('/dashboard');
    } else {
      setShowSignInModal(true);
    }
  };

  // Funciones para cambiar entre modales
  const switchToSignUp = () => {
    setShowSignInModal(false);
    setShowSignUpModal(true);
  };

  const switchToSignIn = () => {
    setShowSignUpModal(false);
    setShowSignInModal(true);
  };

  const closeAllModals = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <SignedOut>
          <button 
            onClick={() => setShowSignInModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => setShowSignUpModal(true)}
            className="px-4 py-2 bg-transparent border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-800/50 hover:border-slate-500 transition-all duration-300"
          >
            Registrarse
          </button>
        </SignedOut>

        <SignedIn>
          <button 
            onClick={handleDashboardClick}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Dashboard
          </button>
          <div className="ml-2">
            <UserButton 
              afterSignOutUrl="/"
              userProfileMode="modal"
              afterMultiSessionSingleSignOutUrl="/"
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

      {/* Modales de autenticación */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={closeAllModals}
        onSwitchToSignUp={switchToSignUp}
      />
      
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={closeAllModals}
        onSwitchToSignIn={switchToSignIn}
      />
    </>
  );
}
