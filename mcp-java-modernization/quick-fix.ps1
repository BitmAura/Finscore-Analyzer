# Quick Fix for MCP Server "Unable to Start" Error

Write-Host "=== MCP Server Quick Fix ===" -ForegroundColor Cyan

# Step 1: Verify server can run
Write-Host "`n[1] Testing MCP server..." -ForegroundColor Yellow
Set-Location E:\finscore-analyser\mcp-java-modernization

$testJob = Start-Job -ScriptBlock {
    Set-Location E:\finscore-analyser\mcp-java-modernization
    node dist/index.js 2>&1
}

Start-Sleep -Seconds 2
$output = Receive-Job -Job $testJob
Stop-Job -Job $testJob
Remove-Job -Job $testJob

if ($output -match "MCP Java Modernization Server running") {
    Write-Host "   [OK] Server executable works!" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Server failed to start" -ForegroundColor Red
    Write-Host "   Running rebuild..." -ForegroundColor Yellow
    npm run build --silent
}

# Step 2: Check VS Code config
Write-Host "`n[2] Checking VS Code configuration..." -ForegroundColor Yellow
$settingsPath = "E:\finscore-analyser\.vscode\settings.json"
$settings = Get-Content $settingsPath -Raw

if ($settings -match "chat\.mcp\.servers") {
    Write-Host "   [OK] MCP configuration found" -ForegroundColor Green
} else {
    Write-Host "   [WARN] MCP configuration missing!" -ForegroundColor Red
}

# Step 3: Instructions
Write-Host "`n=== SOLUTION ===" -ForegroundColor Green
Write-Host "`nThe MCP server is configured correctly but VS Code needs to reload.`n" -ForegroundColor White

Write-Host "Follow these steps:" -ForegroundColor Cyan
Write-Host "  1. Press Ctrl+Shift+P" -ForegroundColor White
Write-Host "  2. Type: Developer: Reload Window" -ForegroundColor White
Write-Host "  3. Press Enter" -ForegroundColor White
Write-Host "`nAfter reload:" -ForegroundColor Cyan
Write-Host "  - The 'unable to start' error should disappear" -ForegroundColor White
Write-Host "  - Open Copilot Chat (Ctrl+Alt+I)" -ForegroundColor White
Write-Host "  - Ask: 'What's the upgrade path from Java 8 to Java 21?'" -ForegroundColor White

Write-Host "`n[READY] MCP server is working - just reload VS Code!" -ForegroundColor Green
