import React from 'react';
import { IInspeccion } from '../../../types/mantenimiento';
import { IAeronave } from '../../../types/inventario';
import MantenimientoTable from '../shared/MantenimientoTable';
import StatusBadge from '../shared/StatusBadge';

export interface InspeccionesTableProps {
  inspecciones: IInspeccion[];
  aeronaves: IAeronave[];
  onEdit: (inspeccion: IInspeccion) => void;
  onDelete: (inspeccion: IInspeccion) => void;
  onView?: (inspeccion: IInspeccion) => void;
}

export const InspeccionesTable: React.FC<InspeccionesTableProps> = ({
  inspecciones,
  aeronaves,
  onEdit,
  onDelete,
  onView
}) => {
  const getAeronaveNombre = (aeronaveId: string) => {
    const aeronave = aeronaves.find(a => a._id === aeronaveId);
    return aeronave ? `${aeronave.matricula} - ${aeronave.modelo}` : 'N/A';
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PROGRAMADA': return 'bg-blue-100 text-blue-800';
      case 'EN_PROGRESO': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETADA': return 'bg-green-100 text-green-800';
      case 'VENCIDA': return 'bg-red-100 text-red-800';
      case 'CANCELADA': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'DIARIA': return 'bg-green-100 text-green-800';
      case 'PREFLIGHT': return 'bg-blue-100 text-blue-800';
      case 'POSTFLIGHT': return 'bg-purple-100 text-purple-800';
      case 'SEMANAL': return 'bg-orange-100 text-orange-800';
      case 'MENSUAL': return 'bg-red-100 text-red-800';
      case 'ANUAL': return 'bg-gray-100 text-gray-800';
      case 'CONDICIONAL': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'numero',
      header: 'Inspección',
      title: 'Inspección',
      render: (inspeccion: IInspeccion) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {inspeccion.numeroInspeccion || `INS-${inspeccion._id?.slice(-6)}`}
          </div>
          <div className="text-sm text-gray-500">
            <StatusBadge
              status={inspeccion.tipo}
              className={getTipoColor(inspeccion.tipo)}
            />
          </div>
        </div>
      )
    },
    {
      key: 'aeronave',
      header: 'Aeronave',
      title: 'Aeronave',
      render: (inspeccion: IInspeccion) => (
        <span className="text-sm text-gray-900">
          {getAeronaveNombre(inspeccion.aeronave)}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      title: 'Estado',
      render: (inspeccion: IInspeccion) => (
        <StatusBadge
          status={inspeccion.estado}
          className={getEstadoColor(inspeccion.estado)}
        />
      )
    },
    {
      key: 'fechas',
      header: 'Fechas',
      title: 'Fechas',
      render: (inspeccion: IInspeccion) => (
        <div className="text-sm text-gray-900">
          <div>Programa: {inspeccion.fechaProgramada ? new Date(inspeccion.fechaProgramada).toLocaleDateString() : 'N/A'}</div>
          <div>Realizada: {inspeccion.fechaRealizada ? new Date(inspeccion.fechaRealizada).toLocaleDateString() : 'Pendiente'}</div>
        </div>
      )
    },
    {
      key: 'inspector',
      header: 'Inspector',
      title: 'Inspector',
      render: (inspeccion: IInspeccion) => (
        <div className="text-sm text-gray-900">
          <div>{inspeccion.inspectorAsignado || 'No asignado'}</div>
          {inspeccion.inspectorRealizada && (
            <div className="text-xs text-gray-500">
              Realizada por: {inspeccion.inspectorRealizada}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'resultado',
      header: 'Resultado',
      title: 'Resultado',
      render: (inspeccion: IInspeccion) => (
        <div className="text-sm text-gray-900">
          {inspeccion.resultado ? (
            <StatusBadge
              status={inspeccion.resultado}
              className={
                inspeccion.resultado === 'CONFORME' 
                  ? 'bg-green-100 text-green-800'
                  : inspeccion.resultado === 'NO_CONFORME'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            />
          ) : (
            <span className="text-gray-500">Pendiente</span>
          )}
        </div>
      )
    },
    {
      key: 'items',
      header: 'Items',
      title: 'Items',
      render: (inspeccion: IInspeccion) => (
        <div className="text-sm text-gray-900">
          <div>Total: {inspeccion.itemsInspeccion?.length || 0}</div>
          {inspeccion.itemsInspeccion && inspeccion.itemsInspeccion.length > 0 && (
            <div className="text-xs text-gray-500">
              Conformes: {inspeccion.itemsInspeccion.filter((i: any) => i.estado === 'CONFORME').length}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      title: 'Acciones',
      render: (inspeccion: IInspeccion) => (
        <div className="flex space-x-2">
          {onView && (
            <button
              onClick={() => onView(inspeccion)}
              className="text-blue-600 hover:text-blue-900 text-sm"
              title="Ver detalles"
            >
              Ver
            </button>
          )}
          <button
            onClick={() => onEdit(inspeccion)}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
            title="Editar"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(inspeccion)}
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
      data={inspecciones}
      columns={columns}
      emptyMessage="No se encontraron inspecciones"
    />
  );
};