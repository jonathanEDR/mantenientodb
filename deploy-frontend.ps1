# Script para desplegar cambios al frontend (Vercel)
# Ejecutar desde la carpeta frontend

Write-Host "🚀 Desplegando cambios al frontend..." -ForegroundColor Cyan

# Verificar que estamos en la carpeta correcta
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecuta este script desde la carpeta frontend" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si es necesario
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
npm install

# Verificar variables de entorno
Write-Host "🔧 Verificando configuración..." -ForegroundColor Yellow
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
    Get-Content $envFile | Where-Object { $_ -match "VITE_" } | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  No se encontró archivo .env local" -ForegroundColor Yellow
    Write-Host "   Asegúrate de que las variables estén configuradas en Vercel" -ForegroundColor Yellow
}

# Construir el proyecto
Write-Host "🔨 Construyendo proyecto..." -ForegroundColor Yellow
$buildResult = npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build exitoso" -ForegroundColor Green

# Si tienes Vercel CLI instalado, puedes descomentar estas líneas
# Write-Host "🚀 Desplegando a Vercel..." -ForegroundColor Yellow
# vercel --prod

Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Hacer commit y push de los cambios a GitHub" -ForegroundColor White
Write-Host "2. Vercel detectará automáticamente los cambios y redesplegará" -ForegroundColor White
Write-Host "3. Verificar en la consola del navegador que la conectividad funcione" -ForegroundColor White

Write-Host ""
Write-Host "🌐 URLs importantes:" -ForegroundColor Cyan
Write-Host "  Frontend: https://mantenientodb.vercel.app" -ForegroundColor White
Write-Host "  Backend:  https://mantenimientoback.onrender.com" -ForegroundColor White
Write-Host "  Health:   https://mantenimientoback.onrender.com/api/health" -ForegroundColor White