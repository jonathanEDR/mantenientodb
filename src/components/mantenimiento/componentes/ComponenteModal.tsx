import React from 'react';
import { IComponente, EstadoComponente, ComponenteCategoria } from '../../../types/mantenimiento';
import { IAeronave } from '../../../types/inventario';
import MantenimientoModal from '../shared/MantenimientoModal';
import { FormField, FormActions } from '../shared/FormComponents';
import { useCatalogoComponentes } from '../../../hooks';

interface ComponenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  componente?: IComponente | null;
  aeronaves: IAeronave[];
  loading?: boolean;
}

export default function ComponenteModal({
  isOpen,
  onClose,
  onSubmit,
  componente,
  aeronaves,
  loading = false
}: ComponenteModalProps) {
  // Hook para obtener catálogo de componentes
  const { categoriaOptions, loading: catalogoLoading, error: catalogoError } = useCatalogoComponentes();
  
  // Categorías estáticas como fallback
  const categoriasEstaticas = [
    { value: 'FUSELAJE', label: 'Fuselaje' },
    { value: 'MOTOR_PRINCIPAL', label: 'Motor Principal' },
    { value: 'TRANSMISION_PRINCIPAL', label: 'Transmisión Principal' },
    { value: 'CUBO_ROTOR_PRINCIPAL', label: 'Cubo Rotor Principal' },
    { value: 'PALAS_ROTOR_PRINCIPAL', label: 'Palas Rotor Principal' },
    { value: 'PLATO_CICLICO', label: 'Plato Cíclico' },
    { value: 'OTROS', label: 'Otros' }
  ];

  // Usar categorías del catálogo si están disponibles, sino usar estáticas
  const categoriasDisponibles = React.useMemo(() => {
    if (!catalogoLoading && !catalogoError && categoriaOptions.length > 0) {
      return categoriaOptions;
    }
    return categoriasEstaticas;
  }, [categoriaOptions, catalogoLoading, catalogoError]);

  const [formData, setFormData] = React.useState({
    nombre: '',
    categoria: '', // Inicializar vacío, se establecerá cuando cargue el catálogo
    numeroSerie: '',
    numeroParte: '',
    fabricante: '',
    fechaFabricacion: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    aeronaveActual: '',
    estado: EstadoComponente.EN_ALMACEN,
    ubicacionFisica: '',
    observaciones: ''
  });

  React.useEffect(() => {
    if (componente) {
      // Extraer el ID de aeronave si es un objeto poblado
      let aeronaveActualId = '';
      if (componente.aeronaveActual) {
        if (typeof componente.aeronaveActual === 'object') {
          aeronaveActualId = componente.aeronaveActual._id;
        } else {
          aeronaveActualId = componente.aeronaveActual;
        }
      }

      setFormData({
        nombre: componente.nombre || '',
        categoria: componente.categoria || '', // Mantener el valor original del componente
        numeroSerie: componente.numeroSerie || '',
        numeroParte: componente.numeroParte || '',
        fabricante: componente.fabricante || '',
        fechaFabricacion: componente.fechaFabricacion ? new Date(componente.fechaFabricacion).toISOString().split('T')[0] : '',
        aeronaveActual: aeronaveActualId,
        estado: componente.estado || EstadoComponente.EN_ALMACEN,
        ubicacionFisica: componente.ubicacionFisica || '',
        observaciones: componente.observaciones || ''
      });
    } else {
      setFormData({
        nombre: '',
        categoria: '', // Se establecerá en el useEffect separado
        numeroSerie: '',
        numeroParte: '',
        fabricante: '',
        fechaFabricacion: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        aeronaveActual: '',
        estado: EstadoComponente.EN_ALMACEN,
        ubicacionFisica: '',
        observaciones: ''
      });
    }
  }, [componente]); // Solo depende del componente, no de las categorías

  // Efecto separado para establecer categoría por defecto cuando se abre modal nuevo
  React.useEffect(() => {
    if (!componente && isOpen && categoriasDisponibles.length > 0) {
      // Solo actualizar si la categoría está vacía
      setFormData(prev => {
        if (!prev.categoria) {
          return { ...prev, categoria: categoriasDisponibles[0].value };
        }
        return prev;
      });
    }
  }, [isOpen, componente, categoriasDisponibles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar datos base
    const submitData = {
      numeroSerie: formData.numeroSerie,
      numeroParte: formData.numeroParte,
      nombre: formData.nombre,
      categoria: formData.categoria,
      fabricante: formData.fabricante,
      fechaFabricacion: formData.fechaFabricacion || new Date().toISOString().split('T')[0],
      vidaUtil: [{ limite: 1000, unidad: 'HORAS' as const, acumulado: 0 }],
      ubicacionFisica: formData.ubicacionFisica || 'Almacén',
      observaciones: formData.observaciones || '',
      // Incluir aeronaveActual siempre (tanto para crear como para editar)
      ...(formData.aeronaveActual && { aeronaveActual: formData.aeronaveActual }),
      // Campos adicionales para actualización
      ...(componente && {
        estado: formData.estado
      })
    };

    onSubmit(submitData);
  };



  const estadoOptions = [
    { value: 'INSTALADO', label: 'Instalado' },
    { value: 'EN_ALMACEN', label: 'En Almacén' },
    { value: 'EN_REPARACION', label: 'En Reparación' },
    { value: 'CONDENADO', label: 'Condenado' },
    { value: 'EN_OVERHAUL', label: 'En Overhaul' },
    { value: 'PENDIENTE_INSPECCION', label: 'Pendiente Inspección' }
  ];

  const aeronaveOptions = [
    { value: '', label: 'Seleccionar aeronave (opcional)' },
    ...aeronaves.map(aeronave => ({
      value: aeronave._id,
      label: `${aeronave.matricula} - ${aeronave.modelo}`
    }))
  ];

  return (
    <MantenimientoModal
      isOpen={isOpen}
      onClose={onClose}
      title={componente ? 'Editar Componente' : 'Nuevo Componente'}
      size="xl"
    >
      {catalogoError && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
          <div className="text-yellow-700 text-sm">
            <strong>Advertencia:</strong> No se pudo cargar el catálogo de componentes. 
            Se mostrarán categorías por defecto.
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nombre"
            type="text"
            value={formData.nombre}
            onChange={(value) => setFormData({...formData, nombre: value})}
            required
            placeholder="Nombre del componente"
          />

          <FormField
            label="Categoría"
            type="select"
            value={formData.categoria}
            onChange={(value) => setFormData({...formData, categoria: value})}
            required
            options={categoriasDisponibles}
          />

          <FormField
            label="Número de Serie"
            type="text"
            value={formData.numeroSerie}
            onChange={(value) => setFormData({...formData, numeroSerie: value})}
            required
            placeholder="Número de serie único"
          />

          <FormField
            label="Número de Parte"
            type="text"
            value={formData.numeroParte}
            onChange={(value) => setFormData({...formData, numeroParte: value})}
            required
            placeholder="Número de parte del fabricante"
          />

          <FormField
            label="Fabricante"
            type="text"
            value={formData.fabricante}
            onChange={(value) => setFormData({...formData, fabricante: value})}
            required
            placeholder="Nombre del fabricante"
          />

          <FormField
            label="Fecha de Fabricación"
            type="date"
            value={formData.fechaFabricacion}
            onChange={(value) => setFormData({...formData, fechaFabricacion: value})}
            required
          />

          <FormField
            label="Aeronave Actual"
            type="select"
            value={formData.aeronaveActual}
            onChange={(value) => setFormData({...formData, aeronaveActual: value})}
            options={aeronaveOptions}
            placeholder="Seleccionar aeronave (opcional)"
          />

          <FormField
            label="Estado"
            type="select"
            value={formData.estado}
            onChange={(value) => setFormData({...formData, estado: value})}
            required
            options={estadoOptions}
          />

          <FormField
            label="Ubicación Física"
            type="text"
            value={formData.ubicacionFisica}
            onChange={(value) => setFormData({...formData, ubicacionFisica: value})}
            required
            placeholder="Ej: Hangar A, Almacén B, Instalado en aeronave"
          />
        </div>

        <FormField
          label="Observaciones"
          type="textarea"
          value={formData.observaciones}
          onChange={(value) => setFormData({...formData, observaciones: value})}
          placeholder="Observaciones adicionales..."
        />

        <FormActions
          onCancel={onClose}
          onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          submitText={componente ? 'Actualizar' : 'Crear'}
          submitting={loading}
        />
      </form>
    </MantenimientoModal>
  );
}