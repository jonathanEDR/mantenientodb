/**
 * TIPOS TYPESCRIPT PARA SISTEMA DE SEMÁFORO PERSONALIZABLE
 * Compartidos entre backend y frontend
 */

// ===============================
// TIPOS Y INTERFACES
// ===============================

export type ColorSemaforo = 'VERDE' | 'AMARILLO' | 'NARANJA' | 'ROJO' | 'MORADO';

export interface IUmbralesSemaforo {
  morado: number;   // Horas DESPUÉS del límite para mostrar morado (sobre-crítico)
  rojo: number;     // Horas antes para mostrar rojo (más crítico)
  naranja: number;  // Horas antes para mostrar naranja  
  amarillo: number; // Horas antes para mostrar amarillo
  verde: number;    // Horas antes para mostrar verde (menos crítico, generalmente 0)
}

export interface IDescripcionesSemaforo {
  morado: string;   // Ej: "SOBRE-CRÍTICO - Componente vencido en uso"
  rojo: string;     // Ej: "Crítico - Programar overhaul inmediatamente"
  naranja: string;  // Ej: "Alto - Preparar overhaul próximo"  
  amarillo: string; // Ej: "Medio - Monitorear progreso"
  verde: string;    // Ej: "OK - Funcionando normal"
}

export interface ISemaforoPersonalizado {
  habilitado: boolean; // Si usar semáforo personalizado o sistema tradicional
  unidad: 'HORAS' | 'PORCENTAJE'; // Tipo de cálculo
  umbrales: IUmbralesSemaforo;
  descripciones?: IDescripcionesSemaforo;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

// Resultado del cálculo del semáforo
export interface IResultadoSemaforo {
  color: ColorSemaforo;
  descripcion: string;
  horasRestantes: number;
  umbralActual: number;
  porcentajeProgreso: number; // 0-100%
  requiereAtencion: boolean;
  nivel: number; // 0=MORADO(sobre-crítico), 1=ROJO(crítico), 2=NARANJA, 3=AMARILLO, 4=VERDE(ok)
}

// ===============================
// CONFIGURACIONES PREDEFINIDAS
// ===============================

export const CONFIGURACIONES_SEMAFORO_PREDEFINIDAS: Record<string, ISemaforoPersonalizado> = {
  ESTANDAR: {
    habilitado: true,
    unidad: 'HORAS',
    umbrales: {
      morado: 100,  // 100h DESPUÉS del límite - sobre-crítico
      rojo: 100,    // 100h antes - crítico
      naranja: 50,  // 50h antes - alto
      amarillo: 25, // 25h antes - medio  
      verde: 0      // 0h antes - ok
    },
    descripciones: {
      morado: 'SOBRE-CRÍTICO - Componente vencido en uso',
      rojo: 'Crítico - Programar overhaul inmediatamente',
      naranja: 'Alto - Preparar overhaul próximo',
      amarillo: 'Medio - Monitorear progreso',
      verde: 'OK - Funcionando normal'
    }
  },
  
  CONSERVADOR: {
    habilitado: true,
    unidad: 'HORAS',
    umbrales: {
      morado: 50,   // 50h después - sobre-crítico (más estricto)
      rojo: 150,    // Más conservador - 150h antes
      naranja: 100,
      amarillo: 50,
      verde: 25
    },
    descripciones: {
      morado: 'SOBRE-CRÍTICO - ¡Detener operación!',
      rojo: 'Crítico - Acción inmediata requerida',
      naranja: 'Alto - Planificar overhaul urgente',
      amarillo: 'Medio - Iniciar preparativos',
      verde: 'Bajo - Monitoreo regular'
    }
  },
  
  AGRESIVO: {
    habilitado: true,
    unidad: 'HORAS', 
    umbrales: {
      morado: 200,  // 200h después - más tolerante
      rojo: 50,     // Menos conservador - 50h antes
      naranja: 25,
      amarillo: 10,
      verde: 0
    },
    descripciones: {
      morado: 'SOBRE-CRÍTICO - Excedido significativamente',
      rojo: 'Crítico - Overhaul requerido',
      naranja: 'Alto - Preparar herramientas',
      amarillo: 'Medio - Finalizar vuelos',
      verde: 'OK - Operación normal'
    }
  },
  
  PORCENTAJE: {
    habilitado: true,
    unidad: 'PORCENTAJE',
    umbrales: {
      morado: 10,   // 10% después del límite (110%)
      rojo: 95,     // 95% del intervalo consumido
      naranja: 85,  // 85% consumido
      amarillo: 75, // 75% consumido
      verde: 0      // 0-74% consumido
    },
    descripciones: {
      morado: 'SOBRE-CRÍTICO - Excedido +10%',
      rojo: 'Crítico - 95%+ del intervalo consumido',
      naranja: 'Alto - 85%+ del intervalo consumido',
      amarillo: 'Medio - 75%+ del intervalo consumido',
      verde: 'OK - Menos del 75% consumido'
    }
  }
};

// ===============================
// UTILIDADES PARA UI
// ===============================

export const COLORES_CSS: Record<ColorSemaforo, string> = {
  MORADO: '#9333EA',   // purple-600
  ROJO: '#DC2626',     // red-600
  NARANJA: '#EA580C',  // orange-600
  AMARILLO: '#F59E0B', // amber-500  
  VERDE: '#10B981'     // green-500
};

export const COLORES_CSS_CLARO: Record<ColorSemaforo, string> = {
  MORADO: '#F3E8FF',   // purple-100
  ROJO: '#FEE2E2',     // red-100
  NARANJA: '#FED7AA',  // orange-100  
  AMARILLO: '#FEF3C7', // amber-100
  VERDE: '#D1FAE5'     // green-100
};

export const COLORES_TAILWIND: Record<ColorSemaforo, { bg: string; text: string; border: string }> = {
  MORADO: {
    bg: 'bg-purple-600',
    text: 'text-purple-700',
    border: 'border-purple-600'
  },
  ROJO: {
    bg: 'bg-red-600',
    text: 'text-red-700',
    border: 'border-red-600'
  },
  NARANJA: {
    bg: 'bg-orange-600',
    text: 'text-orange-700',
    border: 'border-orange-600'
  },
  AMARILLO: {
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-500'
  },
  VERDE: {
    bg: 'bg-green-500',
    text: 'text-green-700',
    border: 'border-green-500'
  }
};

export const ICONOS_SEMAFORO: Record<ColorSemaforo, string> = {
  MORADO: '�',
  ROJO: '�',
  NARANJA: '🟠',
  AMARILLO: '🟡', 
  VERDE: '�'
};

// ===============================
// FUNCIONES DE UTILIDAD
// ===============================

export function obtenerColorPorNivel(nivel: number): ColorSemaforo {
  switch (nivel) {
    case 1: return 'ROJO';
    case 2: return 'NARANJA';
    case 3: return 'AMARILLO';
    case 4: return 'VERDE';
    default: return 'VERDE';
  }
}

export function obtenerNivelPorColor(color: ColorSemaforo): number {
  switch (color) {
    case 'ROJO': return 1;
    case 'NARANJA': return 2;
    case 'AMARILLO': return 3;
    case 'VERDE': return 4;
    default: return 4;
  }
}

export function validarUmbrales(umbrales: IUmbralesSemaforo, unidad: 'HORAS' | 'PORCENTAJE'): string[] {
  const errores: string[] = [];
  
  // Validar que los umbrales estén en orden descendente (rojo > naranja > amarillo >= verde)
  if (umbrales.rojo <= umbrales.naranja) {
    errores.push('El umbral rojo debe ser mayor que el umbral naranja');
  }
  
  if (umbrales.naranja <= umbrales.amarillo) {
    errores.push('El umbral naranja debe ser mayor que el umbral amarillo');
  }
  
  if (umbrales.amarillo < umbrales.verde) {
    errores.push('El umbral amarillo debe ser mayor o igual que el umbral verde');
  }
  
  // Validar rangos según la unidad
  if (unidad === 'PORCENTAJE') {
    const valores = [umbrales.rojo, umbrales.naranja, umbrales.amarillo, umbrales.verde];
    if (valores.some(v => v < 0 || v > 100)) {
      errores.push('Los umbrales en porcentaje deben estar entre 0 y 100');
    }
  } else if (unidad === 'HORAS') {
    const valores = [umbrales.rojo, umbrales.naranja, umbrales.amarillo, umbrales.verde];
    if (valores.some(v => v < 0)) {
      errores.push('Los umbrales en horas no pueden ser negativos');
    }
  }
  
  return errores;
}

export function formatearHoras(horas: number): string {
  if (horas < 0) return '0h';
  if (horas < 1) return `${Math.round(horas * 60)}min`;
  if (horas >= 1000) return `${(horas / 1000).toFixed(1)}kh`;
  return `${Math.round(horas)}h`;
}

export function formatearPorcentaje(porcentaje: number): string {
  return `${Math.round(porcentaje)}%`;
}