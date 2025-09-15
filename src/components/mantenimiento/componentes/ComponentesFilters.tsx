import React from 'react';
import { ComponenteCategoria, EstadoComponente } from '../../../types/mantenimiento';
import MantenimientoFilters from '../shared/MantenimientoFilters';

interface ComponentesFiltersProps {
  filtroCategoria: string;
  filtroEstado: string;
  filtroBusqueda: string;
  onCategoriaChange: (categoria: string) => void;
  onEstadoChange: (estado: string) => void;
  onBusquedaChange: (busqueda: string) => void;
  onAdd: () => void;
}

export default function ComponentesFilters({
  filtroCategoria,
  filtroEstado,
  filtroBusqueda,
  onCategoriaChange,
  onEstadoChange,
  onBusquedaChange,
  onAdd
}: ComponentesFiltersProps) {
  const categoriaOptions = [
    { value: ComponenteCategoria.FUSELAJE, label: 'Fuselaje' },
    { value: ComponenteCategoria.MOTOR_PRINCIPAL, label: 'Motor Principal' },
    { value: ComponenteCategoria.TRANSMISION_PRINCIPAL, label: 'Transmisión Principal' },
    { value: ComponenteCategoria.CUBO_ROTOR_PRINCIPAL, label: 'Cubo Rotor Principal' },
    { value: ComponenteCategoria.PALAS_ROTOR_PRINCIPAL, label: 'Palas Rotor Principal' },
    { value: ComponenteCategoria.PLATO_CICLICO, label: 'Plato Cíclico' },
    { value: ComponenteCategoria.CAJA_30_GRADOS, label: 'Caja 30 Grados' },
    { value: ComponenteCategoria.CUBO_ROTOR_COLA, label: 'Cubo Rotor Cola' },
    { value: ComponenteCategoria.PALAS_ROTOR_COLA, label: 'Palas Rotor Cola' },
    { value: ComponenteCategoria.STARTER_GENERADOR, label: 'Starter Generador' },
    { value: ComponenteCategoria.BATERIAS, label: 'Baterías' },
    { value: ComponenteCategoria.SISTEMA_HIDRAULICO, label: 'Sistema Hidráulico' },
    { value: ComponenteCategoria.TREN_ATERRIZAJE, label: 'Tren de Aterrizaje' },
    { value: ComponenteCategoria.SISTEMA_ELECTRICO, label: 'Sistema Eléctrico' },
    { value: ComponenteCategoria.INSTRUMENTACION, label: 'Instrumentación' },
    { value: ComponenteCategoria.CONTROLES_VUELO, label: 'Controles de Vuelo' },
    { value: ComponenteCategoria.OTROS, label: 'Otros' }
  ];

  const estadoOptions = [
    { value: EstadoComponente.INSTALADO, label: 'Instalado' },
    { value: EstadoComponente.EN_ALMACEN, label: 'En Almacén' },
    { value: EstadoComponente.EN_REPARACION, label: 'En Reparación' },
    { value: EstadoComponente.CONDENADO, label: 'Condenado' },
    { value: EstadoComponente.EN_OVERHAUL, label: 'En Overhaul' },
    { value: EstadoComponente.PENDIENTE_INSPECCION, label: 'Pendiente Inspección' }
  ];

  const filters = [
    {
      key: 'busqueda',
      label: 'Buscar',
      type: 'text' as const,
      value: filtroBusqueda,
      onChange: onBusquedaChange,
      placeholder: 'Buscar por nombre, S/N o P/N...'
    },
    {
      key: 'categoria',
      label: 'Categoría',
      type: 'select' as const,
      value: filtroCategoria,
      onChange: onCategoriaChange,
      options: categoriaOptions,
      placeholder: 'Todas las categorías'
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select' as const,
      value: filtroEstado,
      onChange: onEstadoChange,
      options: estadoOptions,
      placeholder: 'Todos los estados'
    }
  ];

  return (
    <MantenimientoFilters
      filters={filters}
      onAdd={onAdd}
      addButtonText="Nuevo Componente"
      title="Filtros de Componentes"
    />
  );
}