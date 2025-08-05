#!/bin/bash

# Q6 Local Setup Script - Install all dependencies without Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}       Q6 Local Development Setup                ${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed!${NC}"
        echo "Please install Node.js v18 or higher from https://nodejs.org"
        exit 1
    fi
    node_version=$(node -v | cut -d'v' -f2)
    echo -e "${GREEN}✅ Node.js v${node_version} found${NC}"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 is not installed!${NC}"
        echo "Please install Python 3.10 or higher"
        exit 1
    fi
    python_version=$(python3 --version | cut -d' ' -f2)
    echo -e "${GREEN}✅ Python ${python_version} found${NC}"
    
    # Check package manager (prefer pnpm, fallback to npm)
    if command -v pnpm &> /dev/null; then
        PKG_MANAGER="pnpm"
        echo -e "${GREEN}✅ pnpm found${NC}"
    elif command -v npm &> /dev/null; then
        PKG_MANAGER="npm"
        echo -e "${YELLOW}⚠️  pnpm not found, using npm${NC}"
    else
        echo -e "${RED}❌ No package manager found!${NC}"
        echo "Please install npm or pnpm"
        exit 1
    fi
    
    echo ""
}

# Function to setup Python environment
setup_python() {
    echo -e "${YELLOW}Setting up Python environment...${NC}"
    cd compute
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment and install dependencies
    echo "Installing Python dependencies..."
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        ./venv/Scripts/pip install -r requirements.txt
    else
        # Unix-like systems
        source venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        deactivate
    fi
    
    cd ..
    echo -e "${GREEN}✅ Python environment ready${NC}"
    echo ""
}

# Function to setup Node.js backend
setup_backend() {
    echo -e "${YELLOW}Setting up Backend (Node.js)...${NC}"
    cd backend
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "Creating backend .env file..."
        cat > .env << EOF
NODE_ENV=local
PORT=8000
PYTHON_SERVICE_URL=http://localhost:8001
LOG_LEVEL=info
EOF
    fi
    
    # Install dependencies
    echo "Installing backend dependencies..."
    $PKG_MANAGER install
    
    cd ..
    echo -e "${GREEN}✅ Backend setup complete${NC}"
    echo ""
}

# Function to setup React frontend
setup_frontend() {
    echo -e "${YELLOW}Setting up Frontend (React/Vite)...${NC}"
    cd frontend
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "Creating frontend .env file..."
        cat > .env << EOF
VITE_API_URL=http://localhost:8000
EOF
    fi
    
    # Update vite.config.js for local development
    echo "Updating Vite config for local development..."
    cat > vite.config.local.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true
      },
      '/constants': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/compute': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
EOF
    
    # Install dependencies
    echo "Installing frontend dependencies..."
    $PKG_MANAGER install
    
    cd ..
    echo -e "${GREEN}✅ Frontend setup complete${NC}"
    echo ""
}

# Function to generate constants if needed
generate_constants() {
    echo -e "${YELLOW}Checking constants generation...${NC}"
    
    if [ ! -d "constants/notebooks" ] || [ -z "$(ls -A constants/notebooks 2>/dev/null)" ]; then
        echo "Generating constant notebooks..."
        cd constants
        
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            # Windows
            python scripts/generate_notebooks.py
        else
            # Unix-like systems
            cd ../compute
            source venv/bin/activate
            cd ../constants
            python scripts/generate_notebooks.py
            deactivate
            cd ..
        fi
    else
        echo -e "${GREEN}✅ Constants already generated${NC}"
    fi
    echo ""
}

# Main setup
main() {
    check_prerequisites
    setup_python
    setup_backend
    setup_frontend
    generate_constants
    
    echo -e "${GREEN}=================================================${NC}"
    echo -e "${GREEN}✅ Local setup complete!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo ""
    echo -e "${BLUE}To start all services, run:${NC}"
    echo -e "  ${YELLOW}./start-local.sh${NC}"
    echo ""
    echo -e "${BLUE}Or start services individually:${NC}"
    echo -e "  ${YELLOW}# Terminal 1 - Python Compute Service${NC}"
    echo -e "  cd compute && source venv/bin/activate && python -m uvicorn main:app --reload --port 8001"
    echo ""
    echo -e "  ${YELLOW}# Terminal 2 - Node.js Backend${NC}"
    echo -e "  cd backend && npm run dev"
    echo ""
    echo -e "  ${YELLOW}# Terminal 3 - React Frontend${NC}"
    echo -e "  cd frontend && npm run dev"
    echo ""
}

# Run main function
main