# Render.com Deployment Guide

## 1. Vorbereitung

### Repository vorbereiten
```bash
# Erstelle render.yaml im Root
cat > render.yaml << 'EOF'
services:
  # Static Frontend
  - type: web
    name: topological-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    pullRequestPreviewsEnabled: true
    headers:
      - path: /*
        name: Cache-Control
        value: public, max-age=3600

  # Node.js API
  - type: web
    name: topological-api
    env: docker
    dockerfilePath: ./backend/Dockerfile
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: COMPUTE_SERVICE_URL
        fromService:
          type: web
          name: topological-compute
          property: host

  # Python Compute Service  
  - type: web
    name: topological-compute
    env: docker
    dockerfilePath: ./compute/Dockerfile
    disk:
      name: compute-results
      mountPath: /app/results
      sizeGB: 10
EOF
```

## 2. Environment Variables

Erstelle in Render Dashboard:
- `VITE_API_URL`: https://topological-api.onrender.com
- `NODE_ENV`: production
- `CORS_ORIGIN`: https://topological-frontend.onrender.com

## 3. Deployment

1. Push zu GitHub:
```bash
git add .
git commit -m "Add Render configuration"
git push origin main
```

2. In Render Dashboard:
- "New" → "Blueprint"
- Verbinde GitHub Repository
- Wähle Branch `main`
- Render erkennt `render.yaml` automatisch

## 4. Custom Domain (Optional)

```
topological-constants.com
├── frontend: app.topological-constants.com
├── api: api.topological-constants.com
└── compute: compute.topological-constants.com
```

## 5. Monitoring

Render bietet:
- Automatische Health Checks
- Logs in Echtzeit
- Metriken Dashboard
- Alerts bei Problemen

## Kosten-Schätzung

| Service | Typ | Kosten/Monat |
|---------|-----|--------------|
| Frontend | Static | Kostenlos |
| API | Web Service | $7 |
| Compute | Web Service + Disk | $7 + $3 |
| **Total** | | **~$17/Monat** |

## Optimierungen

### Frontend CDN
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'vis-vendor': ['vis-network', 'vis-data'],
          'math-vendor': ['katex']
        }
      }
    }
  }
}
```

### API Caching
```javascript
// backend/src/index.js
import redis from 'redis';
const cache = redis.createClient({
  url: process.env.REDIS_URL
});

app.get('/api/constants/:id', async (req, res) => {
  const cached = await cache.get(`constant:${req.params.id}`);
  if (cached) return res.json(JSON.parse(cached));
  // ... fetch and cache
});
```

### Compute Optimierung
```python
# compute/main.py
from functools import lru_cache
import pickle

@lru_cache(maxsize=128)
def calculate_constant(constant_id):
    # Check if already computed
    result_file = f"/app/results/{constant_id}_result.pkl"
    if os.path.exists(result_file):
        with open(result_file, 'rb') as f:
            return pickle.load(f)
    # ... compute
```