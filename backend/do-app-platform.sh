#!/bin/bash

echo "Starting DigitalOcean App Platform deployment..."
echo "Current working directory: $(pwd)"
echo "Directory contents:"
ls -la

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
  echo "Error: Build failed, dist directory does not exist"
  exit 1
fi

echo "Build succeeded. Contents of dist directory:"
ls -la dist

# Start the application
echo "Starting application in production mode..."
NODE_ENV=production npm run start:prod 