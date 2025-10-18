import { ColorSemaforo, IResultadoSemaforo, ISemaforoPersonalizado } from '../types/semaforoPersonalizado';

/**
 * Calcula el color del semáforo basado en horas restantes y estado de overhaul
 * Función utilitaria para usar en componentes sin hooks
 *
 * PRIORIDADES DE CÁLCULO (sincronizada con backend):
 * 1. Si requiereOverhaul = true O estado = 'OVERHAUL_REQUERIDO' → ROJO (máxima prioridad)
 * 2. Si vencido (excedió límite + umbral morado) → MORADO
 * 3. Si horasRestantes <= 0 (alcanzó límite) → ROJO
 * 4. Si horasRestantes <= umbral.amarillo → ROJO (crítico, menos horas que amarillo)
 * 5. Si horasRestantes <= umbral.naranja → NARANJA
 * 6. Si horasRestantes <= umbral.rojo → AMARILLO
 * 7. Si horasRestantes > umbral.rojo → VERDE
 *
 * IMPORTANTE: Esta lógica está sincronizada con SemaforoCalculatorService.ts del backend
 */
export function calcularSemaforoSimple(
  horasRestantes: number,
  configuracion: ISemaforoPersonalizado | undefined,
  opciones?: {
    requiereOverhaul?: boolean;
    estado?: 'OK' | 'PROXIMO' | 'VENCIDO' | 'OVERHAUL_REQUERIDO';
    debug?: boolean;  // Activar logs de diagnóstico
  }
): IResultadoSemaforo {

  // ===== PRIORIDAD 1: OVERHAUL REQUERIDO =====
  // Verificar tanto el flag requiereOverhaul como el estado OVERHAUL_REQUERIDO
  if (opciones?.requiereOverhaul === true || opciones?.estado === 'OVERHAUL_REQUERIDO') {
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
  let descripcion = descripciones?.verde || 'OK - Operación normal';
  let nivel = 4;
  let umbralActual = umbrales.verde;
  let requiereAtencion = false;

  // ===== LÓGICA DE COLORES DEL SEMÁFORO (sincronizada con backend) =====
  // CORREGIDA para coincidir exactamente con SemaforoCalculatorService.ts

  // MORADO: Componente SOBRE-CRÍTICO (excedió el límite por más del umbral morado)
  if (horasRestantes < -umbrales.morado) {
    color = 'MORADO';
    descripcion = descripciones?.morado || 'SOBRE-CRÍTICO - Componente vencido en uso';
    nivel = 0; // Máxima criticidad
    umbralActual = -umbrales.morado;
    requiereAtencion = true;
  }
  // ROJO: En el límite o justo pasado (horas restantes <= 0)
  else if (horasRestantes <= 0) {
    color = 'ROJO';
    descripcion = descripciones?.rojo || 'Crítico - Programar overhaul inmediatamente';
    nivel = 1;
    umbralActual = 0;
    requiereAtencion = true;
  }
  // ROJO: Crítico (restantes ≤ umbral más bajo - amarillo)
  else if (horasRestantes <= umbrales.amarillo) {
    color = 'ROJO';
    descripcion = descripciones?.rojo || 'Crítico - Programar overhaul inmediatamente';
    nivel = 1;
    umbralActual = umbrales.amarillo;
    requiereAtencion = true;
  }
  // NARANJA: Alto (entre umbral amarillo y naranja)
  else if (horasRestantes <= umbrales.naranja) {
    color = 'NARANJA';
    descripcion = descripciones?.naranja || 'Alto - Preparar overhaul próximo';
    nivel = 2;
    umbralActual = umbrales.naranja;
    requiereAtencion = true;
  }
  // AMARILLO: Medio (entre umbral naranja y rojo)
  else if (horasRestantes <= umbrales.rojo) {
    color = 'AMARILLO';
    descripcion = descripciones?.amarillo || 'Medio - Monitorear progreso';
    nivel = 3;
    umbralActual = umbrales.rojo;
    requiereAtencion = false;
  }
  // VERDE: OK (más horas que el umbral rojo)
  else {
    color = 'VERDE';
    descripcion = descripciones?.verde || 'OK - Operación normal';
    nivel = 4;
    umbralActual = umbrales.rojo;
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
