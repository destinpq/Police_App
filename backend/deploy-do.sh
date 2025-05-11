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

# Log in to the DigitalOcean Container Registry
doctl registry login

# Build and tag the Docker image
docker build -t registry.digitalocean.com/destin-pq/police-app-backend:latest .

# Push the image to the DigitalOcean Container Registry
docker push registry.digitalocean.com/destin-pq/police-app-backend:latest

# Update the app on DigitalOcean App Platform
doctl apps update $POLICE_APP_ID --spec .do/app.yaml

# Run migrations (add this command to run after deployment)
echo "Waiting for app to deploy before running migrations..."
sleep 30
echo "Running database migrations..."
doctl apps run-command $POLICE_APP_ID --command "npx typeorm migration:run" || echo "Migration command failed, but continuing deployment"

echo "Deployment to Digital Ocean completed!" 