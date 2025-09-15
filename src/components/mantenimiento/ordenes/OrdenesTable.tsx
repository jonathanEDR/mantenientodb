import React from 'react';
import { IOrdenTrabajo } from '../../../types/mantenimiento';
import { IAeronave } from '../../../types/inventario';
import { IComponente } from '../../../types/mantenimiento';
import MantenimientoTable from '../shared/MantenimientoTable';
import StatusBadge from '../shared/StatusBadge';

export interface OrdenesTableProps {
  ordenes: IOrdenTrabajo[];
  aeronaves: IAeronave[];
  componentes: IComponente[];
  onEdit: (orden: IOrdenTrabajo) => void;
  onDelete: (orden: IOrdenTrabajo) => void;
  onView?: (orden: IOrdenTrabajo) => void;
}

export const OrdenesTable: React.FC<OrdenesTableProps> = ({
  ordenes,
  aeronaves,
  componentes,
  onEdit,
  onDelete,
  onView
}) => {
  const getAeronaveNombre = (aeronaveId: string) => {
    const aeronave = aeronaves.find(a => a._id === aeronaveId);
    return aeronave ? `${aeronave.matricula} - ${aeronave.modelo}` : 'N/A';
  };

  const getComponenteNombre = (componenteId: string) => {
    const componente = componentes.find(c => c._id === componenteId);
    return componente ? componente.nombre : 'N/A';
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'EN_PROCESO': return 'bg-blue-100 text-blue-800';
      case 'ESPERANDO_REPUESTOS': return 'bg-orange-100 text-orange-800';
      case 'ESPERANDO_APROBACION': return 'bg-purple-100 text-purple-800';
      case 'COMPLETADA': return 'bg-green-100 text-green-800';
      case 'CANCELADA': return 'bg-red-100 text-red-800';
      case 'SUSPENDIDA': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'CRITICA': return 'bg-red-100 text-red-800';
      case 'ALTA': return 'bg-orange-100 text-orange-800';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800';
      case 'BAJA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'numero',
      header: 'Número OT',
      title: 'Número OT',
      render: (orden: IOrdenTrabajo) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {orden.numeroOrden || `OT-${orden._id?.slice(-6)}`}
          </div>
          <div className="text-sm text-gray-500">
            {orden.tipo}
          </div>
        </div>
      )
    },
    {
      key: 'titulo',
      header: 'Título',
      title: 'Título',
      render: (orden: IOrdenTrabajo) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900 truncate">
            {orden.titulo}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {orden.descripcion}
          </div>
        </div>
      )
    },
    {
      key: 'aeronave',
      header: 'Aeronave',
      title: 'Aeronave',
      render: (orden: IOrdenTrabajo) => (
        <span className="text-sm text-gray-900">
          {getAeronaveNombre(orden.aeronave)}
        </span>
      )
    },
    {
      key: 'componente',
      header: 'Componente',
      title: 'Componente',
      render: (orden: IOrdenTrabajo) => (
        <span className="text-sm text-gray-900">
          {orden.componente ? getComponenteNombre(orden.componente) : 'General'}
        </span>
      )
    },
    {
      key: 'prioridad',
      header: 'Prioridad',
      title: 'Prioridad',
      render: (orden: IOrdenTrabajo) => (
        <StatusBadge
          status={orden.prioridad}
          className={getPrioridadColor(orden.prioridad)}
        />
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      title: 'Estado',
      render: (orden: IOrdenTrabajo) => (
        <StatusBadge
          status={orden.estado}
          className={getEstadoColor(orden.estado)}
        />
      )
    },
    {
      key: 'fechas',
      header: 'Fechas',
      title: 'Fechas',
      render: (orden: IOrdenTrabajo) => (
        <div className="text-sm text-gray-900">
          <div>Inicio: {orden.fechaInicio ? new Date(orden.fechaInicio).toLocaleDateString() : 'N/A'}</div>
          <div>Fin: {orden.fechaFinalizacion ? new Date(orden.fechaFinalizacion).toLocaleDateString() : 'Pendiente'}</div>
        </div>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      title: 'Acciones',
      render: (orden: IOrdenTrabajo) => (
        <div className="flex space-x-2">
          {onView && (
            <button
              onClick={() => onView(orden)}
              className="text-blue-600 hover:text-blue-900 text-sm"
              title="Ver detalles"
            >
              Ver
            </button>
          )}
          <button
            onClick={() => onEdit(orden)}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
            title="Editar"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(orden)}
            className="text-red-600 hover:text-red-900 text-sm"
            title="Eliminar"
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  return (
    <MantenimientoTable
      data={ordenes}
      columns={columns}
      emptyMessage="No se encontraron órdenes de trabajo"
    />
  );
};