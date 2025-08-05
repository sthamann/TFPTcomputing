# Local Development Setup (Without Docker)

This guide helps you run the Q6 Topological Constants application locally without Docker.

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **pnpm** (or npm/yarn)

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies
./setup-local.sh

# Or manually:
# Frontend dependencies
cd frontend && pnpm install && cd ..

# Backend dependencies
cd backend && npm install && cd ..

# Python dependencies
cd compute && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ..
```

### 2. Start All Services

```bash
# Start everything with one command
./start-local.sh

# This will automatically:
# 1. Generate constant notebooks if they don't exist
# 2. Execute notebooks to calculate constants (first run only)
# 3. Start all three services in the background

# Or start services individually in separate terminals:
# Terminal 1 - Python Compute Service
cd compute && source venv/bin/activate && python -m uvicorn main:app --reload --port 8001

# Terminal 2 - Node.js Backend (use NODE_ENV=local)
cd backend && NODE_ENV=local npm run dev

# Terminal 3 - React Frontend
cd frontend && npm run dev
```

**Note:** The first run may take a few minutes as it generates and executes all constant notebooks.

## Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Compute Service**: http://localhost:8001

## Environment Variables

The local setup automatically configures:
- Backend connects to Python service at `http://localhost:8001`
- Frontend connects to Backend at `http://localhost:8000`
- All CORS settings are configured for local development

## Troubleshooting

### Port Already in Use
If you get port conflicts:
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:8001 | xargs kill -9  # Compute
```

### Python Virtual Environment
Always activate the virtual environment before running Python services:
```bash
cd compute && source venv/bin/activate
```

### Missing Dependencies
If you encounter missing packages:
```bash
# Frontend
cd frontend && pnpm install

# Backend
cd backend && npm install

# Python
cd compute && pip install -r requirements.txt
```

## Development Workflow

1. **Frontend Changes**: Vite provides hot module reloading automatically
2. **Backend Changes**: Nodemon restarts the server on file changes
3. **Python Changes**: Uvicorn with `--reload` restarts on changes

## Stopping Services

Press `Ctrl+C` in each terminal or use:
```bash
./stop-local.sh
```