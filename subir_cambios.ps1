# Script para subir cambios a GitHub automáticamente
# Uso: .\subir_cambios.ps1 "Tu mensaje aquí"

param(
    [string]$Mensaje = "Actualizacion del sitio"
)

Write-Host "🚧 Agregando archivos..." -ForegroundColor Yellow
git add .

Write-Host "📦 Guardando cambios localmente (Commit)..." -ForegroundColor Yellow
git commit -m "$Mensaje"

Write-Host "🚀 Subiendo a GitHub..." -ForegroundColor Yellow
git push

Write-Host "✅ ¡Listo! Tus cambios estan en la nube." -ForegroundColor Green
Pause
