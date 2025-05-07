#!/bin/bash

echo "Starting backend deployment process..."

# Navigate to the backend directory
cd /workspace/backend

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Start the application
echo "Starting application..."
npm run start:prod 