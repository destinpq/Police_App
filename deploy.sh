#!/bin/bash

echo "Starting deployment process..."

# Navigate to backend directory
cd backend

# Install dependencies
echo "Installing dependencies..."
npm install

# Build application
echo "Building application..."
npm run build

# Start application
echo "Starting application..."
npm run start:prod 