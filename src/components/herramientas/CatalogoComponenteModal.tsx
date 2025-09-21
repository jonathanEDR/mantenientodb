import React, { useState, useEffect } from 'react';
import {
  ICatalogoComponente,
  CatalogoComponenteFormData,
  EstadoCatalogo,
  getEstadoLabel
} from '../../types/herramientas';
import { useApiWithAuth } from '../../utils/useApiWithAuth';

interface CatalogoComponenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  elemento?: ICatalogoComponente | null;
  modo: 'crear' | 'editar';
}

const CatalogoComponenteModal: React.FC<CatalogoComponenteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  elemento,
  modo
}) => {
  const { post, put } = useApiWithAuth();
  
  const [formData, setFormData] = useState<CatalogoComponenteFormData>({
    codigo: '',
    descripcion: '',
    estado: EstadoCatalogo.ACTIVO
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Resetear form cuando se abre/cierra el modal o cambia el elemento
  useEffect(() => {
    if (isOpen) {
      if (modo === 'editar' && elemento) {
        setFormData({
          codigo: elemento.codigo,
          descripcion: elemento.descripcion,
          estado: elemento.estado
        });
      } else {
        setFormData({
          codigo: '',
          descripcion: '',
          estado: EstadoCatalogo.ACTIVO
        });
      }
      setErrors([]);
    }
  }, [isOpen, modo, elemento]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.codigo.trim()) {
      newErrors.push('El código es requerido');
    } else if (formData.codigo.trim().length < 3) {
      newErrors.push('El código debe tener al menos 3 caracteres');
    }

    if (!formData.descripcion.trim()) {
      newErrors.push('La descripción es requerida');
    } else if (formData.descripcion.trim().length < 5) {
      newErrors.push('La descripción debe tener al menos 5 caracteres');
    }

    if (!formData.estado) {
      newErrors.push('El estado es requerido');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      if (modo === 'crear') {
        await post('/herramientas/catalogos/componentes', formData);
      } else {
        await put(`/herramientas/catalogos/componentes/${elemento?._id}`, formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors([error instanceof Error ? error.message : 'Error desconocido']);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {modo === 'crear' ? 'Crear Nuevo Elemento' : 'Editar Elemento'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <ul className="text-red-700 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            {/* Código */}
            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                Código *
              </label>
              <input
                type="text"
                id="codigo"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Código único, mínimo 3 caracteres, sin espacios"
                disabled={loading}
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                Código único, mínimo 3 caracteres, sin espacios
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción del componente"
                disabled={loading}
                maxLength={200}
              />
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {Object.values(EstadoCatalogo).map((estado) => (
                  <option key={estado} value={estado}>
                    {getEstadoLabel(estado)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : modo === 'crear' ? 'Crear' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CatalogoComponenteModal;