import React, { useState, useEffect } from 'react';
import { 
  IEstadoMonitoreoComponente, 
  IFormEstadoMonitoreo, 
  IConfiguracionOverhaul,
  UNIDADES_MONITOREO, 
  CRITICIDADES,
  ICatalogoControlMonitoreo
} from '../../types/estadosMonitoreoComponente';
import { 
  ISemaforoPersonalizado,
  CONFIGURACIONES_SEMAFORO_PREDEFINIDAS,
  COLORES_CSS,
  ICONOS_SEMAFORO,
  validarUmbrales
} from '../../types/semaforoPersonalizado';
import { obtenerCatalogoControlMonitoreo } from '../../utils/herramientasApi';
import { obtenerComponente } from '../../utils/mantenimientoApi';
import SemaforoIndicador from '../common/SemaforoIndicador';
import useSemaforo from '../../hooks/useSemaforo';

/**
 * ========== FUNCIÓN HELPER: CALCULAR UMBRALES AUTOMÁTICOS ==========
 * Ajusta los umbrales del semáforo basándose en el límite del control de monitoreo
 * 
 * @param valorLimite - Límite del control (ej: 105h, 200h, etc.)
 * @param configBase - Configuración predefinida base (ESTANDAR, CONSERVADOR, AGRESIVO, PORCENTAJE)
 * @returns ISemaforoPersonalizado con umbrales ajustados al límite
 */
const calcularUmbralesAutomaticos = (
  valorLimite: number, 
  configBase: ISemaforoPersonalizado = CONFIGURACIONES_SEMAFORO_PREDEFINIDAS.PORCENTAJE
): ISemaforoPersonalizado => {
  
  // Si la configuración base usa PORCENTAJE, devolver tal cual
  // Los porcentajes se aplican dinámicamente en el cálculo del semáforo
  if (configBase.unidad === 'PORCENTAJE') {
    return { ...configBase };
  }
  
  // Si usa HORAS, necesitamos escalar proporcionalmente al valorLimite
  // Tomamos como referencia un límite base de 100h (configuración ESTANDAR original)
  const LIMITE_BASE_REFERENCIA = 100;
  const factorEscala = valorLimite / LIMITE_BASE_REFERENCIA;
  
  return {
    ...configBase,
    umbrales: {
      morado: Math.round(configBase.umbrales.morado * factorEscala),
      rojo: Math.round(configBase.umbrales.rojo * factorEscala),
      naranja: Math.round(configBase.umbrales.naranja * factorEscala),
      amarillo: Math.round(configBase.umbrales.amarillo * factorEscala),
      verde: Math.round(configBase.umbrales.verde * factorEscala)
    }
  };
};

