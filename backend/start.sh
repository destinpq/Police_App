#!/bin/bash

echo "Starting Application..."
echo "Current working directory: $(pwd)"
ls -la

# Install dependencies
echo "Installing dependencies..."
npm install

# Build application
echo "Building application..."
npm run build

# Verify build
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
  echo "Build failed, trying manual compilation..."
  ./node_modules/.bin/tsc
  
  # Check if manual build worked
  if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "Manual build also failed. Exiting."
    exit 1
  fi
fi

echo "Build successful. Contents of dist directory:"
ls -la dist

# Start the application
echo "Starting application..."
node dist/main.js 