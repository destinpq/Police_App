#!/bin/bash

echo "=== DigitalOcean App Platform Deployment Script ==="
echo "Current working directory: $(pwd)"
echo "Directory structure:"
find . -type d -not -path "*/node_modules/*" -not -path "*/\\.*" | sort

# Install dependencies
echo "=== Installing dependencies ==="
npm install

# Build application
echo "=== Building application ==="
npm run build

# Show environment
echo "=== Environment Information ==="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Operating system: $(uname -a)"
echo "Working directory: $(pwd)"

# Set the port to 8080
echo "=== Setting environment variables ==="
export PORT=8080
echo "Port set to: $PORT"

# Show build output
echo "=== Dist Directory Contents ==="
if [ -d "dist" ]; then
  ls -la dist
  if [ -f "dist/main.js" ]; then
    echo "main.js exists in dist directory"
  else
    echo "main.js does not exist in dist directory"
    echo "Contents of dist directory:"
    find dist -type f | sort
  fi
else
  echo "dist directory does not exist"
fi

# Create files map
echo "=== Creating file list ==="
find . -type f -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/.git/*" | sort > files.txt
echo "Files list created at files.txt"

# Start the application using the direct server script
echo "=== Starting application with direct server.js ==="
echo "LOG: Using direct server.js entry point on port 8080"
node server.js 