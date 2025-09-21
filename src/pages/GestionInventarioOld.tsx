import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ComponentesAeronave from '../components/mantenimiento/ComponentesAeronave';
import { IAeronave, IEstadisticasInventario, ICrearAeronaveData } from '../types/inventario';
import { 
  obtenerAeronaves, 
  obtenerEstadisticasInventario, 
  crearAeronave, 
  actualizarAeronave, 
  eliminarAeronave 
} from '../utils/inventarioApi';

const GestionInventario: React.FC = () => {
  const [aeronaves, setAeronaves] = useState<IAeronave[]>([]);
  const [estadisticas, setEstadisticas] = useState<IEstadisticasInventario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [aeronaveEditando, setAeronaveEditando] = useState<IAeronave | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [vistaEnTarjetas, setVistaEnTarjetas] = useState(true);

  // Estados para la vista de componentes
  const [vistaComponentes, setVistaComponentes] = useState(false);
  const [aeronaveSeleccionada, setAeronaveSeleccionada] = useState<IAeronave | null>(null);

  // Estados del formulario
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

  // Función para cargar datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar aeronaves y estadísticas en paralelo
      const [responseAeronaves, responseEstadisticas] = await Promise.all([
        obtenerAeronaves(),
        obtenerEstadisticasInventario()
      ]);

      if (responseAeronaves.success) {
        setAeronaves(responseAeronaves.data);
      }

      if (responseEstadisticas.success) {
        setEstadisticas(responseEstadisticas.data);
      }

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos de inventario');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para formatear fecha
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener color del estado
  const obtenerColorEstado = (estado: string) => {
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

  // Función para manejar cambios en el formulario
  const manejarCambioFormulario = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: name === 'anoFabricacion' || name === 'horasVuelo' ? Number(value) : value
    }));
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
          cargarDatos();
        }
      } else {
        // Crear nueva aeronave
        const response = await crearAeronave(formulario);
        if (response.success) {
          alert('Aeronave creada exitosamente');
          setMostrarFormulario(false);
          resetearFormulario();
          cargarDatos();
        }
      }
    } catch (err: any) {
      console.error('Error al guardar aeronave:', err);
      alert(err.response?.data?.message || 'Error al guardar la aeronave');
    } finally {
      setLoading(false);
    }
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

  // Función para eliminar aeronave
  const manejarEliminarAeronave = async (aeronave: IAeronave) => {
    if (window.confirm(`¿Está seguro de eliminar la aeronave ${aeronave.matricula}?`)) {
      try {
        setLoading(true);
        const response = await eliminarAeronave(aeronave._id);
        if (response.success) {
          alert('Aeronave eliminada exitosamente');
          cargarDatos();
        }
      } catch (err: any) {
        console.error('Error al eliminar aeronave:', err);
        alert(err.response?.data?.message || 'Error al eliminar la aeronave');
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para ver componentes de aeronave
  const verComponentesAeronave = (aeronave: IAeronave) => {
    setAeronaveSeleccionada(aeronave);
    setVistaComponentes(true);
  };

  // Filtrar aeronaves por búsqueda
  const aeronavesFiltradas = aeronaves.filter(aeronave =>
    aeronave.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
    aeronave.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
    aeronave.fabricante.toLowerCase().includes(busqueda.toLowerCase()) ||
    aeronave.ubicacionActual.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading && aeronaves.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
            <p className="text-gray-600">Administra el inventario de aeronaves</p>
          </div>
          <button
            onClick={() => {
              setMostrarFormulario(true);
              setAeronaveEditando(null);
              resetearFormulario();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nueva Aeronave
          </button>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Aeronaves</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.totalAeronaves}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Operativas</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.operativas}</p>
                  <p className="text-sm text-green-600">{estadisticas.porcentajeOperativas}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Mantenimiento</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.enMantenimiento}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Helicópteros / Aviones</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.helicopteros} / {estadisticas.aviones}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal - Vista condicional */}
        {vistaComponentes && aeronaveSeleccionada ? (
          /* Vista de componentes */
          <div className="space-y-6">
            {/* Header de componentes con botón regresar */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setVistaComponentes(false);
                      setAeronaveSeleccionada(null);
                    }}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a Aeronaves
                  </button>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Componentes de {aeronaveSeleccionada.matricula}
                    </h2>
                    <p className="text-gray-600">
                      {aeronaveSeleccionada.fabricante} {aeronaveSeleccionada.modelo} • {aeronaveSeleccionada.tipo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(aeronaveSeleccionada.estado)}`}>
                    {aeronaveSeleccionada.estado}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Componente de gestión de componentes */}
            <ComponentesAeronave
              aeronave={aeronaveSeleccionada}
              isOpen={true}
              onClose={() => {
                setVistaComponentes(false);
                setAeronaveSeleccionada(null);
              }}
            />
          </div>
        ) : (
          /* Vista de aeronaves */
          <>
            {/* Barra de búsqueda y controles */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="max-w-md flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por matrícula, modelo, fabricante o ubicación..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {/* Toggle de vista */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Vista:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setVistaEnTarjetas(true)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        vistaEnTarjetas
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Tarjetas
                    </button>
                    <button
                      onClick={() => setVistaEnTarjetas(false)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        !vistaEnTarjetas
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Tabla
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={cargarDatos}
                  className="mt-2 text-red-600 hover:text-red-800 font-medium"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Lista de aeronaves */}
            {aeronavesFiltradas.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">
                  {busqueda ? 'No se encontraron aeronaves que coincidan con la búsqueda' : 'No hay aeronaves registradas'}
                </p>
                {!busqueda && (
                  <p className="text-gray-400 mt-2">Agrega tu primera aeronave para comenzar</p>
                )}
              </div>
            ) : (
              <>
                {/* Header de lista */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Lista de Aeronaves ({aeronavesFiltradas.length})
                  </h2>
                </div>

                {vistaEnTarjetas ? (
                  /* Vista de tarjetas */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {aeronavesFiltradas.map((aeronave) => (
                      <div
                        key={aeronave._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden group"
                      >
                        {/* Header de la tarjeta */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{aeronave.matricula}</h3>
                              <p className="text-sm text-gray-600">{aeronave.fabricante}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {aeronave.tipo === 'Helicóptero' ? (
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contenido principal */}
                        <div className="p-6 space-y-4">
                          {/* Modelo y año */}
                          <div>
                            <div className="text-lg font-semibold text-gray-900">{aeronave.modelo}</div>
                            <div className="text-sm text-gray-500">Año {aeronave.anoFabricacion} • {aeronave.tipo}</div>
                          </div>

                          {/* Estado */}
                          <div className="flex items-center justify-center">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(aeronave.estado)}`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                aeronave.estado === 'Operativo' ? 'bg-green-400' :
                                aeronave.estado === 'En Mantenimiento' ? 'bg-yellow-400' :
                                'bg-red-400'
                              }`}></div>
                              {aeronave.estado}
                            </span>
                          </div>

                          {/* Información adicional */}
                          <div className="space-y-3">
                            {/* Ubicación */}
                            <div className="flex items-center text-sm">
                              <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-gray-600 truncate">{aeronave.ubicacionActual}</span>
                            </div>

                            {/* Horas de vuelo */}
                            <div className="flex items-center text-sm">
                              <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-600">{aeronave.horasVuelo.toLocaleString()} horas de vuelo</span>
                            </div>

                            {/* Observaciones (si existen) */}
                            {aeronave.observaciones && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 line-clamp-2">{aeronave.observaciones}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer con acciones */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => verComponentesAeronave(aeronave)}
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                              </svg>
                              <span>Ver Componentes</span>
                            </button>
                            <button
                              onClick={() => editarAeronave(aeronave)}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => manejarEliminarAeronave(aeronave)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                              title="Eliminar aeronave"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Vista de tabla */
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Matrícula
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Modelo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ubicación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Horas de Vuelo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {aeronavesFiltradas.map((aeronave) => (
                            <tr key={aeronave._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{aeronave.matricula}</div>
                                <div className="text-sm text-gray-500">{aeronave.fabricante}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{aeronave.tipo}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{aeronave.modelo}</div>
                                <div className="text-sm text-gray-500">Año {aeronave.anoFabricacion}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(aeronave.estado)}`}>
                                  {aeronave.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {aeronave.ubicacionActual}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {aeronave.horasVuelo.toLocaleString()} h
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => verComponentesAeronave(aeronave)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Componentes
                                </button>
                                <button
                                  onClick={() => editarAeronave(aeronave)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => manejarEliminarAeronave(aeronave)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden group"
                  >
                    {/* Header de la tarjeta */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{aeronave.matricula}</h3>
                          <p className="text-sm text-gray-600">{aeronave.fabricante}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {aeronave.tipo === 'Helicóptero' ? (
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="p-6 space-y-4">
                      {/* Modelo y año */}
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{aeronave.modelo}</div>
                        <div className="text-sm text-gray-500">Año {aeronave.anoFabricacion} • {aeronave.tipo}</div>
                      </div>

                      {/* Estado */}
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(aeronave.estado)}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            aeronave.estado === 'Operativo' ? 'bg-green-400' :
                            aeronave.estado === 'En Mantenimiento' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}></div>
                          {aeronave.estado}
                        </span>
                      </div>

                      {/* Información adicional */}
                      <div className="space-y-3">
                        {/* Ubicación */}
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-600 truncate">{aeronave.ubicacionActual}</span>
                        </div>

                        {/* Horas de vuelo */}
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600">{aeronave.horasVuelo.toLocaleString()} horas de vuelo</span>
                        </div>

                        {/* Observaciones (si existen) */}
                        {aeronave.observaciones && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 line-clamp-2">{aeronave.observaciones}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer con acciones */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => verComponentesAeronave(aeronave)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                          <span>Ver Componentes</span>
                        </button>
                        <button
                          onClick={() => editarAeronave(aeronave)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => manejarEliminarAeronave(aeronave)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                          title="Eliminar aeronave"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Vista de tabla */
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Matrícula
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Modelo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ubicación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Horas de Vuelo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {aeronavesFiltradas.map((aeronave) => (
                        <tr key={aeronave._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{aeronave.matricula}</div>
                            <div className="text-sm text-gray-500">{aeronave.fabricante}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{aeronave.tipo}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{aeronave.modelo}</div>
                            <div className="text-sm text-gray-500">Año {aeronave.anoFabricacion}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(aeronave.estado)}`}>
                              {aeronave.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {aeronave.ubicacionActual}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {aeronave.horasVuelo.toLocaleString()} h
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => verComponentesAeronave(aeronave)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Componentes
                            </button>
                            <button
                              onClick={() => editarAeronave(aeronave)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => manejarEliminarAeronave(aeronave)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Formulario Modal */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {aeronaveEditando ? 'Editar Aeronave' : 'Nueva Aeronave'}
                </h3>
              </div>

              <form onSubmit={manejarEnvioFormulario} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matrícula *
                    </label>
                    <input
                      type="text"
                      name="matricula"
                      value={formulario.matricula}
                      onChange={manejarCambioFormulario}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ej: LV-ABC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      name="tipo"
                      value={formulario.tipo}
                      onChange={manejarCambioFormulario}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Helicóptero">Helicóptero</option>
                      <option value="Avión">Avión</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo *
                    </label>
                    <input
                      type="text"
                      name="modelo"
                      value={formulario.modelo}
                      onChange={manejarCambioFormulario}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ej: Bell 206"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fabricante *
                    </label>
                    <input
                      type="text"
                      name="fabricante"
                      value={formulario.fabricante}
                      onChange={manejarCambioFormulario}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ej: Bell Helicopter"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año de Fabricación *
                    </label>
                    <input
                      type="number"
                      name="anoFabricacion"
                      value={formulario.anoFabricacion}
                      onChange={manejarCambioFormulario}
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={formulario.estado}
                      onChange={manejarCambioFormulario}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Operativo">Operativo</option>
                      <option value="En Mantenimiento">En Mantenimiento</option>
                      <option value="Fuera de Servicio">Fuera de Servicio</option>
                      <option value="En Reparación">En Reparación</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación Actual *
                    </label>
                    <input
                      type="text"
                      name="ubicacionActual"
                      value={formulario.ubicacionActual}
                      onChange={manejarCambioFormulario}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ej: Hangar A - Base Principal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horas de Vuelo
                    </label>
                    <input
                      type="number"
                      name="horasVuelo"
                      value={formulario.horasVuelo}
                      onChange={manejarCambioFormulario}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    value={formulario.observaciones}
                    onChange={manejarCambioFormulario}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false);
                      setAeronaveEditando(null);
                      resetearFormulario();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : (aeronaveEditando ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vista de componentes */}
        {vistaComponentes && aeronaveSeleccionada && (
          <ComponentesAeronave
            aeronave={aeronaveSeleccionada}
            isOpen={vistaComponentes}
            onClose={() => {
              setVistaComponentes(false);
              setAeronaveSeleccionada(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default GestionInventario;