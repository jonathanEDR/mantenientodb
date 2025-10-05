/**
 * Sistema de caché para permisos de usuario
 * Reduce llamadas al backend almacenando permisos en localStorage
 */

import { ICurrentUser, IRolePermissions } from '../types/usuarios';

const CACHE_KEY = 'user_permissions_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos en milisegundos

interface PermissionsCacheData {
  user: ICurrentUser;
  permissions: IRolePermissions;
  roleInfo: any;
  timestamp: number;
}

/**
 * Guarda los permisos del usuario en caché
 */
export const savePermissionsToCache = (data: {
  user: ICurrentUser;
  permissions: IRolePermissions;
  roleInfo: any;
}): void => {
  try {
    const cacheData: PermissionsCacheData = {
      ...data,
      timestamp: Date.now()
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('💾 Permisos guardados en caché:', {
      user: data.user.email,
      role: data.user.role,
      timestamp: new Date(cacheData.timestamp).toLocaleString()
    });
  } catch (error) {
    console.warn('⚠️  No se pudo guardar en caché:', error);
    // Silenciosamente fallar si localStorage no está disponible
  }
};

/**
 * Obtiene los permisos del usuario desde caché
 * Retorna null si el caché está expirado o no existe
 */
export const getPermissionsFromCache = (): PermissionsCacheData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);

    if (!cached) {
      console.log('📭 No hay permisos en caché');
      return null;
    }

    const cacheData: PermissionsCacheData = JSON.parse(cached);
    const now = Date.now();
    const age = now - cacheData.timestamp;

    // Verificar si el caché ha expirado
    if (age > CACHE_TTL) {
      console.log('⏰ Caché de permisos expirado:', {
        age: Math.round(age / 1000 / 60) + ' minutos',
        ttl: Math.round(CACHE_TTL / 1000 / 60) + ' minutos'
      });
      clearPermissionsCache();
      return null;
    }

    console.log('✅ Permisos obtenidos de caché:', {
      user: cacheData.user.email,
      role: cacheData.user.role,
      age: Math.round(age / 1000) + ' segundos',
      remainingTime: Math.round((CACHE_TTL - age) / 1000 / 60) + ' minutos'
    });

    return cacheData;
  } catch (error) {
    console.warn('⚠️  Error al leer caché:', error);
    clearPermissionsCache();
    return null;
  }
};

/**
 * Limpia el caché de permisos
 */
export const clearPermissionsCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️  Caché de permisos limpiado');
  } catch (error) {
    console.warn('⚠️  No se pudo limpiar el caché:', error);
  }
};

/**
 * Verifica si el caché es válido (existe y no ha expirado)
 */
export const isCacheValid = (): boolean => {
  const cached = getPermissionsFromCache();
  return cached !== null;
};

/**
 * Obtiene información del caché (para debugging)
 */
export const getCacheInfo = (): {
  exists: boolean;
  valid: boolean;
  age?: number;
  user?: string;
  role?: string;
} => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);

    if (!cached) {
      return { exists: false, valid: false };
    }

    const cacheData: PermissionsCacheData = JSON.parse(cached);
    const now = Date.now();
    const age = now - cacheData.timestamp;
    const valid = age <= CACHE_TTL;

    return {
      exists: true,
      valid,
      age: Math.round(age / 1000), // en segundos
      user: cacheData.user.email,
      role: cacheData.user.role
    };
  } catch (error) {
    return { exists: false, valid: false };
  }
};

/**
 * Invalida el caché si el usuario cambió
 */
export const invalidateCacheIfUserChanged = (currentUserId: string): void => {
  const cached = getPermissionsFromCache();

  if (cached && cached.user._id !== currentUserId) {
    console.log('🔄 Usuario cambió, invalidando caché');
    clearPermissionsCache();
  }
};
