# ============================================
# SCRIPT PARA CONFIGURAR VARIABLES VERCEL
# ============================================

Write-Host "🚀 Configurando variables de entorno en Vercel..." -ForegroundColor Green

# Variables de entorno para producción
$CLERK_KEY = "pk_test_d2VsbC1tYXJtb3QtNzQuY2xlcmsuYWNjb3VudHMuZGV2JA"
$API_URL = "https://mantenimientoback.onrender.com"
$NODE_ENV = "production"

Write-Host "📝 Agregando VITE_CLERK_PUBLISHABLE_KEY..." -ForegroundColor Yellow
Write-Output $CLERK_KEY | vercel env add VITE_CLERK_PUBLISHABLE_KEY production

Write-Host "📝 Agregando VITE_API_BASE_URL..." -ForegroundColor Yellow
Write-Output $API_URL | vercel env add VITE_API_BASE_URL production

Write-Host "📝 Agregando VITE_NODE_ENV..." -ForegroundColor Yellow
Write-Output $NODE_ENV | vercel env add VITE_NODE_ENV production

Write-Host "✅ Variables configuradas. Listando variables actuales:" -ForegroundColor Green
vercel env ls

Write-Host "🔄 Desplegando con nuevas variables..." -ForegroundColor Cyan
vercel --prod

Write-Host "✨ ¡Listo! Revisa tu aplicación en:" -ForegroundColor Green
Write-Host "   https://mantenientodb.vercel.app" -ForegroundColor Blue