# ===================================================
# Tech-geo — Deploy Backend
# ===================================================
# PowerShell script to deploy all Edge Functions
# Run: .\deploy.ps1
# ===================================================

param([string]$ProjectId = "")

$ErrorActionPreference = "Stop"

function Write-Step { param($msg) Write-Host "`n[TECH-GEO] $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "  OK  $msg" -ForegroundColor Green }
function Write-Err  { param($msg) Write-Host "  ERR $msg" -ForegroundColor Red }

Write-Step "Checking Supabase CLI..."
try {
  $null = Get-Command supabase -ErrorAction Stop
  Write-Ok "Supabase CLI found"
} catch {
  Write-Err "Supabase CLI not found. Install: npm install -g supabase"
  exit 1
}

Write-Step "Checking authentication..."
$null = supabase auth whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Err "Not logged in. Run: supabase login"
  exit 1
}
Write-Ok "Authenticated"

if (-not $ProjectId) {
  $ProjectId = $env:SUPABASE_PROJECT_ID
  if (-not $ProjectId) {
    $ProjectId = Read-Host "`nSupabase Project ID"
  }
}

Write-Step "Project: $ProjectId"

Write-Step "Linking project..."
supabase link --project-ref $ProjectId 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Err "Failed to link project"; exit 1 }
Write-Ok "Project linked"

$functions = @(
  "process-payment",
  "payment-callback",
  "notify-order",
  "notify-contact",
  "manage-order",
  "manage-product",
  "admin-stats",
  "search",
  "newsletter",
  "generate-receipt",
  "coupons",
  "analytics",
  "check-stock",
  "resize-image"
)

Write-Step "Deploying $($functions.Count) Edge Functions..."
$success = 0; $failed = 0

foreach ($fn in $functions) {
  Write-Host "  Deploying $fn... " -NoNewline
  $null = supabase functions deploy $fn --project-ref $ProjectId 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "OK" -ForegroundColor Green
    $success++
  } else {
    Write-Host "FAILED" -ForegroundColor Red
    $failed++
  }
}

Write-Step "Deployed: $success/$($functions.Count) (failed: $failed)"
Write-Host "`nFunctions:" -ForegroundColor Cyan
foreach ($fn in $functions) {
  Write-Host "  https://$ProjectId.supabase.co/functions/v1/$fn"
}
