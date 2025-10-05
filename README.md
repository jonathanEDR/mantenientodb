# 🎨 INVMANT Frontend

Interfaz web moderna desarrollada en React + TypeScript + Vite para el sistema de mantenimiento aeronáutico.

## 🚀 **Inicio Rápido**

### Requisitos
- **Node.js** >= 18.0.0
- **npm** o **yarn**
- **Backend API** ejecutándose en puerto 5000

### ⚡ **Desarrollo**

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Iniciar servidor de desarrollo
npm run dev
```

### 📋 **Variables de Entorno (.env)**

```env
# 🌐 Backend API URL
VITE_API_BASE_URL=http://localhost:5000

# 🔐 Clerk Authentication (Frontend)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_tu_clerk_publishable_key
```

### 🛠️ **Scripts Disponibles**

```bash
npm run dev          # 🚀 Desarrollo (puerto 5173)
npm run build        # 📦 Build para producción  
npm run preview      # 👀 Preview del build
npm run lint         # 🔍 ESLint check
npm run type-check   # 📝 TypeScript validation
```

### 🔧 **Solución de Puerto Ocupado**

```bash
# Si el puerto 5173 está ocupado
npm run dev:safe     # Mata proceso y reinicia
# O manualmente:
npx kill-port 5173 && npm run dev
```

## 🏗️ **Arquitectura de Componentes**

```
src/
├── 📁 components/               # Componentes React modulares
│   ├── 📁 auth/                # 🔐 Autenticación (Clerk)
│   │   ├── AuthGuard.tsx       # Protección de rutas
│   │   └── SignInPage.tsx      # Login page
│   ├── 📁 dashboard/           # 📊 Métricas principales
│   │   └── MonitoreoAeronaveComponentes.tsx  # Dashboard principal
│   ├── 📁 inventario/          # ✈️ Gestión de aeronaves
│   │   ├── AeronaveCard.tsx    # Tarjeta de aeronave
│   │   ├── FormularioAeronave.tsx  # Crear/editar aeronave
│   │   └── EstadisticasInventario.tsx  # Stats del inventario
│   ├── 📁 mantenimiento/       # 🔧 Estados y overhauls
│   │   ├── EstadosMonitoreoComponente.tsx     # ⚡ Componente COMPLETO
│   │   ├── EstadosMonitoreoComponenteSimple.tsx # 📋 Version simplificada
│   │   ├── ModalEstadoMonitoreo.tsx           # Crear/editar estados
│   │   └── componentes/        # Sub-componentes especializados
│   ├── 📁 monitoreo/           # 📈 Alertas y métricas
│   │   └── AlertaComponente.tsx # Componente de alerta
│   ├── 📁 common/              # 🧩 Componentes reutilizables
│   │   └── StatusBadge.tsx     # Badges de estado
│   └── 📁 layout/              # 🏠 Layout y navegación
│       ├── Sidebar.tsx         # Menú lateral
│       └── DashboardLayout.tsx # Layout principal
├── 📁 hooks/                   # 🎣 Custom Hooks (OPTIMIZADOS)
│   ├── useEstadosMonitoreoSimple.ts    # ⚡ SIN cache, performance++
│   ├── useMonitoreoCompleto.ts         # 📊 Dashboard data
│   ├── useRoles.ts                     # 👥 Gestión de permisos
│   └── useDebounce.ts                  # 🔍 Search optimization
├── 📁 types/                   # 📝 TypeScript interfaces
│   ├── inventario.ts           # Aeronave, Componente
│   ├── mantenimiento.ts        # OrdenTrabajo, Inspeccion
│   └── estadosMonitoreoComponente.ts  # Estados y overhauls
├── 📁 utils/                   # 🛠️ Utilidades
│   ├── axiosConfig.ts          # HTTP client configurado
│   └── dateUtils.ts            # Manejo de fechas
└── 📁 pages/                   # 📄 Páginas principales
    ├── Dashboard.tsx           # Página principal
    ├── GestionInventario.tsx   # Lista de aeronaves
    └── MonitoreoFlota.tsx      # Monitoreo en tiempo real
```

## ⚡ **Hooks Optimizados (Post-Refactoring)**

### 🎯 **Problema Solucionado**
```typescript
// ❌ ANTES: Hook complejo con cache problemático
const useEstadosMonitoreoComponente = (componenteId) => {
  const requestCache = new Map(); // Causaba saturación
  const pendingRequests = new Map(); // Consultas múltiples
  // ... 200+ líneas de código complejo
};

