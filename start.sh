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
            docker compose build
    echo -e "${GREEN}✅ Docker images built${NC}"
    echo ""
}

# Function to generate and execute constant calculations
test_constants() {
    echo -e "${YELLOW}Generating and testing constant calculations...${NC}"
    echo ""
    
    # Step 1: Generate notebooks
    echo -e "${BLUE}📝 Step 1: Generating notebooks from constant definitions...${NC}"
    docker run --rm \
        -v "$(pwd):/app" \
        -w /app \
        python:3.12-slim \
        bash -c "
            pip install -q nbformat sympy numpy pint &&
            cd constants &&
            python scripts/generate_notebooks.py
        "
    
    local gen_result=$?
    if [ $gen_result -ne 0 ]; then
        echo -e "${RED}❌ Notebook generation failed!${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ Notebooks generated successfully!${NC}"
    echo ""
    
    # Step 2: Execute notebooks to generate results
    echo -e "${BLUE}🔬 Step 2: Executing notebooks to calculate constant values...${NC}"
    
    # Copy our execution script to temp location
    cp constants/docker_execute_notebooks.py /tmp/execute_notebooks.py
    
    # Create notebook execution script (DEPRECATED - using docker_execute_notebooks.py instead)
    cat > /tmp/execute_notebooks_old.py << 'EOF'
#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path
import subprocess
import time

def test_single_notebook():
    """Test execution of a single notebook first"""
    notebook_dir = Path("/app/constants/notebooks")
    results_dir = Path("/app/constants/results")
    
    # Try to execute a simple notebook first
    test_notebooks = ["phi_0", "c_3", "alpha"]
    for test_nb in test_notebooks:
        nb_path = notebook_dir / f"{test_nb}.ipynb"
        if nb_path.exists():
            print(f"🧪 Testing execution with {test_nb} notebook...")
            try:
                result = subprocess.run([
                    'jupyter', 'nbconvert', 
                    '--to', 'notebook',
                    '--execute',
                    '--output-dir', str(results_dir),
                    '--output', f'{test_nb}_test_executed.ipynb',
                    str(nb_path)
                ], capture_output=True, text=True, timeout=120)
                
                if result.returncode == 0:
                    print(f"✅ Test execution successful!")
                    return True
                else:
                    print(f"❌ Test execution failed!")
                    print(f"STDOUT:\n{result.stdout}")
                    print(f"STDERR:\n{result.stderr}")
                    return False
                    
            except Exception as e:
                print(f"💥 Test execution error: {e}")
                return False
    
    print("❌ No suitable test notebooks found!")
    return False

def execute_notebooks():
    """Execute all constant notebooks to generate results"""
    notebook_dir = Path("/app/constants/notebooks")
    results_dir = Path("/app/constants/results")
    data_dir = Path("/app/constants/data")
    
    # Ensure results directory exists
    results_dir.mkdir(exist_ok=True)
    
    if not notebook_dir.exists():
        print("❌ Notebooks directory not found!")
        return False
    
    # Test single notebook first
    if not test_single_notebook():
        print("❌ Single notebook test failed, aborting batch execution")
        return False
    
    # Get all notebooks
    notebooks = sorted(list(notebook_dir.glob("*.ipynb")))
    total = len(notebooks)
    print(f"\n📊 Found {total} notebooks to execute")
    print("")
    
    executed = 0
    failed = 0
    error_details = []
    
    for i, nb_path in enumerate(notebooks, 1):
        const_id = nb_path.stem
        print(f"[{i:3d}/{total}] Executing {const_id}...", end=" ", flush=True)
        
        try:
            # Execute notebook using nbconvert
            result = subprocess.run([
                'jupyter', 'nbconvert', 
                '--to', 'notebook',
                '--execute',
                '--output-dir', str(results_dir),
                '--output', f'{const_id}_executed.ipynb',
                str(nb_path)
            ], capture_output=True, text=True, timeout=120)
            
            if result.returncode == 0:
                print("✅")
                executed += 1
            else:
                print("❌")
                # Show error immediately for debugging
                if result.stderr:
                    print(f"    Error: {result.stderr.strip()[:200]}")
                error_details.append({
                    'notebook': const_id,
                    'stdout': result.stdout,
                    'stderr': result.stderr
                })
                failed += 1
                
        except subprocess.TimeoutExpired:
            print("⏰ (timeout)")
            failed += 1
        except Exception as e:
            print(f"💥 ({str(e)})")
            failed += 1
    
    print("")
    print(f"📈 Execution Summary:")
    print(f"   ✅ Successful: {executed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📊 Total: {total}")
    
    # Show detailed errors for first few failures
    if error_details:
        print(f"\n🔍 First few error details:")
        for i, error in enumerate(error_details[:3]):
            print(f"\n--- Error {i+1}: {error['notebook']} ---")
            if error['stderr']:
                print(f"STDERR:\n{error['stderr']}")
            if error['stdout']:
                print(f"STDOUT:\n{error['stdout']}")
    
    # Check for result files
    result_files = list(results_dir.glob("*_result.json"))
    print(f"\n   💾 Result files generated: {len(result_files)}")
    
    return failed == 0

if __name__ == "__main__":
    success = execute_notebooks()
    sys.exit(0 if success else 1)
EOF
    
    # Execute notebooks in Docker with Jupyter
    docker run --rm \
        -v "$(pwd):/app" \
        -v "/tmp/execute_notebooks.py:/execute_notebooks.py" \
        -w /app \
        python:3.12-slim \
        bash -c "
            pip install -q nbformat sympy numpy pint &&
            python /execute_notebooks.py
        "
    
    local exec_result=$?
    
    # Step 3: Validate results
    echo ""
    echo -e "${BLUE}🔍 Step 3: Validating generated results...${NC}"
    
    # Create validation script
    cat > /tmp/validate_results.py << 'EOF'
#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path

def validate_results():
    """Validate the generated results"""
    data_dir = Path("/app/constants/data")
    # Check for json subdirectory first
    if Path("/app/constants/results/json").exists():
        results_dir = Path("/app/constants/results/json")
    else:
        results_dir = Path("/app/constants/results")
    
    if not data_dir.exists() or not results_dir.exists():
        print("❌ Required directories not found!")
        return False
    
    constants = sorted([f.stem for f in data_dir.glob("*.json")])
    result_files = list(results_dir.glob("*_result.json"))
    
    print(f"📊 Total constants: {len(constants)}")
    print(f"💾 Result files: {len(result_files)}")
    print(f"📓 Executed notebooks: {len(list(results_dir.glob('*_executed.ipynb')))}")
    
    # Check key constants
    key_constants = ["phi", "phi_0", "c_3", "alpha", "alpha_s"]
    print(f"\n🔬 Validating key constants...")
    
    all_valid = True
    for const_id in key_constants:
        try:
            # Check if result exists
            result_path = results_dir / f"{const_id}_result.json"
            if result_path.exists():
                with open(result_path, 'r') as f:
                    result = json.load(f)
                print(f"✅ {result.get('symbol', const_id)}: calculated successfully")
            else:
                print(f"⚠️  {const_id}: no result file found")
                all_valid = False
        except Exception as e:
            print(f"❌ {const_id}: Error - {e}")
            all_valid = False
    
    return all_valid and len(result_files) > 0

if __name__ == "__main__":
    success = validate_results()
    sys.exit(0 if success else 1)
EOF

    docker run --rm \
        -v "$(pwd):/app" \
        -v "/tmp/validate_results.py:/validate_results.py" \
        -w /app \
        python:3.12-slim \
        python /validate_results.py
    
    local val_result=$?
    
    # Step 4: Extract results from executed notebooks
    echo ""
    echo -e "${YELLOW}🔍 Step 4: Extracting results from executed notebooks...${NC}"
    
    # Copy extraction script to temp
    cp constants/extract_results_from_notebooks.py /tmp/extract_results.py
    
    # Extract results
    docker run --rm \
        -v "$(pwd):/app" \
        -v "/tmp/extract_results.py:/extract_results.py" \
        -w /app \
        python:3.12-slim \
        /bin/bash -c "pip install -q nbformat && python /extract_results.py"
    
    local extract_result=$?
    
    if [ $extract_result -eq 0 ]; then
        echo -e "${GREEN}✅ Results extracted successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to extract some results${NC}"
    fi
    
    # Clean up temp files
    rm -f /tmp/execute_notebooks.py /tmp/validate_results.py /tmp/extract_results.py
    
    # Final result
    if [ $exec_result -eq 0 ] && [ $val_result -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ All constant calculations completed successfully!${NC}"
        return 0
    else
        echo ""
        echo -e "${RED}❌ Some constant calculations failed!${NC}"
        return 1
    fi
}

# Function to start services
start_services() {
    echo ""
    echo -e "${YELLOW}Starting services...${NC}"
    
    # Determine which compose file to use
    local compose_file="docker-compose.yml"
    local compose_cmd="docker compose"
    
    if [ "$DEV_MODE" == "true" ]; then
        compose_file="docker-compose.dev.yml"
        compose_cmd="docker compose -f docker-compose.dev.yml"  # Use 'docker compose' instead of 'docker-compose'
        echo -e "${BLUE}🔧 Starting in DEVELOPMENT mode with hot reloading${NC}"
    else
        compose_cmd="docker compose"  # Use 'docker compose' for production too
        echo -e "${BLUE}📦 Starting in PRODUCTION mode${NC}"
    fi
    
    # Stop any existing services
    $compose_cmd down 2>/dev/null || true
    
    # Start services
    $compose_cmd up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 5
    
    # Check service status
    if $compose_cmd ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Services started successfully!${NC}"
        echo ""
        echo -e "${BLUE}Services available at:${NC}"
        echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
        echo -e "  Backend:  ${GREEN}http://localhost:8000${NC}"
        echo -e "  Compute:  ${GREEN}http://localhost:8001${NC}"
        echo ""
        if [ "$DEV_MODE" == "true" ]; then
            echo -e "${GREEN}🔥 Frontend hot reloading is enabled!${NC}"
            echo -e "${YELLOW}Any changes to frontend files will be reflected immediately.${NC}"
            echo ""
        fi
        echo -e "${YELLOW}To view logs: ${NC}$compose_cmd logs -f"
        echo -e "${YELLOW}To stop:     ${NC}$compose_cmd down"
        return 0
    else
        echo -e "${RED}❌ Failed to start services!${NC}"
        $compose_cmd ps
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
    echo "  2) View execution errors"
    echo "  3) View detailed test report"
    echo "  4) Exit"
    echo ""
    read -p "Choose option (1-4): " choice
    
    case $choice in
        1)
            echo -e "${YELLOW}Starting services despite test failures...${NC}"
            return 0
            ;;
        2)
            echo -e "${YELLOW}Viewing execution errors...${NC}"
            if [ -f "constants/results/execution_errors.txt" ]; then
                echo ""
                cat constants/results/execution_errors.txt | head -100
                echo ""
                echo -e "${YELLOW}Note: Showing first 100 lines. Full file at: constants/results/execution_errors.txt${NC}"
            else
                echo -e "${RED}No execution errors file found.${NC}"
            fi
            echo ""
            read -p "Press Enter to continue..."
            handle_test_failure
            ;;
        3)
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
        4)
            echo -e "${RED}Exiting...${NC}"
            exit 1
            ;;
        *)
            echo -e "${RED}Invalid choice!${NC}"
            handle_test_failure
            ;;
    esac
}

# Parse command line arguments
DEV_MODE="false"
BUILD_MODE="false"

for arg in "$@"; do
    case $arg in
        --dev|-d)
            DEV_MODE="true"
            shift
            ;;
        --build|-b)
            BUILD_MODE="true"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dev, -d     Start in development mode with hot reloading"
            echo "  --build, -b   Force rebuild of Docker images"
            echo "  --help, -h    Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0            Start in production mode"
            echo "  $0 --dev      Start in development mode with hot reloading"
            echo "  $0 --build    Rebuild images and start in production mode"
            echo "  $0 -d -b      Rebuild images and start in development mode"
            exit 0
            ;;
    esac
done

# Main execution
main() {
    # Check Docker
    check_docker
    
    # Build images if needed
    if [ "$BUILD_MODE" == "true" ]; then
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
main 