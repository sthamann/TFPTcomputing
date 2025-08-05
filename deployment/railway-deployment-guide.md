# Railway Deployment Guide

## Overview

This application consists of 3 services that need to be deployed:
1. **Backend API** (Node.js/Express) - Port 8000
2. **Frontend** (React/Vite) - Port 3000
3. **Compute Service** (Python/FastAPI) - Port 8001

## Deployment Options

### Option 1: Deploy as Separate Services (Recommended)

Create 3 separate services in Railway:

#### 1. Backend Service

1. Create a new Railway service
2. Connect your GitHub repo
3. Set the root directory to `/backend`
4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=8000
   PYTHON_SERVICE_URL=https://your-compute-service.railway.app
   ```
5. Railway will auto-detect Node.js and use the start script from backend/package.json

#### 2. Frontend Service

1. Create a new Railway service
2. Connect your GitHub repo
3. Set the root directory to `/frontend`
4. Add environment variables:
   ```
   NODE_ENV=production
   VITE_API_URL=https://your-backend-service.railway.app
   ```
5. Add a custom build command in Railway settings:
   ```
   npm install && npm run build
   ```
6. Set the start command:
   ```
   npm run preview
   ```

#### 3. Compute Service

1. Create a new Railway service
2. Connect your GitHub repo
3. Set the root directory to `/compute`
4. Add environment variables:
   ```
   PORT=8001
   ```
5. Add a custom start command:
   ```
   python -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### Option 2: Deploy as a Monorepo (Single Service)

If you prefer to deploy everything as one service, you'll need:

1. A process manager (like PM2)
2. A unified start script
3. Proper port configuration

See the files created below for this approach.

## Service Communication

After deployment, update the service URLs:

1. In Backend service, set `PYTHON_SERVICE_URL` to the Compute service's Railway URL
2. In Frontend, ensure the API calls go to the Backend service's Railway URL
3. Configure CORS in backend to allow frontend domain

## Database Considerations

The application currently uses JSON files for data storage. For production:
1. Consider using Railway's PostgreSQL service
2. Or ensure the JSON files are persisted using Railway volumes

## Monitoring

Use Railway's built-in monitoring and logs:
```bash
railway logs
```

## Custom Domains

Once deployed, you can add custom domains to each service in Railway's dashboard.