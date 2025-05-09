#!/bin/bash

# Digital Ocean App Platform Deployment Script
echo "=== Starting DigitalOcean App Platform Deployment ==="

# Apply crypto patch to fix TypeORM
echo "=== Applying crypto patch ==="
node patch-crypto.js

# Build the application
echo "=== Building application ==="
npm run build

# Start the application
echo "=== Starting application ==="
NODE_ENV=production node server.js 