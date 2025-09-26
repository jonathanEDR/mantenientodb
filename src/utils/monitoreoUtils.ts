import {
  EstadoAlerta,
  TipoAlerta,
  IAlertaMonitoreo,
  IResumenMonitoreoAeronave,
  IColorAlerta,
  COLORES_ALERTAS,
  LABELS_ESTADO,
  LABELS_TIPO_ALERTA,
  ICONOS_TIPO_ALERTA
} from '../types/monitoreo';

/**
 * Obtiene los colores CSS para un estado de alerta
 */
export const obtenerColoresAlerta = (estado: EstadoAlerta): IColorAlerta => {
  return COLORES_ALERTAS[estado];
};

/**
 * Obtiene el label legible para un estado de alerta
 */
export const obtenerLabelEstado = (estado: EstadoAlerta): string => {
  return LABELS_ESTADO[estado];
};

/**
 * Obtiene el label legible para un tipo de alerta
 */
export const obtenerLabelTipoAlerta = (tipo: TipoAlerta): string => {
  return LABELS_TIPO_ALERTA[tipo];
};

/**
 * Obtiene el icono para un tipo de alerta
 */
export const obtenerIconoTipoAlerta = (tipo: TipoAlerta): string => {
  return ICONOS_TIPO_ALERTA[tipo];
};

/**
 * Formatea las horas de vuelo con separadores de miles
 */
export const formatearHoras = (horas: number): string => {
  return horas.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });
};

/**
 * Formatea un porcentaje
 */
export const formatearPorcentaje = (porcentaje: number): string => {
  return `${Math.round(porcentaje)}%`;
};

/**
 * Calcula el nivel de criticidad de una aeronave basado en sus alertas
 */
export const calcularNivelCriticidad = (resumen: IResumenMonitoreoAeronave): EstadoAlerta => {
  if (resumen.alertasCriticas > 0) {
    return EstadoAlerta.VENCIDO;
  }
  if (resumen.alertasProximas > 0) {
    return EstadoAlerta.PROXIMO;
  }
  return EstadoAlerta.OK;
};

/**
 * Obtiene las alertas más críticas de una aeronave (máximo 3)
 */
export const obtenerAlertasPrioritarias = (alertas: IAlertaMonitoreo[]): IAlertaMonitoreo[] => {
  return alertas
    .filter(alerta => alerta.estado !== EstadoAlerta.OK)
    .sort((a, b) => {
      // Primero por estado (VENCIDO > PROXIMO)
      if (a.estado !== b.estado) {
        if (a.estado === EstadoAlerta.VENCIDO) return -1;
        if (b.estado === EstadoAlerta.VENCIDO) return 1;
      }
      // Luego por prioridad (1 > 2 > 3)
      return a.prioridad - b.prioridad;
    })
    .slice(0, 3);
};

/**
 * Genera un mensaje descriptivo para una alerta
 */
export const generarMensajeAlerta = (alerta: IAlertaMonitoreo): string => {
  switch (alerta.estado) {
    case EstadoAlerta.VENCIDO:
      return `${alerta.descripcionCodigo}: Vencido hace ${formatearHoras(alerta.horasVencidas || 0)} horas`;
    
    case EstadoAlerta.PROXIMO:
      if (alerta.horasRestantes) {
        return `${alerta.descripcionCodigo}: Vence en ${formatearHoras(alerta.horasRestantes)} horas`;
      } else if (alerta.horasVencidas) {
        return `${alerta.descripcionCodigo}: Vencido hace ${formatearHoras(alerta.horasVencidas)} horas`;
      }
      return `${alerta.descripcionCodigo}: Próximo a vencer`;
    
    case EstadoAlerta.OK:
      return `${alerta.descripcionCodigo}: Al día (${formatearHoras(alerta.horasRestantes || 0)} horas restantes)`;
    
    default:
      return alerta.descripcionCodigo;
  }
};

/**
 * Calcula el tiempo estimado para el próximo mantenimiento
 */
export const calcularTiempoEstimadoMantenimiento = (
  horasRestantes: number,
  horasPorMes: number = 8
): { meses: number; dias: number; texto: string } => {
  const horasPorDia = horasPorMes / 30;
  const dias = Math.ceil(horasRestantes / horasPorDia);
  const meses = Math.floor(dias / 30);
  const diasRestantes = dias % 30;

  let texto = '';
  if (meses > 0) {
    texto = `${meses} mes${meses > 1 ? 'es' : ''}`;
    if (diasRestantes > 0) {
      texto += ` y ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}`;
    }
  } else {
    texto = `${dias} día${dias > 1 ? 's' : ''}`;
  }

  return { meses, dias: diasRestantes, texto };
};

