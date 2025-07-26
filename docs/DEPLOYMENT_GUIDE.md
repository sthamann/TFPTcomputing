# Deployment Guide - Topological Constants Calculator

This guide provides detailed instructions for deploying the application using Docker or running it locally for development.

## 📋 Prerequisites

### For Docker Deployment
- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- At least 4GB free RAM
- 2GB free disk space

### For Local Development
- Node.js 20+ and npm/pnpm
- Python 3.12+
- Git

## 🐳 Docker Deployment (Recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd topological-constants-app
```

### 2. Environment Configuration

Create `.env` files for each service:

**Backend (.env in `backend/`)**
```env
NODE_ENV=production
PORT=8000
PYTHON_SERVICE_URL=http://python:8000
```

**Frontend (.env in `frontend/`)**
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Build and Start Services

```bash
# Build all services
docker-compose build

# Start all services in detached mode
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Verify Deployment

Check that all services are running:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Python Service: http://localhost:8001

### 5. Common Docker Commands

```bash
# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart api

# View logs for specific service
docker-compose logs -f python

# Execute command in container
docker-compose exec python python scripts/generate_notebooks.py

# Clean up everything (including volumes)
docker-compose down -v
```

## 💻 Local Development Setup

### 1. Install Dependencies

First, ensure you have pnpm installed:
```bash
npm install -g pnpm
```

Install all dependencies:
```bash
# From project root
pnpm install
```

### 2. Python Environment Setup

Create a Python virtual environment:
```bash
cd compute
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Generate Jupyter Notebooks

```bash
cd constants
python scripts/generate_notebooks.py
```

### 4. Start Services Individually

**Terminal 1 - Python Compute Service:**
```bash
cd compute
uvicorn main:app --reload --port 8001
```

**Terminal 2 - Node.js Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - React Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Service URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Python Service: http://localhost:8001
- API Docs: http://localhost:8000/docs

## 🔧 Configuration Details

### Docker Compose Configuration

The `docker-compose.yml` defines three services:

```yaml
services:
  python:     # FastAPI compute service
  api:        # Express API gateway
  web:        # React frontend
```

### Network Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Nginx     │────▶│   Express   │
│             │     │  (Port 3000)│     │  (Port 8000)│
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   FastAPI   │
                                        │  (Port 8001)│
                                        └─────────────┘
```

## 🚀 Production Deployment

### Using Docker in Production

1. **Update Environment Variables**
   - Set `NODE_ENV=production`
   - Use secure API URLs
   - Enable HTTPS

2. **Build Optimized Images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Enable Health Checks**
   Add health checks to docker-compose.yml:
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

### Scaling Considerations

- Use Redis for distributed caching
- Add nginx load balancer for multiple instances
- Use managed databases for persistence
- Enable horizontal pod autoscaling in Kubernetes

## 🐛 Troubleshooting

### Docker Issues

**Problem: Port already in use**
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9
```

**Problem: Container fails to start**
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild without cache
docker-compose build --no-cache
```

**Problem: Permission errors**
```bash
# Fix ownership
sudo chown -R $USER:$USER .
```

### Local Development Issues

**Problem: Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

**Problem: Python import errors**
```bash
# Ensure virtual environment is activated
which python  # Should show venv path

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Problem: Notebook generation fails**
```bash
# Install Jupyter kernel
python -m ipykernel install --user --name python3
```

## 📊 Monitoring and Logs

### Docker Logs
```bash
# All services
docker-compose logs -f

# Specific service with timestamps
docker-compose logs -f --timestamps api
```

### Local Development Logs
- Frontend: Browser console + terminal
- Backend: Terminal output + `logs/` directory
- Python: Terminal output + `uvicorn.log`

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use secrets management in production
   - Rotate API keys regularly

2. **Network Security**
   - Enable CORS only for trusted origins
   - Use HTTPS in production
   - Implement rate limiting

3. **Container Security**
   - Run containers as non-root user
   - Keep base images updated
   - Scan images for vulnerabilities

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html) 