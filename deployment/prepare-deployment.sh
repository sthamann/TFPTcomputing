#!/bin/bash
# Deployment Preparation Script

echo "🚀 Preparing for deployment..."

# 1. Environment Variables Template
cat > .env.production.example << EOF
# Backend
NODE_ENV=production
PORT=8000
CORS_ORIGIN=https://your-domain.com

# Compute
COMPUTE_SERVICE_URL=http://compute:8080
RESULTS_PATH=/app/compute/results

# Frontend (build time)
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com
EOF

# 2. Docker Compose for Production
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=\${VITE_API_URL}
    ports:
      - "80:80"
    depends_on:
      - api

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - COMPUTE_SERVICE_URL=http://compute:8080
    ports:
      - "8000:8000"
    volumes:
      - ./constants:/app/constants:ro
      - compute-results:/app/compute/results:ro
    depends_on:
      - compute

  compute:
    build:
      context: ./compute
      dockerfile: Dockerfile
    volumes:
      - ./constants:/app/constants:ro
      - compute-results:/app/results
    ports:
      - "8080:8080"

volumes:
  compute-results:
EOF

# 3. GitHub Actions Workflow
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml << EOF
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        env:
          RENDER_API_KEY: \${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST \\
            -H "Authorization: Bearer \$RENDER_API_KEY" \\
            https://api.render.com/v1/services/\${{ secrets.RENDER_SERVICE_ID }}/deploys
EOF

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Choose your hosting provider"
echo "2. Set up environment variables"
echo "3. Configure domain and SSL"
echo "4. Deploy!"