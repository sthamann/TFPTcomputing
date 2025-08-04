# Topological Constants Calculator

A full-stack application for calculating physics constants using the Topological Fixed Point Framework. This application provides a modern web interface for exploring fundamental constants, their relationships, and calculations based on the golden ratio and topological principles.

## 🚀 Features

- **Constants Explorer**: Browse and search physics constants with detailed information
- **Live Calculations**: Calculate constant values with step-by-step Jupyter notebook execution
- **Formula Playground**: Experiment with custom formulas and parameters in real-time
- **Dependency Graph**: Interactive visualization of constant relationships
- **Dark Mode**: Beautiful UI with dark mode support
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   Compute   │
│  React/Vite │     │   Express   │     │   FastAPI   │
│   Port 3000 │     │   Port 8000 │     │   Port 8001 │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │  Constants  │
                    │  JSON/YAML  │
                    └─────────────┘
```

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Python 3.12+ (for local development)
- pnpm 8+ (for local development)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd topological-constants-app
   ```

2. **Start with automated testing and launch**
   
   **On macOS/Linux:**
   ```bash
   # Production mode (optimized build):
   ./start.sh
   
   # Development mode with hot reloading:
   ./start.sh --dev
   
   # Rebuild images:
   ./start.sh --build
   
   # See all options:
   ./start.sh --help
   ```
   
   **On Windows (PowerShell):**
   ```powershell
   # Production mode:
   .\start.ps1
   
   # With image rebuild:
   .\start.ps1 -Build
   ```
   
   The startup script will:
   - ✅ Check Docker is running
   - ✅ Test all constant calculations
   - ✅ Start all three services (frontend, backend, compute)
   - ✅ Display service URLs
   
   **Development Mode Features:**
   - 🔥 Hot reloading for frontend (Vite HMR)
   - 🔄 Auto-restart for backend changes (Nodemon)
   - 📂 Source code mounted as volumes
   - 🚀 Instant updates without rebuilding
   
   **Alternative: Manual start**
   ```bash
   # Production mode:
   docker-compose up -d
   
   # Development mode:
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Python Service: http://localhost:8001

## 📊 Current Status

- ✅ **26 constants migrated** from legacy codebase
- ✅ All constants calculated from first principles (no magic numbers)
- ✅ Jupyter notebooks generated for each constant
- ✅ Full-stack application infrastructure ready
- ✅ Detailed deployment guide created
- 🚧 Additional constants pending migration (lifetimes, light quark masses, etc.)
- 🚧 Docker deployment testing needed

## 🛠️ Development Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Generate Jupyter notebooks**
   ```bash
   cd constants
   python scripts/generate_notebooks.py
   ```

3. **Start services in development mode**
   ```bash
   # Terminal 1: Python compute service
   cd compute
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8001

   # Terminal 2: Node.js backend
   cd backend
   npm run dev

   # Terminal 3: React frontend
   cd frontend
   npm run dev
   ```

## 📂 Project Structure

```
topological-constants-app/
├── backend/               # Node.js Express API Gateway
│   ├── src/
│   │   └── index.js      # Main server file
│   ├── package.json
│   └── Dockerfile
├── compute/              # Python FastAPI compute service
│   ├── main.py          # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and API client
│   │   └── styles/      # CSS files
│   ├── package.json
│   └── Dockerfile
├── constants/           # Constants catalog
│   ├── data/           # JSON constant definitions
│   ├── notebooks/      # Generated Jupyter notebooks
│   ├── scripts/        # Generation scripts
│   └── schema.ts       # TypeScript schema
├── docs/               # Documentation
├── docker-compose.yml  # Docker orchestration
└── package.json       # Root package file
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=8000
PYTHON_SERVICE_URL=http://localhost:8001
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000/api
```

## 📚 Adding New Constants

1. Create a JSON file in `constants/data/`:
   ```json
   {
     "id": "my_constant",
     "symbol": "χ",
     "name": "My Constant",
     "description": "Description of the constant",
     "unit": "dimensionless",
     "formula": "χ = φ₀ * π",
     "dependencies": ["phi_0"],
     "category": "derived",
     "sources": [{
       "name": "Reference 2025",
       "year": 2025,
       "value": 2.84
     }],
     "accuracyTarget": 0.01
   }
   ```

2. Generate the notebook:
   ```bash
   cd constants
   python scripts/generate_notebooks.py
   ```

3. The constant will automatically appear in the UI

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Python tests
cd compute && pytest
```

## 📊 API Endpoints

### Constants
- `GET /api/constants` - List all constants
- `GET /api/constants/:id` - Get constant details
- `POST /api/constants/:id/calculate` - Calculate constant value

### Playground
- `POST /api/playground/run` - Execute custom formula

### Graph
- `GET /api/dag` - Get dependency graph

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on specific ports
   lsof -ti:3000 | xargs kill -9
   lsof -ti:8000 | xargs kill -9
   lsof -ti:8001 | xargs kill -9
   ```

2. **Docker build fails**
   ```bash
   # Clean rebuild
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

3. **Notebook generation fails**
   ```bash
   # Install required packages
   pip install nbformat sympy numpy pint
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your fchanges (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Based on the Topological Fixed Point Framework
- Uses CODATA and PDG reference values
- Built with modern web technologies 