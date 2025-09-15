import React, { useState, useEffect } from 'react';
import { 
  IOrdenTrabajo, 
  TipoMantenimiento, 
  PrioridadOrden, 
  EstadoOrden 
} from '../../../types/mantenimiento';
import { IAeronave } from '../../../types/inventario';
import { IComponente } from '../../../types/mantenimiento';

interface OrdenTrabajoModalProps {
  orden?: IOrdenTrabajo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (orden: Partial<IOrdenTrabajo>) => void;
  aeronaves: IAeronave[];
  componentes: IComponente[];
}

export default function OrdenTrabajoModal({
  orden,
  isOpen,
  onClose,
  onSave,
  aeronaves,
  componentes
}: OrdenTrabajoModalProps) {
  const [formData, setFormData] = useState<Partial<IOrdenTrabajo>>({
    numeroOrden: '',
    aeronave: '',
    componente: '',
    tipo: TipoMantenimiento.PREVENTIVO,
    titulo: '',
    descripcion: '',
    prioridad: PrioridadOrden.MEDIA,
    tecnicoAsignado: '',
    supervisorAsignado: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    estado: EstadoOrden.PENDIENTE,
    horasEstimadas: 0,
    observaciones: '',
    materialesRequeridos: [],
    registrosTrabajo: [],
    itemsInspeccion: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orden) {
      setFormData({
        ...orden,
        fechaCreacion: orden.fechaCreacion?.split('T')[0] || '',
        fechaVencimiento: orden.fechaVencimiento?.split('T')[0] || '',
        fechaInicio: orden.fechaInicio?.split('T')[0] || '',
        fechaFinalizacion: orden.fechaFinalizacion?.split('T')[0] || ''
      });
    } else {
      // Generar número de orden automático
      const fecha = new Date();
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      const numeroOrden = `OT-${year}${month}${day}-${Date.now().toString().slice(-4)}`;
      
      setFormData(prev => ({
        ...prev,
        numeroOrden,
        fechaCreacion: new Date().toISOString().split('T')[0]
      }));
    }
  }, [orden]);

  // Filtrar componentes por aeronave seleccionada
  const componentesFiltrados = componentes.filter(
    comp => !formData.aeronave || comp.aeronaveActual === formData.aeronave
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.numeroOrden?.trim()) {
      newErrors.numeroOrden = 'El número de orden es requerido';
    }

    if (!formData.aeronave) {
      newErrors.aeronave = 'La aeronave es requerida';
    }

    if (!formData.titulo?.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.fechaVencimiento) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento es requerida';
    } else {
      const vencimiento = new Date(formData.fechaVencimiento);
      const hoy = new Date();
      if (vencimiento < hoy) {
        newErrors.fechaVencimiento = 'La fecha de vencimiento no puede ser anterior a hoy';
      }
    }

    if (!formData.horasEstimadas || formData.horasEstimadas <= 0) {
      newErrors.horasEstimadas = 'Las horas estimadas deben ser mayor a 0';
    }

    if (!formData.tecnicoAsignado?.trim()) {
      newErrors.tecnicoAsignado = 'El técnico asignado es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const ordenToSave = {
      ...formData,
      createdAt: orden?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(ordenToSave);
    onClose();
  };

  const handleInputChange = (field: keyof IOrdenTrabajo, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-8 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {orden ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primera fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Orden *
                </label>
                <input
                  type="text"
                  value={formData.numeroOrden || ''}
                  onChange={(e) => handleInputChange('numeroOrden', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.numeroOrden ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="OT-YYYYMMDD-XXXX"
                />
                {errors.numeroOrden && <p className="text-red-500 text-xs mt-1">{errors.numeroOrden}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Mantenimiento *
                </label>
                <select
                  value={formData.tipo || ''}
                  onChange={(e) => handleInputChange('tipo', e.target.value as TipoMantenimiento)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={TipoMantenimiento.PREVENTIVO}>Preventivo</option>
                  <option value={TipoMantenimiento.CORRECTIVO}>Correctivo</option>
                  <option value={TipoMantenimiento.INSPECCION}>Inspección</option>
                  <option value={TipoMantenimiento.OVERHAUL}>Overhaul</option>
                  <option value={TipoMantenimiento.REPARACION}>Reparación</option>
                  <option value={TipoMantenimiento.MODIFICACION}>Modificación</option>
                  <option value={TipoMantenimiento.DIRECTIVA_AD}>Directiva AD</option>
                  <option value={TipoMantenimiento.BOLETIN_SERVICIO}>Boletín de Servicio</option>
                </select>
              </div>
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aeronave *
                </label>
                <select
                  value={formData.aeronave || ''}
                  onChange={(e) => handleInputChange('aeronave', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.aeronave ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar aeronave</option>
                  {aeronaves.map(aeronave => (
                    <option key={aeronave._id} value={aeronave._id}>
                      {aeronave.matricula} - {aeronave.modelo}
                    </option>
                  ))}
                </select>
                {errors.aeronave && <p className="text-red-500 text-xs mt-1">{errors.aeronave}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Componente (Opcional)
                </label>
                <select
                  value={formData.componente || ''}
                  onChange={(e) => handleInputChange('componente', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={!formData.aeronave}
                >
                  <option value="">Seleccionar componente</option>
                  {componentesFiltrados.map(componente => (
                    <option key={componente._id} value={componente._id}>
                      {componente.nombre} - {componente.numeroSerie}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tercera fila */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo || ''}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.titulo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Título descriptivo de la orden de trabajo"
              />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
            </div>

            {/* Cuarta fila */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion || ''}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Descripción detallada del trabajo a realizar"
              />
              {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
            </div>

            {/* Quinta fila */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad *
                </label>
                <select
                  value={formData.prioridad || ''}
                  onChange={(e) => handleInputChange('prioridad', e.target.value as PrioridadOrden)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={PrioridadOrden.CRITICA}>Crítica</option>
                  <option value={PrioridadOrden.ALTA}>Alta</option>
                  <option value={PrioridadOrden.MEDIA}>Media</option>
                  <option value={PrioridadOrden.BAJA}>Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  value={formData.estado || ''}
                  onChange={(e) => handleInputChange('estado', e.target.value as EstadoOrden)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={EstadoOrden.PENDIENTE}>Pendiente</option>
                  <option value={EstadoOrden.EN_PROCESO}>En Proceso</option>
                  <option value={EstadoOrden.ESPERANDO_REPUESTOS}>Esperando Repuestos</option>
                  <option value={EstadoOrden.ESPERANDO_APROBACION}>Esperando Aprobación</option>
                  <option value={EstadoOrden.COMPLETADA}>Completada</option>
                  <option value={EstadoOrden.CANCELADA}>Cancelada</option>
                  <option value={EstadoOrden.SUSPENDIDA}>Suspendida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas Estimadas *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.horasEstimadas || ''}
                  onChange={(e) => handleInputChange('horasEstimadas', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.horasEstimadas ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors.horasEstimadas && <p className="text-red-500 text-xs mt-1">{errors.horasEstimadas}</p>}
              </div>
            </div>

            {/* Sexta fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Técnico Asignado *
                </label>
                <input
                  type="text"
                  value={formData.tecnicoAsignado || ''}
                  onChange={(e) => handleInputChange('tecnicoAsignado', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.tecnicoAsignado ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del técnico responsable"
                />
                {errors.tecnicoAsignado && <p className="text-red-500 text-xs mt-1">{errors.tecnicoAsignado}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supervisor Asignado
                </label>
                <input
                  type="text"
                  value={formData.supervisorAsignado || ''}
                  onChange={(e) => handleInputChange('supervisorAsignado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nombre del supervisor (opcional)"
                />
              </div>
            </div>

            {/* Séptima fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Creación
                </label>
                <input
                  type="date"
                  value={formData.fechaCreacion || ''}
                  onChange={(e) => handleInputChange('fechaCreacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  value={formData.fechaVencimiento || ''}
                  onChange={(e) => handleInputChange('fechaVencimiento', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.fechaVencimiento ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fechaVencimiento && <p className="text-red-500 text-xs mt-1">{errors.fechaVencimiento}</p>}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones || ''}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Observaciones adicionales (opcional)"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {orden ? 'Actualizar' : 'Crear'} Orden
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}