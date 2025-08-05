#!/bin/bash

# Q6 Local Stop Script - Stop all locally running services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}       Stopping Q6 Services                      ${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Function to kill process on port
kill_port() {
    local port=$1
    local service=$2
    
    echo -n "Stopping $service (port $port)..."
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        echo -e " ${GREEN}✅${NC}"
    else
        echo -e " ${YELLOW}not running${NC}"
    fi
}

# Function to kill process by PID
kill_pid() {
    local pid=$1
    local service=$2
    
    if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
        echo -n "Stopping $service (PID $pid)..."
        kill -9 $pid 2>/dev/null || true
        echo -e " ${GREEN}✅${NC}"
    fi
}

# Main execution
main() {
    # Try to read PIDs from file first
    if [ -f ".local-pids" ]; then
        source .local-pids
        
        echo -e "${YELLOW}Stopping services by PID...${NC}"
        kill_pid "$COMPUTE_PID" "Compute Service"
        kill_pid "$BACKEND_PID" "Backend Service"
        kill_pid "$FRONTEND_PID" "Frontend Service"
        
        rm -f .local-pids
        echo ""
    fi
    
    # Also kill by port in case PIDs are stale
    echo -e "${YELLOW}Ensuring all services are stopped...${NC}"
    kill_port 8001 "Compute Service"
    kill_port 8000 "Backend Service"
    kill_port 3000 "Frontend Service"
    
    # Restore original vite config if backed up
    if [ -f "frontend/vite.config.js.backup" ]; then
        mv frontend/vite.config.js.backup frontend/vite.config.js 2>/dev/null || true
    fi
    
    echo ""
    echo -e "${GREEN}✅ All services stopped${NC}"
    echo ""
}

# Run main function
main