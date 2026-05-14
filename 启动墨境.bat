@echo off
title MoJing InkRealm
echo.
echo   ========================================
echo        MoJing InkRealm
echo        AI Novel Writing Tool
echo   ========================================
echo.
echo   Starting server...
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERROR] Node.js not found. Please install Node.js 18+
    echo   Download: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist "dist" (
    echo   [INFO] First run, building project...
    call npm install --production=false
    call npm run build
    echo.
)

start "" "http://localhost:5173"
node server.js

echo.
echo   Server stopped.
echo.
pause