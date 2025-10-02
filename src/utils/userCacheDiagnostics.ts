/**
 * 🔬 DIAGNÓSTICO AVANZADO DE CACHE PERSISTENTE
 * 
 * Herramientas para identificar exactamente dónde está almacenado
 * el token expirado que persiste solo en ciertos usuarios/navegadores
 */

interface CacheLocation {
  location: string;
  key: string;
  value: any;
  isJWT: boolean;
  isExpired?: boolean;
  expiryDate?: string;
  expiredSince?: number;
}

export class UserCacheDiagnostics {
  
  /**
   * Escaneo completo de TODOS los posibles lugares de storage
   */
  static async fullCacheScan(): Promise<CacheLocation[]> {
    console.log('🔬 === INICIANDO ESCANEO COMPLETO DE CACHE ===');
    const findings: CacheLocation[] = [];

    try {
      // 1. SessionStorage
      console.log('🔍 Escaneando sessionStorage...');
      findings.push(...this.scanStorage(sessionStorage, 'sessionStorage'));

      // 2. LocalStorage  
      console.log('🔍 Escaneando localStorage...');
      findings.push(...this.scanStorage(localStorage, 'localStorage'));

      // 3. IndexedDB
      console.log('🔍 Escaneando IndexedDB...');
      const idbFindings = await this.scanIndexedDB();
      findings.push(...idbFindings);

      // 4. Cookies
      console.log('🔍 Escaneando cookies...');
      findings.push(...this.scanCookies());

      // 5. Cache API
      console.log('🔍 Escaneando Cache API...');
      const cacheFindings = await this.scanCacheAPI();
      findings.push(...cacheFindings);

      // 6. Memory/Variables globales
      console.log('🔍 Escaneando variables globales...');
      findings.push(...this.scanGlobalVariables());

    } catch (error) {
      console.error('Error durante escaneo:', error);
    }

    return findings;
  }

  /**
   * Escanear sessionStorage/localStorage
   */
  static scanStorage(storage: Storage, storageName: string): CacheLocation[] {
    const findings: CacheLocation[] = [];
    
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key) continue;

        const value = storage.getItem(key);
        if (!value) continue;

        const finding: CacheLocation = {
          location: storageName,
          key,
          value: value.substring(0, 200) + (value.length > 200 ? '...' : ''),
          isJWT: this.isJWTToken(value)
        };

        // Si es JWT, analizar expiración
        if (finding.isJWT) {
          const jwtAnalysis = this.analyzeJWT(value);
          finding.isExpired = jwtAnalysis.isExpired;
          finding.expiryDate = jwtAnalysis.expiryDate;
          finding.expiredSince = jwtAnalysis.expiredSince;
        }

