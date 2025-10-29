param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$Browser = "chrome",
  [switch]$Headless
)

$ErrorActionPreference = 'Stop'

Write-Host "Starting dev server..." -ForegroundColor Cyan
# Launch via cmd to handle npm shim on Windows
$cmd = (Get-Command cmd.exe).Source
if (-not $cmd) { throw "cmd.exe not found" }
$dev = Start-Process -FilePath $cmd -ArgumentList "/c","npm run dev" -NoNewWindow -PassThru

# Wait for readiness
$deadline = (Get-Date).AddMinutes(2)
while((Get-Date) -lt $deadline) {
  try {
    $code = (Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/api/readiness" -TimeoutSec 5).StatusCode
    if ($code -eq 200) { break }
  } catch {}
  Start-Sleep -Seconds 2
}

try {
  Write-Host "Running Selenium TestNG suite..." -ForegroundColor Cyan
  Push-Location e2e-selenium
  $mvn = (Get-Command mvn -ErrorAction SilentlyContinue).Source
  if (-not $mvn) { $mvn = (Get-Command mvn.cmd -ErrorAction SilentlyContinue).Source }
  if (-not $mvn) { throw "Maven (mvn) not found in PATH. Please install Maven or add it to PATH." }
  & $mvn test -DBASE_URL=$BaseUrl -DBROWSER=$Browser -DHEADLESS=$([bool]$Headless) -DTEST_EMAIL=$env:TEST_EMAIL -DTEST_PASSWORD=$env:TEST_PASSWORD
  $exit = $LASTEXITCODE
  Pop-Location
} finally {
  Write-Host "Stopping dev server..." -ForegroundColor Yellow
  try { Stop-Process -Id $dev.Id -Force } catch {}
}

exit $exit
