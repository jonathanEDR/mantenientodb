import React from 'react';
import MantenimientoFilters from '../shared/MantenimientoFilters';

export interface InspeccionesFiltersProps {
  filtroTipo: string;
  filtroEstado: string;
  filtroResultado: string;
  filtroBusqueda: string;
  filtroInspector: string;
  onTipoChange: (tipo: string) => void;
  onEstadoChange: (estado: string) => void;
  onResultadoChange: (resultado: string) => void;
  onBusquedaChange: (busqueda: string) => void;
  onInspectorChange: (inspector: string) => void;
  onAdd: () => void;
  onClear?: () => void;
}

export const InspeccionesFilters: React.FC<InspeccionesFiltersProps> = ({
  filtroTipo,
  filtroEstado,
  filtroResultado,
  filtroBusqueda,
  filtroInspector,
  onTipoChange,
  onEstadoChange,
  onResultadoChange,
  onBusquedaChange,
  onInspectorChange,
  onAdd,
  onClear
}) => {
  const filters = [
    {
      key: 'tipo',
      label: 'Tipo de Inspección',
      type: 'select' as const,
      value: filtroTipo,
      onChange: onTipoChange,
      options: [
        { value: '', label: 'Todos los tipos' },
        { value: 'DIARIA', label: 'Diaria' },
        { value: 'PREFLIGHT', label: 'Preflight' },
        { value: 'POSTFLIGHT', label: 'Postflight' },
        { value: 'SEMANAL', label: 'Semanal' },
        { value: 'MENSUAL', label: 'Mensual' },
        { value: 'ANUAL', label: 'Anual' },
        { value: 'CONDICIONAL', label: 'Condicional' }
      ]
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select' as const,
      value: filtroEstado,
      onChange: onEstadoChange,
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 'PROGRAMADA', label: 'Programada' },
        { value: 'EN_PROGRESO', label: 'En Progreso' },
        { value: 'COMPLETADA', label: 'Completada' },
        { value: 'VENCIDA', label: 'Vencida' },
        { value: 'CANCELADA', label: 'Cancelada' }
      ]
    },
    {
      key: 'resultado',
      label: 'Resultado',
      type: 'select' as const,
      value: filtroResultado,
      onChange: onResultadoChange,
      options: [
        { value: '', label: 'Todos los resultados' },
        { value: 'CONFORME', label: 'Conforme' },
        { value: 'NO_CONFORME', label: 'No Conforme' },
        { value: 'CONDICIONAL', label: 'Condicional' }
      ]
    },
    {
      key: 'busqueda',
      label: 'Buscar',
      type: 'text' as const,
      value: filtroBusqueda,
      onChange: onBusquedaChange,
      placeholder: 'Buscar por número de inspección o aeronave...'
    },
    {
      key: 'inspector',
      label: 'Inspector',
      type: 'select' as const,
      value: filtroInspector,
      onChange: onInspectorChange,
      options: [
        { value: '', label: 'Todos los inspectores' },
        { value: 'inspector1', label: 'Inspector 1' },
        { value: 'inspector2', label: 'Inspector 2' },
        { value: 'inspector3', label: 'Inspector 3' }
      ]
    }
  ];

  return (
    <MantenimientoFilters
      title="Filtros de Inspecciones"
      filters={filters}
      onAdd={onAdd}
      addButtonText="Nueva Inspección"
    />
  );
};