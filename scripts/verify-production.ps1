#!/usr/bin/env powershell

# Script para preparar y verificar el deploy del frontend
Write-Host "🚀 Verificando configuración del frontend para producción..." -ForegroundColor Green

# 1. Verificar variables de entorno
Write-Host "`n📋 Verificando variables de entorno..." -ForegroundColor Yellow

$envFile = ".env.production"
if (Test-Path $envFile) {
    Write-Host "✅ Archivo .env.production encontrado" -ForegroundColor Green
    Get-Content $envFile | Where-Object {$_ -match "^VITE_"} | ForEach-Object {
        Write-Host "   $_" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Archivo .env.production no encontrado" -ForegroundColor Red
}

# 2. Verificar archivos críticos
Write-Host "`n📁 Verificando archivos críticos..." -ForegroundColor Yellow

$criticalFiles = @(
    "vercel.json",
    "src/main.tsx",
    "src/App.tsx",
    "src/components/auth/SignInPage.tsx",
    "src/components/auth/SignUpPage.tsx",
    "src/components/auth/AuthGuard.tsx",
    "VERCEL-ENV-SETUP.md"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file" -ForegroundColor Red
    }
}

# 3. Verificar dependencias
Write-Host "`n📦 Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $clerkVersion = $packageJson.dependencies.'@clerk/clerk-react'
    if ($clerkVersion) {
        Write-Host "   ✅ @clerk/clerk-react: $clerkVersion" -ForegroundColor Green
    } else {
        Write-Host "   ❌ @clerk/clerk-react no encontrado" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ package.json no encontrado" -ForegroundColor Red
}

# 4. Build para verificar errores
Write-Host "`n🔨 Ejecutando build de verificación..." -ForegroundColor Yellow

try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build exitoso" -ForegroundColor Green
    } else {
        Write-Host "❌ Build falló - revisar errores arriba" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error ejecutando npm run build: $_" -ForegroundColor Red
}

# 5. Instrucciones finales
Write-Host "`n📋 PASOS SIGUIENTES PARA VERCEL:" -ForegroundColor Magenta
Write-Host "1. Ve a tu dashboard de Vercel" -ForegroundColor White
Write-Host "2. Proyecto > Settings > Environment Variables" -ForegroundColor White
Write-Host "3. Configura VITE_CLERK_PUBLISHABLE_KEY con clave pk_live_..." -ForegroundColor White
Write-Host "4. Configura VITE_API_BASE_URL=https://mantenimientoback.onrender.com" -ForegroundColor White
Write-Host "5. Redeploy el proyecto" -ForegroundColor White

Write-Host "`n🔧 Para más detalles, revisar: VERCEL-ENV-SETUP.md" -ForegroundColor Cyan