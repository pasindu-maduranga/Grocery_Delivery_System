# ================================================================
#  ⚡ Quick Update Script — Pull latest images into Container Apps
#  Run after GitHub Actions finishes building new images.
#  Usage: powershell -ExecutionPolicy Bypass -File update-azure.ps1
#  Time:  ~30 seconds
# ================================================================

$secretsFile = "$PSScriptRoot\deploy.secrets.env"
if (-not (Test-Path $secretsFile)) {
    Write-Host "❌ ERROR: deploy.secrets.env not found!" -ForegroundColor Red; exit 1
}

$secrets = @{}
Get-Content $secretsFile | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" } | ForEach-Object {
    $parts = $_ -split "=", 2
    $secrets[$parts[0].Trim()] = $parts[1].Trim().Trim('"')
}

$RG       = "grocery-delivery-rg"
$ACR      = "grocerydeliveryacr.azurecr.io"
$ACR_USER = $secrets["ACR_USER"]
$ACR_PASS = $secrets["ACR_PASS"]

Write-Host ""
Write-Host "⚡ Updating all Container Apps with latest images..." -ForegroundColor Cyan
Write-Host ""

$services = @(
    "grocery-backend", "user-service", "delivery-backend",
    "order-service", "admin-frontend", "customer-frontend"
)

foreach ($svc in $services) {
    Write-Host "  🔄 Updating $svc..." -ForegroundColor Yellow
    az containerapp update `
      --name $svc --resource-group $RG `
      --image "$ACR/${svc}:latest" `
      --registry-server $ACR `
      --registry-username $ACR_USER `
      --registry-password $ACR_PASS | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $svc updated!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $svc failed!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  ✅ All services updated!                      " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌍 Live URLs:" -ForegroundColor Cyan
Write-Host "  Admin:    https://admin-frontend.redcliff-0ea51bff.eastus.azurecontainerapps.io"
Write-Host "  Customer: https://customer-frontend.redcliff-0ea51bff.eastus.azurecontainerapps.io"
