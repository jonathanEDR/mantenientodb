import React from 'react';
import AuthButtons from '../components/auth/AuthButtons';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-6 bg-white shadow flex items-center justify-between">
        <h1 className="text-2xl font-bold">Registro - Módulo de Usuarios</h1>
        <AuthButtons />
      </header>
    </div>
  );
}
