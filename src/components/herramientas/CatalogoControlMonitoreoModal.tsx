import React, { useState, useEffect } from 'react';
import { ICatalogoControlMonitoreo, CatalogoControlMonitoreoFormData, EstadoControlMonitoreo } from '../../types/herramientas';

interface CatalogoControlMonitoreoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CatalogoControlMonitoreoFormData) => void;
  elemento?: ICatalogoControlMonitoreo | null;
  isLoading?: boolean;
}

const CatalogoControlMonitoreoModal: React.FC<CatalogoControlMonitoreoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  elemento,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CatalogoControlMonitoreoFormData>({
    descripcionCodigo: '',
    horaInicial: 0,
    horaFinal: 0,
    estado: EstadoControlMonitoreo.ACTIVO
  });

  useEffect(() => {
    if (elemento) {
      setFormData({
        descripcionCodigo: elemento.descripcionCodigo || '',
        horaInicial: elemento.horaInicial || 0,
        horaFinal: elemento.horaFinal || 0,
        estado: elemento.estado || EstadoControlMonitoreo.ACTIVO
      });
    } else {
      setFormData({
        descripcionCodigo: '',
        horaInicial: 0,
        horaFinal: 0,
        estado: EstadoControlMonitoreo.ACTIVO
      });
    }
  }, [elemento, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'horaInicial' || name === 'horaFinal' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {elemento ? 'Editar' : 'Agregar'} Control y Monitoreo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="descripcionCodigo" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción o Código de Monitoreo *
            </label>
            <input
              type="text"
              id="descripcionCodigo"
              name="descripcionCodigo"
              value={formData.descripcionCodigo}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese descripción o código"
            />
          </div>

          <div>
            <label htmlFor="horaInicial" className="block text-sm font-medium text-gray-700 mb-1">
              Hora Inicial *
            </label>
            <input
              type="number"
              id="horaInicial"
              name="horaInicial"
              value={formData.horaInicial}
              onChange={handleChange}
              required
              min="0"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ejemplo: 3000"
            />
          </div>

          <div>
            <label htmlFor="horaFinal" className="block text-sm font-medium text-gray-700 mb-1">
              Hora Final *
            </label>
            <input
              type="number"
              id="horaFinal"
              name="horaFinal"
              value={formData.horaFinal}
              onChange={handleChange}
              required
              min="0"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ejemplo: 6000"
            />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={EstadoControlMonitoreo.ACTIVO}>Activo</option>
              <option value={EstadoControlMonitoreo.INACTIVO}>Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : (elemento ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CatalogoControlMonitoreoModal;