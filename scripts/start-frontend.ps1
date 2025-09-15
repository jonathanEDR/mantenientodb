Param(
  [int]$Port = 5173
)

Write-Host "Cleaning port $Port..."
 $lines = netstat -ano | Select-String ":$Port\b" | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
 $pids = $lines | Where-Object { $_ -match '^[0-9]+$' }
 foreach ($candidatePid in $pids) {
  Write-Host "Stopping PID $candidatePid"
  Stop-Process -Id [int]$candidatePid -Force -ErrorAction SilentlyContinue
}

Write-Host "Starting Vite dev server on port $Port..."
Set-Location -Path (Join-Path $PSScriptRoot '..')
$env:VITE_PORT = $Port
# Use cmd.exe to run npm for broader compatibility in different shells
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','npm run dev' -WorkingDirectory (Get-Location).Path -NoNewWindow -PassThru
Write-Host "Vite started (background). Open http://localhost:$Port in your browser."
