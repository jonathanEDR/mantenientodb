import { useState, useEffect, useRef } from 'react';
import {
  IAeronave,
  IEstadisticasInventario,
  ICrearAeronaveData,
  IAeronavesResponse,
  IEstadisticasInventarioResponse
} from '../../types/inventario';
import {
  obtenerAeronaves,
  obtenerEstadisticasInventario,
  crearAeronave,
  actualizarAeronave,
  eliminarAeronave
} from '../../utils/inventarioApi';

// Cache global simple para evitar múltiples fetches
let inventarioCacheData: { aeronaves: IAeronave[]; estadisticas: IEstadisticasInventario | null } | null = null;
let inventarioCacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 segundos

export const useInventario = () => {
  const [aeronaves, setAeronaves] = useState<IAeronave[]>([]);
  const [estadisticas, setEstadisticas] = useState<IEstadisticasInventario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Función para cargar datos
  const cargarDatos = async () => {
    try {
      // Verificar cache
      const now = Date.now();
      if (inventarioCacheData && (now - inventarioCacheTimestamp) < CACHE_TTL) {
        console.log('📦 [useInventario] Usando datos del caché');
        setAeronaves(inventarioCacheData.aeronaves);
        setEstadisticas(inventarioCacheData.estadisticas);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Cargar aeronaves y estadísticas en paralelo
      const [responseAeronaves, responseEstadisticas] = await Promise.all([
        obtenerAeronaves(),
        obtenerEstadisticasInventario()
      ]);

      if (!isMountedRef.current) return; // Evitar actualizar si se desmontó

      if (responseAeronaves.success) {
        setAeronaves(responseAeronaves.data);
      }

      if (responseEstadisticas.success) {
        setEstadisticas(responseEstadisticas.data);
      }

      // Actualizar caché
      inventarioCacheData = {
        aeronaves: responseAeronaves.data,
        estadisticas: responseEstadisticas.data
      };
      inventarioCacheTimestamp = Date.now();
      console.log('💾 [useInventario] Datos guardados en caché');

    } catch (err) {
      console.error('Error al cargar datos:', err);
      if (isMountedRef.current) {
        setError('Error al cargar los datos de inventario');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Cargar datos al montar el hook
  useEffect(() => {
    isMountedRef.current = true;
    cargarDatos();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    aeronaves,
    estadisticas,
    loading,
    error,
    cargarDatos,
    setAeronaves,
    setEstadisticas,
    setLoading,
    setError
  };
};

export const useFormularioAeronave = (onSuccess: () => void) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [aeronaveEditando, setAeronaveEditando] = useState<IAeronave | null>(null);
  const [loading, setLoading] = useState(false);

  const [formulario, setFormulario] = useState<ICrearAeronaveData>({
    matricula: '',
    tipo: 'Helicóptero',
    modelo: '',
    fabricante: '',
    anoFabricacion: new Date().getFullYear(),
    estado: 'Operativo',
    ubicacionActual: '',
    horasVuelo: 0,
    observaciones: ''
  });

  // Función para manejar cambios en el formulario
  const manejarCambioFormulario = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormulario((prev: ICrearAeronaveData) => ({
      ...prev,
      [name]: name === 'anoFabricacion' || name === 'horasVuelo' ? Number(value) : value
    }));
  };

  // Función para resetear formulario
  const resetearFormulario = () => {
    setFormulario({
      matricula: '',
      tipo: 'Helicóptero',
      modelo: '',
      fabricante: '',
      anoFabricacion: new Date().getFullYear(),
      estado: 'Operativo',
      ubicacionActual: '',
      horasVuelo: 0,
      observaciones: ''
    });
  };

  // Función para editar aeronave
  const editarAeronave = (aeronave: IAeronave) => {
    setAeronaveEditando(aeronave);
    setFormulario({
      matricula: aeronave.matricula,
      tipo: aeronave.tipo,
      modelo: aeronave.modelo,
      fabricante: aeronave.fabricante,
      anoFabricacion: aeronave.anoFabricacion,
      estado: aeronave.estado,
      ubicacionActual: aeronave.ubicacionActual,
      horasVuelo: aeronave.horasVuelo,
      observaciones: aeronave.observaciones || ''
    });
    setMostrarFormulario(true);
  };

  // Función para enviar formulario
  const manejarEnvioFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (aeronaveEditando) {
        // Actualizar aeronave existente
        const response = await actualizarAeronave(aeronaveEditando._id, formulario);
        if (response.success) {
          alert('Aeronave actualizada exitosamente');
          setMostrarFormulario(false);
          setAeronaveEditando(null);
          resetearFormulario();
          // Invalidar caché
          inventarioCacheTimestamp = 0;
          onSuccess();
        }
      } else {
        // Crear nueva aeronave
        const response = await crearAeronave(formulario);
        if (response.success) {
          alert('Aeronave creada exitosamente');
          setMostrarFormulario(false);
          resetearFormulario();
          // Invalidar caché
          inventarioCacheTimestamp = 0;
          onSuccess();
        }
      }
    } catch (err: any) {
      console.error('Error al guardar aeronave:', err);
      alert(err.response?.data?.message || 'Error al guardar la aeronave');
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir formulario de nueva aeronave
  const nuevaAeronave = () => {
    setMostrarFormulario(true);
    setAeronaveEditando(null);
    resetearFormulario();
  };

  // Función para cerrar formulario
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setAeronaveEditando(null);
    resetearFormulario();
  };

  return {
    mostrarFormulario,
    aeronaveEditando,
    formulario,
    loading,
    manejarCambioFormulario,
    manejarEnvioFormulario,
    editarAeronave,
    nuevaAeronave,
    cerrarFormulario,
    resetearFormulario
  };
};

export const useVistaInventario = () => {
  const [vistaComponentes, setVistaComponentes] = useState(false);
  const [aeronaveSeleccionada, setAeronaveSeleccionada] = useState<IAeronave | null>(null);
  const [vistaEnTarjetas, setVistaEnTarjetas] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Función para ver componentes de aeronave
  const verComponentesAeronave = (aeronave: IAeronave) => {
    setAeronaveSeleccionada(aeronave);
    setVistaComponentes(true);
  };

  // Función para volver a vista de aeronaves
  const volverAeronaves = () => {
    setVistaComponentes(false);
    setAeronaveSeleccionada(null);
  };

  return {
    vistaComponentes,
    aeronaveSeleccionada,
    vistaEnTarjetas,
    busqueda,
    setVistaEnTarjetas,
    setBusqueda,
    verComponentesAeronave,
    volverAeronaves
  };
};

// Función utilitaria para obtener color del estado
export const obtenerColorEstado = (estado: string) => {
  switch (estado) {
    case 'Operativo':
      return 'bg-green-100 text-green-800';
    case 'En Mantenimiento':
      return 'bg-yellow-100 text-yellow-800';
    case 'Fuera de Servicio':
      return 'bg-red-100 text-red-800';
    case 'En Reparación':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Función utilitaria para formatear fecha
export const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};