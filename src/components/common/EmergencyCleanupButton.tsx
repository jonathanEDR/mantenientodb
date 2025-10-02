import React from 'react';
import { nuclearCacheCleanup } from '../../utils/cacheCleanup';
import { useClerk } from '@clerk/clerk-react';

export default function EmergencyCleanupButton() {
  const clerk = useClerk();

  const handleEmergencyCleanup = async () => {
    if (confirm('🧹 ¿Ejecutar LIMPIEZA NUCLEAR de todos los caches? Esto cerrará tu sesión y eliminará todos los datos locales.')) {
      try {
        console.log('🚨 EJECUTANDO LIMPIEZA NUCLEAR MANUAL...');
        
        // Generar diagnóstico antes de limpiar
        const report = await (await import('../../utils/userCacheDiagnostics')).UserCacheDiagnostics.generateReport();
        console.log('📊 DIAGNÓSTICO PRE-LIMPIEZA:', report);
        
        // Ejecutar limpieza
        await nuclearCacheCleanup(clerk);
        
        alert('✅ Limpieza completada. La página se recargará.');
        window.location.href = '/sign-in';
      } catch (error) {
        console.error('Error durante limpieza manual:', error);
        alert('❌ Error durante la limpieza. Intentando reload...');
        window.location.reload();
      }
    }
  };

  const handleDiagnostic = async () => {
    try {
      console.log('🔬 EJECUTANDO DIAGNÓSTICO...');
      const report = await (await import('../../utils/userCacheDiagnostics')).UserCacheDiagnostics.generateReport();
      
      // Mostrar alert con resumen
      const lines = report.split('\n');
      const summary = lines.filter(line => 
        line.includes('TOKENS EXPIRADOS') || 
        line.includes('Total items') ||
        line.includes('Tokens JWT') ||
        line.includes('Tokens expirados')
      );
      
      alert('🔬 Diagnóstico completado!\n\n' + summary.join('\n') + '\n\n📋 Ver consola para reporte completo');
    } catch (error) {
      console.error('Error durante diagnóstico:', error);
      alert('❌ Error durante diagnóstico');
    }
  };

  // Solo mostrar en desarrollo
  const isDev = (import.meta as any).env.DEV;
  
  if (!isDev) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      backgroundColor: '#ff4444',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      fontSize: '12px',
      minWidth: '160px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button
          onClick={handleDiagnostic}
          style={{
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            padding: '6px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 'bold'
          }}
        >
          🔬 DIAGNOSTICAR
        </button>
        
        <button
          onClick={handleEmergencyCleanup}
          style={{
            background: 'white',
            color: '#ff4444',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
        >
          🧹 EMERGENCY RESET
        </button>
      </div>
      
      <div style={{ fontSize: '9px', marginTop: '5px', opacity: 0.9, textAlign: 'center' }}>
        Debug Tools
      </div>
    </div>
  );
}