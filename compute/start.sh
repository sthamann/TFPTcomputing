#!/bin/bash

# Start script for compute service
# Handles both venv and system Python installations

if [ -d "venv" ]; then
    echo "Using virtual environment"
    source venv/bin/activate
else
    echo "Using system Python"
fi

# Start uvicorn
python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8001}