/**
 * HOOK PARA CÁLCULO DE SEMÁFORO EN FRONTEND
 * 
 * Permite calcular el estado del semáforo basándose en configuración local,
 * útil para preview en tiempo real mientras se configuran los umbrales.
 */

import { useMemo } from 'react';
import { 
  ISemaforoPersonalizado, 
  IResultadoSemaforo, 
  ColorSemaforo,
  validarUmbrales
} from '../types/semaforoPersonalizado';

interface UseSemaforoParams {
  horasRestantes: number;
  intervaloOverhaul: number;
  configuracion: ISemaforoPersonalizado;
}

export const useSemaforo = ({ horasRestantes, intervaloOverhaul, configuracion }: UseSemaforoParams) => {
  
  const resultado = useMemo((): IResultadoSemaforo => {
    // Validar configuración
    const errores = validarUmbrales(configuracion.umbrales, configuracion.unidad);
    if (errores.length > 0) {
      // Configuración inválida, retornar estado neutral
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

    const { umbrales, unidad, descripciones } = configuracion;
    
    // Convertir a valor comparable según unidad
    let valorComparacion: number;
    let porcentajeProgreso: number;
    
    if (unidad === 'PORCENTAJE') {
      // Calcular porcentaje del intervalo consumido
      const horasConsumidas = intervaloOverhaul - horasRestantes;
      porcentajeProgreso = Math.max(0, Math.min(100, (horasConsumidas / intervaloOverhaul) * 100));
      valorComparacion = porcentajeProgreso;
    } else {
      // Usar horas directamente
      valorComparacion = horasRestantes;
      const horasConsumidas = intervaloOverhaul - horasRestantes;
      porcentajeProgreso = Math.max(0, Math.min(100, (horasConsumidas / intervaloOverhaul) * 100));
    }

    // Determinar color según umbrales
    let color: ColorSemaforo;
    let umbralActual: number;
    let nivel: number;
    
    if (unidad === 'PORCENTAJE') {
      // Para porcentaje, mayor porcentaje = más crítico
      if (valorComparacion >= umbrales.rojo) {
        color = 'ROJO';
        umbralActual = umbrales.rojo;
        nivel = 1;
      } else if (valorComparacion >= umbrales.naranja) {
        color = 'NARANJA';
        umbralActual = umbrales.naranja;
        nivel = 2;
      } else if (valorComparacion >= umbrales.amarillo) {
        color = 'AMARILLO';
        umbralActual = umbrales.amarillo;
        nivel = 3;
      } else {
        color = 'VERDE';
        umbralActual = umbrales.verde;
        nivel = 4;
      }
    } else {
      // Para horas: menos horas restantes = más crítico
      if (horasRestantes >= umbrales.rojo) {
        color = 'VERDE';
        umbralActual = umbrales.rojo;
        nivel = 4;
      } else if (horasRestantes >= umbrales.naranja) {
        color = 'AMARILLO';
        umbralActual = umbrales.naranja;
        nivel = 3;
      } else if (horasRestantes >= umbrales.amarillo) {
        color = 'NARANJA';
        umbralActual = umbrales.amarillo;
        nivel = 2;
      } else {
        color = 'ROJO';
        umbralActual = umbrales.verde;
        nivel = 1;
      }
    }

    // Obtener descripción
    const descripcion = descripciones?.[color.toLowerCase() as keyof typeof descripciones] || 
                      `Estado ${color}`;

    // Determinar si requiere atención (colores críticos)
    const requiereAtencion = color === 'ROJO' || color === 'NARANJA';

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