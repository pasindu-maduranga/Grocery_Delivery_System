# ================================================================
#  Grocery Delivery System - Fresh Azure Account Setup
#  Usage: powershell -ExecutionPolicy Bypass -File init-azure.ps1
# ================================================================

$RG_NAME = "grocery-delivery-rg"
$LOCATION = "eastus"
$ENV_NAME = "grocery-delivery-env"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  INITIALIZING FRESH AZURE ENVIRONMENT         " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 1. Create Resource Group & Register Providers
Write-Host "[1/4] Preparing Azure Environment..." -ForegroundColor Yellow
az group create --name $RG_NAME --location $LOCATION | Out-Null

Write-Host "  Registering required providers (Microsoft.App, Microsoft.OperationalInsights)..." -ForegroundColor Gray
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait

# 2. Deploy Infrastructure (ACR, Env, Logs)
Write-Host "[2/4] Deploying Core Infrastructure (Bicep)..." -ForegroundColor Yellow
$deployment = az deployment group create `
  --resource-group $RG_NAME `
  --template-file ./infra/main.bicep `
  --parameters location=$LOCATION | ConvertFrom-Json

$ACR_NAME = $deployment.properties.outputs.acrName.value
$ENV_ID = $deployment.properties.outputs.environmentId.value

Write-Host "  OK: ACR Name is $ACR_NAME" -ForegroundColor Green

# 3. Create Placeholder Container Apps
Write-Host "[3/4] Creating Service Placeholders..." -ForegroundColor Yellow

$services = @(
    @{ name="grocery-backend"; port=5000 },
    @{ name="user-service"; port=5003 },
    @{ name="delivery-backend"; port=5005 },
    @{ name="order-service"; port=5004 },
    @{ name="admin-frontend"; port=80 },
    @{ name="customer-frontend"; port=80 }
)

foreach ($service in $services) {
    Write-Host "  Creating $($service.name)..." -ForegroundColor Cyan
    az containerapp create `
      --name $service.name `
      --resource-group $RG_NAME `
      --environment $ENV_NAME `
      --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest `
      --target-port $service.port `
      --ingress external `
      --query "properties.configuration.ingress.fqdn" -o tsv
}

# 4. Get Credentials for GitHub Actions
Write-Host "[4/4] Generating GitHub Secrets..." -ForegroundColor Yellow
$subId = az account show --query id -o tsv
$sp = az ad sp create-for-rbac --name "grocery-delivery-cicd" --role contributor --scopes "/subscriptions/$subId/resourceGroups/$RG_NAME" --sdk-auth | Out-String

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!                               " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "ACTION REQUIRED: Add these 3 Secrets to GitHub Settings -> Secrets -> Actions:" -ForegroundColor White
Write-Host ""
Write-Host "1. AZURE_CREDENTIALS" -ForegroundColor Yellow
Write-Host "   Copy this entire JSON block:" -ForegroundColor Gray
Write-Host $sp -ForegroundColor Green
Write-Host ""
Write-Host "2. SONAR_TOKEN" -ForegroundColor Yellow
Write-Host "   Generate this from SonarCloud.io" -ForegroundColor Gray
Write-Host ""
Write-Host "3. MONGO_URI (and other secrets from your .env)" -ForegroundColor Yellow
Write-Host "   Add these as Secrets to be injected into Container Apps via pipeline." -ForegroundColor Gray
Write-Host ""
Write-Host "Once secrets are added, push your code to GitHub to trigger the Full DevOps pipeline!" -ForegroundColor Cyan
