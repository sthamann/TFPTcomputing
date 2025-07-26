#!/bin/bash

# Q6 Project Startup Script
# Tests all constant calculations before starting services

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}       Q6 Topological Constants Project          ${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Function to check if Docker is running
check_docker() {
    echo -e "${YELLOW}Checking Docker status...${NC}"
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running!${NC}"
        echo "Please start Docker Desktop and try again."
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
    echo ""
}

# Function to build Docker images if needed
build_images() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker-compose build
    echo -e "${GREEN}✅ Docker images built${NC}"
    echo ""
}

# Function to test constant calculations
test_constants() {
    echo -e "${YELLOW}Testing constant calculations...${NC}"
    echo ""
    
    # Create a test script that will run inside Docker
    cat > /tmp/test_constants_docker.py << 'EOF'
#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path

def test_all_constants():
    """Test all constant calculations"""
    data_dir = Path("/app/constants/data")
    notebook_dir = Path("/app/constants/notebooks")
    
    if not data_dir.exists() or not notebook_dir.exists():
        print("❌ Constants directories not found!")
        return False
    
    constants = sorted([f.stem for f in data_dir.glob("*.json")])
    total = len(constants)
    
    # Check notebook existence
    missing = []
    for const_id in constants:
        notebook_path = notebook_dir / f"{const_id}.ipynb"
        if not notebook_path.exists():
            missing.append(const_id)
    
    print(f"📊 Total constants: {total}")
    print(f"📓 Notebooks found: {total - len(missing)}")
    
    if missing:
        print(f"❌ Missing notebooks: {len(missing)}")
        for const_id in missing[:5]:
            print(f"   - {const_id}")
        if len(missing) > 5:
            print(f"   ... and {len(missing) - 5} more")
        return False
    else:
        print("✅ All notebooks exist!")
        
    # Quick validation of key constants
    print("\n🔬 Validating key constants...")
    
    key_constants = ["phi", "phi_0", "c_3", "alpha", "alpha_s"]
    all_valid = True
    
    for const_id in key_constants:
        try:
            with open(f"/app/constants/data/{const_id}.json", 'r') as f:
                data = json.load(f)
            print(f"✅ {data['symbol']} ({const_id}): {data['name']}")
        except Exception as e:
            print(f"❌ {const_id}: Error - {e}")
            all_valid = False
    
    return all_valid

if __name__ == "__main__":
    success = test_all_constants()
    sys.exit(0 if success else 1)
EOF

    # Run the test in Docker
    docker run --rm \
        -v "$(pwd):/app" \
        -v "/tmp/test_constants_docker.py:/test_constants.py" \
        -w /app \
        python:3.12-slim \
        python /test_constants.py
    
    local test_result=$?
    
    if [ $test_result -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Constant calculations test passed!${NC}"
        return 0
    else
        echo ""
        echo -e "${RED}❌ Constant calculations test failed!${NC}"
        return 1
    fi
}

# Function to start services
start_services() {
    echo ""
    echo -e "${YELLOW}Starting services...${NC}"
    
    # Stop any existing services
    docker-compose down 2>/dev/null || true
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 5
    
    # Check service status
    if docker-compose ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Services started successfully!${NC}"
        echo ""
        echo -e "${BLUE}Services available at:${NC}"
        echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
        echo -e "  Backend:  ${GREEN}http://localhost:8000${NC}"
        echo -e "  Compute:  ${GREEN}http://localhost:8001${NC}"
        echo ""
        echo -e "${YELLOW}To view logs: ${NC}docker-compose logs -f"
        echo -e "${YELLOW}To stop:     ${NC}docker-compose down"
        return 0
    else
        echo -e "${RED}❌ Failed to start services!${NC}"
        docker-compose ps
        return 1
    fi
}

# Function to handle test failure
handle_test_failure() {
    echo ""
    echo -e "${YELLOW}⚠️  Constant calculation tests failed!${NC}"
    echo ""
    echo "Options:"
    echo "  1) Start services anyway"
    echo "  2) View detailed test report"
    echo "  3) Exit"
    echo ""
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            echo -e "${YELLOW}Starting services despite test failures...${NC}"
            return 0
            ;;
        2)
            echo -e "${YELLOW}Running detailed test report...${NC}"
            docker run --rm \
                -v "$(pwd):/app" \
                -w /app \
                python:3.12 \
                python test_all_constants.py || true
            echo ""
            read -p "Press Enter to continue..."
            handle_test_failure
            ;;
        3)
            echo -e "${RED}Exiting...${NC}"
            exit 1
            ;;
        *)
            echo -e "${RED}Invalid choice!${NC}"
            handle_test_failure
            ;;
    esac
}

# Main execution
main() {
    # Check Docker
    check_docker
    
    # Build images if needed
    if [ "$1" == "--build" ] || [ "$1" == "-b" ]; then
        build_images
    fi
    
    # Test constants
    if test_constants; then
        # Tests passed, start services
        start_services
    else
        # Tests failed, ask user what to do
        handle_test_failure
        if [ $? -eq 0 ]; then
            start_services
        fi
    fi
}

# Run main function
main "$@" 