/**
 * Filtra alertas por estado
 */
export const filtrarAlertasPorEstado = (
  alertas: IAlertaMonitoreo[],
  estados: EstadoAlerta[]
): IAlertaMonitoreo[] => {
  return alertas.filter(alerta => estados.includes(alerta.estado));
};

/**
 * Agrupa alertas por estado
 */
export const agruparAlertasPorEstado = (alertas: IAlertaMonitoreo[]) => {
  return alertas.reduce((agrupadas, alerta) => {
    if (!agrupadas[alerta.estado]) {
      agrupadas[alerta.estado] = [];
    }
    agrupadas[alerta.estado].push(alerta);
    return agrupadas;
  }, {} as Record<EstadoAlerta, IAlertaMonitoreo[]>);
};

/**
 * Determina si una aeronave necesita atención inmediata
 */
export const necesitaAtencionInmediata = (resumen: IResumenMonitoreoAeronave): boolean => {
  return resumen.alertasCriticas > 0;
};

/**
 * Genera un resumen textual del estado de una aeronave
 */
export const generarResumenTextual = (resumen: IResumenMonitoreoAeronave): string => {
  if (resumen.alertasCriticas > 0) {
    return `${resumen.alertasCriticas} alerta${resumen.alertasCriticas > 1 ? 's' : ''} crítica${resumen.alertasCriticas > 1 ? 's' : ''}`;
  }
  
  if (resumen.alertasProximas > 0) {
    return `${resumen.alertasProximas} próxima${resumen.alertasProximas > 1 ? 's' : ''} a vencer`;
  }
  
  return 'Todos los controles al día';
};

/**
 * Calcula el porcentaje de salud general de una aeronave
 */
export const calcularPorcentajeSalud = (resumen: IResumenMonitoreoAeronave): number => {
  if (resumen.totalAlertas === 0) return 100;
  
  const pesoOk = 100;
  const pesoProximo = 50;
  const pesoCritico = 0;
  
  const puntuacionTotal = 
    (resumen.alertasOk * pesoOk) +
    (resumen.alertasProximas * pesoProximo) +
    (resumen.alertasCriticas * pesoCritico);
    
  const puntuacionMaxima = resumen.totalAlertas * pesoOk;
  
  return Math.round((puntuacionTotal / puntuacionMaxima) * 100);
};

/**
 * Formatea una fecha relativa (ej: "hace 2 horas", "en 3 días")
 */
export const formatearFechaRelativa = (fecha: Date | string): string => {
  const ahora = new Date();
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const diferencia = fechaObj.getTime() - ahora.getTime();
  const segundos = Math.abs(diferencia) / 1000;
  const minutos = segundos / 60;
  const horas = minutos / 60;
  const dias = horas / 24;
  
  const esFuturo = diferencia > 0;
  const prefijo = esFuturo ? 'en ' : 'hace ';
  
  if (dias >= 1) {
    const diasRedondeados = Math.round(dias);
    return `${prefijo}${diasRedondeados} día${diasRedondeados > 1 ? 's' : ''}`;
  }
  
  if (horas >= 1) {
    const horasRedondeadas = Math.round(horas);
    return `${prefijo}${horasRedondeadas} hora${horasRedondeadas > 1 ? 's' : ''}`;
  }
  
  if (minutos >= 1) {
    const minutosRedondeados = Math.round(minutos);
    return `${prefijo}${minutosRedondeados} minuto${minutosRedondeados > 1 ? 's' : ''}`;
  }
  
  return 'ahora mismo';
};

/**
 * Exporta los datos de monitoreo a CSV
 */
export const exportarMonitoreoCSV = (resumenFlota: any): string => {
  const headers = [
    'Matrícula',
    'Horas de Vuelo',
    'Total Alertas',
    'Críticas',
    'Próximas',
    'OK',
    'Porcentaje Salud',
    'Última Actualización'
  ].join(',');
  
  const filas = resumenFlota.aeronaves.map((aeronave: IResumenMonitoreoAeronave) => [
    aeronave.matricula,
    aeronave.horasVueloActuales,
    aeronave.totalAlertas,
    aeronave.alertasCriticas,
    aeronave.alertasProximas,
    aeronave.alertasOk,
    calcularPorcentajeSalud(aeronave),
    new Date(aeronave.ultimaActualizacion).toLocaleString()
  ].join(','));
  
  return [headers, ...filas].join('\n');
};