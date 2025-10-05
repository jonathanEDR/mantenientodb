import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ComponentesAeronave from '../components/mantenimiento/ComponentesAeronave';
import { useInventario } from '../hooks/inventario';

/**
 * Página independiente para la gestión de componentes de una aeronave específica
 * Ruta: /componentes/aeronave/:matricula
 */
const GestionComponentesAeronave: React.FC = () => {
  const { matricula } = useParams<{ matricula: string }>();
  const navigate = useNavigate();
  const { aeronaves, loading, error } = useInventario();

  // Buscar la aeronave por matrícula
  const aeronave = React.useMemo(() => {
    return aeronaves.find(a => a.matricula === matricula);
  }, [aeronaves, matricula]);

  // Handler para volver al inventario
  const handleVolver = () => {
    navigate('/inventario');
  };

  // Loading state
  if (loading && aeronaves.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state - aeronave no encontrada
  if (!aeronave && !loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Aeronave no encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontró ninguna aeronave con matrícula: {matricula}
            </p>
            <div className="mt-6">
              <button
                onClick={handleVolver}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver al Inventario
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state - general
  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header con breadcrumbs y botón volver */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Botón volver */}
              <button
                onClick={handleVolver}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver
              </button>
              
              {/* Breadcrumbs */}
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <button
                      onClick={handleVolver}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Inventario
                    </button>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-gray-700 font-medium">
                      Componentes
                    </span>
                  </li>
                </ol>
              </nav>
            </div>

            {/* Información de la aeronave */}
            {aeronave && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">
                    {aeronave.matricula}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {aeronave.fabricante} {aeronave.modelo}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Componente de gestión de componentes */}
        {aeronave && (
          <ComponentesAeronave
            aeronave={aeronave}
            isOpen={true}
            onClose={handleVolver}
            isInPlace={true}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default GestionComponentesAeronave;
