# ================================================================
#  Grocery Delivery System - Azure Deploy Script
#  Usage: powershell -ExecutionPolicy Bypass -File deploy.ps1
# ================================================================

# Load secrets from file
$secretsFile = "$PSScriptRoot\deploy.secrets.env"
if (-not (Test-Path $secretsFile)) {
    Write-Host "ERROR: deploy.secrets.env not found!" -ForegroundColor Red
    exit 1
}

$secrets = @{}
Get-Content $secretsFile | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" } | ForEach-Object {
    $parts = $_ -split "=", 2
    $key   = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"')
    $secrets[$key] = $value
}

# Configuration
$ACR      = "grocerydeliveryacr.azurecr.io"
$RG       = "grocery-delivery-rg"
$ENV_NAME = "grocery-delivery-env"
$DOMAIN   = "redcliff-0ea51bff.eastus.azurecontainerapps.io"

$ACR_USER = $secrets["ACR_USER"]
$ACR_PASS = $secrets["ACR_PASS"]

# Pre-computed Azure URLs
$GROCERY_URL  = "https://grocery-backend.$DOMAIN"
$USER_URL     = "https://user-service.$DOMAIN"
$DELIVERY_URL = "https://delivery-backend.$DOMAIN"
$ORDER_URL    = "https://order-service.$DOMAIN"
$ADMIN_URL    = "https://admin-frontend.$DOMAIN"
$CUSTOMER_URL = "https://customer-frontend.$DOMAIN"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  GROCERY DELIVERY SYSTEM - AZURE DEPLOYMENT   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# STEP 1: Login to ACR
Write-Host ""
Write-Host "[1/4] Logging into Azure Container Registry..." -ForegroundColor Yellow
echo $ACR_PASS | docker login $ACR --username $ACR_USER --password-stdin
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED: ACR Login" -ForegroundColor Red; exit 1 }
Write-Host "OK: Logged into ACR" -ForegroundColor Green

# STEP 2: Build and Push All Docker Images
Write-Host ""
Write-Host "[2/4] Building and Pushing Docker Images..." -ForegroundColor Yellow
Write-Host "      This takes 5-15 minutes..." -ForegroundColor Gray

