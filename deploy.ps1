# ================================================================
#  🚀 Grocery Delivery System — Azure Deploy Script
#  Reads secrets from deploy.secrets.env (never committed to GitHub)
#  Usage: powershell -ExecutionPolicy Bypass -File deploy.ps1
# ================================================================

# ── Load secrets from file ────────────────────────────────────────
$secretsFile = "$PSScriptRoot\deploy.secrets.env"
if (-not (Test-Path $secretsFile)) {
    Write-Host "❌ ERROR: deploy.secrets.env not found!" -ForegroundColor Red
    Write-Host "   Create it from deploy.secrets.env.example" -ForegroundColor Yellow
    exit 1
}

$secrets = @{}
Get-Content $secretsFile | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" } | ForEach-Object {
    $parts = $_ -split "=", 2
    $key   = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"')
    $secrets[$key] = $value
}

# ── Configuration ─────────────────────────────────────────────────
$ACR      = "grocerydeliveryacr.azurecr.io"
$RG       = "grocery-delivery-rg"
$ENV      = "grocery-delivery-env"
$DOMAIN   = "redcliff-0ea51bff.eastus.azurecontainerapps.io"

$ACR_USER = $secrets["ACR_USER"]
$ACR_PASS = $secrets["ACR_PASS"]

# ── Pre-computed Azure URLs ───────────────────────────────────────
$GROCERY_URL  = "https://grocery-backend.$DOMAIN"
$USER_URL     = "https://user-service.$DOMAIN"
$DELIVERY_URL = "https://delivery-backend.$DOMAIN"
$ORDER_URL    = "https://order-service.$DOMAIN"
$ADMIN_URL    = "https://admin-frontend.$DOMAIN"
$CUSTOMER_URL = "https://customer-frontend.$DOMAIN"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  GROCERY DELIVERY SYSTEM — AZURE DEPLOYMENT   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# ── STEP 1: Login to ACR ─────────────────────────────────────────
Write-Host ""
Write-Host "🔑 Step 1/4: Logging into Azure Container Registry..." -ForegroundColor Yellow
echo $ACR_PASS | docker login $ACR --username $ACR_USER --password-stdin
if ($LASTEXITCODE -ne 0) { Write-Host "❌ ACR Login failed!" -ForegroundColor Red; exit 1 }
Write-Host "✅ Logged into ACR" -ForegroundColor Green

# ── STEP 2: Build & Push All Docker Images ────────────────────────
Write-Host ""
Write-Host "🐳 Step 2/4: Building & Pushing Docker Images..." -ForegroundColor Yellow
Write-Host "   (This takes 5-15 minutes for all 6 services)" -ForegroundColor Gray

function Build-And-Push {
    param($Label, $Number, $Tag, $Context, $BuildArgs = @{})
    Write-Host ""
    Write-Host "  [$Number/6] Building $Label..." -ForegroundColor Cyan
    $buildCmd = "docker build"
    foreach ($arg in $BuildArgs.GetEnumerator()) {
        $buildCmd += " --build-arg $($arg.Key)=`"$($arg.Value)`""
    }
    $buildCmd += " -t `"$ACR/$Tag`:latest`" $Context"
    Invoke-Expression $buildCmd
    if ($LASTEXITCODE -ne 0) { Write-Host "❌ Build failed: $Label" -ForegroundColor Red; exit 1 }
    docker push "$ACR/${Tag}:latest"
    if ($LASTEXITCODE -ne 0) { Write-Host "❌ Push failed: $Label" -ForegroundColor Red; exit 1 }
    Write-Host "  ✅ $Label pushed" -ForegroundColor Green
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
Write-Host "✅ All 6 images pushed to ACR!" -ForegroundColor Green

# ── STEP 3: Deploy Backends ───────────────────────────────────────
Write-Host ""
Write-Host "🚀 Step 3/4: Deploying Backend Services..." -ForegroundColor Yellow

function Deploy-App {
    param($Name, $Port, $EnvVars = @())
    Write-Host ""
    Write-Host "  Deploying $Name..." -ForegroundColor Cyan
    $image = "$ACR/${Name}:latest"
    $exists = az containerapp show --name $Name --resource-group $RG 2>$null
    if ($exists) {
        az containerapp update --name $Name --resource-group $RG --image $image | Out-Null
    } else {
        $envString = ($EnvVars | ForEach-Object { $_ }) -join " "
        az containerapp create `
          --name $Name --resource-group $RG --environment $ENV `
          --image $image `
          --registry-server $ACR --registry-username $ACR_USER --registry-password $ACR_PASS `
          --target-port $Port --ingress external `
          --min-replicas 0 --max-replicas 2 `
          --env-vars $EnvVars | Out-Null
    }
    if ($LASTEXITCODE -ne 0) { Write-Host "  ❌ Failed: $Name" -ForegroundColor Red; exit 1 }
    Write-Host "  ✅ $Name deployed!" -ForegroundColor Green
}

Deploy-App "grocery-backend" 5000 @(
    "MONGO_URI=$($secrets['GROCERY_MONGO'])",
    "JWT_SECRET=$($secrets['JWT_SECRET'])",
    "PORT=5000", "NODE_ENV=production",
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
    "PORT=5003", "NODE_ENV=production",
    "FRONTEND_URL=$ADMIN_URL",
    "CUSTOMER_FRONTEND_URL=$CUSTOMER_URL"
)

Deploy-App "delivery-backend" 5001 @(
    "MONGO_URI=$($secrets['DELIVERY_MONGO'])",
    "PORT=5001", "NODE_ENV=production",
    "FRONTEND_URL=$ADMIN_URL",
    "CUSTOMER_FRONTEND_URL=$CUSTOMER_URL"
)

Deploy-App "order-service" 5004 @(
    "MONGO_URI=$($secrets['ORDER_MONGO'])",
    "JWT_SECRET=$($secrets['JWT_SECRET'])",
    "PORT=5004", "NODE_ENV=production",
    "FRONTEND_URL=$ADMIN_URL",
    "CUSTOMER_FRONTEND_URL=$CUSTOMER_URL"
)

# ── STEP 4: Deploy Frontends ──────────────────────────────────────
Write-Host ""
Write-Host "🌐 Step 4/4: Deploying Frontend Services..." -ForegroundColor Yellow
Deploy-App "admin-frontend"    80 @()
Deploy-App "customer-frontend" 80 @()

# ── Summary ───────────────────────────────────────────────────────
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  ✅ DEPLOYMENT COMPLETE!                       " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌍 Your Live URLs:" -ForegroundColor Cyan
Write-Host "  🖥️  Admin:    $ADMIN_URL" -ForegroundColor White
Write-Host "  🛒  Customer: $CUSTOMER_URL" -ForegroundColor White
Write-Host "  🏪  Grocery:  $GROCERY_URL" -ForegroundColor White
Write-Host "  👤  User:     $USER_URL" -ForegroundColor White
Write-Host "  🚚  Delivery: $DELIVERY_URL" -ForegroundColor White
Write-Host "  📦  Order:    $ORDER_URL" -ForegroundColor White
Write-Host ""
Write-Host "💡 First visit may be slow — cold start takes ~5 seconds" -ForegroundColor Gray
