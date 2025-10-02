import React, { useState, useMemo } from 'react';
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
  // Estado para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const componentesPorPagina = 3;

  // Calcular componentes paginados
  const componentesPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * componentesPorPagina;
    const fin = inicio + componentesPorPagina;
    return componentes.slice(inicio, fin);
  }, [componentes, paginaActual]);

  const totalPaginas = Math.ceil(componentes.length / componentesPorPagina);

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
              title="Gestionar estados de monitoreo (carga bajo demanda)"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Monitoreo
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <MantenimientoTable
        columns={columns}
        data={componentesPaginados}
        loading={loading}
        emptyMessage="No se encontraron componentes"
        onEdit={onEdit}
        onDelete={onDelete}
      />
      
      {/* Controles de paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Mostrando{' '}
              <span className="font-medium">
                {(paginaActual - 1) * componentesPorPagina + 1}
              </span>{' '}
              al{' '}
              <span className="font-medium">
                {Math.min(paginaActual * componentesPorPagina, componentes.length)}
              </span>{' '}
              de{' '}
              <span className="font-medium">{componentes.length}</span> componentes
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>
            
            <span className="text-sm text-gray-700">
              Página {paginaActual} de {totalPaginas}
            </span>
            
            <button
              onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaActual === totalPaginas}
              className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}