# Deploy de tesoreria-adorno a GitHub Pages
# Uso: .\deploy.ps1 "mensaje opcional"

$mensaje = if ($args[0]) { $args[0] } else { "deploy " + (Get-Date -Format "yyyy-MM-dd HH:mm") }

Write-Host "→ git add..." -ForegroundColor Cyan
git add -A

Write-Host "→ git commit: $mensaje" -ForegroundColor Cyan
git commit -m "$mensaje"

Write-Host "→ git push..." -ForegroundColor Cyan
git push

Write-Host "✓ Deploy iniciado. GitHub Pages tarda 1-2 minutos en actualizar." -ForegroundColor Green
Write-Host "  URL: https://claudiaadornosrl-prog.github.io/tesoreria-adorno/" -ForegroundColor Yellow
