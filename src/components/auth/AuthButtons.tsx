import React from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <Link to="/sign-in">
          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
            Iniciar Sesión
          </button>
        </Link>
        <Link to="/sign-up">
          <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
            Registrarse
          </button>
        </Link>
      </SignedOut>

      <SignedIn>
        <Link to="/dashboard">
          <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
            Dashboard
          </button>
        </Link>
        <UserButton />
      </SignedIn>
    </div>
  );
}