// Componente interno para preview del semáforo
const SemaforoPreview: React.FC<{ configuracion: ISemaforoPersonalizado; intervaloOverhaul: number }> = ({ 
  configuracion, 
  intervaloOverhaul 
}) => {
  // Generar ejemplos de diferentes estados
  const ejemplos = [
    { label: 'Ejemplo: 5h restantes', horas: 5 },
    { label: 'Ejemplo: 30h restantes', horas: 30 },
    { label: 'Ejemplo: 60h restantes', horas: 60 },
    { label: 'Ejemplo: 150h restantes', horas: 150 }
  ];

  return (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
      <h5 className="text-sm font-medium text-gray-700 mb-3">🔍 Preview del Semáforo</h5>
      <div className="space-y-2">
        {ejemplos.map(ejemplo => {
          const { resultado, esValido } = useSemaforo({
            horasRestantes: ejemplo.horas,
            intervaloOverhaul,
            configuracion
          });
          
          return (
            <div key={ejemplo.horas} className="flex items-center justify-between p-2 bg-white rounded border">
              <span className="text-xs text-gray-600">{ejemplo.label}</span>
              {esValido ? (
                <SemaforoIndicador 
                  resultado={resultado}
                  tamaño="pequeño"
                  mostrarDescripcion={false}
                  mostrarHoras={false}
                />
              ) : (
                <span className="text-xs text-red-500">Config. inválida</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
    observaciones: '',
    basadoEnAeronave: true, // Por defecto usar horas de aeronave
    offsetInicial: 0,
    configuracionOverhaul: {
      habilitarOverhaul: true, // ✅ Habilitado por defecto
      intervaloOverhaul: 100, // Se calculará automáticamente
      ciclosOverhaul: 1, // ✅ Por defecto 1 ciclo
      cicloActual: 0,
      horasUltimoOverhaul: 0,
      proximoOverhaulEn: 500,
      requiereOverhaul: false,
      observacionesOverhaul: '',
      requiereParoAeronave: false,
      // ===== SISTEMA DE SEMÁFORO =====
      semaforoPersonalizado: {
        habilitado: true, // Activado por defecto
        unidad: 'HORAS',
        umbrales: {
          morado: 100,
          rojo: 100,
          naranja: 50,
          amarillo: 25,
          verde: 0
        },
        descripciones: {
          morado: 'SOBRE-CRÍTICO - Componente vencido en uso',
          rojo: 'Crítico - Programar overhaul inmediatamente',
          naranja: 'Alto - Preparar overhaul próximo',
          amarillo: 'Medio - Monitorear progreso',
          verde: 'OK - Funcionando normal'
        }
      }
    },
    configuracionPersonalizada: {
      requiereParoAeronave: false,
      semaforoPersonalizado: {
        habilitado: true, // Activado por defecto
        unidad: 'HORAS',
        umbrales: {
          morado: 100,
          rojo: 100,
          naranja: 50,
          amarillo: 25,
          verde: 0
        },
        descripciones: {
          morado: 'SOBRE-CRÍTICO - Componente vencido en uso',
          rojo: 'Crítico - Acción inmediata requerida',
          naranja: 'Alto - Planificar mantenimiento pronto',
          amarillo: 'Medio - Monitorear de cerca',
          verde: 'OK - Funcionando correctamente'
        }
      }
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
          observacionesOverhaul: estado.configuracionOverhaul?.observacionesOverhaul || '',
          requiereParoAeronave: estado.configuracionOverhaul?.requiereParoAeronave || false,
          // ===== SISTEMA DE SEMÁFORO =====
          semaforoPersonalizado: estado.configuracionOverhaul?.semaforoPersonalizado || 
            CONFIGURACIONES_SEMAFORO_PREDEFINIDAS.PORCENTAJE // ✅ Usar PORCENTAJE por defecto
        },
        configuracionPersonalizada: {
          requiereParoAeronave: estado.configuracionPersonalizada?.requiereParoAeronave || false,
          semaforoPersonalizado: estado.configuracionPersonalizada?.semaforoPersonalizado || 
            CONFIGURACIONES_SEMAFORO_PREDEFINIDAS.PORCENTAJE // ✅ Usar PORCENTAJE por defecto
        }
      });
    } else {
      // Modo creación - resetear formulario
      setFormData({
        catalogoControlId: '',
        valorActual: 0,
        valorLimite: 100,
        unidad: 'HORAS',

        observaciones: '',
        basadoEnAeronave: true,
        offsetInicial: 0,
        configuracionOverhaul: {
          habilitarOverhaul: true, // ✅ Habilitado por defecto al resetear
          intervaloOverhaul: 100, // Se calculará automáticamente
          ciclosOverhaul: 1, // ✅ Por defecto 1 ciclo
          cicloActual: 0,
          horasUltimoOverhaul: 0,
          proximoOverhaulEn: 500,
          requiereOverhaul: false,
          observacionesOverhaul: '',
          requiereParoAeronave: false,
          // ===== SISTEMA DE SEMÁFORO =====
          semaforoPersonalizado: CONFIGURACIONES_SEMAFORO_PREDEFINIDAS.PORCENTAJE // ✅ Usar PORCENTAJE por defecto
        },
        configuracionPersonalizada: {
          requiereParoAeronave: false,
          semaforoPersonalizado: CONFIGURACIONES_SEMAFORO_PREDEFINIDAS.PORCENTAJE // ✅ Usar PORCENTAJE por defecto
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
        
        // ===== CALCULAR VALORES PARA OVERHAULS =====
        const ciclosInicial = 1; // Empezar con 1 ciclo por defecto
        const intervaloOverhaulInicial = rangoIntervalo / ciclosInicial; // Horas entre overhauls
        
        // ===== CALCULAR UMBRALES BASÁNDOSE EN HORAS ENTRE OVERHAULS =====
        // Usar las "Horas entre Overhauls" como base para el semáforo
        const semaforoAjustadoOverhaul = calcularUmbralesAutomaticos(
          intervaloOverhaulInicial,
          CONFIGURACIONES_SEMAFORO_PREDEFINIDAS.PORCENTAJE
        );
        
        // Para configuración sin overhaul, usar el límite total
        const semaforoAjustadoGeneral = calcularUmbralesAutomaticos(
          rangoIntervalo,
          CONFIGURACIONES_SEMAFORO_PREDEFINIDAS.PORCENTAJE
        );
        
        setFormData(prev => ({
          ...prev,
          [campo]: valor,
          valorActual: valorActual,
          valorLimite: rangoIntervalo,
          offsetInicial: offsetInicial,
          basadoEnAeronave: true,
          unidad: 'HORAS',
          // Actualizar semáforo para estados sin overhaul
          configuracionPersonalizada: {
            ...prev.configuracionPersonalizada!,
            semaforoPersonalizado: semaforoAjustadoGeneral
          },
          // Actualizar semáforo para estados con overhaul
          configuracionOverhaul: {
            ...prev.configuracionOverhaul!,
            ciclosOverhaul: ciclosInicial, // ✅ Iniciar con 1 ciclo
            intervaloOverhaul: intervaloOverhaulInicial, // ✅ Calcular: Límite Total / Ciclos
            semaforoPersonalizado: semaforoAjustadoOverhaul // ✅ Basado en horas entre overhauls
          }
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
    setFormData(prev => {
      // ===== CÁLCULO AUTOMÁTICO DE INTERVALO BASADO EN CICLOS =====
      // Si el campo que cambia es 'ciclosOverhaul', recalcular 'intervaloOverhaul' y 'umbrales'
      if (campo === 'ciclosOverhaul' && valor > 0) {
        const valorLimiteTotal = prev.valorLimite || 100; // Límite total del control
        const nuevoIntervalo = Math.round((valorLimiteTotal / valor) * 100) / 100; // Redondear a 2 decimales
        
        // ===== RECALCULAR UMBRALES BASÁNDOSE EN EL NUEVO INTERVALO =====
        const semaforoActual = prev.configuracionOverhaul!.semaforoPersonalizado!;
        const nuevoSemaforo = calcularUmbralesAutomaticos(
          nuevoIntervalo,
          semaforoActual // Mantener la configuración actual (PORCENTAJE, ESTANDAR, etc.)
        );
        
        return {
          ...prev,
          configuracionOverhaul: {
            ...prev.configuracionOverhaul!,
            ciclosOverhaul: valor,
            intervaloOverhaul: nuevoIntervalo, // ✅ Recalcular intervalo
            semaforoPersonalizado: {
              ...nuevoSemaforo,
              habilitado: true // ✅ Mantener habilitado
            }
          }
        };
      }
      
      // Para otros campos, actualizar normalmente
      return {
        ...prev,
        configuracionOverhaul: {
          ...prev.configuracionOverhaul!,
          [campo]: valor
        }
      };
    });
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

  // ===== FUNCIONES PARA MANEJO DE SEMÁFORO =====
  const handleSemaforoChange = (campo: keyof ISemaforoPersonalizado, valor: any) => {
    setFormData(prev => ({
      ...prev,
      configuracionOverhaul: {
        ...prev.configuracionOverhaul!,
        semaforoPersonalizado: {
          ...prev.configuracionOverhaul!.semaforoPersonalizado!,
          [campo]: valor
        }
      }
    }));
  };

  const handleUmbralesChange = (color: 'rojo' | 'naranja' | 'amarillo' | 'verde', valor: number) => {
    setFormData(prev => ({
      ...prev,
      configuracionOverhaul: {
        ...prev.configuracionOverhaul!,
        semaforoPersonalizado: {
          ...prev.configuracionOverhaul!.semaforoPersonalizado!,
          umbrales: {
            ...prev.configuracionOverhaul!.semaforoPersonalizado!.umbrales,
            [color]: valor
          }
        }
      }
    }));
  };

  const handleDescripcionChange = (color: 'rojo' | 'naranja' | 'amarillo' | 'verde', descripcion: string) => {
    setFormData(prev => ({
      ...prev,
      configuracionOverhaul: {
        ...prev.configuracionOverhaul!,
        semaforoPersonalizado: {
          ...prev.configuracionOverhaul!.semaforoPersonalizado!,
          descripciones: {
            ...prev.configuracionOverhaul!.semaforoPersonalizado!.descripciones!,
            [color]: descripcion
          }
        }
      }
    }));
  };

  const aplicarConfiguracionPredefinida = (nombreConfig: string) => {
    const config = CONFIGURACIONES_SEMAFORO_PREDEFINIDAS[nombreConfig];
    if (config) {
      setFormData(prev => {
        // ===== CALCULAR UMBRALES BASADOS EN HORAS ENTRE OVERHAULS =====
        // Usar las "Horas entre Overhauls" calculadas automáticamente como base
        const horasEntreOverhauls = prev.configuracionOverhaul!.intervaloOverhaul || 100;
        const semaforoAjustado = calcularUmbralesAutomaticos(horasEntreOverhauls, config);
        
        return {
          ...prev,
          configuracionOverhaul: {
            ...prev.configuracionOverhaul!,
            semaforoPersonalizado: {
              ...semaforoAjustado,
              habilitado: true // ✅ Siempre habilitado
            }
          }
        };
      });
    }
  };

  // ===== FUNCIONES PARA MANEJO DE SEMÁFORO PERSONALIZADO (SIN OVERHAUL) =====
  const handleSemaforoPersonalizadoChange = (campo: keyof ISemaforoPersonalizado, valor: any) => {
    setFormData(prev => ({
      ...prev,
      configuracionPersonalizada: {
        ...prev.configuracionPersonalizada!,
        semaforoPersonalizado: {
          ...prev.configuracionPersonalizada!.semaforoPersonalizado!,
          [campo]: valor
        }
      }
    }));
  };

  const handleUmbralesPersonalizadoChange = (color: 'rojo' | 'naranja' | 'amarillo' | 'verde', valor: number) => {
    setFormData(prev => ({
      ...prev,
      configuracionPersonalizada: {
        ...prev.configuracionPersonalizada!,
        semaforoPersonalizado: {
          ...prev.configuracionPersonalizada!.semaforoPersonalizado!,
          umbrales: {
            ...prev.configuracionPersonalizada!.semaforoPersonalizado!.umbrales,
            [color]: valor
          }
        }
      }
    }));
  };

  const handleDescripcionPersonalizadaChange = (color: 'rojo' | 'naranja' | 'amarillo' | 'verde', descripcion: string) => {
    setFormData(prev => ({
      ...prev,
      configuracionPersonalizada: {
        ...prev.configuracionPersonalizada!,
        semaforoPersonalizado: {
          ...prev.configuracionPersonalizada!.semaforoPersonalizado!,
          descripciones: {
            ...prev.configuracionPersonalizada!.semaforoPersonalizado!.descripciones!,
            [color]: descripcion
          }
        }
      }
    }));
  };

  const aplicarConfiguracionPredefinidaPersonalizada = (nombreConfig: string) => {
    const config = CONFIGURACIONES_SEMAFORO_PREDEFINIDAS[nombreConfig];
    if (config) {
      setFormData(prev => {
        // ===== CALCULAR UMBRALES AJUSTADOS AL LÍMITE ACTUAL =====
        const limiteActual = prev.valorLimite || 100;
        const semaforoAjustado = calcularUmbralesAutomaticos(limiteActual, config);
        
        return {
          ...prev,
          configuracionPersonalizada: {
            ...prev.configuracionPersonalizada!,
            semaforoPersonalizado: {
              ...semaforoAjustado,
              habilitado: true // Siempre activado para configuración personalizada
            }
          }
        };
      });
    }
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



          {/* Configuración de Overhauls */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">🔧 Configuración de Overhauls</h3>
              <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                Sistema automático de mantenimiento preventivo
              </span>
            </div>
            
            {/* Configuración siempre visible */}
            <div className="space-y-4">
                {/* Ciclos y Intervalo (orden invertido, ciclos primero) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Ciclos Máximos *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.configuracionOverhaul?.ciclosOverhaul || 1}
                      onChange={(e) => handleOverhaulChange('ciclosOverhaul', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Define cuántos overhauls antes de reemplazo
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      Horas entre Overhauls *
                      <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Auto-calculado
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.configuracionOverhaul?.intervaloOverhaul || 100}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="100"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      = Límite Total ({formData.valorLimite || 100}h) / Ciclos ({formData.configuracionOverhaul?.ciclosOverhaul || 1})
                    </p>
                  </div>
                </div>

                {/* Información del ciclo actual */}
                {formData.configuracionOverhaul?.cicloActual && formData.configuracionOverhaul.cicloActual > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">
                        Ciclo actual: {formData.configuracionOverhaul.cicloActual} de {formData.configuracionOverhaul.ciclosOverhaul || 5}
                      </span>
                    </div>
                    {formData.configuracionOverhaul.fechaUltimoOverhaul && (
                      <p className="text-sm text-blue-600 mt-1">
                        Último overhaul: {new Date(formData.configuracionOverhaul.fechaUltimoOverhaul).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* ===== CONFIGURACIÓN DE ALERTAS PARA OVERHAULS ===== */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    🚦 Sistema de Semáforo Personalizable
                  </h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Sistema avanzado con 5 colores y umbrales personalizables basados en las horas entre overhauls
                  </p>

                  {/* Sistema de Semáforo (Siempre visible) */}
                  <div className="space-y-4">
                      {/* Configuraciones Predefinidas */}
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Configuraciones Predefinidas
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.keys(CONFIGURACIONES_SEMAFORO_PREDEFINIDAS).map(nombre => (
                            <button
                              key={nombre}
                              type="button"
                              onClick={() => aplicarConfiguracionPredefinida(nombre)}
                              className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              {nombre}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Configuración de Umbrales */}
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">
                            Umbrales del Semáforo
                          </label>
                          <select
                            value={formData.configuracionOverhaul?.semaforoPersonalizado?.unidad || 'HORAS'}
                            onChange={(e) => handleSemaforoChange('unidad', e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="HORAS">Horas</option>
                            <option value="PORCENTAJE">Porcentaje</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {['morado', 'rojo', 'naranja', 'amarillo', 'verde'].map(color => (
                            <div key={color} className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: COLORES_CSS[color.toUpperCase() as keyof typeof COLORES_CSS] }}
                                />
                                <label className="text-xs font-medium text-gray-700 capitalize">
                                  {color}
                                </label>
                              </div>
                              <input
                                type="number"
                                min="0"
                                max={formData.configuracionOverhaul?.semaforoPersonalizado?.unidad === 'PORCENTAJE' ? 100 : undefined}
                                value={formData.configuracionOverhaul?.semaforoPersonalizado?.umbrales[color as keyof typeof formData.configuracionOverhaul.semaforoPersonalizado.umbrales] || 0}
                                onChange={(e) => handleUmbralesChange(color as any, parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                placeholder="0"
                              />
                              <input
                                type="text"
                                value={formData.configuracionOverhaul?.semaforoPersonalizado?.descripciones?.[color as keyof typeof formData.configuracionOverhaul.semaforoPersonalizado.descripciones] || ''}
                                onChange={(e) => handleDescripcionChange(color as any, e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                placeholder={`Descripción ${color}...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  {/* Paro de Aeronave */}
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.configuracionOverhaul?.requiereParoAeronave || false}
                        onChange={(e) => handleOverhaulChange('requiereParoAeronave', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        El overhaul requiere paro de aeronave
                      </span>
                    </label>
                  </div>
                </div>
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