# CONFIGURACION CLERK EN VERCEL
# ==============================

Write-Host "PASOS para configurar Clerk:" -ForegroundColor Green
Write-Host ""

Write-Host "1. VARIABLES NECESARIAS:" -ForegroundColor Yellow
Write-Host "VITE_CLERK_PUBLISHABLE_KEY = pk_test_d2VsbC1tYXJtb3QtNzQuY2xlcmsuYWNjb3VudHMuZGV2JA" -ForegroundColor White
Write-Host "VITE_API_BASE_URL = https://mantenimientoback.onrender.com" -ForegroundColor White
Write-Host ""

Write-Host "2. ACCEDE AL DASHBOARD:" -ForegroundColor Yellow
Write-Host "https://vercel.com/jonathans-projects-819814ab/mantenientodb/settings/environment-variables" -ForegroundColor Blue
Write-Host ""

Write-Host "3. EN ENVIRONMENT VARIABLES:" -ForegroundColor Yellow
Write-Host "- Elimina VITE_CLERK_PUBLISHABLE_KEY existente" -ForegroundColor White
Write-Host "- Agrega nueva variable con el valor de arriba" -ForegroundColor White
Write-Host "- Selecciona: Production, Preview, Development" -ForegroundColor White
Write-Host ""

Write-Host "Abriendo dashboard..." -ForegroundColor Cyan
Start-Process "https://vercel.com/jonathans-projects-819814ab/mantenientodb/settings/environment-variables"

Write-Host ""
Write-Host "Despues ejecuta: vercel --prod" -ForegroundColor Green