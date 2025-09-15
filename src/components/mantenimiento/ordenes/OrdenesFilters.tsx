import React from 'react';
import MantenimientoFilters from '../shared/MantenimientoFilters';

export interface OrdenesFiltersProps {
  filtroTipo: string;
  filtroEstado: string;
  filtroPrioridad: string;
  filtroBusqueda: string;
  filtroTecnico: string;
  onTipoChange: (tipo: string) => void;
  onEstadoChange: (estado: string) => void;
  onPrioridadChange: (prioridad: string) => void;
  onBusquedaChange: (busqueda: string) => void;
  onTecnicoChange: (tecnico: string) => void;
  onAdd: () => void;
  onClear?: () => void;
}

export const OrdenesFilters: React.FC<OrdenesFiltersProps> = ({
  filtroTipo,
  filtroEstado,
  filtroPrioridad,
  filtroBusqueda,
  filtroTecnico,
  onTipoChange,
  onEstadoChange,
  onPrioridadChange,
  onBusquedaChange,
  onTecnicoChange,
  onAdd,
  onClear
}) => {
  const filters = [
    {
      key: 'tipo',
      label: 'Tipo de Mantenimiento',
      type: 'select' as const,
      value: filtroTipo,
      onChange: onTipoChange,
      options: [
        { value: '', label: 'Todos los tipos' },
        { value: 'PREVENTIVO', label: 'Preventivo' },
        { value: 'CORRECTIVO', label: 'Correctivo' },
        { value: 'PREDICTIVO', label: 'Predictivo' },
        { value: 'OVERHAUL', label: 'Overhaul' },
        { value: 'INSPECCION', label: 'Inspección' },
        { value: 'MODIFICACION', label: 'Modificación' },
        { value: 'DIRECTIVA_AD', label: 'Directiva AD' },
        { value: 'BOLETIN_SERVICIO', label: 'Boletín de Servicio' }
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
        { value: 'ABIERTA', label: 'Abierta' },
        { value: 'EN_PROGRESO', label: 'En Progreso' },
        { value: 'ESPERANDO_MATERIAL', label: 'Esperando Material' },
        { value: 'ESPERANDO_APROBACION', label: 'Esperando Aprobación' },
        { value: 'COMPLETADA', label: 'Completada' },
        { value: 'CANCELADA', label: 'Cancelada' },
        { value: 'DIFERIDA', label: 'Diferida' }
      ]
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      type: 'select' as const,
      value: filtroPrioridad,
      onChange: onPrioridadChange,
      options: [
        { value: '', label: 'Todas las prioridades' },
        { value: 'CRITICA', label: 'Crítica' },
        { value: 'ALTA', label: 'Alta' },
        { value: 'MEDIA', label: 'Media' },
        { value: 'BAJA', label: 'Baja' }
      ]
    },
    {
      key: 'busqueda',
      label: 'Buscar',
      type: 'text' as const,
      value: filtroBusqueda,
      onChange: onBusquedaChange,
      placeholder: 'Buscar por número de orden, descripción o técnico...'
    },
    {
      key: 'tecnico',
      label: 'Técnico Asignado',
      type: 'select' as const,
      value: filtroTecnico,
      onChange: onTecnicoChange,
      options: [
        { value: '', label: 'Todos los técnicos' },
        { value: 'tecnico1', label: 'Técnico 1' },
        { value: 'tecnico2', label: 'Técnico 2' },
        { value: 'tecnico3', label: 'Técnico 3' }
      ]
    }
  ];

  return (
    <MantenimientoFilters
      title="Filtros de Órdenes de Trabajo"
      filters={filters}
      onAdd={onAdd}
      addButtonText="Nueva Orden de Trabajo"
    />
  );
};