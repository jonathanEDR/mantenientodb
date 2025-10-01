import React from 'react';
import { useCurrentUser } from '../hooks/useRoles';

// Contexto para autenticación
interface IAuthContext {
  currentUser: any;
  permissions: any;
  userRole: any;
  roleInfo: any;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = React.createContext<IAuthContext | undefined>(undefined);

// Provider para el contexto de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userData = useCurrentUser();
  
  const contextValue: IAuthContext = {
    ...userData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = (): IAuthContext => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthProvider;