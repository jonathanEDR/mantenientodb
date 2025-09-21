import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { usePermissions } from '../hooks/useRoles';
import { useApiWithAuth } from '../utils/useApiWithAuth';
import CatalogoComponenteModal from '../components/herramientas/CatalogoComponenteModal';
import CatalogoComponentesTable from '../components/herramientas/CatalogoComponentesTable';
import CatalogoComponentesFiltros from '../components/herramientas/CatalogoComponentesFiltros';
import {
  ICatalogoComponente,
  CatalogoComponentesFiltros as FiltrosType
} from '../types/herramientas';

export default function GestionCatalogoComponentes() {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { get, post, put, delete: deleteRequest } = useApiWithAuth();
  
  // Estados principales
  const [elementos, setElementos] = useState<ICatalogoComponente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [elementoEditando, setElementoEditando] = useState<ICatalogoComponente | null>(null);
  const [modoModal, setModoModal] = useState<'crear' | 'editar'>('crear');
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosType>({
    busqueda: '',
    estado: ''
  });

  // Verificar permisos
  useEffect(() => {
    console.log('Permisos del usuario:', permissions);
    console.log('canViewCatalogs:', permissions.canViewCatalogs);
    
    // Temporalmente comentamos la redirección para debuggear
    // if (!permissions.canViewCatalogs) {
    //   navigate('/dashboard');
    //   return;
    // }
  }, [permissions, navigate]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarElementos();
  }, [filtros]);

  const cargarElementos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query params
      const params = new URLSearchParams();
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.estado) params.append('estado', filtros.estado);

      const response = await get(`/herramientas/catalogos/componentes?${params}`);
      setElementos(response.data.elementos || []);
    } catch (error) {
      console.error('Error al cargar elementos:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearElemento = () => {
    setElementoEditando(null);
    setModoModal('crear');
    setMostrarModal(true);
  };

  const handleEditarElemento = (elemento: ICatalogoComponente) => {
    setElementoEditando(elemento);
    setModoModal('editar');
    setMostrarModal(true);
  };

  const handleEliminarElemento = async (elemento: ICatalogoComponente) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el elemento "${elemento.codigo}"?`)) {
      return;
    }

    try {
      await deleteRequest(`/herramientas/catalogos/componentes/${elemento._id}`);
      // Recargar elementos
      await cargarElementos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleModalSuccess = () => {
    cargarElementos();
  };

  const handleFiltrosChange = (nuevosFiltros: FiltrosType) => {
    setFiltros(nuevosFiltros);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: ''
    });
  };

  if (!permissions.canViewCatalogs) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catálogo de Componentes</h1>
              <p className="text-gray-600 mt-1">
                Gestiona el catálogo de componentes del sistema
              </p>
            </div>
            {permissions.canCreateCatalogs && (
              <button
                onClick={handleCrearElemento}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nuevo Elemento</span>
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas simples */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{elementos.length}</div>
              <div className="text-sm text-blue-600">Total de Elementos</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {elementos.filter(e => e.estado === 'ACTIVO').length}
              </div>
              <div className="text-sm text-green-600">Activos</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {elementos.filter(e => e.estado === 'INACTIVO').length}
              </div>
              <div className="text-sm text-yellow-600">Inactivos</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {elementos.filter(e => e.estado === 'OBSOLETO').length}
              </div>
              <div className="text-sm text-red-600">Obsoletos</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <CatalogoComponentesFiltros
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          onLimpiarFiltros={handleLimpiarFiltros}
        />

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Tabla */}
        <CatalogoComponentesTable
          elementos={elementos}
          loading={loading}
          onEdit={handleEditarElemento}
          onDelete={handleEliminarElemento}
        />

        {/* Modal */}
        <CatalogoComponenteModal
          isOpen={mostrarModal}
          onClose={() => setMostrarModal(false)}
          onSuccess={handleModalSuccess}
          elemento={elementoEditando}
          modo={modoModal}
        />
      </div>
    </DashboardLayout>
  );
}