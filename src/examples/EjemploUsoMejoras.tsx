/**
 * EJEMPLO DE USO DE LAS MEJORAS IMPLEMENTADAS
 *
 * Este archivo muestra cómo utilizar todas las nuevas funcionalidades
 * implementadas en el sistema.
 */

import React, { useState } from 'react';
import {
  useAeronaves,
  useCrearAeronave,
  useActualizarAeronave,
  useEliminarAeronave,
  useEstadisticasInventario
} from '../hooks/inventario/useInventarioQuery';
import { notifications, withNotifications } from '../utils/notifications';
import {
  crearAeronaveSchema,
  safeValidateInventarioData
} from '../schemas/inventario.schema';
import LoadingSpinner, {
  SkeletonTable,
  SkeletonStats
} from '../components/common/LoadingSpinner';

/**
 * EJEMPLO 1: Uso de React Query para obtener datos
 */
export const EjemploListaAeronaves: React.FC = () => {
  const [page, setPage] = useState(1);

  // Hook de React Query - maneja loading, error, cache automáticamente
  const { data, isLoading, isError, error, refetch } = useAeronaves({
    page,
    limit: 20,
  });

  if (isLoading) {
    return <SkeletonTable rows={10} columns={5} />;
  }

  if (isError) {
    return (
      <div className="bg-red-50 p-4 rounded">
        <p className="text-red-600">Error: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Aeronaves (con cache automático)</h2>
      <ul>
        {data?.data.map((aeronave: any) => (
          <li key={aeronave._id}>{aeronave.matricula} - {aeronave.modelo}</li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={!data?.pagination.hasPrev}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {page} de {data?.pagination.pages}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.pagination.hasNext}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

/**
 * EJEMPLO 2: Uso de Mutations con notificaciones automáticas
 */
export const EjemploCrearAeronave: React.FC = () => {
  const [formData, setFormData] = useState({
    matricula: '',
    tipo: 'Helicóptero' as const,
    modelo: '',
    fabricante: '',
    anoFabricacion: new Date().getFullYear(),
    ubicacionActual: '',
    horasVuelo: 0,
  });

  // Mutation con React Query - invalida cache automáticamente
  const { mutateAsync: crear, isPending } = useCrearAeronave();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar con Zod
    const result = safeValidateInventarioData.crearAeronave(formData);

    if (!result.success) {
      // Mostrar errores de validación
      result.error.errors.forEach(err => {
        notifications.error(`${err.path.join('.')}: ${err.message}`);
      });
      return;
    }

    try {
      // Crear aeronave - automáticamente:
      // 1. Muestra notificación de éxito
      // 2. Invalida cache de listas
      // 3. Re-fetch de datos relacionados
      await crear(result.data);

      // Limpiar formulario
      setFormData({
        matricula: '',
        tipo: 'Helicóptero',
        modelo: '',
        fabricante: '',
        anoFabricacion: new Date().getFullYear(),
        ubicacionActual: '',
        horasVuelo: 0,
      });
    } catch (error) {
      // Los errores ya se manejan automáticamente
      console.error('Error al crear aeronave:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2>Crear Aeronave (con validación Zod)</h2>

      <div>
        <label>Matrícula:</label>
        <input
          type="text"
          value={formData.matricula}
          onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label>Tipo:</label>
        <select
          value={formData.tipo}
          onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="Helicóptero">Helicóptero</option>
          <option value="Avión">Avión</option>
        </select>
      </div>

      <div>
        <label>Modelo:</label>
        <input
          type="text"
          value={formData.modelo}
          onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label>Fabricante:</label>
        <input
          type="text"
          value={formData.fabricante}
          onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isPending ? <LoadingSpinner size="sm" /> : 'Crear Aeronave'}
      </button>
    </form>
  );
};

/**
 * EJEMPLO 3: Uso de notificaciones manuales
 */
export const EjemploNotificaciones: React.FC = () => {
  const handleSuccess = () => {
    notifications.success('¡Operación exitosa!');
  };

  const handleError = () => {
    notifications.error('Ocurrió un error');
  };

  const handleWarning = () => {
    notifications.warning('Advertencia importante');
  };

  const handleInfo = () => {
    notifications.info('Información relevante');
  };

  const handlePromise = async () => {
    const myPromise = new Promise((resolve) => {
      setTimeout(() => resolve('Datos cargados'), 2000);
    });

    await notifications.promise(myPromise, {
      loading: 'Cargando datos...',
      success: 'Datos cargados exitosamente',
      error: 'Error al cargar datos',
    });
  };

  return (
    <div className="space-y-2">
      <h2>Ejemplos de Notificaciones</h2>
      <button onClick={handleSuccess} className="px-4 py-2 bg-green-600 text-white rounded">
        Success Toast
      </button>
      <button onClick={handleError} className="px-4 py-2 bg-red-600 text-white rounded">
        Error Toast
      </button>
      <button onClick={handleWarning} className="px-4 py-2 bg-yellow-600 text-white rounded">
        Warning Toast
      </button>
      <button onClick={handleInfo} className="px-4 py-2 bg-blue-600 text-white rounded">
        Info Toast
      </button>
      <button onClick={handlePromise} className="px-4 py-2 bg-purple-600 text-white rounded">
        Promise Toast
      </button>
    </div>
  );
};

/**
 * EJEMPLO 4: Uso de Skeleton Loaders
 */
export const EjemploSkeletonLoaders: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(true);

  return (
    <div className="space-y-4">
      <h2>Ejemplos de Skeleton Loaders</h2>

      <button
        onClick={() => setShowSkeleton(!showSkeleton)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {showSkeleton ? 'Mostrar Contenido' : 'Mostrar Skeleton'}
      </button>

      {showSkeleton ? (
        <>
          <h3>Skeleton Stats:</h3>
          <SkeletonStats count={4} />

          <h3>Skeleton Table:</h3>
          <SkeletonTable rows={5} columns={4} />
        </>
      ) : (
        <div>
          <h3>Contenido Real</h3>
          <p>Aquí iría el contenido real de la aplicación</p>
        </div>
      )}
    </div>
  );
};

/**
 * EJEMPLO 5: Uso de withNotifications wrapper
 */
export const EjemploWithNotifications: React.FC = () => {
  const handleOperacion = async () => {
    await withNotifications(
      async () => {
        // Simular operación async
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return { success: true };
      },
      {
        loading: 'Procesando operación...',
        success: 'Operación completada exitosamente',
        error: (error) => `Error: ${error.message}`,
      }
    );
  };

  return (
    <div>
      <h2>Wrapper withNotifications</h2>
      <button
        onClick={handleOperacion}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Ejecutar Operación
      </button>
    </div>
  );
};

/**
 * EJEMPLO 6: Estadísticas con cache automático
 */
export const EjemploEstadisticas: React.FC = () => {
  // Cache de 5 minutos automático
  const { data, isLoading } = useEstadisticasInventario();

  if (isLoading) {
    return <SkeletonStats count={4} />;
  }

  const stats = data?.data;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded shadow">
        <h3>Total Aeronaves</h3>
        <p className="text-3xl font-bold">{stats?.totalAeronaves || 0}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3>Operativas</h3>
        <p className="text-3xl font-bold text-green-600">{stats?.operativas || 0}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3>En Mantenimiento</h3>
        <p className="text-3xl font-bold text-yellow-600">{stats?.enMantenimiento || 0}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3>Fuera de Servicio</h3>
        <p className="text-3xl font-bold text-red-600">{stats?.fueraServicio || 0}</p>
      </div>
    </div>
  );
};

// Exportar todos los ejemplos
export default {
  EjemploListaAeronaves,
  EjemploCrearAeronave,
  EjemploNotificaciones,
  EjemploSkeletonLoaders,
  EjemploWithNotifications,
  EjemploEstadisticas,
};
