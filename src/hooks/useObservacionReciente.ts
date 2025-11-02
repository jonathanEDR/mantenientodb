import { useState, useEffect } from 'react';
import { historialAeronaveService, IObservacionAeronaveHistorial } from '../services/historialAeronaveService';

export interface IObservacionReciente {
  observacion: IObservacionAeronaveHistorial | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para obtener la observación más reciente de una aeronave
 * desde su historial de observaciones
 */
export const useObservacionReciente = (aeronaveId: string): IObservacionReciente => {
  const [observacion, setObservacion] = useState<IObservacionAeronaveHistorial | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!aeronaveId) {
      setObservacion(null);
      return;
    }

    // Debounce para evitar múltiples llamadas simultáneas
    const timeoutId = setTimeout(() => {
      const obtenerObservacionReciente = async () => {
        try {
          setLoading(true);
          setError(null);

          // Obtener solo las observaciones (no cambios de estado ni actualizaciones de horas)
          // y limitar a 1 registro para obtener la más reciente
          const response = await historialAeronaveService.obtenerHistorialObservaciones(
            aeronaveId,
            {
              limite: 1,
              tipo: 'observacion'
            }
          );

          if (response.data.historial && response.data.historial.length > 0) {
            setObservacion(response.data.historial[0]);
          } else {
            setObservacion(null);
          }

        } catch (err) {
          console.error('Error al obtener observación reciente:', err);
          setError('Error al cargar la observación más reciente');
          setObservacion(null);
        } finally {
          setLoading(false);
        }
      };

      obtenerObservacionReciente();
    }, 100); // 100ms de debounce

    return () => clearTimeout(timeoutId);
  }, [aeronaveId]);

  return { observacion, loading, error };
};

/**
 * Hook optimizado para múltiples aeronaves
 * Carga las observaciones recientes para varias aeronaves en una sola consulta batch
 */
export const useObservacionesRecientes = (aeronaveIds: string[]) => {
  const [observaciones, setObservaciones] = useState<{[key: string]: IObservacionAeronaveHistorial | null}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!aeronaveIds.length) {
      setObservaciones({});
      return;
    }

    // Debounce para evitar múltiples llamadas rápidas
    const timeoutId = setTimeout(() => {
      const obtenerObservacionesRecientes = async () => {
        try {
          setLoading(true);
          setError(null);

          // Usar el nuevo endpoint batch optimizado
          const response = await historialAeronaveService.obtenerObservacionesRecientesBatch(aeronaveIds);
          setObservaciones(response.data);

        } catch (err) {
          console.error('Error al obtener observaciones recientes en batch:', err);
          setError('Error al cargar las observaciones recientes');
          
          // Fallback: inicializar con valores nulos
          const fallbackObservaciones: {[key: string]: IObservacionAeronaveHistorial | null} = {};
          aeronaveIds.forEach(id => {
            fallbackObservaciones[id] = null;
          });
          setObservaciones(fallbackObservaciones);
        } finally {
          setLoading(false);
        }
      };

      obtenerObservacionesRecientes();
    }, 100); // 100ms de debounce

    return () => clearTimeout(timeoutId);
  }, [aeronaveIds.join(',')]);

  return { observaciones, loading, error };
};