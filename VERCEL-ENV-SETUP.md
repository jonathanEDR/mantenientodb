# ===================================
# CONFIGURACIÓN VERCEL PRODUCTION
# ===================================

# ⚠️  IMPORTANTE: CONFIGURAR ESTAS VARIABLES EN VERCEL DASHBOARD
# Ir a: Vercel Dashboard > Tu Proyecto > Settings > Environment Variables

# 1. CLERK AUTHENTICATION (PRODUCCIÓN)
# Nombre: VITE_CLERK_PUBLISHABLE_KEY
# Valor: Tu clave de producción pk_live_XXXXXXXX... (NO pk_test_)

# 2. API BACKEND
# Nombre: VITE_API_BASE_URL
# Valor: https://mantenimientoback.onrender.com

# 3. CONFIGURACIÓN DE PRODUCCIÓN
# Nombre: VITE_NODE_ENV
# Valor: production

# 4. DEBUG MODE (OPCIONAL)
# Nombre: VITE_DEBUG_MODE
# Valor: false

# ===================================
# PASOS PARA CONFIGURAR EN VERCEL:
# ===================================

# 1. Ve a tu dashboard de Vercel
# 2. Selecciona tu proyecto
# 3. Ve a Settings > Environment Variables
# 4. Agrega cada variable con su respectivo valor
# 5. Asegúrate de que esté configurada para "Production"
# 6. Redeploy tu aplicación

# ===================================
# CÓMO OBTENER CLAVE DE PRODUCCIÓN CLERK:
# ===================================

# 1. Ve a tu dashboard de Clerk
# 2. Selecciona tu aplicación
# 3. Ve a "API Keys" en la barra lateral
# 4. Busca "Publishable key" que comience con "pk_live_"
# 5. Copia esa clave (NO la que empiece con pk_test_)

# ===================================
# VERIFICACIÓN POST-DEPLOY:
# ===================================

# Después del deploy, verifica en la consola del navegador:
# - No debe aparecer "development keys" warnings
# - Las URLs de redirección deben funcionar correctamente
# - No debe haber errores de CSP (Content Security Policy)