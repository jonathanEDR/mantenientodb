import React, { useState, useEffect } from 'react';
import { 
  IEstadoMonitoreoComponente, 
  IFormEstadoMonitoreo, 
  IConfiguracionOverhaul,
  UNIDADES_MONITOREO, 
  CRITICIDADES,
  ICatalogoControlMonitoreo
} from '../../types/estadosMonitoreoComponente';
import { obtenerCatalogoControlMonitoreo } from '../../utils/herramientasApi';
import { obtenerComponente } from '../../utils/mantenimientoApi';

interface ModalEstadoMonitoreoProps {
  abierto: boolean;
  estado: IEstadoMonitoreoComponente | null;
  onCerrar: () => void;
  onGuardar: (datos: IFormEstadoMonitoreo) => Promise<boolean>;
  loading: boolean;
  componenteId?: string; // Para poder obtener información de la aeronave
}

const ModalEstadoMonitoreo: React.FC<ModalEstadoMonitoreoProps> = ({
  abierto,
  estado,
  onCerrar,
  onGuardar,
  loading,
  componenteId
}) => {
  const [formData, setFormData] = useState<IFormEstadoMonitoreo>({
    catalogoControlId: '',
    valorActual: 0,
    valorLimite: 100,
    unidad: 'HORAS',
    fechaProximaRevision: '',
    observaciones: '',
    basadoEnAeronave: true, // Por defecto usar horas de aeronave
    offsetInicial: 0,
    configuracionOverhaul: {
      habilitarOverhaul: false,
      intervaloOverhaul: 500,
      ciclosOverhaul: 5,
      cicloActual: 0,
      horasUltimoOverhaul: 0,
      proximoOverhaulEn: 500,
      requiereOverhaul: false,
      observacionesOverhaul: ''
    },
    configuracionPersonalizada: {
      alertaAnticipada: 50,
      criticidad: 'MEDIA',
      requiereParoAeronave: false
    }
  });

  const [catalogos, setCatalogos] = useState<ICatalogoControlMonitoreo[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [componenteInfo, setComponenteInfo] = useState<any>(null);
  const [horasAeronave, setHorasAeronave] = useState<number>(0);

  // Cargar catálogos de control y información del componente
  useEffect(() => {
    const cargarDatos = async () => {
      if (!abierto) return;
      
      setLoadingCatalogos(true);
      try {
        // Cargar catálogos de control
        const resultadoCatalogos = await obtenerCatalogoControlMonitoreo();
        if (resultadoCatalogos.success) {
          setCatalogos(resultadoCatalogos.data);
        }

        // Cargar información del componente si está disponible
        if (componenteId) {
          const resultadoComponente = await obtenerComponente(componenteId);
          if (resultadoComponente.success) {
            setComponenteInfo(resultadoComponente.data);
            // Si el componente tiene aeronave asignada, obtener sus horas
            if (resultadoComponente.data.aeronaveActual) {
              const aeronave = resultadoComponente.data.aeronaveActual;
              // Verificar si es un objeto aeronave completo o solo un ID
              if (typeof aeronave === 'object' && 'horasVuelo' in aeronave) {
                setHorasAeronave(aeronave.horasVuelo || 0);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoadingCatalogos(false);
      }
    };

    cargarDatos();
  }, [abierto, componenteId]);

  // Inicializar formulario cuando cambia el estado a editar
  useEffect(() => {
    if (estado) {
      // Modo edición
      const catalogoControlId = typeof estado.catalogoControlId === 'object' 
        ? estado.catalogoControlId._id 
        : estado.catalogoControlId;

      setFormData({
        catalogoControlId,
        valorActual: estado.valorActual,
        valorLimite: estado.valorLimite,
        unidad: estado.unidad,
        fechaProximaRevision: estado.fechaProximaRevision.split('T')[0], // Solo la fecha
        observaciones: estado.observaciones || '',
        basadoEnAeronave: estado.basadoEnAeronave ?? true,
        offsetInicial: estado.offsetInicial || 0,
        configuracionOverhaul: {
          habilitarOverhaul: estado.configuracionOverhaul?.habilitarOverhaul || false,
          intervaloOverhaul: estado.configuracionOverhaul?.intervaloOverhaul || 500,
          ciclosOverhaul: estado.configuracionOverhaul?.ciclosOverhaul || 5,
          cicloActual: estado.configuracionOverhaul?.cicloActual || 0,
          horasUltimoOverhaul: estado.configuracionOverhaul?.horasUltimoOverhaul || 0,
          proximoOverhaulEn: estado.configuracionOverhaul?.proximoOverhaulEn || 500,
          requiereOverhaul: estado.configuracionOverhaul?.requiereOverhaul || false,
          fechaUltimoOverhaul: estado.configuracionOverhaul?.fechaUltimoOverhaul,
          observacionesOverhaul: estado.configuracionOverhaul?.observacionesOverhaul || ''
        },
        configuracionPersonalizada: {
          alertaAnticipada: estado.configuracionPersonalizada?.alertaAnticipada || 50,
          criticidad: estado.configuracionPersonalizada?.criticidad || 'MEDIA',
          requiereParoAeronave: estado.configuracionPersonalizada?.requiereParoAeronave || false
        }
      });
    } else {
      // Modo creación - resetear formulario
      setFormData({
        catalogoControlId: '',
        valorActual: 0,
        valorLimite: 100,
        unidad: 'HORAS',
        fechaProximaRevision: '',
        observaciones: '',
        basadoEnAeronave: true,
        offsetInicial: 0,
        configuracionOverhaul: {
          habilitarOverhaul: false,
          intervaloOverhaul: 500,
          ciclosOverhaul: 5,
          cicloActual: 0,
          horasUltimoOverhaul: 0,
          proximoOverhaulEn: 500,
          requiereOverhaul: false,
          observacionesOverhaul: ''
        },
        configuracionPersonalizada: {
          alertaAnticipada: 50,
          criticidad: 'MEDIA',
          requiereParoAeronave: false
        }
      });
    }
    setErrores({});
  }, [estado, abierto]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.catalogoControlId) {
      nuevosErrores.catalogoControlId = 'Selecciona un control de monitoreo';
    }

    if (!formData.fechaProximaRevision) {
      nuevosErrores.fechaProximaRevision = 'Selecciona una fecha de próxima revisión';
    }

    if (formData.configuracionPersonalizada?.alertaAnticipada! < 0) {
      nuevosErrores.alertaAnticipada = 'La alerta anticipada no puede ser negativa';
    }

    // Validación básica de que los valores se llenaron correctamente desde el catálogo
    if (formData.valorLimite <= 0) {
      nuevosErrores.catalogoControlId = 'Error en el catálogo seleccionado: valor límite inválido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const exito = await onGuardar(formData);
    if (exito) {
      // El modal se cerrará desde el componente padre
    }
  };

  const handleInputChange = (campo: keyof IFormEstadoMonitoreo, valor: any) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    // Auto-llenar valores cuando se selecciona un catálogo
    if (campo === 'catalogoControlId' && valor) {
      const catalogoSeleccionado = catalogos.find(cat => cat._id === valor);
      if (catalogoSeleccionado) {
        // Calcular valores basándose en el catálogo y horas de aeronave
        const rangoIntervalo = catalogoSeleccionado.horaFinal - catalogoSeleccionado.horaInicial;
        const offsetInicial = horasAeronave; // Usar las horas actuales como offset inicial
        const valorActual = Math.max(0, horasAeronave - catalogoSeleccionado.horaInicial);
        
        setFormData(prev => ({
          ...prev,
          [campo]: valor,
          valorActual: valorActual,
          valorLimite: rangoIntervalo,
          offsetInicial: offsetInicial,
          basadoEnAeronave: true,
          unidad: 'HORAS'
        }));
      }
    }
    
    // Limpiar error del campo si existe
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: ''
      }));
    }
  };

  const handleOverhaulChange = (campo: keyof IConfiguracionOverhaul, valor: any) => {
    setFormData(prev => ({
      ...prev,
      configuracionOverhaul: {
        ...prev.configuracionOverhaul!,
        [campo]: valor
      }
    }));
  };

  const handleConfiguracionChange = (campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      configuracionPersonalizada: {
        ...prev.configuracionPersonalizada!,
        [campo]: valor
      }
    }));
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {estado ? 'Editar Estado de Monitoreo' : 'Nuevo Estado de Monitoreo'}
            </h2>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Control de Monitoreo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Control de Monitoreo *
            </label>
            <select
              value={formData.catalogoControlId}
              onChange={(e) => handleInputChange('catalogoControlId', e.target.value)}
              disabled={loadingCatalogos || !!estado} // Deshabilitar en modo edición
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errores.catalogoControlId ? 'border-red-300' : 'border-gray-300'
              } ${(loadingCatalogos || !!estado) ? 'bg-gray-100' : ''}`}
            >
              <option value="">
                {loadingCatalogos ? 'Cargando...' : 'Selecciona un control'}
              </option>
              {catalogos.map((catalogo) => (
                <option key={catalogo._id} value={catalogo._id}>
                  {catalogo.descripcionCodigo} ({catalogo.horaInicial}h - {catalogo.horaFinal}h)
                </option>
              ))}
            </select>
            {errores.catalogoControlId && (
              <p className="text-red-500 text-sm mt-1">{errores.catalogoControlId}</p>
            )}
          </div>

          {/* Valores (Auto-llenados desde el catálogo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Inicial (Horas) *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.valorActual}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Se llena automáticamente al seleccionar control"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se obtiene automáticamente del catálogo seleccionado
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Límite (Horas) *
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={formData.valorLimite}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Se llena automáticamente al seleccionar control"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se obtiene automáticamente del catálogo seleccionado
              </p>
            </div>
          </div>

          {/* Fecha de Próxima Revisión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Próxima Revisión *
            </label>
            <input
              type="date"
              value={formData.fechaProximaRevision}
              onChange={(e) => handleInputChange('fechaProximaRevision', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errores.fechaProximaRevision ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errores.fechaProximaRevision && (
              <p className="text-red-500 text-sm mt-1">{errores.fechaProximaRevision}</p>
            )}
          </div>

          {/* Configuración Personalizada */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Alertas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alerta Anticipada (unidades antes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.configuracionPersonalizada?.alertaAnticipada || 50}
                  onChange={(e) => handleConfiguracionChange('alertaAnticipada', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criticidad
                </label>
                <select
                  value={formData.configuracionPersonalizada?.criticidad || 'MEDIA'}
                  onChange={(e) => handleConfiguracionChange('criticidad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {CRITICIDADES.map((criticidad) => (
                    <option key={criticidad.value} value={criticidad.value}>
                      {criticidad.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.configuracionPersonalizada?.requiereParoAeronave || false}
                  onChange={(e) => handleConfiguracionChange('requiereParoAeronave', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Requiere paro de aeronave para mantenimiento
                </span>
              </label>
            </div>
          </div>

          {/* Configuración de Overhauls */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Configuración de Overhauls</h3>
            
            {/* Habilitar Overhaul */}
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.configuracionOverhaul?.habilitarOverhaul || false}
                  onChange={(e) => handleOverhaulChange('habilitarOverhaul', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Programar overhauls automáticamente
                </span>
              </label>
            </div>

            {formData.configuracionOverhaul?.habilitarOverhaul && (
              <div className="space-y-4 ml-6 pl-4 border-l border-gray-200">
                {/* Intervalo y Ciclos */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horas entre Overhauls *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.configuracionOverhaul?.intervaloOverhaul || 500}
                      onChange={(e) => handleOverhaulChange('intervaloOverhaul', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cada cuántas horas debe hacerse overhaul</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Ciclos Máximos *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.configuracionOverhaul?.ciclosOverhaul || 5}
                      onChange={(e) => handleOverhaulChange('ciclosOverhaul', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Máximo overhauls permitidos antes de reemplazo</p>
                  </div>
                </div>

                {/* Información del ciclo actual */}
                {formData.configuracionOverhaul?.cicloActual > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">
                        Ciclo actual: {formData.configuracionOverhaul.cicloActual} de {formData.configuracionOverhaul.ciclosOverhaul}
                      </span>
                    </div>
                    {formData.configuracionOverhaul?.fechaUltimoOverhaul && (
                      <p className="text-sm text-blue-600 mt-1">
                        Último overhaul: {new Date(formData.configuracionOverhaul.fechaUltimoOverhaul).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Observaciones de overhaul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones de Overhaul
                  </label>
                  <textarea
                    value={formData.configuracionOverhaul?.observacionesOverhaul || ''}
                    onChange={(e) => handleOverhaulChange('observacionesOverhaul', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observaciones específicas sobre los overhauls de este componente..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones || ''}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observaciones adicionales sobre este estado de monitoreo..."
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCerrar}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {estado ? 'Actualizar' : 'Crear'} Estado
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEstadoMonitoreo;