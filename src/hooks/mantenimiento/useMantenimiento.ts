import { useState, useEffect, useCallback } from 'react';
import { IComponente } from '../../types/mantenimiento';
import { IAeronave } from '../../types/inventario';
import { 
  obtenerComponentes, 
  crearComponente, 
  actualizarComponente,
  actualizarComponenteHistorial,
  eliminarComponente 
} from '../../utils/mantenimientoApi';
import { obtenerAeronaves } from '../../utils/inventarioApi';

export interface UseMantenimientoReturn {
  // Estado
  componentes: IComponente[];
  aeronaves: IAeronave[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  cargarDatos: () => Promise<void>;
  crearNuevoComponente: (componente: Partial<IComponente>) => Promise<void>;
  actualizarComponenteExistente: (id: string, componente: Partial<IComponente>) => Promise<void>;
  actualizarComponenteDesdeHistorial: (id: string, data: any) => Promise<void>;
  eliminarComponenteExistente: (componente: IComponente) => Promise<void>;
  
  // Utilidades
  obtenerAeronaveNombre: (aeronaveId: string) => string;
  validarComponente: (componente: Partial<IComponente>) => string | null;
}

export const useMantenimiento = (): UseMantenimientoReturn => {
  const [componentes, setComponentes] = useState<IComponente[]>([]);
  const [aeronaves, setAeronaves] = useState<IAeronave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [componentesResponse, aeronavesResponse] = await Promise.all([
        obtenerComponentes(),
        obtenerAeronaves()
      ]);

      // Extraer los datos de ambas respuestas
      const componentesData = componentesResponse?.data || [];
      const aeronavesData = aeronavesResponse?.data || [];

      setComponentes(Array.isArray(componentesData) ? componentesData : []);
      setAeronaves(Array.isArray(aeronavesData) ? aeronavesData : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(errorMessage);
      console.error('Error al cargar datos:', err);
      setComponentes([]);
      setAeronaves([]);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Array vacío - función estable

  const crearNuevoComponente = useCallback(async (componenteData: Partial<IComponente>) => {
    try {
      setError(null);
      // Convertir aeronaveActual si es necesario
      const dataToSend: any = { ...componenteData };
      if (dataToSend.aeronaveActual && typeof dataToSend.aeronaveActual === 'object') {
        dataToSend.aeronaveActual = (dataToSend.aeronaveActual as IAeronave)._id;
      }
      await crearComponente(dataToSend);
      await cargarDatos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear componente';
      setError(errorMessage);
      throw err;
    }
  }, [cargarDatos]);

  const actualizarComponenteExistente = useCallback(async (id: string, componenteData: Partial<IComponente>) => {
    try {
      setError(null);
      // Convertir aeronaveActual si es necesario
      const dataToSend = { ...componenteData };
      if (dataToSend.aeronaveActual && typeof dataToSend.aeronaveActual === 'object') {
        dataToSend.aeronaveActual = (dataToSend.aeronaveActual as IAeronave)._id;
      }
      await actualizarComponente(id, dataToSend as any);
      await cargarDatos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar componente';
      setError(errorMessage);
      throw err;
    }
  }, [cargarDatos]);

  const actualizarComponenteDesdeHistorial = useCallback(async (id: string, data: any) => {
    try {
      setError(null);
      await actualizarComponenteHistorial(id, data);
      await cargarDatos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar componente desde historial';
      setError(errorMessage);
      throw err;
    }
  }, [cargarDatos]);

  const eliminarComponenteExistente = useCallback(async (componente: IComponente) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el componente "${componente.nombre}"?`)) {
      return;
    }

    try {
      setError(null);
      await eliminarComponente(componente._id!);
      await cargarDatos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar componente';
      setError(errorMessage);
      throw err;
    }
  }, [cargarDatos]);

  const obtenerAeronaveNombre = useCallback((aeronaveId: string): string => {
    if (!aeronaveId) return 'N/A';
    const aeronave = aeronaves.find(a => a._id === aeronaveId);
    return aeronave ? `${aeronave.matricula} - ${aeronave.modelo}` : 'N/A';
  }, [aeronaves]);

  const validarComponente = useCallback((componente: Partial<IComponente>): string | null => {
    if (!componente.nombre?.trim()) {
      return 'El nombre del componente es requerido';
    }
    if (!componente.numeroSerie?.trim()) {
      return 'El número de serie es requerido';
    }
    if (!componente.categoria) {
      return 'La categoría es requerida';
    }
    if (!componente.ubicacionFisica?.trim()) {
      return 'La ubicación física (aeronave) es requerida';
    }
    return null;
  }, []);

  useEffect(() => {
    cargarDatos();
  }, []); // ✅ Solo ejecutar una vez al montar

  return {
    // Estado
    componentes,
    aeronaves,
    loading,
    error,
    
    // Acciones
    cargarDatos,
    crearNuevoComponente,
    actualizarComponenteExistente,
    actualizarComponenteDesdeHistorial,
    eliminarComponenteExistente,
    
    // Utilidades
    obtenerAeronaveNombre,
    validarComponente
  };
};