module.exports = {
  apps: [
    {
      name: 'backend',
      script: './backend/src/index.js',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        PYTHON_SERVICE_URL: process.env.PYTHON_SERVICE_URL || 'http://localhost:8001'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'compute',
      script: 'python',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8001',
      cwd: './compute',
      interpreter: 'none',
      env: {
        PORT: 8001
      },
      error_file: './logs/compute-error.log',
      out_file: './logs/compute-out.log',
      log_file: './logs/compute-combined.log',
      time: true
    },
    {
      name: 'frontend',
      script: './frontend/server.js',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};