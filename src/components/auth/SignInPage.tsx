import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import RedirectIfSignedIn from './RedirectIfSignedIn';

export default function SignInPage() {
  return (
    <RedirectIfSignedIn>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </RedirectIfSignedIn>
  );
}
