/**
 * Script de diagnóstico avanzado para problemas de conectividad
 * Ejecuta verificaciones completas del sistema
 */

// Configuración
const CONFIG = {
  backend: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  frontend: window.location.origin,
  clerkKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
};

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

class DiagnosticManager {
  private results: DiagnosticResult[] = [];

  async runAllTests(): Promise<DiagnosticResult[]> {
    console.log('🚀 Iniciando diagnóstico completo del sistema...');
    
    await this.testEnvironmentConfig();
    await this.testNetworkConnectivity();
    await this.testBackendHealth();
    await this.testCORS();
    await this.testClerkConfiguration();
    await this.testAuthentication();
    
    this.printReport();
    return this.results;
  }

  private addResult(test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
    
    if (details) {
      console.log('📋 Detalles:', details);
    }
  }

  private async testEnvironmentConfig() {
    try {
      const config = {
        backend: CONFIG.backend,
        frontend: CONFIG.frontend,
        clerkKey: CONFIG.clerkKey ? `${CONFIG.clerkKey.substring(0, 20)}...` : 'NO CONFIGURADO',
        nodeEnv: import.meta.env.VITE_NODE_ENV || 'no definido'
      };

      this.addResult(
        'Configuración de Environment',
        'success',
        'Variables de entorno cargadas correctamente',
        config
      );
    } catch (error) {
      this.addResult(
        'Configuración de Environment',
        'error',
        'Error al leer variables de entorno',
        error
      );
    }
  }

  private async testNetworkConnectivity() {
    try {
      // Test de conectividad básica
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(CONFIG.backend, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 404) { // 404 es OK, significa que el servidor responde
        this.addResult(
          'Conectividad de Red',
          'success',
          `Backend alcanzable en ${CONFIG.backend}`,
          { status: response.status, statusText: response.statusText }
        );
      } else {
        this.addResult(
          'Conectividad de Red',
          'warning',
          `Backend responde pero con estado inesperado: ${response.status}`,
          { status: response.status, statusText: response.statusText }
        );
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        this.addResult(
          'Conectividad de Red',
          'error',
          'Timeout: Backend no responde en 3 segundos',
          { url: CONFIG.backend }
        );
      } else {
        this.addResult(
          'Conectividad de Red',
          'error',
          'Error de conectividad con el backend',
          { error: error.message, url: CONFIG.backend }
        );
      }
    }
  }

  private async testBackendHealth() {
    try {
      const response = await fetch(`${CONFIG.backend}/api/health`);
      
      if (response.ok) {
        const data = await response.json();
        this.addResult(
          'Salud del Backend',
          'success',
          'Backend funcionando correctamente',
          data
        );
      } else {
        this.addResult(
          'Salud del Backend',
          'error',
          `Health check falló: ${response.status}`,
          { status: response.status, statusText: response.statusText }
        );
      }
    } catch (error: any) {
      this.addResult(
        'Salud del Backend',
        'error',
        'No se pudo verificar la salud del backend',
        { error: error.message }
      );
    }
  }

