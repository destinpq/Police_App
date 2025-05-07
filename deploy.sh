#!/bin/bash

echo "Starting deployment process..."

# Check if we're in the repository root or need to navigate there
if [ -d "/workspace" ]; then
  echo "Running in cloud environment..."
  # In cloud environment (DigitalOcean, etc.)
  if [ -d "/workspace/backend" ]; then
    cd /workspace/backend
  else
    echo "Cannot find /workspace/backend directory"
    ls -la /workspace
    exit 1
  fi
else
  # Local environment
  echo "Running in local environment..."
  if [ ! -d "backend" ] && [ ! -d "../backend" ]; then
    echo "Error: Cannot find backend directory"
    exit 1
  fi
  
  if [ -d "backend" ]; then
    cd backend
  elif [ -d "../backend" ]; then
    cd ../backend
  fi
fi

# Current directory check
echo "Current directory: $(pwd)"
ls -la

# Install dependencies
echo "Installing dependencies..."
npm install

# Build application
echo "Building application..."
npm run build

# Verify build directory exists
if [ ! -d "dist" ]; then
  echo "Error: Build failed, dist directory not created"
  exit 1
fi

echo "Build successful. Contents of dist directory:"
ls -la dist

# Start application
echo "Starting application..."
NODE_ENV=production npm run start:prod 