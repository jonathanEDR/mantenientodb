/**
 * ===== HOOK PARA CÁLCULO DE SEMÁFORO (NUEVA LÓGICA) =====
 * 
 * Calcula el estado del semáforo basándose en HORAS ACUMULADAS (TSO)
 * Útil para preview en tiempo real mientras se configuran los umbrales
 */

import { useMemo } from 'react';
import { 
  ISemaforoPersonalizado, 
  IResultadoSemaforo, 
  ColorSemaforo,
  validarUmbrales
} from '../types/semaforoPersonalizado';

interface UseSemaforoParams {
  horasRestantes: number;  // Mantenemos el nombre por compatibilidad, pero se usa para calcular horasAcumuladas
  intervaloOverhaul: number;
  configuracion: ISemaforoPersonalizado;
}

export const useSemaforo = ({ horasRestantes, intervaloOverhaul, configuracion }: UseSemaforoParams) => {
  
  const resultado = useMemo((): IResultadoSemaforo => {
    // Validar configuración
    const errores = validarUmbrales(configuracion.umbrales, configuracion.unidad);
    if (errores.length > 0) {
      return {
        color: 'VERDE',
        descripcion: 'Configuración inválida',
        horasRestantes: Math.max(0, horasRestantes),
        umbralActual: 0,
        porcentajeProgreso: 0,
        requiereAtencion: false,
        nivel: 4
      };
    }

    const { umbrales, descripciones } = configuracion;
    
    // ===== NUEVA LÓGICA: CALCULAR BASADO EN HORAS ACUMULADAS =====
    // Convertir horasRestantes a horasAcumuladas
    const horasAcumuladas = intervaloOverhaul - horasRestantes;
    const porcentajeProgreso = Math.min(100, Math.max(0, (horasAcumuladas / intervaloOverhaul) * 100));
    
    const umbralMorado = umbrales.morado || 0;
    const umbralRojo = umbrales.rojo || 0;
    const umbralNaranja = umbrales.naranja || 0;
    const umbralAmarillo = umbrales.amarillo || 0;

    let color: ColorSemaforo;
    let umbralActual: number;
    let nivel: number;
    
    // 🟣 MORADO: Excedió el límite + tolerancia
    if (horasAcumuladas >= intervaloOverhaul + umbralMorado) {
      color = 'MORADO';
      umbralActual = intervaloOverhaul + umbralMorado;
      nivel = 0;
    }
    // 🔴 ROJO: Llegó al umbral rojo
    else if (horasAcumuladas >= umbralRojo) {
      color = 'ROJO';
      umbralActual = umbralRojo;
      nivel = 1;
    }
    // 🟠 NARANJA: Llegó al umbral naranja
    else if (horasAcumuladas >= umbralNaranja) {
      color = 'NARANJA';
      umbralActual = umbralNaranja;
      nivel = 2;
    }
    // 🟡 AMARILLO: Llegó al umbral amarillo
    else if (horasAcumuladas >= umbralAmarillo) {
      color = 'AMARILLO';
      umbralActual = umbralAmarillo;
      nivel = 3;
    }
    // 🟢 VERDE: Aún está en rango seguro
    else {
      color = 'VERDE';
      umbralActual = umbralAmarillo;
      nivel = 4;
    }

    // Obtener descripción
    const descripcion = descripciones?.[color.toLowerCase() as keyof typeof descripciones] || 
                      `Estado ${color}`;

    // Determinar si requiere atención
    const requiereAtencion = color === 'ROJO' || color === 'NARANJA' || color === 'MORADO';

    return {
      color,
      descripcion,
      horasRestantes: Math.max(0, horasRestantes),
      umbralActual,
      porcentajeProgreso,
      requiereAtencion,
      nivel
    };
  }, [horasRestantes, intervaloOverhaul, configuracion]);

  // Validar configuración
  const erroresValidacion = useMemo(() => {
    return validarUmbrales(configuracion.umbrales, configuracion.unidad);
  }, [configuracion.umbrales, configuracion.unidad]);

  return {
    resultado,
    errores: erroresValidacion,
    esValido: erroresValidacion.length === 0
  };
};

export default useSemaforo;