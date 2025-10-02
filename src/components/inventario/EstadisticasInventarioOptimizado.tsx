import React, { useMemo } from 'react';
import { useEstadisticasInventario } from '../../hooks/inventario/useInventarioQuery';
import LoadingSpinner, { SkeletonStats } from '../common/LoadingSpinner';
import { handleError } from '../../utils/notifications';

/**
 * Componente optimizado de estadísticas de inventario
 * Usa React Query para cacheo automático y manejo de estados
 */
const EstadisticasInventarioOptimizado: React.FC = () => {
  // React Query hook - maneja loading, error, y cache automáticamente
  const { data, isLoading, isError, error, refetch } = useEstadisticasInventario();

  // Memoizar cálculos derivados para evitar re-cálculos innecesarios
  const stats = useMemo(() => {
    if (!data?.data) return null;

    const {
      totalAeronaves,
      helicopteros,
      aviones,
      operativas,
      enMantenimiento,
      fueraServicio,
      porcentajeOperativas,
    } = data.data;

    return [
      {
        title: 'Total Aeronaves',
        value: totalAeronaves,
        icon: '✈️',
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
      },
      {
        title: 'Operativas',
        value: operativas,
        percentage: porcentajeOperativas,
        icon: '✅',
        color: 'bg-green-500',
        textColor: 'text-green-600',
      },
      {
        title: 'En Mantenimiento',
        value: enMantenimiento,
        icon: '🔧',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
      },
      {
        title: 'Fuera de Servicio',
        value: fueraServicio,
        icon: '⚠️',
        color: 'bg-red-500',
        textColor: 'text-red-600',
      },
    ];
  }, [data]);

  // Estado de carga
  if (isLoading) {
    return <SkeletonStats count={4} />;
  }

  // Estado de error
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium mb-3">Error al cargar estadísticas</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // No hay datos
  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No hay estadísticas disponibles</p>
      </div>
    );
  }

  // Renderizar estadísticas
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">{stat.icon}</span>
            <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
          </div>

          <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>

          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            {stat.percentage !== undefined && (
              <span className="text-sm text-gray-500">({stat.percentage}%)</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(EstadisticasInventarioOptimizado);