function Build-And-Push {
    param($Label, $Number, $Tag, $Context, $BuildArgs = @{})
    Write-Host ""
    Write-Host "  [$Number/6] Building $Label..." -ForegroundColor Cyan
    $buildCmd = "docker build"
    foreach ($arg in $BuildArgs.GetEnumerator()) {
        $buildCmd += " --build-arg $($arg.Key)=`"$($arg.Value)`""
    }
    $buildCmd += " -t `"$ACR/${Tag}:latest`" $Context"
    Invoke-Expression $buildCmd
    if ($LASTEXITCODE -ne 0) { Write-Host "  FAILED: $Label" -ForegroundColor Red; exit 1 }
    docker push "$ACR/${Tag}:latest"
    if ($LASTEXITCODE -ne 0) { Write-Host "  PUSH FAILED: $Label" -ForegroundColor Red; exit 1 }
    Write-Host "  OK: $Label pushed" -ForegroundColor Green
}

Build-And-Push "grocery-backend"  "1" "grocery-backend"  "./Grocery_Store_Management/backend/src"
Build-And-Push "user-service"     "2" "user-service"     "./User_Management_and_Payment_Service/backend"
Build-And-Push "delivery-backend" "3" "delivery-backend" "./Delivery_Management/backend"
Build-And-Push "order-service"    "4" "order-service"    "./Order_and_Notification_Management/backend"

Build-And-Push "admin-frontend" "5" "admin-frontend" "./frontend" @{
    VITE_API_URL       = "$GROCERY_URL/api"
    VITE_API_URL_ORDER = "$ORDER_URL/api"
}

Build-And-Push "customer-frontend" "6" "customer-frontend" "./frontend-customer" @{
    VITE_API_URL_USER_MANAGEMENT_SERVICE    = "$USER_URL/api"
    VITE_API_URL_GROCERY_MANAGEMENT_SERVICE = "$GROCERY_URL/api"
    VITE_STRIPE_PUBLISHABLE_KEY             = $secrets["STRIPE_PUB_CUST"]
}

Write-Host ""
Write-Host "OK: All 6 images pushed to ACR!" -ForegroundColor Green

# STEP 3: Deploy Backends
Write-Host ""
Write-Host "[3/4] Deploying Backend Services to Azure..." -ForegroundColor Yellow

function Deploy-App {
    param($Name, $Port, $EnvVars = @())
    Write-Host ""
    Write-Host "  Deploying $Name..." -ForegroundColor Cyan
    $image = "$ACR/${Name}:latest"
    $exists = az containerapp show --name $Name --resource-group $RG 2>$null
    if ($exists) {
        # App exists - just update image and env vars
        if ($EnvVars.Count -gt 0) {
            az containerapp update `
              --name $Name `
              --resource-group $RG `
              --image $image `
              --set-env-vars $EnvVars | Out-Null
        } else {
            az containerapp update `
              --name $Name `
              --resource-group $RG `
              --image $image | Out-Null
        }
    } else {
        # App doesn't exist - create it with all settings
        az containerapp create `
          --name $Name `
          --resource-group $RG `
          --environment $ENV_NAME `
          --image $image `
          --registry-server $ACR `
          --registry-username $ACR_USER `
          --registry-password $ACR_PASS `
          --target-port $Port `
          --ingress external `
          --min-replicas 1 `
          --max-replicas 2 `
          --env-vars $EnvVars | Out-Null
    }
    if ($LASTEXITCODE -ne 0) { Write-Host "  FAILED: $Name" -ForegroundColor Red; exit 1 }
    Write-Host "  OK: $Name deployed!" -ForegroundColor Green
}

Deploy-App "grocery-backend" 5000 @(
    "MONGO_URI=$($secrets['GROCERY_MONGO'])",
    "JWT_SECRET=$($secrets['JWT_SECRET'])",
    "PORT=5000",
    "NODE_ENV=production",
    "CLOUDINARY_API_KEY=$($secrets['CLOUDINARY_KEY'])",
    "CLOUDINARY_SECRET_KEY=$($secrets['CLOUDINARY_SECRET'])",
    "CLOUDINARY_NAME=$($secrets['CLOUDINARY_NAME'])",
    "SUPER_ADMIN_USERNAME=superadmin",
    "SUPER_ADMIN_PASSWORD=$($secrets['SUPER_ADMIN_PASS'])",
    "EMAIL_USER=$($secrets['EMAIL_USER'])",
    "EMAIL_PASS=$($secrets['EMAIL_PASS'])",
    "STRIPE_SECRET_KEY=$($secrets['STRIPE_SECRET'])",
    "STRIPE_PUBLISHABLE_KEY=$($secrets['STRIPE_PUB'])",
    "FRONTEND_URL=$ADMIN_URL",
    "CUSTOMER_FRONTEND_URL=$CUSTOMER_URL"
)

Deploy-App "user-service" 5003 @(
    "MONGO_URI=$($secrets['USER_MONGO'])",
    "PORT=5003",
    "NODE_ENV=production",
    "FRONTEND_URL=$ADMIN_URL",
    "CUSTOMER_FRONTEND_URL=$CUSTOMER_URL"
)

Deploy-App "delivery-backend" 5001 @(
    "MONGO_URI=$($secrets['DELIVERY_MONGO'])",
    "PORT=5001",
    "NODE_ENV=production",
    "FRONTEND_URL=$ADMIN_URL",
    "CUSTOMER_FRONTEND_URL=$CUSTOMER_URL"
)

Deploy-App "order-service" 5004 @(
    "MONGO_URI=$($secrets['ORDER_MONGO'])",
    "JWT_SECRET=$($secrets['JWT_SECRET'])",
    "PORT=5004",
    "NODE_ENV=production",
    "FRONTEND_URL=$ADMIN_URL",
    "CUSTOMER_FRONTEND_URL=$CUSTOMER_URL"
)

# STEP 4: Deploy Frontends
Write-Host ""
Write-Host "[4/4] Deploying Frontend Services..." -ForegroundColor Yellow
Deploy-App "admin-frontend"    80 @()
Deploy-App "customer-frontend" 80 @()

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!                         " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Live URLs:" -ForegroundColor Cyan
Write-Host "  Admin Dashboard : $ADMIN_URL" -ForegroundColor White
Write-Host "  Customer App    : $CUSTOMER_URL" -ForegroundColor White
Write-Host "  Grocery API     : $GROCERY_URL" -ForegroundColor White
Write-Host "  User/Payment API: $USER_URL" -ForegroundColor White
Write-Host "  Delivery API    : $DELIVERY_URL" -ForegroundColor White
Write-Host "  Order API       : $ORDER_URL" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: First visit may be slow - cold start ~5 seconds" -ForegroundColor Gray
