# =================================================
# GUÍA PARA CONFIGURAR CLERK EN VERCEL DASHBOARD
# =================================================

Write-Host "🔧 PASOS para configurar Clerk correctamente:" -ForegroundColor Green
Write-Host ""

Write-Host "1. 📋 VARIABLES QUE NECESITAS:" -ForegroundColor Yellow
Write-Host "   VITE_CLERK_PUBLISHABLE_KEY = pk_test_d2VsbC1tYXJtb3QtNzQuY2xlcmsuYWNjb3VudHMuZGV2JA" -ForegroundColor White
Write-Host "   VITE_API_BASE_URL = https://mantenimientoback.onrender.com" -ForegroundColor White
Write-Host "   VITE_NODE_ENV = production" -ForegroundColor White
Write-Host ""

Write-Host "2. 🌐 ACCEDE AL DASHBOARD DE VERCEL:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/jonathans-projects-819814ab/mantenientodb/settings/environment-variables" -ForegroundColor Blue
Write-Host ""

Write-Host "3. ⚙️ EN EL DASHBOARD:" -ForegroundColor Yellow
Write-Host "   → Busca 'Environment Variables'" -ForegroundColor White
Write-Host "   → Elimina VITE_CLERK_PUBLISHABLE_KEY si existe" -ForegroundColor White
Write-Host "   → Agrega nueva variable:" -ForegroundColor White
Write-Host "     Name: VITE_CLERK_PUBLISHABLE_KEY" -ForegroundColor Cyan
Write-Host "     Value: pk_test_d2VsbC1tYXJtb3QtNzQuY2xlcmsuYWNjb3VudHMuZGV2JA" -ForegroundColor Cyan
Write-Host "     Environment: Production, Preview, Development" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. 🚀 DESPUÉS DE CONFIGURAR:" -ForegroundColor Yellow
Write-Host "   → Vercel automáticamente redesplegará" -ForegroundColor White
Write-Host "   → O ejecuta: vercel --prod" -ForegroundColor White
Write-Host ""

Write-Host "5. ✅ VERIFICA EN:" -ForegroundColor Yellow
Write-Host "   https://mantenientodb.vercel.app" -ForegroundColor Blue
Write-Host ""

Write-Host "📱 Abriendo dashboard de Vercel..." -ForegroundColor Cyan
Start-Process "https://vercel.com/jonathans-projects-819814ab/mantenientodb/settings/environment-variables"

Write-Host ""
Write-Host "Una vez configurado, ejecuta: vercel --prod" -ForegroundColor Green