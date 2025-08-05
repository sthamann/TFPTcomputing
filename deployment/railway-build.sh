#!/bin/bash

# Railway build script for monorepo deployment
# This script builds all services when deploying as a single Railway service

echo "Building Topological Constants Application..."

# Install root dependencies
echo "Installing root dependencies..."
pnpm install --no-frozen-lockfile

# Install Python dependencies for compute service
echo "Installing Python dependencies..."
cd compute
pip install -r requirements.txt
cd ..

# Build all services
echo "Building all services..."
pnpm run build

# Additional build steps for production
echo "Preparing production environment..."

# Ensure logs directory exists
mkdir -p logs

# Generate constants if needed (optional - remove if not needed in production)
# cd constants && npm run generate:notebooks && npm run execute:notebooks && cd ..

echo "Build completed successfully!"