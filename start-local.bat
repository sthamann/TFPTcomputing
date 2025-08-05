@echo off
REM Q6 Local Start Script for Windows - Start all services without Docker

echo =================================================
echo        Starting Q6 Services Locally             
echo =================================================
echo.

REM Create logs directory
if not exist "logs" mkdir logs

REM Check if setup has been run
if not exist "compute\venv" (
    echo [ERROR] Python virtual environment not found!
    echo Please run setup-local.bat first
    pause
    exit /b 1
)

if not exist "backend\node_modules" (
    echo [ERROR] Backend dependencies not installed!
    echo Please run setup-local.bat first
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies not installed!
    echo Please run setup-local.bat first
    pause
    exit /b 1
)

REM Generate notebooks if needed
echo Checking constant notebooks...
if not exist "constants\notebooks\alpha.ipynb" (
    echo Generating constant notebooks...
    cd compute
    call venv\Scripts\activate.bat
    cd ..\constants
    python scripts\generate_notebooks.py
    call ..\compute\venv\Scripts\deactivate.bat
    cd ..
    echo [OK] Notebooks generated
)

REM Execute notebooks if no results exist
if not exist "constants\results\json\alpha_result.json" (
    echo Executing notebooks to calculate constants...
    echo This may take a few minutes on first run...
    cd compute
    call venv\Scripts\activate.bat
    python ..\constants\docker_execute_notebooks.py
    python ..\constants\extract_results_from_notebooks.py
    call venv\Scripts\deactivate.bat
    cd ..
    echo [OK] Constants calculated
)

REM Start Python Compute Service
echo Starting Python Compute Service...
cd compute
start /B cmd /c "venv\Scripts\activate && python -m uvicorn main:app --reload --port 8001 > ..\logs\compute.log 2>&1"
cd ..

REM Wait a moment for the service to start
timeout /t 3 /nobreak > nul

REM Start Node.js Backend
echo Starting Node.js Backend...
cd backend
set NODE_ENV=local
set PORT=8000
set PYTHON_SERVICE_URL=http://localhost:8001
start /B cmd /c "npm run dev > ..\logs\backend.log 2>&1"
cd ..

REM Wait a moment for the service to start
timeout /t 3 /nobreak > nul

REM Start React Frontend
echo Starting React Frontend...
cd frontend

REM Use local vite config if it exists
if exist "vite.config.local.js" (
    if exist "vite.config.js" move vite.config.js vite.config.js.backup > nul 2>&1
    copy vite.config.local.js vite.config.js > nul 2>&1
)

set VITE_API_URL=http://localhost:8000
start /B cmd /c "npm run dev > ..\logs\frontend.log 2>&1"
cd ..

REM Wait for services to be ready
echo.
echo Waiting for services to start...
timeout /t 5 /nobreak > nul

echo.
echo =================================================
echo All services should be starting!
echo =================================================
echo.
echo Service URLs:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   Compute:   http://localhost:8001
echo.
echo Service Logs:
echo   Frontend:  type logs\frontend.log
echo   Backend:   type logs\backend.log
echo   Compute:   type logs\compute.log
echo.
echo To stop all services:
echo   stop-local.bat
echo.
echo Note: Services are running in background windows.
echo You can close this window, but services will continue running.
echo.

pause