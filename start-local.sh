#!/bin/bash

# Q6 Local Start Script - Start all services without Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}       Starting Q6 Services Locally              ${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to generate and execute notebooks
generate_notebooks() {
    echo -e "${YELLOW}Generating and executing constant notebooks...${NC}"
    
    # Step 1: Generate self-contained notebooks
    echo -e "${BLUE}📝 Generating self-contained notebooks from constant definitions...${NC}"
    cd constants
    
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        python scripts/generate_notebooks.py
    else
        # Unix-like systems
        if [ -f "../compute/venv/bin/activate" ]; then
            source ../compute/venv/bin/activate
            python scripts/generate_notebooks.py
            deactivate
        else
            python3 scripts/generate_notebooks.py
        fi
    fi
    
    if [ $? -ne 0 ]; then
        cd ..
        echo -e "${RED}❌ Notebook generation failed!${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Notebooks generated successfully!${NC}"
    
    # Step 2: Execute notebooks (always run to ensure fresh calculations)
    echo -e "${BLUE}🔬 Executing notebooks to calculate constant values...${NC}"
    echo -e "${YELLOW}This may take a few minutes...${NC}"
    
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        python execute_standalone_notebooks.py || true
    else
        # Unix-like systems
        if [ -f "../compute/venv/bin/activate" ]; then
            source ../compute/venv/bin/activate
            python execute_standalone_notebooks.py || true
            deactivate
        else
            python3 execute_standalone_notebooks.py || true
        fi
    fi
    
    cd ..
    
    if [ -f "constants/results/json/alpha_result.json" ]; then
        echo -e "${GREEN}✅ Notebooks executed and results saved${NC}"
    else
        echo -e "${YELLOW}⚠️  Some notebooks may have failed, but continuing...${NC}"
    fi
    
    echo ""
    return 0
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        echo -e "${YELLOW}Killing process on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to start Python compute service
start_compute() {
    echo -e "${YELLOW}Starting Python Compute Service...${NC}"
    
    # Kill existing process if running
    kill_port 8001
    
    cd compute
    
    # Start in background
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        ./venv/Scripts/python -m uvicorn main:app --reload --port 8001 > ../logs/compute.log 2>&1 &
    else
        # Unix-like systems
        source venv/bin/activate
        nohup python -m uvicorn main:app --reload --port 8001 > ../logs/compute.log 2>&1 &
        deactivate
    fi
    
    COMPUTE_PID=$!
    cd ..
    
    # Wait for service to start
    echo -n "Waiting for compute service to start..."
    for i in {1..30}; do
        if curl -s http://localhost:8001/health >/dev/null 2>&1; then
            echo -e " ${GREEN}✅${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    echo -e " ${RED}❌ Failed to start${NC}"
    return 1
}

# Function to start Node.js backend
start_backend() {
    echo -e "${YELLOW}Starting Node.js Backend...${NC}"
    
    # Kill existing process if running
    kill_port 8000
    
    cd backend
    
    # Use local environment variables
    export NODE_ENV=local
    export PORT=8000
    export PYTHON_SERVICE_URL=http://localhost:8001
    
    # Start in background
    nohup npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for service to start
    echo -n "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            echo -e " ${GREEN}✅${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    echo -e " ${RED}❌ Failed to start${NC}"
    return 1
}

# Function to start React frontend
start_frontend() {
    echo -e "${YELLOW}Starting React Frontend...${NC}"
    
    # Kill existing process if running
    kill_port 3000
    
    cd frontend
    
    # Use local vite config if it exists
    if [ -f "vite.config.local.js" ]; then
        mv vite.config.js vite.config.js.backup 2>/dev/null || true
        cp vite.config.local.js vite.config.js
    fi
    
    # Start in background
    export VITE_API_URL=http://localhost:8000
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for service to start
    echo -n "Waiting for frontend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e " ${GREEN}✅${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    echo -e " ${RED}❌ Failed to start${NC}"
    return 1
}

# Function to show service status
show_status() {
    echo ""
    echo -e "${GREEN}=================================================${NC}"
    echo -e "${GREEN}✅ All services started successfully!${NC}"
    echo -e "${GREEN}=================================================${NC}"
    echo ""
    echo -e "${BLUE}Service URLs:${NC}"
    echo -e "  Frontend:  ${GREEN}http://localhost:3000${NC}"
    echo -e "  Backend:   ${GREEN}http://localhost:8000${NC}"
    echo -e "  Compute:   ${GREEN}http://localhost:8001${NC}"
    echo ""
    echo -e "${BLUE}Service Logs:${NC}"
    echo -e "  Frontend:  ${YELLOW}tail -f logs/frontend.log${NC}"
    echo -e "  Backend:   ${YELLOW}tail -f logs/backend.log${NC}"
    echo -e "  Compute:   ${YELLOW}tail -f logs/compute.log${NC}"
    echo ""
    echo -e "${BLUE}To stop all services:${NC}"
    echo -e "  ${YELLOW}./stop-local.sh${NC}"
    echo ""
    echo -e "${YELLOW}Services are running in the background.${NC}"
    echo -e "${YELLOW}This terminal can be closed without affecting the services.${NC}"
}

# Function to handle errors
handle_error() {
    echo ""
    echo -e "${RED}❌ Error starting services!${NC}"
    echo ""
    echo "Check the logs for more information:"
    [ -f "logs/compute.log" ] && echo "  Compute: tail -f logs/compute.log"
    [ -f "logs/backend.log" ] && echo "  Backend: tail -f logs/backend.log"
    [ -f "logs/frontend.log" ] && echo "  Frontend: tail -f logs/frontend.log"
    
    # Kill any started processes
    [ ! -z "$COMPUTE_PID" ] && kill $COMPUTE_PID 2>/dev/null || true
    [ ! -z "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null || true
    [ ! -z "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null || true
    
    exit 1
}

# Main execution
main() {
    # Create logs directory
    mkdir -p logs
    
    # Check if setup has been run
    if [ ! -d "compute/venv" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
        echo -e "${RED}❌ Dependencies not installed!${NC}"
        echo "Please run ./setup-local.sh first"
        exit 1
    fi
    
    # Generate notebooks if needed
    generate_notebooks
    
    # Trap errors
    trap handle_error ERR
    
    # Start services in order
    start_compute
    start_backend
    start_frontend
    
    # Save PIDs to file for stop script
    cat > .local-pids << EOF
COMPUTE_PID=$COMPUTE_PID
BACKEND_PID=$BACKEND_PID
FRONTEND_PID=$FRONTEND_PID
EOF
    
    # Show status
    show_status
}

# Run main function
main