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

  // Ya no necesitamos mapeo - usamos directamente los códigos del catálogo

  // Buscar código de catálogo por nombre/descripción o categoría del componente
  const buscarCodigoPorNombre = (nombreOCategoria: string): string => {
    if (!categoriaOptions.length) return ''; // Catálogo aún no cargado
    
    // 1. Buscar por código exacto (para componentes existentes que ya tienen la categoría correcta)
    const coincidenciaCodigo = categoriaOptions.find(cat => 
      cat.value === nombreOCategoria.toUpperCase()
    );
    if (coincidenciaCodigo) return coincidenciaCodigo.value;
    
    // 2. Buscar coincidencia exacta por nombre/descripción
    const coincidenciaExacta = categoriaOptions.find(cat => 
      cat.label.toLowerCase() === nombreOCategoria.toLowerCase()
    );
    if (coincidenciaExacta) return coincidenciaExacta.value;
    
    // 3. Buscar coincidencia parcial (en caso de variaciones)
    const coincidenciaParcial = categoriaOptions.find(cat => 
      cat.label.toLowerCase().includes(nombreOCategoria.toLowerCase()) ||
      nombreOCategoria.toLowerCase().includes(cat.label.toLowerCase())
    );
    
    return coincidenciaParcial?.value || '';
  };

  const [formData, setFormData] = React.useState({
    catalogoComponente: '', // Código del catálogo seleccionado
    numeroSerie: '',
    numeroParte: '',
    fabricante: '',
    fechaFabricacion: new Date().toISOString().split('T')[0],
    aeronaveActual: '',
    estado: EstadoComponente.EN_ALMACEN,
    ubicacionFisica: '',
    observaciones: ''
  });

  // Derivar nombre y categoría del catálogo seleccionado
  const componenteInfo = React.useMemo(() => {
    if (!formData.catalogoComponente) return { nombre: '', categoria: '' };
    
    const catalogoSeleccionado = categoriaOptions.find(cat => cat.value === formData.catalogoComponente);
    const nombre = catalogoSeleccionado ? catalogoSeleccionado.label : '';
    const categoria = formData.catalogoComponente.toUpperCase(); // Usar directamente el código del catálogo
    
    return { nombre, categoria };
  }, [formData.catalogoComponente, categoriaOptions]);

  // UseEffect para cargar datos del componente (separado del catálogo)
  React.useEffect(() => {
    console.log('🔧 [EDIT] UseEffect componente ejecutado:', {
      tieneComponente: !!componente,
      nombre: componente?.nombre,
      categoria: componente?.categoria,
      numeroSerie: componente?.numeroSerie,
      isOpen
    });

    if (componente) {
      console.log('🔧 [EDIT] Cargando datos del componente:', {
        nombre: componente.nombre,
        categoria: componente.categoria,
        numeroSerie: componente.numeroSerie,
        completo: componente
      });

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
        catalogoComponente: '', // Se establecerá en el siguiente useEffect cuando el catálogo esté listo
        numeroSerie: componente.numeroSerie || '',
        numeroParte: componente.numeroParte || '',
        fabricante: componente.fabricante || '',
        fechaFabricacion: componente.fechaFabricacion ? new Date(componente.fechaFabricacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        aeronaveActual: aeronaveActualId,
        estado: componente.estado || EstadoComponente.EN_ALMACEN,
        ubicacionFisica: componente.ubicacionFisica || '',
        observaciones: componente.observaciones || ''
      });
    } else {
      setFormData({
        catalogoComponente: '',
        numeroSerie: '',
        numeroParte: '',
        fabricante: '',
        fechaFabricacion: new Date().toISOString().split('T')[0],
        aeronaveActual: '',
        estado: EstadoComponente.EN_ALMACEN,
        ubicacionFisica: '',
        observaciones: ''
      });
    }
  }, [componente]);

  // UseEffect separado para establecer el código del catálogo cuando esté disponible
  React.useEffect(() => {
    console.log('🔧 [EDIT] UseEffect catálogo ejecutado:', {
      tieneComponente: !!componente,
      nombreComponente: componente?.nombre,
      catalogoLength: categoriaOptions.length,
      catalogoLoading,
      isOpen
    });

    if (componente && categoriaOptions.length > 0) {
      // Buscar por categoría primero, luego por nombre como fallback
      const codigoCatalogo = buscarCodigoPorNombre(componente.categoria) || buscarCodigoPorNombre(componente.nombre);
      
      console.log('🔧 [EDIT] Buscando código de catálogo:', {
        nombreComponente: componente.nombre,
        categoriaComponente: componente.categoria,
        codigoEncontrado: codigoCatalogo,
        catalogoDisponible: categoriaOptions.length > 0
      });
      
      if (codigoCatalogo) {
        setFormData(prev => ({
          ...prev,
          catalogoComponente: codigoCatalogo
        }));
      }
    }
  }, [componente, categoriaOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.catalogoComponente) {
      alert('Debe seleccionar un componente del catálogo');
      return;
    }
    
    if (!formData.numeroSerie.trim()) {
      alert('El número de serie es requerido');
      return;
    }
    
    if (!formData.numeroParte.trim()) {
      alert('El número de parte es requerido');
      return;
    }
    
    // Preparar datos para envío
    const vidaUtilPreservada = componente && componente.vidaUtil && componente.vidaUtil.length > 0 
      ? componente.vidaUtil.map(vida => ({
          limite: vida.limite || 1000,
          unidad: vida.unidad || 'HORAS' as const,
          acumulado: vida.acumulado || 0 // Preservar horas existentes
        }))
      : [{ 
          limite: 1000, 
          unidad: 'HORAS' as const, 
          acumulado: 0 // ⚠️ CRÍTICO: SIEMPRE 0 para componentes nuevos
        }];

    console.log('🔧 [ComponenteModal] Preparando vida útil:', {
      esEdicion: !!componente,
      vidaUtilOriginal: componente?.vidaUtil,
      vidaUtilPreservada,
      numeroSerie: formData.numeroSerie,
      esComponenteNuevo: !componente,
      horasInicialesComponenteNuevo: !componente ? 0 : 'N/A'
    });

    const submitData = {
      nombre: componenteInfo.nombre, // Usar el nombre derivado del catálogo
      categoria: componenteInfo.categoria, // Usar la categoría mapeada al enum
      numeroSerie: formData.numeroSerie.trim(),
      numeroParte: formData.numeroParte.trim(),
      fabricante: formData.fabricante.trim(),
      fechaFabricacion: formData.fechaFabricacion,
      vidaUtil: vidaUtilPreservada,
      ubicacionFisica: formData.ubicacionFisica.trim() || 'Almacén',
      observaciones: formData.observaciones.trim(),
      // Incluir aeronave si está seleccionada
      ...(formData.aeronaveActual && { aeronaveActual: formData.aeronaveActual }),
      // Para actualizaciones, preservar datos críticos adicionales
      ...(componente && { 
        estado: formData.estado,
        // Preservar historial de uso existente
        historialUso: componente.historialUso || [],
        // Preservar mantenimiento programado
        mantenimientoProgramado: componente.mantenimientoProgramado || [],
        // Preservar fechas importantes
        fechaInstalacion: componente.fechaInstalacion,
        ultimaInspeccion: componente.ultimaInspeccion,
        proximaInspeccion: componente.proximaInspeccion,
        // Preservar certificaciones
        certificaciones: componente.certificaciones || {},
        // Preservar alertas
        alertasActivas: componente.alertasActivas || false
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
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <div className="text-red-700 text-sm">
            <strong>Error:</strong> No se pudo cargar el catálogo de componentes. {catalogoError}
          </div>
        </div>
      )}

      {componente && categoriaOptions.length > 0 && !formData.catalogoComponente && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
          <div className="text-yellow-700 text-sm">
            <strong>Advertencia:</strong> No se pudo encontrar "{componente.nombre}" en el catálogo actual. 
            Seleccione el componente correspondiente o el más similar.
          </div>
        </div>
      )}

      {/* Información de horas acumuladas para componentes existentes */}
      {componente && componente.vidaUtil && componente.vidaUtil.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">📊 Información de Vida Útil Actual</h4>
          <div className="space-y-2">
            {componente.vidaUtil.map((vida, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-blue-700">
                  <strong>{vida.unidad}:</strong> {vida.acumulado || 0} acumuladas de {vida.limite || 'N/A'} límite
                </span>
                <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {((vida.acumulado || 0) / (vida.limite || 1) * 100).toFixed(1)}% utilizado
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            ℹ️ Estas horas se preservarán al actualizar el componente. Solo cambiarán mediante operaciones específicas de mantenimiento.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <FormField
              label="Componente del Catálogo"
              type="select"
              value={formData.catalogoComponente}
              onChange={(value) => setFormData({...formData, catalogoComponente: value})}
              required
              options={[
                { value: '', label: 'Seleccionar componente...' },
                ...categoriaOptions
              ]}
              disabled={catalogoLoading}
            />
            <p className="text-xs text-gray-500">
              {catalogoLoading ? 'Cargando catálogo...' : 'Seleccione del catálogo de componentes'}
            </p>
          </div>

          <div className="space-y-1">
            <FormField
              label="Nombre (Auto-generado)"
              type="text"
              value={componenteInfo.nombre}
              onChange={() => {}} // Solo lectura
              disabled
              placeholder="Se genera automáticamente del catálogo"
            />
            <p className="text-xs text-gray-500">
              Nombre: <span className="font-medium">{componenteInfo.nombre || 'Ninguno seleccionado'}</span>
              {componenteInfo.categoria && (
                <span className="ml-2 text-blue-600">
                  → Categoría: {componenteInfo.categoria}
                </span>
              )}
            </p>
          </div>

          <div className="space-y-1">
            <FormField
              label="Número de Serie"
              type="text"
              value={formData.numeroSerie}
              onChange={(value) => setFormData({...formData, numeroSerie: value})}
              required
              placeholder="Ej: SN123456, MSN789, etc."
            />
            <p className="text-xs text-gray-500">Número de serie único del componente</p>
          </div>

          <div className="space-y-1">
            <FormField
              label="Número de Parte (P/N)"
              type="text"
              value={formData.numeroParte}
              onChange={(value) => setFormData({...formData, numeroParte: value})}
              required
              placeholder="Ej: PN12345-01, 123-456-789, etc."
            />
            <p className="text-xs text-gray-500">Part Number del fabricante</p>
          </div>

          <FormField
            label="Fabricante"
            type="text"
            value={formData.fabricante}
            onChange={(value) => setFormData({...formData, fabricante: value})}
            required
            placeholder="Ej: Bell, Airbus, Safran, etc."
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

          <div className="space-y-1">
            <FormField
              label="Ubicación Física"
              type="text"
              value={formData.ubicacionFisica}
              onChange={(value) => setFormData({...formData, ubicacionFisica: value})}
              required
              placeholder="Ej: Hangar A-1, Almacén Principal, Instalado"
            />
            <p className="text-xs text-gray-500">Ubicación actual del componente</p>
          </div>
        </div>

        <div className="space-y-1">
          <FormField
            label="Observaciones"
            type="textarea"
            value={formData.observaciones}
            onChange={(value) => setFormData({...formData, observaciones: value})}
            placeholder="Observaciones, condiciones especiales, historial relevante..."
          />
          <p className="text-xs text-gray-500">Información adicional sobre el componente (opcional)</p>
        </div>

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