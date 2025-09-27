import React from 'react';
import { IComponente } from '../../../types/mantenimiento';
import { IAeronave } from '../../../types/inventario';
import MantenimientoTable from '../shared/MantenimientoTable';
import StatusBadge from '../shared/StatusBadge';

interface ComponentesTableProps {
  componentes: IComponente[];
  aeronaves: IAeronave[];
  loading?: boolean;
  onEdit: (componente: IComponente) => void;
  onDelete: (componente: IComponente) => void;
  onViewDetails: (componente: IComponente) => void;
  onViewMonitoreo?: (componente: IComponente) => void;
}

export default function ComponentesTable({
  componentes,
  aeronaves,
  loading = false,
  onEdit,
  onDelete,
  onViewDetails,
  onViewMonitoreo
}: ComponentesTableProps) {
  const obtenerNombreAeronave = (aeronaveActual?: string | IAeronave) => {
    if (!aeronaveActual) return 'No asignada';
    
    // Si es un objeto (datos poblados)
    if (typeof aeronaveActual === 'object') {
      return `${aeronaveActual.matricula} - ${aeronaveActual.modelo}`;
    }
    
    // Si es un string (ObjectId), buscar en la lista de aeronaves
    const aeronave = aeronaves.find(a => a._id === aeronaveActual || a.matricula === aeronaveActual);
    return aeronave ? `${aeronave.matricula} - ${aeronave.modelo}` : 'N/A';
  };

  const formatearCategoria = (categoria: string) => {
    return categoria.replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const columns = [
    {
      key: 'nombre',
      title: 'Componente',
      render: (value: string, record: IComponente) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">S/N: {record.numeroSerie}</div>
          <div className="text-sm text-gray-500">P/N: {record.numeroParte}</div>
        </div>
      )
    },
    {
      key: 'categoria',
      title: 'Categoría',
      render: (value: string) => (
        <span className="text-sm text-gray-900">{formatearCategoria(value)}</span>
      )
    },
    {
      key: 'fabricante',
      title: 'Fabricante',
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value}</span>
      )
    },
    {
      key: 'aeronaveActual',
      title: 'Aeronave',
      render: (value: string | IAeronave) => (
        <span className="text-sm text-gray-900">{obtenerNombreAeronave(value)}</span>
      )
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (value: string) => (
        <StatusBadge status={value} variant="estado" />
      )
    },
    {
      key: 'ubicacionFisica',
      title: 'Ubicación',
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value}</span>
      )
    },
    {
      key: 'fechaFabricacion',
      title: 'Fecha Fabricación',
      render: (value: Date) => (
        <span className="text-sm text-gray-900">
          {value ? new Date(value).toLocaleDateString() : 'No especificada'}
        </span>
      )
    },
    {
      key: 'acciones',
      title: 'Acciones',
      render: (value: any, record: IComponente) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(record)}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            title="Ver detalles y gestionar componente"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver Más
          </button>
          {onViewMonitoreo && (
            <button
              onClick={() => onViewMonitoreo(record)}
              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
              title="Gestionar estados de monitoreo"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Monitoreo
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <MantenimientoTable
      columns={columns}
      data={componentes}
      loading={loading}
      emptyMessage="No se encontraron componentes"
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}