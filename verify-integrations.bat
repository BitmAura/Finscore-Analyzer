@echo off
echo ========================================
echo FinScore Analyzer - Integration Checker
echo ========================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [ERROR] .env.local file not found!
    echo Please create .env.local with Supabase credentials
    pause
    exit /b 1
)

echo [1/6] Checking environment variables...
findstr /C:"NEXT_PUBLIC_SUPABASE_URL" .env.local >nul
if errorlevel 1 (
    echo [ERROR] NEXT_PUBLIC_SUPABASE_URL not found in .env.local
) else (
    echo [OK] NEXT_PUBLIC_SUPABASE_URL found
)

findstr /C:"NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local >nul
if errorlevel 1 (
    echo [ERROR] NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local
) else (
    echo [OK] NEXT_PUBLIC_SUPABASE_ANON_KEY found
)

findstr /C:"supabase-demo" .env.local >nul
if errorlevel 1 (
    echo [OK] Service role key appears valid (not demo key)
) else (
    echo [WARNING] Service role key is DEMO key - replace with real key!
)

echo.
echo [2/6] Checking if port 3000 is available...
netstat -ano | findstr ":3000" >nul
if errorlevel 1 (
    echo [OK] Port 3000 is available
) else (
    echo [WARNING] Port 3000 is in use!
    echo Would you like to kill the process? (Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
            echo Killing process %%a...
            taskkill /PID %%a /F
        )
    )
)

echo.
echo [3/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js
) else (
    for /f "delims=" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js version: %NODE_VERSION%
)

echo.
echo [4/6] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found!
) else (
    for /f "delims=" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm version: %NPM_VERSION%
)

echo.
echo [5/6] Checking if node_modules exists...
if exist node_modules (
    echo [OK] node_modules directory exists
) else (
    echo [WARNING] node_modules not found!
    echo Would you like to run 'npm install'? (Y/N)
    set /p install_choice=
    if /i "%install_choice%"=="Y" (
        echo Installing dependencies...
        call npm install
    )
)

echo.
echo [6/6] Checking critical files...
set FILES_OK=1

if not exist "src\lib\supabase.ts" (
    echo [ERROR] src\lib\supabase.ts missing
    set FILES_OK=0
) else (
    echo [OK] supabase.ts found
)

if not exist "src\middleware.ts" (
    echo [ERROR] src\middleware.ts missing
    set FILES_OK=0
) else (
    echo [OK] middleware.ts found
)

if not exist "src\app\providers.tsx" (
    echo [ERROR] src\app\providers.tsx missing
    set FILES_OK=0
) else (
    echo [OK] providers.tsx found
)

echo.
echo ========================================
echo Integration Check Complete!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Replace SUPABASE_SERVICE_ROLE_KEY in .env.local with your REAL key
echo    Get it from: https://app.supabase.com/project/gnhuwhfxotmfkvongowp/settings/api
echo.
echo 2. Verify database tables exist in Supabase Dashboard
echo.
echo 3. Start the development server:
echo    npm run dev
echo.
echo For detailed integration status, see: INTEGRATION_CHECKLIST.md
echo.
pause

