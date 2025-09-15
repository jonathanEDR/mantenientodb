import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { dateUtils } from '../utils/dateUtils';
import { DateTimeDisplay, DateRangePicker, RelativeDate } from '../components/common/DateTimeComponents';

/**
 * Página de ejemplo para mostrar todas las funcionalidades del módulo de fechas
 */
export default function DateTimeExample() {
  const [selectedRange, setSelectedRange] = useState<{start: Date | null; end: Date | null}>({
    start: null,
    end: null
  });

  const now = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <DashboardLayout title="Módulo de Gestión de Fechas - Ejemplos">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Información de zona horaria */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Configuración de Zona Horaria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Zona Horaria:</span>
              <p className="text-blue-700">{dateUtils.config.TIMEZONE}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Offset UTC:</span>
              <p className="text-blue-700">{dateUtils.config.TIMEZONE_OFFSET}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Locale:</span>
              <p className="text-blue-700">{dateUtils.config.LOCALE}</p>
            </div>
          </div>
        </div>

        {/* Displays de fecha y hora en tiempo real */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Displays de Fecha y Hora
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Fecha y Hora Corta</h4>
              <DateTimeDisplay format="shortDateTime" realTime={true} />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Fecha y Hora Media</h4>
              <DateTimeDisplay format="mediumDateTime" realTime={true} />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Fecha y Hora Larga</h4>
              <DateTimeDisplay format="longDateTime" realTime={true} />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Solo Fecha</h4>
              <DateTimeDisplay format="mediumDate" realTime={true} />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Solo Hora</h4>
              <DateTimeDisplay format="timeOnly" realTime={true} />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Con Zona Horaria</h4>
              <DateTimeDisplay 
                format="shortDateTime" 
                realTime={true} 
                showTimezone={true} 
              />
            </div>
          </div>
        </div>

        {/* Formateadores disponibles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Formateadores Disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(dateUtils.formatters).map(([key, formatter]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-mono text-sm text-gray-600">{key}</span>
                <span className="text-sm text-gray-900">
                  {formatter(now)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selector de rango de fechas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selector de Rango de Fechas
          </h3>
          <DateRangePicker
            value={selectedRange}
            onChange={setSelectedRange}
            showPresets={true}
          />
          {(selectedRange.start || selectedRange.end) && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Rango Seleccionado:</h4>
              <div className="text-sm text-green-700">
                <p>
                  <strong>Inicio:</strong> {selectedRange.start ? dateUtils.formatters.longDateTime(selectedRange.start) : 'No seleccionado'}
                </p>
                <p>
                  <strong>Fin:</strong> {selectedRange.end ? dateUtils.formatters.longDateTime(selectedRange.end) : 'No seleccionado'}
                </p>
                {selectedRange.start && selectedRange.end && (
                  <p>
                    <strong>Días de diferencia:</strong> {dateUtils.daysDiff(selectedRange.end, selectedRange.start)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fechas relativas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fechas Relativas
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Ahora:</span>
              <RelativeDate date={now} />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Ayer:</span>
              <RelativeDate date={yesterday} />
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Próxima semana:</span>
              <RelativeDate date={nextWeek} />
            </div>
          </div>
        </div>

        {/* Rangos predefinidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rangos Predefinidos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'today', label: 'Hoy', range: dateUtils.ranges.today() },
              { key: 'thisWeek', label: 'Esta Semana', range: dateUtils.ranges.thisWeek() },
              { key: 'thisMonth', label: 'Este Mes', range: dateUtils.ranges.thisMonth() },
              { key: 'last7Days', label: 'Últimos 7 Días', range: dateUtils.ranges.lastDays(7) },
              { key: 'last30Days', label: 'Últimos 30 Días', range: dateUtils.ranges.lastDays(30) },
            ].map(({ key, label, range }) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  {label}
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Inicio:</strong> {dateUtils.formatters.shortDateTime(range.start)}</p>
                  <p><strong>Fin:</strong> {dateUtils.formatters.shortDateTime(range.end)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ejemplos de código */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ejemplos de Uso
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`// Importar el módulo
import { dateUtils } from '../utils/dateUtils';

// Formatear fecha actual
const now = dateUtils.formatNow('shortDateTime');

// Formatear fecha específica
const formatted = dateUtils.formatters.longDate(new Date());

// Obtener rango de este mes
const thisMonth = dateUtils.ranges.thisMonth();

// Validar fecha
const isValid = dateUtils.isValid(someDate);

// Comparar fechas
const isBefore = dateUtils.isBefore(date1, date2);

// Para inputs de fecha
const inputValue = dateUtils.input.toInputDate(new Date());
const dateFromInput = dateUtils.input.fromInputDate('2023-12-25');`}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}