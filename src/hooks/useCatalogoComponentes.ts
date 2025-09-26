import { useState, useEffect, useMemo } from 'react';
import { ICatalogoComponente, EstadoCatalogo } from '../types/herramientas';
import { useApiWithAuth } from '../utils/useApiWithAuth';

export interface CatalogoOption {
  value: string;
  label: string;
}

export function useCatalogoComponentes() {
  const [catalogoComponentes, setCatalogoComponentes] = useState<ICatalogoComponente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { get } = useApiWithAuth();

  const fetchCatalogo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await get('/herramientas/catalogos/componentes');
      
      // La API devuelve: { success: true, data: { elementos: [...], paginacion: {...} } }
      const elementos = response.data?.elementos || response.elementos || response || [];
      
      setCatalogoComponentes(Array.isArray(elementos) ? elementos : []);
    } catch (err) {
      console.error('Error al cargar catálogo de componentes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCatalogoComponentes([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogo();
  }, []);

  // Convertir catálogo a opciones para select, solo elementos activos
  const categoriaOptions: CatalogoOption[] = useMemo(() => {
    return Array.isArray(catalogoComponentes)
      ? catalogoComponentes
          .filter(item => item.estado === EstadoCatalogo.ACTIVO)
          .map(item => ({
            value: item.codigo,
            label: item.descripcion
          }))
      : [];
  }, [catalogoComponentes]);

  return {
    catalogoComponentes,
    categoriaOptions,
    loading,
    error,
    refetch: fetchCatalogo
  };
}