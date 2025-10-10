import { ColorSemaforo, IResultadoSemaforo, ISemaforoPersonalizado } from '../types/semaforoPersonalizado';

/**
 * Calcula el color del semáforo basado en horas restantes y estado de overhaul
 * Función utilitaria para usar en componentes sin hooks
 * 
 * PRIORIDADES DE CÁLCULO:
 * 1. Si estado = 'OVERHAUL_REQUERIDO' → ROJO (máxima prioridad)
 * 2. Si vencido (excedió límite + umbral morado) → MORADO
 * 3. Si horasRestantes <= 0 (alcanzó o superó límite) → ROJO
 * 4. Evaluar según umbrales normales del semáforo
 * 
 * NOTA: No confiar en requiereOverhaul del backend, calculamos basado en horas
 */
export function calcularSemaforoSimple(
  horasRestantes: number,
  configuracion: ISemaforoPersonalizado | undefined,
  opciones?: {
    requiereOverhaul?: boolean;
    estado?: 'OK' | 'PROXIMO' | 'VENCIDO' | 'OVERHAUL_REQUERIDO';
  }
): IResultadoSemaforo {
  
  // ===== PRIORIDAD 1: ESTADO EXPLÍCITO OVERHAUL_REQUERIDO =====
  // Solo confiar en el estado si es explícitamente OVERHAUL_REQUERIDO
  if (opciones?.estado === 'OVERHAUL_REQUERIDO') {
    return {
      color: 'ROJO',
      descripcion: 'Overhaul Requerido',
      horasRestantes,
      umbralActual: 0,
      porcentajeProgreso: 100,
      requiereAtencion: true,
      nivel: 1
    };
  }
  
  // Si no hay configuración de semáforo, retornar estado por defecto
  if (!configuracion || !configuracion.habilitado) {
    return {
      color: 'VERDE' as ColorSemaforo,
      descripcion: 'OK',
      horasRestantes,
      umbralActual: 0,
      porcentajeProgreso: 0,
      requiereAtencion: false,
      nivel: 4
    };
  }

  const { umbrales, descripciones } = configuracion;
  let color: ColorSemaforo = 'VERDE';
  let descripcion = descripciones?.verde || 'OK';
  let nivel = 4;
  let umbralActual = umbrales.verde;
  let requiereAtencion = false;

  // ===== LÓGICA DE COLORES DEL SEMÁFORO =====
  // MORADO: Componente VENCIDO (horas restantes negativas Y pasó el umbral morado)
  if (horasRestantes < 0 && Math.abs(horasRestantes) > umbrales.morado) {
    color = 'MORADO';
    descripcion = descripciones?.morado || 'SOBRE-CRÍTICO - Componente vencido en uso';
    nivel = 0; // Máxima criticidad
    umbralActual = umbrales.morado;
    requiereAtencion = true;
  }
  // ROJO: Crítico (menos de X horas antes del límite o vencido pero dentro del umbral morado)
  else if (horasRestantes <= umbrales.rojo) {
    color = 'ROJO';
    descripcion = descripciones?.rojo || 'Crítico - Programar overhaul inmediatamente';
    nivel = 1;
    umbralActual = umbrales.rojo;
    requiereAtencion = true;
  }
  // NARANJA: Alto (menos de X horas antes)
  else if (horasRestantes <= umbrales.naranja) {
    color = 'NARANJA';
    descripcion = descripciones?.naranja || 'Alto - Preparar overhaul próximo';
    nivel = 2;
    umbralActual = umbrales.naranja;
    requiereAtencion = true;
  }
  // AMARILLO: Medio (menos de X horas antes)
  else if (horasRestantes <= umbrales.amarillo) {
    color = 'AMARILLO';
    descripcion = descripciones?.amarillo || 'Medio - Monitorear progreso';
    nivel = 3;
    umbralActual = umbrales.amarillo;
    requiereAtencion = false;
  }
  // VERDE: OK (más de X horas antes)
  else {
    color = 'VERDE';
    descripcion = descripciones?.verde || 'OK - Operación normal';
    nivel = 4;
    umbralActual = umbrales.verde;
    requiereAtencion = false;
  }

  return {
    color,
    descripcion,
    horasRestantes,
    umbralActual,
    porcentajeProgreso: 0, // Se calcula en el componente que lo usa
    requiereAtencion,
    nivel
  };
}
