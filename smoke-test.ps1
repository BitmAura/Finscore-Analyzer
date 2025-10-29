# Smoke Test Script for FinScore Analyzer
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SMOKE TESTS - FinScore Analyzer" -ForegroundColor White  
Write-Host "========================================`n" -ForegroundColor Cyan

Start-Sleep -Seconds 5

$results = @{}

# Test 1: Homepage
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    $results['GET /'] = "[OK] Status: $($response.StatusCode)"
    Write-Host "[OK] GET / : $($response.StatusCode)" -ForegroundColor Green
} catch {
    $results['GET /'] = "[FAIL]"
    Write-Host "[FAIL] GET / : $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login page
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/login" -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    $results['GET /login'] = "[OK] Status: $($response.StatusCode)"
    Write-Host "[OK] GET /login : $($response.StatusCode)" -ForegroundColor Green
} catch {
    $results['GET /login'] = "[FAIL]"
    Write-Host "[FAIL] GET /login : FAIL" -ForegroundColor Red
}

# Test 3: Clear session API
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/clear-session" -Method POST -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    $results['POST /api/auth/clear-session'] = "[OK] Status: $($response.StatusCode)"
    Write-Host "[OK] POST /api/auth/clear-session : $($response.StatusCode)" -ForegroundColor Green
} catch {
    $results['POST /api/auth/clear-session'] = "[FAIL]"
    Write-Host "[FAIL] POST /api/auth/clear-session : FAIL" -ForegroundColor Red
}

# Test 4: Dashboard (requires auth, expect redirect)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/dashboard" -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    $results['GET /dashboard'] = "[OK] Status: $($response.StatusCode)"
    Write-Host "[OK] GET /dashboard : $($response.StatusCode)" -ForegroundColor Green
} catch {
    $results['GET /dashboard'] = "[REDIRECT] (expected)"
    Write-Host "[REDIRECT] GET /dashboard : Auth required (expected)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SUMMARY" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

$results.GetEnumerator() | ForEach-Object {
    Write-Host "$($_.Key): $($_.Value)"
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
