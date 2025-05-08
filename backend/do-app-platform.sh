#!/bin/bash

echo "Starting DigitalOcean App Platform deployment..."
echo "Current working directory: $(pwd)"
echo "Directory contents:"
ls -la

# Print environment information
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
  echo "Error: Build failed, dist directory does not exist"
  echo "Creating dist directory and checking src files..."
  mkdir -p dist
  ls -la src
  
  # Try compiling manually
  echo "Attempting manual compilation..."
  ./node_modules/.bin/tsc
  
  if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "Manual compilation failed, exiting"
    exit 1
  fi
fi

echo "Build succeeded. Contents of dist directory:"
ls -la dist

# Start the application
echo "Starting application in production mode..."
export NODE_ENV=production
export PORT=4001
node dist/main.js 