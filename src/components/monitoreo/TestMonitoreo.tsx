import React from 'react';

/**
 * Componente de prueba para verificar el sistema de monitoreo
 */
const TestMonitoreo: React.FC = () => {
  const datosEjemplo = {
    matricula: "XA-TEST",
    alertas: [
      {
        descripcionCodigo: "100H - Inspección general",
        horaInicial: 0,
        horaFinal: 100,
        horasActuales: 95,
        estado: "PROXIMO" as const,
        tipoAlerta: "PREVENTIVO" as const,
        horasRestantes: 5,
        porcentajeCompletado: 95,
        prioridad: 1 as const
      }
    ]
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🧪 Prueba del Sistema de Monitoreo</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800">✅ Backend Implementado</h4>
          <ul className="text-sm text-green-700 mt-2 space-y-1">
            <li>• Tipos y servicios de monitoreo</li>
            <li>• Endpoints API (/api/monitoreo)</li>
            <li>• Cálculo de alertas automático</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800">✅ Frontend Implementado</h4>
          <ul className="text-sm text-green-700 mt-2 space-y-1">
            <li>• Hooks de monitoreo (useMonitoreo, useMonitoreoFlota)</li>
            <li>• Componentes de UI (AlertaMonitoreo, EstadoMonitoreoAeronave)</li>
            <li>• Página MonitoreoFlota con filtros</li>
            <li>• Integración en AeronaveCard</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800">📊 Datos de Ejemplo</h4>
          <pre className="text-xs text-blue-700 mt-2 overflow-x-auto">
            {JSON.stringify(datosEjemplo, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800">⚠️ Para Completar las Pruebas</h4>
          <ul className="text-sm text-yellow-700 mt-2 space-y-1">
            <li>• Agregar datos al catálogo de control de monitoreo</li>
            <li>• Probar la navegación entre páginas</li>
            <li>• Verificar que las alertas se calculen correctamente</li>
            <li>• Comprobar la funcionalidad de exportación</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestMonitoreo;