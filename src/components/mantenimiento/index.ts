// Componentes compartidos de mantenimiento
export { default as MantenimientoTable } from './shared/MantenimientoTable';
export { default as MantenimientoFilters } from './shared/MantenimientoFilters';
export { default as MantenimientoModal } from './shared/MantenimientoModal';
export { default as StatusBadge } from './shared/StatusBadge';
export { FormField, FormActions } from './shared/FormComponents';

// Componentes específicos de componentes
export { default as ComponenteModal } from './componentes/ComponenteModal';
export { default as ComponentesTable } from './componentes/ComponentesTable';
export { default as ComponentesFilters } from './componentes/ComponentesFilters';

// Componentes de órdenes de trabajo - usando named exports
export { OrdenesTable } from './ordenes/OrdenesTable';
export { OrdenesFilters } from './ordenes/OrdenesFilters';
export { default as OrdenTrabajoModal } from './ordenes/OrdenTrabajoModal';

// Componentes de inspecciones - usando named exports
export { InspeccionesTable } from './inspecciones/InspeccionesTable';
export { InspeccionesFilters } from './inspecciones/InspeccionesFilters';