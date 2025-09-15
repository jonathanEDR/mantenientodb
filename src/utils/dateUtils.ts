import { format, parseISO, isValid, startOfDay, endOfDay, addDays, subDays, isAfter, isBefore, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Configuración de formatos de fecha comunes para el frontend
 */
export const DATE_FORMATS = {
  // Formatos de fecha
  DATE_SHORT: 'dd/MM/yyyy',           // 25/12/2023
  DATE_MEDIUM: 'dd MMM yyyy',         // 25 dic 2023
  DATE_LONG: 'dd \'de\' MMMM \'de\' yyyy', // 25 de diciembre de 2023
  
  // Formatos de hora
  TIME_12H: 'hh:mm a',               // 02:30 PM
  TIME_24H: 'HH:mm',                 // 14:30
  TIME_WITH_SECONDS: 'HH:mm:ss',     // 14:30:45
  
  // Formatos combinados
  DATETIME_SHORT: 'dd/MM/yyyy HH:mm', // 25/12/2023 14:30
  DATETIME_MEDIUM: 'dd MMM yyyy, HH:mm', // 25 dic 2023, 14:30
  DATETIME_LONG: 'dd \'de\' MMMM \'de\' yyyy \'a las\' HH:mm', // 25 de diciembre de 2023 a las 14:30
  
  // Formatos para APIs
  ISO_DATE: 'yyyy-MM-dd',            // 2023-12-25
  ISO_DATETIME: 'yyyy-MM-dd\'T\'HH:mm:ss', // 2023-12-25T14:30:00
  
  // Formatos especiales
  DAY_MONTH: 'dd MMM',               // 25 dic
  MONTH_YEAR: 'MMM yyyy',            // dic 2023
  YEAR: 'yyyy'                       // 2023
} as const;

/**
 * Configuración de zona horaria para Perú
 */
export const PERU_CONFIG = {
  TIMEZONE: 'America/Lima',
  TIMEZONE_OFFSET: '-05:00', // Perú está en UTC-5
  LOCALE: 'es-PE' // Español de Perú
} as const;

/**
 * Obtiene la fecha y hora actual ajustada para Lima, Perú
 */
export function getNowInLima(): Date {
  // En el frontend, trabajamos con la hora local del usuario
  // pero podemos mostrar un indicador de zona horaria
  return new Date();
}

/**
 * Obtiene la fecha y hora actual de Lima para mostrar en interfaces
 */
export function getCurrentDateTimeInLima(): Date {
  return getNowInLima();
}

/**
 * Formatea una fecha para usar en inputs de tipo datetime-local
 */
export function formatDateTimeForInput(date: Date): string {
  // datetime-local espera formato: YYYY-MM-DDTHH:MM
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Formatea una fecha usando la configuración regional de Perú
 */
export function formatDate(date: Date | string, formatString: string = DATE_FORMATS.DATETIME_SHORT): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Fecha inválida';
    }
    
    return format(dateObj, formatString, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Error en fecha';
  }
}

/**
 * Formatea la fecha actual
 */
export function formatNow(formatString: string = DATE_FORMATS.DATETIME_SHORT): string {
  return formatDate(new Date(), formatString);
}

/**
 * Parsea una fecha string y la convierte a Date
 */
export function parseDate(dateString: string): Date | null {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Valida si una fecha es válida
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && isValid(date);
}

/**
 * Obtiene el inicio del día
 */
export function getStartOfDay(date?: Date): Date {
  return startOfDay(date || new Date());
}

/**
 * Obtiene el final del día
 */
export function getEndOfDay(date?: Date): Date {
  return endOfDay(date || new Date());
}

/**
 * Obtiene el rango de fechas para hoy
 */
export function getTodayRange(): { start: Date; end: Date } {
  return {
    start: getStartOfDay(),
    end: getEndOfDay()
  };
}

/**
 * Obtiene el rango de fechas para esta semana
 */
export function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const startOfWeek = subDays(now, now.getDay());
  const endOfWeek = addDays(startOfWeek, 6);
  
  return {
    start: getStartOfDay(startOfWeek),
    end: getEndOfDay(endOfWeek)
  };
}

/**
 * Obtiene el rango de fechas para este mes
 */
export function getThisMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: getStartOfDay(startOfMonth),
    end: getEndOfDay(endOfMonth)
  };
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  return differenceInDays(date1, date2);
}

/**
 * Verifica si una fecha es anterior a otra
 */
export function isDateBefore(date1: Date, date2: Date): boolean {
  return isBefore(date1, date2);
}

/**
 * Verifica si una fecha es posterior a otra
 */
export function isDateAfter(date1: Date, date2: Date): boolean {
  return isAfter(date1, date2);
}

/**
 * Formatos específicos para mostrar en la aplicación
 */
