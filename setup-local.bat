@echo off
REM Q6 Local Setup Script for Windows - Install all dependencies without Docker

echo =================================================
echo        Q6 Local Development Setup               
echo =================================================
echo.

REM Check prerequisites
echo Checking prerequisites...

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js v18 or higher from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=2 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js v%NODE_VERSION% found

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python 3.10 or higher
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [OK] Python %PYTHON_VERSION% found

REM Check package manager
where pnpm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PKG_MANAGER=pnpm
    echo [OK] pnpm found
) else (
    where npm >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set PKG_MANAGER=npm
        echo [WARNING] pnpm not found, using npm
    ) else (
        echo [ERROR] No package manager found!
        echo Please install npm or pnpm
        pause
        exit /b 1
    )
)

echo.

REM Setup Python environment
echo Setting up Python environment...
cd compute

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Install Python dependencies
echo Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
call venv\Scripts\deactivate.bat

cd ..
echo [OK] Python environment ready
echo.

REM Setup Node.js backend
echo Setting up Backend (Node.js)...
cd backend

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating backend .env file...
    (
        echo NODE_ENV=local
        echo PORT=8000
        echo PYTHON_SERVICE_URL=http://localhost:8001
        echo LOG_LEVEL=info
    ) > .env
)

REM Install dependencies
echo Installing backend dependencies...
call %PKG_MANAGER% install

cd ..
echo [OK] Backend setup complete
echo.

REM Setup React frontend
echo Setting up Frontend (React/Vite)...
cd frontend

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating frontend .env file...
    (
        echo VITE_API_URL=http://localhost:8000
    ) > .env
)

REM Create local vite config
echo Creating local Vite config...
(
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo.
echo export default defineConfig({
echo   plugins: [react()],
echo   server: {
echo     host: 'localhost',
echo     port: 3000,
echo     proxy: {
echo       '/api': {
echo         target: 'http://localhost:8000',
echo         changeOrigin: true,
echo         secure: false
echo       },
echo       '/ws': {
echo         target: 'ws://localhost:8000',
echo         ws: true,
echo         changeOrigin: true
echo       },
echo       '/constants': {
echo         target: 'http://localhost:8000',
echo         changeOrigin: true
echo       },
echo       '/compute': {
echo         target: 'http://localhost:8000',
echo         changeOrigin: true
echo       }
echo     }
echo   }
echo })
) > vite.config.local.js

REM Install dependencies
echo Installing frontend dependencies...
call %PKG_MANAGER% install

cd ..
echo [OK] Frontend setup complete
echo.

REM Generate constants if needed
echo Checking constants generation...
if not exist "constants\notebooks" (
    echo Generating constant notebooks...
    cd compute
    call venv\Scripts\activate.bat
    cd ..\constants
    python scripts\generate_notebooks.py
    call ..\compute\venv\Scripts\deactivate.bat
    cd ..
) else (
    echo [OK] Constants already generated
)

echo.
echo =================================================
echo [OK] Local setup complete!
echo =================================================
echo.
echo To start all services, run:
echo   start-local.bat
echo.
echo Or start services individually:
echo   Terminal 1 - Python Compute Service
echo   cd compute ^&^& venv\Scripts\activate ^&^& python -m uvicorn main:app --reload --port 8001
echo.
echo   Terminal 2 - Node.js Backend
echo   cd backend ^&^& npm run dev
echo.
echo   Terminal 3 - React Frontend
echo   cd frontend ^&^& npm run dev
echo.

pause