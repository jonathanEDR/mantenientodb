import React, { useState, useEffect } from 'react';
import { dateUtils } from '../../utils/dateUtils';

interface DateTimeDisplayProps {
  /**
   * Formato a usar para mostrar la fecha/hora
   */
  format?: keyof typeof dateUtils.formatters;
  /**
   * Si debe actualizar en tiempo real
   */
  realTime?: boolean;
  /**
   * Intervalo de actualización en milisegundos (por defecto 1000ms = 1 segundo)
   */
  updateInterval?: number;
  /**
   * Clase CSS adicional
   */
  className?: string;
  /**
   * Si debe mostrar la zona horaria
   */
  showTimezone?: boolean;
  /**
   * Fecha específica a mostrar (si no se proporciona, usa la actual)
   */
  date?: Date | string;
}

/**
 * Componente para mostrar fecha y hora con formato peruano
 */
export const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  format = 'shortDateTime',
  realTime = false,
  updateInterval = 1000,
  className = '',
  showTimezone = false,
  date
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!realTime) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [realTime, updateInterval]);

  const displayDate = date ? (typeof date === 'string' ? dateUtils.parse(date) || new Date() : date) : currentTime;
  const formattedDate = dateUtils.formatters[format](displayDate);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{formattedDate}</span>
      {showTimezone && (
        <span className="ml-2 text-xs text-gray-500 font-mono">
          ({dateUtils.config.TIMEZONE_OFFSET} Lima)
        </span>
      )}
    </span>
  );
};

interface DateRangePickerProps {
  /**
   * Valor inicial del rango
   */
  value?: { start: Date | null; end: Date | null };
  /**
   * Callback cuando cambia el rango
   */
  onChange?: (range: { start: Date | null; end: Date | null }) => void;
  /**
   * Etiqueta para el campo de inicio
   */
  startLabel?: string;
  /**
   * Etiqueta para el campo de fin
   */
  endLabel?: string;
  /**
   * Si debe mostrar botones de rangos predefinidos
   */
  showPresets?: boolean;
  /**
   * Clase CSS adicional
   */
  className?: string;
}

/**
 * Componente para seleccionar un rango de fechas
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value = { start: null, end: null },
  onChange,
  startLabel = 'Fecha inicio',
  endLabel = 'Fecha fin',
  showPresets = true,
  className = ''
}) => {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = dateUtils.input.fromInputDate(e.target.value);
    onChange?.({ ...value, start: date });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = dateUtils.input.fromInputDate(e.target.value);
    onChange?.({ ...value, end: date });
  };

  const handlePresetClick = (preset: () => { start: Date; end: Date }) => {
    const range = preset();
    onChange?.(range);
  };

  const presets = [
    { label: 'Hoy', value: dateUtils.ranges.today },
    { label: 'Esta semana', value: dateUtils.ranges.thisWeek },
    { label: 'Este mes', value: dateUtils.ranges.thisMonth },
    { label: 'Últimos 7 días', value: () => dateUtils.ranges.lastDays(7) },
    { label: 'Últimos 30 días', value: () => dateUtils.ranges.lastDays(30) }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {startLabel}
          </label>
          <input
            type="date"
            value={dateUtils.input.toInputDate(value.start)}
            onChange={handleStartChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {endLabel}
          </label>
          <input
            type="date"
            value={dateUtils.input.toInputDate(value.end)}
            onChange={handleEndChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {showPresets && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 mr-2">Rangos rápidos:</span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset.value)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface RelativeDateProps {
  /**
   * Fecha a mostrar de forma relativa
   */
  date: Date | string;
  /**
   * Clase CSS adicional
   */
  className?: string;
  /**
   * Si debe mostrar la fecha completa en tooltip
   */
  showTooltip?: boolean;
}

/**
 * Componente para mostrar fechas de forma relativa (ej: "Hace 2 días")
 */
export const RelativeDate: React.FC<RelativeDateProps> = ({
  date,
  className = '',
  showTooltip = true
}) => {
  const relativeText = dateUtils.relative(date);
  const fullDate = dateUtils.formatters.longDateTime(date);

  return (
    <span
      className={`${className}`}
      title={showTooltip ? fullDate : undefined}
    >
      {relativeText}
    </span>
  );
};

export default {
  DateTimeDisplay,
  DateRangePicker,
  RelativeDate
};