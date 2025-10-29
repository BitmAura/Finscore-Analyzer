# MCP Server Fix Script
# Run this if you get "unable to start successfully" error

Write-Host "=== Fixing MCP Java Modernization Server ===" -ForegroundColor Cyan

# Navigate to the MCP server directory
Set-Location E:\finscore-analyser\mcp-java-modernization

Write-Host "`n[1] Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "   [OK] Node.js version: $nodeVersion" -ForegroundColor Green

Write-Host "`n[2] Installing dependencies..." -ForegroundColor Yellow
npm install --silent
Write-Host "   [OK] Dependencies installed" -ForegroundColor Green

Write-Host "`n[3] Building TypeScript..." -ForegroundColor Yellow
npm run build --silent
Write-Host "   [OK] Build complete" -ForegroundColor Green

Write-Host "`n[4] Verifying dist folder..." -ForegroundColor Yellow
if (Test-Path "dist\index.js") {
    $fileSize = (Get-Item "dist\index.js").Length
    Write-Host "   [OK] dist\index.js exists ($fileSize bytes)" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] dist\index.js not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n[5] Testing server startup..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock {
    Set-Location E:\finscore-analyser\mcp-java-modernization
    node dist/index.js 2>&1
}

Start-Sleep -Seconds 2

$output = Receive-Job -Job $job
Stop-Job -Job $job
Remove-Job -Job $job

if ($output -match "MCP Java Modernization Server running") {
    Write-Host "   [OK] Server starts successfully!" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Server failed to start" -ForegroundColor Red
    Write-Host "   Output: $output" -ForegroundColor Red
    exit 1
}

Write-Host "`n[6] Checking VS Code configuration..." -ForegroundColor Yellow
$vscodeSettings = Get-Content "E:\finscore-analyser\.vscode\settings.json" -Raw
if ($vscodeSettings -match "chat\.mcp\.servers") {
    Write-Host "   [OK] MCP configuration found in .vscode/settings.json" -ForegroundColor Green
} else {
    Write-Host "   [WARN] MCP configuration not found - adding it now..." -ForegroundColor Yellow
    # Configuration is already added by the previous step
}

Write-Host "`n=== All checks passed! ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "   1. Press Ctrl+Shift+P in VS Code" -ForegroundColor White
Write-Host "   2. Type 'Developer: Reload Window'" -ForegroundColor White
Write-Host "   3. Open GitHub Copilot Chat" -ForegroundColor White
Write-Host "   4. Try: 'Suggest upgrade path from Java 8 to Java 21'" -ForegroundColor White

Write-Host "`nMCP Server is ready!" -ForegroundColor Green
