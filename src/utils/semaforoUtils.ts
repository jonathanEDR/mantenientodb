import { ColorSemaforo, IResultadoSemaforo, ISemaforoPersonalizado } from '../types/semaforoPersonalizado';

/**
 * ===== NUEVA LÓGICA DE SEMÁFORO SIMPLIFICADA =====
 * 
 * Calcula el color del semáforo basado en HORAS ACUMULADAS (TSO)
 * 
 * IMPORTANTE: Los umbrales representan "horas acumuladas" para activar cada color
 * 
 * Ejemplo con límite de 10h:
 * - Verde (0-5h): 0h → 4h ✅ VERDE
 * - Amarillo (5-7h): 5h → 6h ✅ AMARILLO  
 * - Naranja (7-9h): 7h ✅ NARANJA
 * - Rojo (9h-límite): 9h ✅ ROJO
 * - Morado (límite+): 11h+ ✅ MORADO (excedió)
 * 
 * @param horasAcumuladas - Horas TSO acumuladas desde último overhaul
 * @param intervaloOverhaul - Límite de horas para el ciclo actual
 * @param configuracion - Configuración de umbrales del semáforo
 */
export function calcularSemaforoSimple(
  horasAcumuladas: number,  // ✅ Cambio: ahora recibe horas acumuladas (TSO)
  configuracion: ISemaforoPersonalizado | undefined,
  opciones?: {
    intervaloOverhaul?: number;  // ✅ Nuevo: límite del ciclo
    requiereOverhaul?: boolean;
    estado?: 'OK' | 'PROXIMO' | 'VENCIDO' | 'OVERHAUL_REQUERIDO';
  }
): IResultadoSemaforo {

  const intervaloOverhaul = opciones?.intervaloOverhaul || 100;
  const horasRestantes = intervaloOverhaul - horasAcumuladas;

  // ===== PRIORIDAD 1: OVERHAUL REQUERIDO =====
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

  // Si no hay configuración, retornar verde por defecto
  if (!configuracion || !configuracion.habilitado) {
    return {
      color: 'VERDE' as ColorSemaforo,
      descripcion: 'OK - Operación normal',
      horasRestantes,
      umbralActual: 0,
      porcentajeProgreso: 0,
      requiereAtencion: false,
      nivel: 4
    };
  }

  const { umbrales, descripciones } = configuracion;

  // ===== NUEVA LÓGICA: EVALUAR HORAS ACUMULADAS (TSO) =====
  // Los umbrales representan "cuántas horas acumuladas" activan cada color
  
  const umbralMorado = umbrales.morado || 0;      // Tolerancia de exceso (ej: 1h)
  const umbralRojo = umbrales.rojo || 0;          // Horas para rojo (ej: 9h)
  const umbralNaranja = umbrales.naranja || 0;    // Horas para naranja (ej: 7h)
  const umbralAmarillo = umbrales.amarillo || 0;  // Horas para amarillo (ej: 5h)

  let color: ColorSemaforo;
  let descripcion: string;
  let nivel: number;
  let umbralActual: number;
  let requiereAtencion: boolean;

  // 🟣 MORADO: Excedió el límite + tolerancia
  if (horasAcumuladas >= intervaloOverhaul + umbralMorado) {
    color = 'MORADO';
    descripcion = descripciones?.morado || 'SOBRE-CRÍTICO - Componente vencido en uso';
    nivel = 0;
    umbralActual = intervaloOverhaul + umbralMorado;
    requiereAtencion = true;
  }
  // 🔴 ROJO: Llegó al umbral rojo (ej: 9h de 10h)
  else if (horasAcumuladas >= umbralRojo) {
    color = 'ROJO';
    descripcion = descripciones?.rojo || 'Crítico - Programar overhaul inmediatamente';
    nivel = 1;
    umbralActual = umbralRojo;
    requiereAtencion = true;
  }
  // 🟠 NARANJA: Llegó al umbral naranja (ej: 7h de 10h)
  else if (horasAcumuladas >= umbralNaranja) {
    color = 'NARANJA';
    descripcion = descripciones?.naranja || 'Alto - Preparar overhaul próximo';
    nivel = 2;
    umbralActual = umbralNaranja;
    requiereAtencion = true;
  }
  // 🟡 AMARILLO: Llegó al umbral amarillo (ej: 5h de 10h)
  else if (horasAcumuladas >= umbralAmarillo) {
    color = 'AMARILLO';
    descripcion = descripciones?.amarillo || 'Medio - Monitorear progreso';
    nivel = 3;
    umbralActual = umbralAmarillo;
    requiereAtencion = false;
  }
  // 🟢 VERDE: Aún está en rango seguro (< umbral amarillo)
  else {
    color = 'VERDE';
    descripcion = descripciones?.verde || 'OK - Operación normal';
    nivel = 4;
    umbralActual = umbralAmarillo;
    requiereAtencion = false;
  }

  const porcentajeProgreso = Math.min(100, (horasAcumuladas / intervaloOverhaul) * 100);

  return {
    color,
    descripcion,
    horasRestantes,
    umbralActual,
    porcentajeProgreso,
    requiereAtencion,
    nivel
  };
}
