@echo off
REM Q6 Local Stop Script for Windows - Stop all locally running services

echo =================================================
echo        Stopping Q6 Services                     
echo =================================================
echo.

REM Kill Python process on port 8001
echo Stopping Compute Service (port 8001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a > nul 2>&1
)
echo [OK] Compute Service stopped

REM Kill Node.js process on port 8000
echo Stopping Backend Service (port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a > nul 2>&1
)
echo [OK] Backend Service stopped

REM Kill Node.js process on port 3000
echo Stopping Frontend Service (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a > nul 2>&1
)
echo [OK] Frontend Service stopped

REM Restore original vite config if backed up
if exist "frontend\vite.config.js.backup" (
    cd frontend
    move /Y vite.config.js.backup vite.config.js > nul 2>&1
    cd ..
)

echo.
echo [OK] All services stopped
echo.

pause