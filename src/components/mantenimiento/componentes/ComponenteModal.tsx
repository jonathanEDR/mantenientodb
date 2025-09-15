import React from 'react';
import { IComponente, EstadoComponente, ComponenteCategoria } from '../../../types/mantenimiento';
import { IAeronave } from '../../../types/inventario';
import MantenimientoModal from '../shared/MantenimientoModal';
import { FormField, FormActions } from '../shared/FormComponents';

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
  const [formData, setFormData] = React.useState({
    nombre: '',
    categoria: ComponenteCategoria.FUSELAJE,
    numeroSerie: '',
    numeroParte: '',
    fabricante: '',
    fechaFabricacion: '',
    aeronaveActual: '',
    estado: EstadoComponente.EN_ALMACEN,
    ubicacionFisica: '',
    observaciones: ''
  });

  React.useEffect(() => {
    if (componente) {
      setFormData({
        nombre: componente.nombre || '',
        categoria: componente.categoria || ComponenteCategoria.FUSELAJE,
        numeroSerie: componente.numeroSerie || '',
        numeroParte: componente.numeroParte || '',
        fabricante: componente.fabricante || '',
        fechaFabricacion: componente.fechaFabricacion ? new Date(componente.fechaFabricacion).toISOString().split('T')[0] : '',
        aeronaveActual: componente.aeronaveActual || '',
        estado: componente.estado || EstadoComponente.EN_ALMACEN,
        ubicacionFisica: componente.ubicacionFisica || '',
        observaciones: componente.observaciones || ''
      });
    } else {
      setFormData({
        nombre: '',
        categoria: ComponenteCategoria.FUSELAJE,
        numeroSerie: '',
        numeroParte: '',
        fabricante: '',
        fechaFabricacion: '',
        aeronaveActual: '',
        estado: EstadoComponente.EN_ALMACEN,
        ubicacionFisica: '',
        observaciones: ''
      });
    }
  }, [componente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Solo enviar los campos que espera la API ICrearComponenteData
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
      // Campos adicionales que podrían ser necesarios para actualización
      ...(componente && {
        aeronaveActual: formData.aeronaveActual,
        estado: formData.estado
      })
    };

    onSubmit(submitData);
  };

  const categoriaOptions = [
    { value: 'FUSELAJE', label: 'Fuselaje' },
    { value: 'MOTOR_PRINCIPAL', label: 'Motor Principal' },
    { value: 'TRANSMISION_PRINCIPAL', label: 'Transmisión Principal' },
    { value: 'CUBO_ROTOR_PRINCIPAL', label: 'Cubo Rotor Principal' },
    { value: 'PALAS_ROTOR_PRINCIPAL', label: 'Palas Rotor Principal' },
    { value: 'PLATO_CICLICO', label: 'Plato Cíclico' },
    { value: 'CAJA_30_GRADOS', label: 'Caja 30 Grados' },
    { value: 'CUBO_ROTOR_COLA', label: 'Cubo Rotor Cola' },
    { value: 'PALAS_ROTOR_COLA', label: 'Palas Rotor Cola' },
    { value: 'STARTER_GENERADOR', label: 'Starter Generador' },
    { value: 'BATERIAS', label: 'Baterías' },
    { value: 'SISTEMA_HIDRAULICO', label: 'Sistema Hidráulico' },
    { value: 'TREN_ATERRIZAJE', label: 'Tren de Aterrizaje' },
    { value: 'SISTEMA_ELECTRICO', label: 'Sistema Eléctrico' },
    { value: 'INSTRUMENTACION', label: 'Instrumentación' },
    { value: 'CONTROLES_VUELO', label: 'Controles de Vuelo' },
    { value: 'OTROS', label: 'Otros' }
  ];

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
            options={categoriaOptions}
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