        findings.push(finding);
      }
    } catch (error) {
      console.warn(`Error escaneando ${storageName}:`, error);
    }

    return findings;
  }

  /**
   * Escanear IndexedDB
   */
  static async scanIndexedDB(): Promise<CacheLocation[]> {
    const findings: CacheLocation[] = [];

    try {
      const databases = await indexedDB.databases();
      
      for (const dbInfo of databases) {
        if (!dbInfo.name) continue;
        
        try {
          const db = await this.openDatabase(dbInfo.name);
          const stores = Array.from(db.objectStoreNames);
          
          for (const storeName of stores) {
            const data = await this.scanObjectStore(db, storeName);
            
            data.forEach(item => {
              findings.push({
                location: `IndexedDB[${dbInfo.name}/${storeName}]`,
                key: item.key,
                value: JSON.stringify(item.value).substring(0, 200),
                isJWT: this.isJWTToken(item.value)
              });
            });
          }
          
          db.close();
        } catch (error) {
          console.warn(`Error accediendo DB ${dbInfo.name}:`, error);
        }
      }
    } catch (error) {
      console.warn('Error escaneando IndexedDB:', error);
    }

    return findings;
  }

  /**
   * Escanear cookies
   */
  static scanCookies(): CacheLocation[] {
    const findings: CacheLocation[] = [];
    
    try {
      const cookies = document.cookie.split(';');
      
      cookies.forEach(cookie => {
        const [key, ...valueParts] = cookie.split('=');
        const value = valueParts.join('=').trim();
        
        if (key && value) {
          findings.push({
            location: 'Cookie',
            key: key.trim(),
            value: value.substring(0, 200),
            isJWT: this.isJWTToken(value)
          });
        }
      });
    } catch (error) {
      console.warn('Error escaneando cookies:', error);
    }

    return findings;
  }

  /**
   * Escanear Cache API
   */
  static async scanCacheAPI(): Promise<CacheLocation[]> {
    const findings: CacheLocation[] = [];

    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        
        for (const cacheName of cacheNames) {
          try {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            
            for (const request of requests.slice(0, 10)) { // Limitar a 10
              findings.push({
                location: `CacheAPI[${cacheName}]`,
                key: request.url,
                value: 'Cache Request',
                isJWT: false
              });
            }
          } catch (error) {
            console.warn(`Error accediendo cache ${cacheName}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn('Error escaneando Cache API:', error);
    }

    return findings;
  }

  /**
   * Escanear variables globales
   */
  static scanGlobalVariables(): CacheLocation[] {
    const findings: CacheLocation[] = [];
    
    try {
      // Buscar en window object
      const windowKeys = Object.keys(window).filter(key => 
        key.toLowerCase().includes('clerk') || 
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('auth')
      );

      windowKeys.forEach(key => {
        try {
          const value = (window as any)[key];
          if (value && typeof value === 'object') {
            findings.push({
              location: 'Global[window]',
              key,
              value: JSON.stringify(value).substring(0, 200),
              isJWT: false
            });
          }
        } catch (error) {
          // Ignorar errores de acceso
        }
      });
    } catch (error) {
      console.warn('Error escaneando variables globales:', error);
    }

    return findings;
  }

  /**
   * Detectar si un string es un JWT
   */
  static isJWTToken(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    
    const parts = value.split('.');
    return parts.length === 3 && 
           parts.every(part => part.length > 0) &&
           /^[A-Za-z0-9_-]+$/.test(parts[0]);
  }

  /**
   * Analizar JWT
   */
  static analyzeJWT(jwt: string) {
    try {
      const parts = jwt.split('.');
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp) {
        const isExpired = payload.exp <= now;
        const expiredSince = now - payload.exp;
        const expiryDate = new Date(payload.exp * 1000).toISOString();
        
        return { isExpired, expiredSince, expiryDate };
      }
      
      return { isExpired: false, expiredSince: 0, expiryDate: 'No expiry' };
    } catch {
      return { isExpired: false, expiredSince: 0, expiryDate: 'Parse error' };
    }
  }

  /**
   * Abrir base de datos IndexedDB
   */
  static openDatabase(name: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Escanear object store de IndexedDB
   */
  static scanObjectStore(db: IDBDatabase, storeName: string): Promise<{key: string, value: any}[]> {
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const results: {key: string, value: any}[] = [];
          const data = request.result || [];
          
          data.forEach((item, index) => {
            results.push({
              key: `item_${index}`,
              value: item
            });
          });
          
          resolve(results.slice(0, 20)); // Limitar resultados
        };
        
        request.onerror = () => resolve([]);
      } catch (error) {
        resolve([]);
      }
    });
  }

  /**
   * Generar reporte completo
   */
  static async generateReport(): Promise<string> {
    console.log('📊 === GENERANDO REPORTE DE DIAGNÓSTICO ===');
    
    const findings = await this.fullCacheScan();
    
    let report = '🔬 REPORTE DE DIAGNÓSTICO DE CACHE\n';
    report += `⏰ Fecha: ${new Date().toISOString()}\n`;
    report += `👤 Usuario: ${window.location.hostname}\n`;
    report += `🌐 URL: ${window.location.href}\n\n`;
    
    // Tokens expirados encontrados
    const expiredTokens = findings.filter(f => f.isJWT && f.isExpired);
    if (expiredTokens.length > 0) {
      report += '❌ TOKENS EXPIRADOS ENCONTRADOS:\n';
      expiredTokens.forEach(token => {
        report += `  • ${token.location}[${token.key}]: Expirado hace ${token.expiredSince}s (${token.expiryDate})\n`;
      });
      report += '\n';
    }
    
    // Todos los tokens JWT
    const allJWTs = findings.filter(f => f.isJWT);
    if (allJWTs.length > 0) {
      report += '🔑 TODOS LOS TOKENS JWT:\n';
      allJWTs.forEach(token => {
        const status = token.isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO';
        report += `  • ${token.location}[${token.key}]: ${status}\n`;
      });
      report += '\n';
    }
    
    // Items relacionados con Clerk
    const clerkItems = findings.filter(f => 
      f.key.toLowerCase().includes('clerk') || 
      f.location.toLowerCase().includes('clerk')
    );
    
    if (clerkItems.length > 0) {
      report += '🏢 ITEMS RELACIONADOS CON CLERK:\n';
      clerkItems.forEach(item => {
        report += `  • ${item.location}[${item.key}]\n`;
      });
      report += '\n';
    }
    
    // Resumen
    report += '📊 RESUMEN:\n';
    report += `  • Total items encontrados: ${findings.length}\n`;
    report += `  • Tokens JWT: ${allJWTs.length}\n`;
    report += `  • Tokens expirados: ${expiredTokens.length}\n`;
    report += `  • Items de Clerk: ${clerkItems.length}\n`;
    
    console.log(report);
    return report;
  }
}

// Función de conveniencia para usar en consola
(window as any).diagnoseCacheIssues = () => UserCacheDiagnostics.generateReport();