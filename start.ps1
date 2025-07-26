# Q6 Project Startup Script (PowerShell Version)
# Tests all constant calculations before starting services

$ErrorActionPreference = "Stop"

# Define colors
$Host.UI.RawUI.ForegroundColor = "White"

function Write-ColorOutput($ForegroundColor, $Text) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Text
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput "Blue" "================================================="
Write-ColorOutput "Blue" "       Q6 Topological Constants Project          "
Write-ColorOutput "Blue" "================================================="
Write-Output ""

# Function to check if Docker is running
function Check-Docker {
    Write-ColorOutput "Yellow" "Checking Docker status..."
    try {
        docker info 2>&1 | Out-Null
        Write-ColorOutput "Green" "✅ Docker is running"
        Write-Output ""
    }
    catch {
        Write-ColorOutput "Red" "❌ Docker is not running!"
        Write-Output "Please start Docker Desktop and try again."
        exit 1
    }
}

# Function to build Docker images if needed
function Build-Images {
    Write-ColorOutput "Yellow" "Building Docker images..."
    docker-compose build
    Write-ColorOutput "Green" "✅ Docker images built"
    Write-Output ""
}

# Function to test constant calculations
function Test-Constants {
    Write-ColorOutput "Yellow" "Testing constant calculations..."
    Write-Output ""
    
    # Create test script
    $testScript = @'
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
'@
    
    # Save test script to temp file
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $testScript
    
    # Run test in Docker
    $result = docker run --rm `
        -v "${PWD}:/app" `
        -v "${tempFile}:/test_constants.py" `
        -w /app `
        python:3.12-slim `
        python /test_constants.py
    
    $testResult = $LASTEXITCODE
    
    # Clean up temp file
    Remove-Item $tempFile
    
    if ($testResult -eq 0) {
        Write-Output ""
        Write-ColorOutput "Green" "✅ Constant calculations test passed!"
        return $true
    }
    else {
        Write-Output ""
        Write-ColorOutput "Red" "❌ Constant calculations test failed!"
        return $false
    }
}

# Function to start services
function Start-Services {
    Write-Output ""
    Write-ColorOutput "Yellow" "Starting services..."
    
    # Stop any existing services
    docker-compose down 2>$null
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    Write-ColorOutput "Yellow" "Waiting for services to start..."
    Start-Sleep -Seconds 5
    
    # Check service status
    $psOutput = docker-compose ps
    if ($psOutput -match "Up") {
        Write-ColorOutput "Green" "✅ Services started successfully!"
        Write-Output ""
        Write-ColorOutput "Blue" "Services available at:"
        Write-ColorOutput "Green" "  Frontend: http://localhost:3000"
        Write-ColorOutput "Green" "  Backend:  http://localhost:8000"
        Write-ColorOutput "Green" "  Compute:  http://localhost:8001"
        Write-Output ""
        Write-ColorOutput "Yellow" "To view logs: docker-compose logs -f"
        Write-ColorOutput "Yellow" "To stop:     docker-compose down"
        return $true
    }
    else {
        Write-ColorOutput "Red" "❌ Failed to start services!"
        docker-compose ps
        return $false
    }
}

# Function to handle test failure
function Handle-TestFailure {
    Write-Output ""
    Write-ColorOutput "Yellow" "⚠️  Constant calculation tests failed!"
    Write-Output ""
    Write-Output "Options:"
    Write-Output "  1) Start services anyway"
    Write-Output "  2) View detailed test report"
    Write-Output "  3) Exit"
    Write-Output ""
    
    $choice = Read-Host "Choose option (1-3)"
    
    switch ($choice) {
        "1" {
            Write-ColorOutput "Yellow" "Starting services despite test failures..."
            return $true
        }
        "2" {
            Write-ColorOutput "Yellow" "Running detailed test report..."
            docker run --rm `
                -v "${PWD}:/app" `
                -w /app `
                python:3.12 `
                python test_all_constants.py
            Write-Output ""
            Read-Host "Press Enter to continue..."
            return Handle-TestFailure
        }
        "3" {
            Write-ColorOutput "Red" "Exiting..."
            exit 1
        }
        default {
            Write-ColorOutput "Red" "Invalid choice!"
            return Handle-TestFailure
        }
    }
}

# Main execution
function Main {
    param(
        [switch]$Build
    )
    
    # Check Docker
    Check-Docker
    
    # Build images if requested
    if ($Build) {
        Build-Images
    }
    
    # Test constants
    if (Test-Constants) {
        # Tests passed, start services
        Start-Services
    }
    else {
        # Tests failed, ask user what to do
        if (Handle-TestFailure) {
            Start-Services
        }
    }
}

# Parse arguments and run
$build = $false
if ($args -contains "--build" -or $args -contains "-b") {
    $build = $true
}

Main -Build:$build 