  private async testCORS() {
    try {
      // Test OPTIONS preflight
      const response = await fetch(`${CONFIG.backend}/api/health`, {
        method: 'OPTIONS'
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
      };

      if (response.ok) {
        this.addResult(
          'Configuración CORS',
          'success',
          'CORS configurado correctamente',
          corsHeaders
        );
      } else {
        this.addResult(
          'Configuración CORS',
          'warning',
          'CORS preflight con problemas',
          { status: response.status, headers: corsHeaders }
        );
      }
    } catch (error: any) {
      this.addResult(
        'Configuración CORS',
        'error',
        'Error probando CORS',
        { error: error.message }
      );
    }
  }

  private async testClerkConfiguration() {
    try {
      if (!CONFIG.clerkKey) {
        this.addResult(
          'Configuración Clerk',
          'error',
          'Clave pública de Clerk no configurada',
          { variable: 'VITE_CLERK_PUBLISHABLE_KEY' }
        );
        return;
      }

      // Verificar si Clerk está cargado
      const clerkLoaded = typeof window !== 'undefined' && (window as any).Clerk;
      
      if (clerkLoaded) {
        const clerk = (window as any).Clerk;
        const session = clerk.session;
        
        this.addResult(
          'Configuración Clerk',
          'success',
          'Clerk cargado y configurado',
          {
            loaded: true,
            hasSession: !!session,
            userId: session?.user?.id || 'No disponible'
          }
        );
      } else {
        this.addResult(
          'Configuración Clerk',
          'warning',
          'Clerk no está completamente cargado',
          { clerkKey: CONFIG.clerkKey.substring(0, 20) + '...' }
        );
      }
    } catch (error: any) {
      this.addResult(
        'Configuración Clerk',
        'error',
        'Error verificando Clerk',
        { error: error.message }
      );
    }
  }

  private async testAuthentication() {
    try {
      if (typeof window === 'undefined' || !(window as any).Clerk) {
        this.addResult(
          'Autenticación',
          'warning',
          'No se puede probar autenticación - Clerk no disponible',
          {}
        );
        return;
      }

      const clerk = (window as any).Clerk;
      const session = clerk.session;

      if (!session) {
        this.addResult(
          'Autenticación',
          'warning',
          'Usuario no autenticado',
          { signedIn: false }
        );
        return;
      }

      // Intentar obtener token
      const token = await session.getToken();
      
      if (token) {
        // Probar token con el backend
        const response = await fetch(`${CONFIG.backend}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          this.addResult(
            'Autenticación',
            'success',
            'Autenticación funcionando correctamente',
            { 
              hasToken: true,
              backendRecognizesUser: true,
              userId: userData.user?.clerkId || 'No disponible'
            }
          );
        } else {
          this.addResult(
            'Autenticación',
            'error',
            `Token válido pero backend rechaza: ${response.status}`,
            { 
              hasToken: true,
              backendStatus: response.status,
              statusText: response.statusText
            }
          );
        }
      } else {
        this.addResult(
          'Autenticación',
          'error',
          'No se pudo obtener token de Clerk',
          { hasSession: true, hasToken: false }
        );
      }
    } catch (error: any) {
      this.addResult(
        'Autenticación',
        'error',
        'Error en prueba de autenticación',
        { error: error.message }
      );
    }
  }

  private printReport() {
    console.log('\n📊 === REPORTE COMPLETO DE DIAGNÓSTICO ===');
    
    const summary = {
      total: this.results.length,
      success: this.results.filter(r => r.status === 'success').length,
      warnings: this.results.filter(r => r.status === 'warning').length,
      errors: this.results.filter(r => r.status === 'error').length
    };

    console.log('📈 Resumen:', summary);
    
    if (summary.errors > 0) {
      console.log('\n❌ ERRORES CRÍTICOS:');
      this.results
        .filter(r => r.status === 'error')
        .forEach(r => console.log(`  • ${r.test}: ${r.message}`));
    }

    if (summary.warnings > 0) {
      console.log('\n⚠️ ADVERTENCIAS:');
      this.results
        .filter(r => r.status === 'warning')
        .forEach(r => console.log(`  • ${r.test}: ${r.message}`));
    }

    console.log('\n💡 RECOMENDACIONES:');
    
    if (this.results.some(r => r.test === 'Conectividad de Red' && r.status === 'error')) {
      console.log('  • Verificar que el backend esté ejecutándose en http://localhost:5000');
      console.log('  • Comprobar firewall y configuración de red');
    }
    
    if (this.results.some(r => r.test === 'Configuración Clerk' && r.status === 'error')) {
      console.log('  • Verificar VITE_CLERK_PUBLISHABLE_KEY en .env');
      console.log('  • Asegurar que la aplicación Clerk esté configurada correctamente');
    }
    
    if (this.results.some(r => r.test === 'Autenticación' && r.status === 'error')) {
      console.log('  • Intentar logout/login en Clerk');
      console.log('  • Verificar configuración de JWT en el backend');
    }

    console.log('\n🔄 Para ejecutar diagnóstico nuevamente: diagnosticManager.runAllTests()');
  }
}

// Crear instancia global
const diagnosticManager = new DiagnosticManager();

// Exponer en window para uso en consola
if (typeof window !== 'undefined') {
  (window as any).diagnosticManager = diagnosticManager;
}

// Auto-ejecutar en desarrollo
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  setTimeout(() => {
    diagnosticManager.runAllTests();
  }, 2000); // Esperar a que se cargue todo
}

export default diagnosticManager;