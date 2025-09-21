import React from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function AuthButtons() {
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
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
}
