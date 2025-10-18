import React, { useEffect } from 'react';
import { SignIn, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  // Monitorear el estado de autenticación
  useEffect(() => {
    if (isSignedIn && isOpen) {
      onClose();
      navigate('/dashboard');
    }
  }, [isSignedIn, isOpen, onClose, navigate]);

  // Función simplificada para ocultar elementos no deseados
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        // Solo ocultar elementos específicos sin interferir con la funcionalidad
        const elementsToHide = document.querySelectorAll('.cl-footer, .cl-footerAction, .cl-brandingContainer');
        elementsToHide.forEach((el: Element) => {
          (el as HTMLElement).style.display = 'none';
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Iniciar Sesión"
      size="md"
    >
      <div className="space-y-4">
        {/* Descripción */}
        <div className="text-center mb-6">
          <p className="text-slate-300">
            Accede a tu cuenta del Sistema COEAN23
          </p>
        </div>

        {/* Componente Clerk personalizado */}
        <div className="clerk-signin-container">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent border-0 shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formFieldInput: "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400",
                formFieldLabel: "text-slate-300",
                formButtonPrimary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0",
                socialButtonsBlockButton: "bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                dividerLine: "bg-slate-600",
                dividerText: "text-slate-400"
              }
            }}
          />
        </div>

        {/* Separador y enlace a registro */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-center text-slate-400 text-sm">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default SignInModal;