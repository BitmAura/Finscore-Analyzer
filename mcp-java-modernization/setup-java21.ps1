# Java 21 Environment Setup Script
# This sets up Java 21 for the current session and provides instructions for permanent setup

Write-Host "=== Java 21 Environment Setup ===" -ForegroundColor Green

# Step 1: Verify Java 21 installation
Write-Host "`n[1] Verifying Java 21 installation..." -ForegroundColor Yellow
$javaPath = "C:\Program Files\Java\jdk-21"
if (Test-Path "$javaPath\bin\java.exe") {
    $javaVersion = &"$javaPath\bin\java.exe" -version 2>&1 | Select-String "version"
    Write-Host "   [OK] Found: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Java 21 not found at $javaPath" -ForegroundColor Red
    exit 1
}

# Step 2: Set environment variables for current session
Write-Host "`n[2] Setting environment variables for this session..." -ForegroundColor Yellow
$env:JAVA_HOME = $javaPath
$env:PATH = "$javaPath\bin;$env:PATH"
Write-Host "   [OK] JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Green
Write-Host "   [OK] Added to PATH" -ForegroundColor Green

# Step 3: Verify java command works
Write-Host "`n[3] Testing java command..." -ForegroundColor Yellow
try {
    $version = java -version 2>&1 | Out-String
    Write-Host "   [OK] Java is accessible!" -ForegroundColor Green
    Write-Host $version -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] Java command failed" -ForegroundColor Red
    exit 1
}

# Step 4: Check Maven (optional)
Write-Host "`n[4] Checking for Maven..." -ForegroundColor Yellow
try {
    $mvnVersion = mvn -version 2>&1 | Select-String "Apache Maven" | Select-Object -First 1
    Write-Host "   [OK] $mvnVersion" -ForegroundColor Green
} catch {
    Write-Host "   [WARN] Maven not found (optional for MCP server)" -ForegroundColor Yellow
    Write-Host "   You can download Maven from: https://maven.apache.org/download.cgi" -ForegroundColor Gray
}

# Step 5: Display permanent setup instructions
Write-Host "`n=== Current Session Setup Complete! ===" -ForegroundColor Green
Write-Host "`nJava 21 is now available in THIS terminal session." -ForegroundColor White
Write-Host "`nTo make this PERMANENT (survive restarts):" -ForegroundColor Cyan
Write-Host "1. Press Windows Key" -ForegroundColor White
Write-Host "2. Type 'Environment Variables' and press Enter" -ForegroundColor White
Write-Host "3. Click 'Environment Variables' button" -ForegroundColor White
Write-Host "4. Under 'System variables':" -ForegroundColor White
Write-Host "   - New variable: JAVA_HOME = C:\Program Files\Java\jdk-21" -ForegroundColor Gray
Write-Host "   - Edit 'Path' and add: C:\Program Files\Java\jdk-21\bin" -ForegroundColor Gray
Write-Host "5. Click OK and restart terminals" -ForegroundColor White

Write-Host "`n=== Quick Commands ===" -ForegroundColor Cyan
Write-Host "Check Java:  java -version" -ForegroundColor White
Write-Host "Check Maven: mvn -version" -ForegroundColor White
Write-Host "Test MCP:    Reload VS Code and open Copilot Chat" -ForegroundColor White

Write-Host "`n=== Java 21 is Ready! ===" -ForegroundColor Green
