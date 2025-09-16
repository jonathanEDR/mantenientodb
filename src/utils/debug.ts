/// <reference types="vite/client" />

// Archivo de debugging para verificar conectividad con el backend

// Función para verificar la configuración actual
export const debugConfig = () => {
  const config = {
    API_BASE_URL: (import.meta as any).env.VITE_API_BASE_URL,
    CLERK_KEY: (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...',
    NODE_ENV: (import.meta as any).env.NODE_ENV,
    MODE: (import.meta as any).env.MODE,
    DEV: (import.meta as any).env.DEV,
    PROD: (import.meta as any).env.PROD
  };
  
  console.log('🔧 Configuración del Frontend:', config);
  return config;
};

// Función para probar la conectividad con el backend
export const testBackendConnection = async () => {
  const apiUrl = (import.meta as any).env.VITE_API_BASE_URL;
  
  console.log('🚀 Probando conexión con backend...');
  console.log('📍 URL del backend:', apiUrl);
  
  if (!apiUrl) {
    console.error('❌ VITE_API_BASE_URL no está configurado');
    return { success: false, error: 'VITE_API_BASE_URL no configurado' };
  }
  
  try {
    // Probar endpoint de health
    const healthUrl = `${apiUrl}/api/health`;
    console.log('🏥 Probando health check:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend respondió correctamente:', data);
      return { success: true, data };
    } else {
      console.error('❌ Backend respondió con error:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error('❌ Error al conectar con backend:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Función para probar CORS
export const testCORS = async () => {
  const apiUrl = (import.meta as any).env.VITE_API_BASE_URL;
  
  console.log('🌐 Probando CORS...');
  
  try {
    const response = await fetch(`${apiUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });
    
    console.log('✅ CORS preflight respondió:', response.status);
    console.log('📋 Headers CORS:', response.headers);
    
    return { success: response.ok, status: response.status };
  } catch (error) {
    console.error('❌ Error en CORS preflight:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Función para probar autenticación con Clerk
export const testClerkAuth = async () => {
  console.log('🔐 Probando autenticación con Clerk...');
  
  try {
    const clerk = (window as any).Clerk;
    if (!clerk) {
      console.error('❌ Clerk no está disponible');
      return { success: false, error: 'Clerk no inicializado' };
    }
    
    const session = clerk.session;
    if (!session) {
      console.log('ℹ️ No hay sesión activa');
      return { success: true, authenticated: false };
    }
    
    const token = await session.getToken();
    console.log('✅ Token obtenido:', token ? 'Sí' : 'No');
    
    return { success: true, authenticated: !!token, hasToken: !!token };
  } catch (error) {
    console.error('❌ Error con Clerk:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Función completa de debugging
export const runFullDiagnostic = async () => {
  console.log('🔍 === Diagnóstico Completo ===');
  
  const config = debugConfig();
  console.log('\n');
  
  const backend = await testBackendConnection();
  console.log('\n');
  
  const cors = await testCORS();
  console.log('\n');
  
  const auth = await testClerkAuth();
  console.log('\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    config,
    backend,
    cors,
    auth
  };
  
  console.log('📊 Reporte completo:', report);
  return report;
};

// Auto-ejecutar diagnóstico en desarrollo
if ((import.meta as any).env.DEV) {
  console.log('🚀 Ejecutando diagnóstico automático...');
  setTimeout(() => {
    runFullDiagnostic();
  }, 2000);
}