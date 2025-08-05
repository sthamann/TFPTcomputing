# Railway Deployment Instructions

## Quick Fix for Your Error

The error occurred because Railway couldn't find a start command. We've now added:
- A `start` script in the root `package.json`
- Railway configuration files
- Production server setup

## Deployment Options

### Option 1: Deploy as Separate Services (Strongly Recommended)

Deploy each service separately for better reliability and scalability. This avoids Python/Node.js dependency conflicts.

See detailed instructions below in "For Multi-Service Deployment" section.

### Option 2: Deploy as One Service (More Complex)

If you must deploy as a single service:

1. Push these changes to your GitHub repo
2. In Railway, create a new project and connect your GitHub repo
3. Railway will use nixpacks.toml to install both Node and Python dependencies
4. Set these environment variables in Railway:
   ```
   NODE_ENV=production
   PORT=3000
   BACKEND_PORT=8000
   COMPUTE_PORT=8001
   ```

**Note:** Single-service deployment can have issues with Python dependencies. If you encounter "No module named uvicorn" errors, deploy as separate services instead.

## Environment Variables

### For Single Service Deployment:
```env
NODE_ENV=production
PORT=3000
BACKEND_PORT=8000
COMPUTE_PORT=8001
```

### For Multi-Service Deployment:

**Backend Service:**
```env
NODE_ENV=production
PORT=8000
PYTHON_SERVICE_URL=https://your-compute-service.railway.app
```

**Frontend Service:**
```env
NODE_ENV=production
PORT=3000
API_URL=https://your-backend-service.railway.app
```

**Compute Service:**
```env
PORT=8001
```

## What We Changed

1. Added `start` script to root `package.json`
2. Created production start script (`deployment/start-production.js`)
3. Added production server for frontend (`frontend/server.js`)
4. Created Railway configuration files for each service
5. Added PM2 configuration as an alternative

## Next Steps

1. Commit and push these changes to GitHub
2. Re-deploy on Railway
3. The build should now succeed!

## Troubleshooting

If you still get errors:
- Check Railway logs for specific error messages
- Ensure all environment variables are set
- For Python service, you might need to add a `runtime.txt` with `python-3.11`

### Lockfile Issues

If you get a "frozen lockfile" error:
- Make sure to run `pnpm install` locally after adding new dependencies
- Commit the updated `pnpm-lock.yaml` file
- The Railway configs now use `pnpm install --no-frozen-lockfile` to avoid this issue