import React from 'react';

interface ConfigErrorProps {
  error: string;
  details?: string;
}

export const ConfigError: React.FC<ConfigErrorProps> = ({ error, details }) => {
  const envVars = (import.meta as any).env;
  
  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      backgroundColor: '#fee',
      border: '2px solid #f55',
      borderRadius: '8px',
      fontFamily: 'monospace',
      color: '#333'
    }}>
      <h2 style={{ color: '#d33', marginTop: 0 }}>🚨 Error de Configuración</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Error:</strong> {error}
      </div>
      
      {details && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Detalles:</strong> {details}
        </div>
      )}
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Variables de entorno disponibles:</strong>
        <pre style={{ 
          backgroundColor: '#f8f8f8', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>
      
      <div style={{ backgroundColor: '#ffe', padding: '15px', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0, color: '#a60' }}>📋 Cómo solucionarlo:</h3>
        <ol>
          <li>Ve a <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></li>
          <li>Abre tu proyecto → Settings → Environment Variables</li>
          <li>Agrega: <code>VITE_CLERK_PUBLISHABLE_KEY</code> con tu clave de Clerk</li>
          <li>Agrega: <code>VITE_API_BASE_URL</code> con la URL de tu backend</li>
          <li>Redespliega el proyecto</li>
        </ol>
        
        <p><strong>Tu clave de Clerk debe empezar con:</strong> <code>pk_test_</code> o <code>pk_live_</code></p>
      </div>
    </div>
  );
};

export default ConfigError;