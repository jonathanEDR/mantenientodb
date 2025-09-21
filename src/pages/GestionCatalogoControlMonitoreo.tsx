import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useCurrentUser } from '../hooks/useRoles';
import { useApiWithAuth } from '../utils/useApiWithAuth';
import CatalogoControlMonitoreoTabla from '../components/herramientas/CatalogoControlMonitoreoTabla';
import CatalogoControlMonitoreoModal from '../components/herramientas/CatalogoControlMonitoreoModal';
import { 
  ICatalogoControlMonitoreo, 
  CatalogoControlMonitoreoFormData, 
  EstadoControlMonitoreo 
} from '../types/herramientas';

const GestionCatalogoControlMonitoreo: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, permissions, loading: authLoading } = useCurrentUser();
  const { get, post, put, delete: deleteMethod } = useApiWithAuth();
  
  const [elementos, setElementos] = useState<ICatalogoControlMonitoreo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [elementoEditando, setElementoEditando] = useState<ICatalogoControlMonitoreo | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '' as EstadoControlMonitoreo | ''
  });

  // Verificar permisos
  useEffect(() => {
    if (!authLoading && (!permissions?.canViewCatalogs)) {
      navigate('/dashboard');
      return;
    }
  }, [permissions, authLoading, navigate]);

  const cargarElementos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filtros.busqueda) params.append('descripcionCodigo', filtros.busqueda);
      if (filtros.estado) params.append('estado', filtros.estado);

      const response = await get(`/herramientas/catalogos/control-monitoreo?${params}`);
      setElementos(response.elementos || []);
    } catch (error) {
      console.error('Error al cargar elementos:', error);
      setElementos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissions?.canViewCatalogs) {
      cargarElementos();
    }
  }, [permissions, filtros]);

  const handleAbrirModal = (elemento?: ICatalogoControlMonitoreo) => {
    setElementoEditando(elemento || null);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setElementoEditando(null);
  };

  const handleSubmit = async (data: CatalogoControlMonitoreoFormData) => {
    try {
      setGuardando(true);
      
      if (elementoEditando?._id) {
        await put(`/herramientas/catalogos/control-monitoreo/${elementoEditando._id}`, data);
      } else {
        await post('/herramientas/catalogos/control-monitoreo', data);
      }
      
      await cargarElementos();
      handleCerrarModal();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el elemento');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este elemento?')) {
      return;
    }

    try {
      await deleteMethod(`/herramientas/catalogos/control-monitoreo/${id}`);
      await cargarElementos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el elemento');
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (authLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!permissions?.canViewCatalogs) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">No tiene permisos para ver este catálogo</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Estado de Control y Monitoreo
          </h1>
        
        {/* Filtros */}
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              name="busqueda"
              placeholder="Buscar por descripción o código..."
              value={filtros.busqueda}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value={EstadoControlMonitoreo.ACTIVO}>Activo</option>
              <option value={EstadoControlMonitoreo.INACTIVO}>Inactivo</option>
            </select>
          </div>
          {permissions?.canCreateCatalogs && (
            <button
              onClick={() => handleAbrirModal()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Agregar Nuevo
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <CatalogoControlMonitoreoTabla
        elementos={elementos}
        onEditar={handleAbrirModal}
        onEliminar={handleEliminar}
        isLoading={loading}
      />

      {/* Modal */}
      <CatalogoControlMonitoreoModal
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
        onSubmit={handleSubmit}
        elemento={elementoEditando}
        isLoading={guardando}
      />
      </div>
    </DashboardLayout>
  );
};

export default GestionCatalogoControlMonitoreo;