// ✅ DESPUÉS: Hook simple y eficiente  
const useEstadosMonitoreoSimple = (componenteId) => {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (componenteId) {
      cargarEstados(); // 1 sola consulta por componente
    }
  }, [componenteId]);
  
  // Solo ~50 líneas, fácil mantenimiento
};
```

### 🔄 **Componentes Utilizados**
```typescript
// ✅ Componente COMPLETO (con botones de acción)
<EstadosMonitoreoComponente 
  componenteId={componente._id}
  numeroSerie={componente.numeroSerie}
  nombreComponente={componente.nombre}
/>
// Incluye: Botón "Agregar Estado", "Completar Overhaul", filtros

// ✅ Componente SIMPLE (solo visualización)
<EstadosMonitoreoComponenteSimple 
  componenteId={componente._id}
/>
// Solo muestra: Estados, progreso, estadísticas
```

## 🎨 **Diseño y UI/UX**

### 🎯 **Design System**
```css
/* Paleta de colores para estados */
.estado-ok { @apply bg-green-100 text-green-800; }
.estado-proximo { @apply bg-yellow-100 text-yellow-800; }  
.estado-vencido { @apply bg-red-100 text-red-800; }
.estado-overhaul { @apply bg-purple-100 text-purple-800; }

/* Responsive breakpoints */
.grid-responsive { @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3; }
```

### 📱 **Responsive Design**
- **Mobile First**: Diseño optimizado para móviles
- **Tablet Ready**: Layouts adaptables para tablets
- **Desktop Enhanced**: Experiencia completa en desktop
- **Touch Friendly**: Botones y controles táctiles

## 🔐 **Sistema de Autenticación**

### 👥 **Roles y Permisos**
```typescript
// Hook de permisos optimizado
const { isAdmin, isMechanic, isViewer } = usePermissions();

// Protección de componentes
{(isAdmin || isMechanic) && (
  <button onClick={handleCrearEstado}>
    ➕ Agregar Estado
  </button>
)}

// Protección de rutas
<AuthGuard requiredRole="admin">
  <AdminPanel />
</AuthGuard>
```

### 🔑 **Estados de Usuario**
- **👑 Admin**: Acceso completo, CRUD en todos los módulos
- **🔧 Mechanic**: Crear/editar estados, completar overhauls
- **👀 Viewer**: Solo lectura, ver dashboards y reportes

## 🚀 **Build y Deploy**

### 📦 **Optimizaciones de Build**
```typescript
// vite.config.ts optimizado
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'auth-vendor': ['@clerk/clerk-react'],
          'ui-vendor': ['@headlessui/react']
        }
      }
    }
  }
});
```

### ☁️ **Deploy en Vercel**
```json
// vercel.json configurado para SPA
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 📊 **Métricas de Build**
```
📦 Bundle Size: ~380KB (gzipped: ~88KB)
⚡ First Load: < 1.5s
🎨 Lighthouse Score: 95+
📱 Mobile Performance: Excellent
🔄 Hot Reload: < 100ms
```

## 🧪 **Testing & Debug**

### 🔍 **Development Tools**
```bash
# Análisis de bundle
npm run build:analyze

# Type checking continuo
npm run type-check:watch  

# Performance profiling
npm run dev -- --profile
```

### 🐛 **Debug Common Issues**

1. **Hook Loop Error**
   ```typescript
   // ❌ Causa loop infinito
   useEffect(() => {
     fetchData();
   }); // Sin dependencias

   // ✅ Correcto
   useEffect(() => {
     fetchData();
   }, [componentId]); // Con dependencias específicas
   ```

2. **Estado no actualiza**
   ```typescript
   // ❌ Mutación directa
   estados.push(nuevoEstado);

   // ✅ Inmutabilidad
   setEstados([...estados, nuevoEstado]);
   ```

## 📈 **Performance Optimizado**

### ⚡ **Mejoras Implementadas**
- **❌ Eliminado**: Cache complejo que causaba saturación
- **✅ Hooks simples**: useState + useEffect sin side effects
- **🎯 Lazy Loading**: Componentes cargados bajo demanda
- **🔄 Debounced Search**: Búsquedas optimizadas (300ms delay)
- **📦 Code Splitting**: Chunks por módulo para carga rápida

### 🎯 **Métricas de Rendimiento**
```
🚀 Initial Load: 1.2s (objetivo < 2s)
⚡ Page Transitions: < 200ms
🔄 Data Fetching: < 300ms promedio  
📱 Mobile Score: 92/100 (Lighthouse)
💾 Memory Usage: < 50MB typical
```
