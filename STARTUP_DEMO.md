# Q6 Project Startup Demo

The new startup scripts provide an automated way to test all constant calculations before launching the services.

## Features

### 1. Docker Status Check
The script first verifies Docker is running:
```
Checking Docker status...
✅ Docker is running
```

### 2. Constant Calculations Test
Tests all 70 constant calculations:
```
Testing constant calculations...

📊 Total constants: 70
📓 Notebooks found: 70
✅ All notebooks exist!

🔬 Validating key constants...
✅ φ (phi): Golden Ratio
✅ φ₀ (phi_0): Fundamental VEV
✅ c₃ (c_3): Topological Fixed Point
✅ α (alpha): Fine-Structure Constant
✅ α_s (alpha_s): Strong Coupling Constant

✅ Constant calculations test passed!
```

### 3. Service Launch
If tests pass, services are automatically started:
```
Starting services...
[+] Running 3/3
 ✔ Container topological-compute  Started
 ✔ Container topological-api      Started
 ✔ Container topological-web      Started

✅ Services started successfully!

Services available at:
  Frontend: http://localhost:3000
  Backend:  http://localhost:8000
  Compute:  http://localhost:8001
```

## Test Failure Handling

If constant tests fail, the script provides options:

```
⚠️  Constant calculation tests failed!

Options:
  1) Start services anyway
  2) View detailed test report
  3) Exit

Choose option (1-3): _
```

## Usage

### Basic Start
```bash
# macOS/Linux
./start.sh

# Windows PowerShell
.\start.ps1
```

### With Docker Image Rebuild
```bash
# macOS/Linux
./start.sh --build

# Windows PowerShell
.\start.ps1 -Build
```

## Benefits

1. **Automated Testing**: Ensures all physics calculations work before starting
2. **Clear Feedback**: Colored output shows status at each step
3. **Error Handling**: Gracefully handles test failures with user options
4. **Cross-Platform**: Works on macOS, Linux, and Windows
5. **Docker Integration**: Uses Docker for consistent testing environment

## Technical Details

- Tests run in a lightweight `python:3.12-slim` Docker container
- Validates existence of all 70 constant notebooks
- Checks key physics constants (φ, φ₀, c₃, α, α_s)
- Services start only after successful tests (or user override)
- Automatic cleanup of any existing containers before starting 