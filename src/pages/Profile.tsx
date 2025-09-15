import React from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function Profile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return (
    <DashboardLayout>
      <div>Loading...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Perfil">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Perfil de usuario</h2>
        <p><strong>Nombre:</strong> {user?.firstName} {user?.lastName}</p>
        <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
        <p><strong>Clerk ID:</strong> {user?.id}</p>

        <div className="mt-4">
          <SignOutButton>
            <button className="px-4 py-2 bg-red-600 text-white rounded">Cerrar sesión</button>
          </SignOutButton>
        </div>
      </div>
    </DashboardLayout>
  );
}
