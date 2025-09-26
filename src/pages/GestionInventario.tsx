import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ComponentesAeronave from '../components/mantenimiento/ComponentesAeronave';
import AeronaveList from '../components/inventario/AeronaveList';
import FormularioAeronave from '../components/inventario/FormularioAeronave';
import GestionHorasAeronave from '../components/inventario/GestionHorasAeronave';
import EstadisticasInventario from '../components/inventario/EstadisticasInventario';
import { 
  useInventario, 
  useFormularioAeronave, 
  useVistaInventario,
  obtenerColorEstado 
} from '../hooks/inventario';
import { eliminarAeronave } from '../utils/inventarioApi';
import { IAeronave } from '../types/inventario';

const GestionInventario: React.FC = () => {
  // Hooks personalizados
  const navigate = useNavigate();
  const { aeronaves, estadisticas, loading, error, cargarDatos } = useInventario();
  const vista = useVistaInventario();
  const formulario = useFormularioAeronave(cargarDatos);

  // Función para manejar búsqueda
  const [busqueda, setBusqueda] = React.useState('');

  // Estado para gestión de horas
  const [mostrarGestionHoras, setMostrarGestionHoras] = React.useState(false);
  const [aeronaveGestionHoras, setAeronaveGestionHoras] = React.useState<IAeronave | null>(null);

  // Función para abrir gestión de horas
  const manejarGestionHoras = (aeronave: IAeronave) => {
    setAeronaveGestionHoras(aeronave);
    setMostrarGestionHoras(true);
  };

  // Función para cerrar gestión de horas
  const cerrarGestionHoras = () => {
    setMostrarGestionHoras(false);
    setAeronaveGestionHoras(null);
  };

  // Función para manejar actualización de aeronave después de gestión de horas
  const manejarAeronaveActualizada = (aeronaveActualizada: IAeronave) => {
    // Actualizar en la lista local
    cargarDatos();
    // Cerrar modal después de una breve pausa para mostrar resultado
    setTimeout(() => {
      cerrarGestionHoras();
    }, 2000);
  };

  // Función para eliminar aeronave
  const manejarEliminarAeronave = async (aeronave: any) => {
    if (window.confirm(`¿Está seguro de eliminar la aeronave ${aeronave.matricula}?`)) {
      try {
        const response = await eliminarAeronave(aeronave._id);
        if (response.success) {
          alert('Aeronave eliminada exitosamente');
          cargarDatos();
        }
      } catch (err: any) {
        console.error('Error al eliminar aeronave:', err);
        alert(err.response?.data?.message || 'Error al eliminar la aeronave');
      }
    }
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
        {/* Vista condicional */}
        {vista.vistaComponentes && vista.aeronaveSeleccionada ? (
          /* Vista de componentes */
          <div className="space-y-6">
            {/* Header de componentes con botón regresar */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={vista.volverAeronaves}
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
                      Componentes de {vista.aeronaveSeleccionada.matricula}
                    </h2>
                    <p className="text-gray-600">
                      {vista.aeronaveSeleccionada.fabricante} {vista.aeronaveSeleccionada.modelo} • {vista.aeronaveSeleccionada.tipo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(vista.aeronaveSeleccionada.estado)}`}>
                    {vista.aeronaveSeleccionada.estado}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Componente de gestión de componentes en lugar */}
            <ComponentesAeronave
              aeronave={vista.aeronaveSeleccionada}
              isOpen={true}
              onClose={vista.volverAeronaves}
              isInPlace={true}
            />
          </div>
        ) : (
          /* Vista de aeronaves */
          <>
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
                <p className="text-gray-600">Administra el inventario de aeronaves</p>
              </div>
              <button
                onClick={formulario.nuevaAeronave}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Nueva Aeronave
              </button>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
              <EstadisticasInventario estadisticas={estadisticas} />
            )}

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
                      onClick={() => vista.setVistaEnTarjetas(true)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        vista.vistaEnTarjetas
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
                      onClick={() => vista.setVistaEnTarjetas(false)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        !vista.vistaEnTarjetas
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
              <AeronaveList
                aeronaves={aeronavesFiltradas}
                vistaEnTarjetas={vista.vistaEnTarjetas}
                onVerComponentes={vista.verComponentesAeronave}
                onEditar={formulario.editarAeronave}
                onEliminar={manejarEliminarAeronave}
                onGestionarHoras={manejarGestionHoras}
                obtenerColorEstado={obtenerColorEstado}
                onVerMonitoreo={(matricula) => {
                  // Navegar a página de monitoreo con filtro por matrícula
                  navigate(`/monitoreo?matricula=${matricula}`);
                }}
                onConfigurarMonitoreo={(matricula) => {
                  // Por ahora navegar a gestión de catálogo de control
                  navigate('/herramientas/control-monitoreo');
                }}
              />
            )}
          </>
        )}

        {/* Formulario Modal */}
        {formulario.mostrarFormulario && (
          <FormularioAeronave
            formulario={formulario.formulario}
            aeronaveEditando={formulario.aeronaveEditando}
            loading={formulario.loading}
            onCambio={formulario.manejarCambioFormulario}
            onEnvio={formulario.manejarEnvioFormulario}
            onCerrar={formulario.cerrarFormulario}
          />
        )}

        {/* Modal de Gestión de Horas */}
        {mostrarGestionHoras && aeronaveGestionHoras && (
          <GestionHorasAeronave
            aeronave={aeronaveGestionHoras}
            onActualizado={manejarAeronaveActualizada}
            onCerrar={cerrarGestionHoras}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default GestionInventario;