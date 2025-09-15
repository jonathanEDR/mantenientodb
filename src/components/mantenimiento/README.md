# Módulo de Mantenimiento - Arquitectura Modular

Este módulo implementa una arquitectura modular y escalable para la gestión de mantenimiento aeronáutico.

## 📁 Estructura del Proyecto

```
src/
├── components/mantenimiento/          # Componentes UI modulares
│   ├── shared/                       # Componentes reutilizables
│   │   ├── MantenimientoTable.tsx    # Tabla base configurable
│   │   ├── MantenimientoFilters.tsx  # Sistema de filtros base
│   │   ├── MantenimientoModal.tsx    # Modal base para formularios
│   │   ├── StatusBadge.tsx           # Badge de estado reutilizable
│   │   └── FormComponents.tsx        # Campos de formulario reutilizables
│   ├── componentes/                  # Gestión de componentes
│   │   ├── ComponenteModal.tsx
│   │   ├── ComponentesTable.tsx
│   │   └── ComponentesFilters.tsx
│   ├── ordenes/                      # Órdenes de trabajo
│   │   ├── OrdenesTable.tsx
│   │   └── OrdenesFilters.tsx
│   ├── inspecciones/                 # Inspecciones
│   │   ├── InspeccionesTable.tsx
│   │   └── InspeccionesFilters.tsx
│   └── index.ts                      # Barrel file para imports limpios
├── hooks/mantenimiento/              # Hooks personalizados
│   ├── useMantenimiento.ts           # Lógica de datos y CRUD
│   ├── useFilters.ts                 # Lógica de filtrado avanzada
│   ├── useModal.ts                   # Manejo de estado de modales
│   └── index.ts
├── context/mantenimiento/            # Estado global
│   ├── MantenimientoContext.tsx      # Context Provider con reducer
│   └── index.ts
└── types/mantenimiento.ts            # Tipos TypeScript
```

## 🔧 Hooks Personalizados

### useMantenimiento
Hook para manejo de datos y operaciones CRUD:

```typescript
const {
  componentes,
  aeronaves,
  loading,
  error,
  crearNuevoComponente,
  actualizarComponenteExistente,
  eliminarComponenteExistente,
  obtenerAeronaveNombre,
  validarComponente
} = useMantenimiento();
```

### useFilters
Hook para filtrado avanzado de datos:

```typescript
const {
  filtros,
  datosFiltrados,
  setFiltroCategoria,
  setFiltroEstado,
  setFiltroBusqueda,
  limpiarFiltros,
  hayFiltrosActivos,
  conteoFiltros
} = useFilters(datos);
```

### useModal
Hook para manejo de estado de modales:

```typescript
const {
  isOpen,
  loading,
  editingItem,
  openModal,
  closeModal,
  setLoading,
  isEditing,
  isCreating
} = useModal<TipoItem>();
```

## 🔄 Context Provider

El `MantenimientoProvider` ofrece estado global centralizado:

```typescript
import { MantenimientoProvider, useMantenimientoContext } from '../context';

// En el root de la aplicación
<MantenimientoProvider>
  <App />
</MantenimientoProvider>

// En componentes hijos
const {
  componentes,
  setComponentes,
  addComponente,
  updateComponente,
  deleteComponente,
  filters,
  setFilters,
  getAeronaveNombre
} = useMantenimientoContext();
```

## 🧩 Componentes Reutilizables

### MantenimientoTable
Tabla base configurable para cualquier tipo de datos:

```typescript
<MantenimientoTable
  data={datos}
  columns={configuracionColumnas}
  emptyMessage="No se encontraron datos"
/>
```

### MantenimientoFilters
Sistema de filtros universal:

```typescript
<MantenimientoFilters
  title="Filtros"
  filters={configuracionFiltros}
  onAdd={manejarAgregar}
  addButtonText="Nuevo Item"
/>
```

### StatusBadge
Badge de estado reutilizable:

```typescript
<StatusBadge
  status="OPERATIVO"
  className="bg-green-100 text-green-800"
/>
```

## 📋 Uso en Páginas

Ejemplo de implementación simplificada:

```typescript
import React from 'react';
import {
  ComponentesTable,
  ComponentesFilters,
  ComponenteModal
} from '../components/mantenimiento';
import { useMantenimiento, useModal } from '../hooks';

export default function GestionComponentes() {
  const { componentes, aeronaves, loading } = useMantenimiento();
  const { isOpen, editingItem, openModal, closeModal } = useModal();
  
  // Filtros locales (opcional - también se puede usar context)
  const [filtros, setFiltros] = useState({});
  
  return (
    <div>
      <ComponentesFilters onAdd={() => openModal()} />
      <ComponentesTable
        componentes={componentesFiltrados}
        onEdit={openModal}
        onDelete={handleDelete}
      />
      <ComponenteModal
        isOpen={isOpen}
        onClose={closeModal}
        componente={editingItem}
      />
    </div>
  );
}
```

## ✨ Beneficios de la Arquitectura

1. **Reutilización**: Componentes shared que se usan en todo el módulo
2. **Mantenibilidad**: Separación clara de responsabilidades
3. **Escalabilidad**: Fácil agregar nuevas funcionalidades
4. **Tipado Estricto**: TypeScript en toda la aplicación
5. **Performance**: Hooks optimizados con useCallback y useMemo
6. **Testing**: Componentes aislados fáciles de testear
7. **Imports Limpios**: Barrel files para imports organizados

## 🚀 Próximas Mejoras

- [ ] Añadir Storybook para documentar componentes
- [ ] Implementar tests unitarios
- [ ] Añadir hooks para optimistic updates
- [ ] Implementar virtual scrolling para tablas grandes
- [ ] Añadir componentes de gráficos y reportes
- [ ] Implementar sistema de permisos por componente

## 📝 Convenciones de Código

- Componentes en PascalCase
- Hooks personalizados empiezan con "use"
- Interfaces empiezan con "I"
- Enums en SCREAMING_SNAKE_CASE
- Props interfaces terminan en "Props"
- Context providers terminan en "Provider"
- Barrel files (index.ts) en cada directorio para exports limpios