export const formatters = {
  // Para mostrar en tablas y listas
  shortDate: (date: Date | string) => formatDate(date, DATE_FORMATS.DATE_SHORT),
  shortDateTime: (date: Date | string) => formatDate(date, DATE_FORMATS.DATETIME_SHORT),
  
  // Para mostrar en headers y títulos
  mediumDate: (date: Date | string) => formatDate(date, DATE_FORMATS.DATE_MEDIUM),
  mediumDateTime: (date: Date | string) => formatDate(date, DATE_FORMATS.DATETIME_MEDIUM),
  
  // Para mostrar en reportes
  longDate: (date: Date | string) => formatDate(date, DATE_FORMATS.DATE_LONG),
  longDateTime: (date: Date | string) => formatDate(date, DATE_FORMATS.DATETIME_LONG),
  
  // Para APIs
  isoDate: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDate(dateObj, DATE_FORMATS.ISO_DATE);
  },
  isoDateTime: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDate(dateObj, DATE_FORMATS.ISO_DATETIME);
  },
  
  // Para inputs de fecha
  inputDate: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDate(dateObj, 'yyyy-MM-dd');
  },
  inputDateTime: (date: Date | string) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDate(dateObj, 'yyyy-MM-dd\'T\'HH:mm');
  },
  
  // Formatos relativos
  timeOnly: (date: Date | string) => formatDate(date, DATE_FORMATS.TIME_24H),
  timeOnly12h: (date: Date | string) => formatDate(date, DATE_FORMATS.TIME_12H),
  
  // Formatos especiales
  dayMonth: (date: Date | string) => formatDate(date, DATE_FORMATS.DAY_MONTH),
  monthYear: (date: Date | string) => formatDate(date, DATE_FORMATS.MONTH_YEAR),
  year: (date: Date | string) => formatDate(date, DATE_FORMATS.YEAR)
};

/**
 * Utilidades para trabajar con rangos de fechas
 */
export const dateRanges = {
  today: getTodayRange,
  thisWeek: getThisWeekRange,
  thisMonth: getThisMonthRange,
  
  // Rango personalizado
  custom: (startDate: Date, endDate: Date) => ({
    start: getStartOfDay(startDate),
    end: getEndOfDay(endDate)
  }),
  
  // Últimos N días
  lastDays: (days: number) => {
    const now = new Date();
    const start = subDays(now, days - 1);
    return {
      start: getStartOfDay(start),
      end: getEndOfDay(now)
    };
  }
};

/**
 * Funciones de utilidad para inputs de fecha
 */
export const inputHelpers = {
  // Convierte una fecha a string para input type="date"
  toInputDate: (date: Date | string | null): string => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatters.inputDate(dateObj);
    } catch {
      return '';
    }
  },
  
  // Convierte una fecha a string para input type="datetime-local"
  toInputDateTime: (date: Date | string | null): string => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return formatters.inputDateTime(dateObj);
    } catch {
      return '';
    }
  },
  
  // Convierte un string de input a Date
  fromInputDate: (value: string): Date | null => {
    if (!value) return null;
    return parseDate(value);
  },
  
  // Obtiene la fecha actual en formato input
  getCurrentInputDate: (): string => {
    return inputHelpers.toInputDate(new Date());
  },
  
  // Obtiene la fecha y hora actual en formato input
  getCurrentInputDateTime: (): string => {
    return inputHelpers.toInputDateTime(new Date());
  }
};

/**
 * Mensajes de fecha relativos en español
 */
export const relativeMessages = {
  today: 'Hoy',
  yesterday: 'Ayer',
  tomorrow: 'Mañana',
  thisWeek: 'Esta semana',
  lastWeek: 'Semana pasada',
  nextWeek: 'Próxima semana',
  thisMonth: 'Este mes',
  lastMonth: 'Mes pasado',
  nextMonth: 'Próximo mes'
};

/**
 * Obtiene un mensaje relativo para una fecha
 */
export function getRelativeMessage(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const today = getStartOfDay(now);
    const targetDate = getStartOfDay(dateObj);
    
    const diffDays = getDaysDifference(targetDate, today);
    
    if (diffDays === 0) return relativeMessages.today;
    if (diffDays === -1) return relativeMessages.yesterday;
    if (diffDays === 1) return relativeMessages.tomorrow;
    
    // Para otros casos, mostrar la fecha formateada
    return formatDate(dateObj, DATE_FORMATS.DATE_MEDIUM);
  } catch {
    return 'Fecha inválida';
  }
}

/**
 * Hook personalizado para trabajar con fechas (puede ser usado en componentes React)
 */
export const dateUtils = {
  // Funciones principales
  format: formatDate,
  formatNow,
  parse: parseDate,
  isValid: isValidDate,
  
  // Rangos
  ranges: dateRanges,
  
  // Formateadores
  formatters,
  
  // Helpers para inputs
  input: inputHelpers,
  
  // Comparaciones
  isBefore: isDateBefore,
  isAfter: isDateAfter,
  daysDiff: getDaysDifference,
  
  // Mensajes relativos
  relative: getRelativeMessage,
  
  // Configuración
  config: PERU_CONFIG,
  formats: DATE_FORMATS
};

export default dateUtils;