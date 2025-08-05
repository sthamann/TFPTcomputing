#!/usr/bin/env node

/**
 * Production start script for Railway deployment
 * This script starts all services in production mode
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Topological Constants Application...');

// Environment setup
process.env.NODE_ENV = 'production';

// Check if Python dependencies are installed
const computeVenvPath = path.join(__dirname, '../compute/venv');
const useVenv = fs.existsSync(computeVenvPath);

console.log('Python environment:', useVenv ? `Using venv at ${computeVenvPath}` : 'Using system Python');

// Service configurations
const services = [
  {
    name: 'backend',
    command: 'node',
    args: ['src/index.js'],
    cwd: path.join(__dirname, '../backend'),
    env: {
      ...process.env,
      PORT: process.env.BACKEND_PORT || '8000',
      NODE_ENV: 'production',
      PYTHON_SERVICE_URL: process.env.PYTHON_SERVICE_URL || 'http://localhost:8001'
    }
  },
  {
    name: 'compute',
    command: '/bin/bash',
    args: ['start.sh'],
    cwd: path.join(__dirname, '../compute'),
    env: {
      ...process.env,
      PORT: process.env.COMPUTE_PORT || '8001',
      PYTHONPATH: path.join(__dirname, '../compute')
    }
  },
  {
    name: 'frontend',
    command: 'node',
    args: ['server.js'],
    cwd: path.join(__dirname, '../frontend'),
    env: {
      ...process.env,
      PORT: process.env.PORT || '3000',
      NODE_ENV: 'production'
    }
  }
];

// Start each service
const processes = [];

services.forEach(service => {
  console.log(`Starting ${service.name}...`);
  
  const proc = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: service.env,
    stdio: 'inherit'
  });

  proc.on('error', (err) => {
    console.error(`Failed to start ${service.name}:`, err);
    cleanup();
    process.exit(1);
  });

  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${service.name} exited with code ${code}`);
      cleanup();
      process.exit(code);
    }
  });

  processes.push({ name: service.name, process: proc });
});

// Cleanup function
function cleanup() {
  console.log('Shutting down services...');
  processes.forEach(({ name, process }) => {
    console.log(`Stopping ${name}...`);
    process.kill('SIGTERM');
  });
}

// Handle termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log('All services started successfully!');