<#
.SYNOPSIS
  Point a fresh PostgreSQL database at this app: create the schema, load the
  sample data, and verify it worked.

.EXAMPLE
  .\scripts\setup-db.ps1 -DatabaseUrl "postgresql://user:pw@host.neon.tech/db?sslmode=require"

.NOTES
  Only affects the database you pass in. Your local .env is left alone, and the
  connection string is never written to disk.
#>

param(
  [Parameter(Mandatory = $true, HelpMessage = "The full postgresql:// connection string from your database provider.")]
  [string]$DatabaseUrl,

  # Skip the sample series/chapters and create only the empty schema.
  [switch]$SkipSeed
)

$ErrorActionPreference = "Stop"

function Fail($message) {
  Write-Host ""
  Write-Host "  $message" -ForegroundColor Red
  Write-Host ""
  exit 1
}

# --- Catch placeholder strings before Prisma spends 30s timing out on them ----
if ($DatabaseUrl -match '[<>]') {
  Fail "That string still has angle brackets in it. Paste the real connection string from your database provider, not the example."
}
if ($DatabaseUrl -notmatch '^postgres(ql)?://') {
  Fail "That does not look like a PostgreSQL URL. It should start with postgresql:// - copy it from your provider's connection details."
}

try {
  $parsed = [System.Uri]$DatabaseUrl
} catch {
  Fail "Could not parse that as a URL. Copy the whole connection string, including the postgresql:// prefix."
}

if ($parsed.Host -in @("host", "hostname", "your-host", "example.com")) {
  Fail "The host in that string is literally '$($parsed.Host)' - that is a placeholder, not a real server. Get the real string from your provider (Vercel: Storage tab -> your database -> .env.local)."
}
if ($parsed.Host -in @("localhost", "127.0.0.1")) {
  Write-Host "  Note: this is your local Docker database, not a hosted one." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Target: $($parsed.Host)$($parsed.AbsolutePath)" -ForegroundColor Cyan
Write-Host ""

$env:DATABASE_URL = $DatabaseUrl

try {
  Write-Host "  [1/3] Creating schema..." -ForegroundColor Cyan
  npx prisma db push --skip-generate
  if ($LASTEXITCODE -ne 0) { Fail "Schema push failed. If it could not reach the server, check the host is correct and that your provider allows connections from your IP." }

  if (-not $SkipSeed) {
    Write-Host ""
    Write-Host "  [2/3] Loading sample data..." -ForegroundColor Cyan
    npx prisma db seed
    if ($LASTEXITCODE -ne 0) { Fail "Seeding failed. The schema was created, so you can re-run this script or use -SkipSeed." }
  } else {
    Write-Host ""
    Write-Host "  [2/3] Skipping seed (-SkipSeed)." -ForegroundColor Yellow
  }

  Write-Host ""
  Write-Host "  [3/3] Verifying..." -ForegroundColor Cyan
  node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.series.count().then(async n=>{const c=await p.chapter.count();console.log('       '+n+' series, '+c+' chapters readable');await p.`$disconnect()}).catch(e=>{console.error('       verification failed: '+e.message);process.exit(1)})"
  if ($LASTEXITCODE -ne 0) { Fail "Could not read back from the database after setup." }
} finally {
  Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "  Done." -ForegroundColor Green
Write-Host ""
Write-Host "  Next: set the same DATABASE_URL in Vercel" -ForegroundColor White
Write-Host "  Project -> Settings -> Environment Variables -> add DATABASE_URL -> Redeploy." -ForegroundColor Gray
Write-Host "  (If you created the database from Vercel's Storage tab, this is already done.)" -ForegroundColor Gray
Write-Host ""
