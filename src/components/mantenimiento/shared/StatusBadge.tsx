import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'estado' | 'prioridad' | 'categoria';
  className?: string;
}

export default function StatusBadge({ status, variant = 'estado', className = '' }: StatusBadgeProps) {
  const getStatusColor = () => {
    if (variant === 'estado') {
      switch (status) {
        case 'INSTALADO':
          return 'bg-green-100 text-green-800';
        case 'EN_ALMACEN':
          return 'bg-blue-100 text-blue-800';
        case 'EN_REPARACION':
          return 'bg-orange-100 text-orange-800';
        case 'CONDENADO':
          return 'bg-red-100 text-red-800';
        case 'EN_OVERHAUL':
          return 'bg-purple-100 text-purple-800';
        case 'PENDIENTE_INSPECCION':
          return 'bg-yellow-100 text-yellow-800';
        case 'PENDIENTE':
          return 'bg-gray-100 text-gray-800';
        case 'EN_PROCESO':
          return 'bg-blue-100 text-blue-800';
        case 'COMPLETADA':
          return 'bg-green-100 text-green-800';
        case 'CANCELADA':
          return 'bg-red-100 text-red-800';
        case 'SUSPENDIDA':
          return 'bg-yellow-100 text-yellow-800';
        case 'ESPERANDO_REPUESTOS':
          return 'bg-orange-100 text-orange-800';
        case 'ESPERANDO_APROBACION':
          return 'bg-purple-100 text-purple-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    if (variant === 'prioridad') {
      switch (status) {
        case 'CRITICA':
          return 'bg-red-100 text-red-800';
        case 'ALTA':
          return 'bg-orange-100 text-orange-800';
        case 'MEDIA':
          return 'bg-yellow-100 text-yellow-800';
        case 'BAJA':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Categorías y otros
    return 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span 
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()} ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
}