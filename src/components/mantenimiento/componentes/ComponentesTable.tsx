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
}

export default function ComponentesTable({
  componentes,
  aeronaves,
  loading = false,
  onEdit,
  onDelete
}: ComponentesTableProps) {
  const obtenerNombreAeronave = (matricula?: string) => {
    if (!matricula) return 'No asignada';
    const aeronave = aeronaves.find(a => a.matricula === matricula);
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
      render: (value: string) => (
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