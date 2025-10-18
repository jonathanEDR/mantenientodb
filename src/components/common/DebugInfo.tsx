import React, { useState } from 'react';

interface DebugInfoProps {
  dbUser: any;
  isVisible?: boolean;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ dbUser, isVisible = false }) => {
  const [showDebug, setShowDebug] = useState(isVisible);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="text-xs text-gray-400 hover:text-gray-600 underline"
      >
        Mostrar información técnica
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-700">Información Técnica del Sistema</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ✕ Ocultar
        </button>
      </div>
      
      <div className="space-y-2 text-xs text-gray-600">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">ID de Usuario (BD):</span> {dbUser?._id}</p>
            <p><span className="font-medium">Clerk ID:</span> {dbUser?.clerkId}</p>
            <p><span className="font-medium">Creado:</span> {dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleString() : 'N/A'}</p>
          </div>
          <div>
            <p><span className="font-medium">Última actualización:</span> {dbUser?.updatedAt ? new Date(dbUser.updatedAt).toLocaleString() : 'N/A'}</p>
            <p><span className="font-medium">Estado de BD:</span> <span className="text-green-600">✅ Conectado</span></p>
            <p><span className="font-medium">Versión:</span> v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;