#!/bin/bash

# This script deploys the Task Tracker application to Heroku

# Exit on error
set -e

# Define app name (change this to your app name)
APP_NAME="destinpq-task-tracker"

echo "Starting deployment of $APP_NAME to Heroku..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "Heroku CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in to Heroku
heroku whoami || (echo "Please login to Heroku first with 'heroku login'" && exit 1)

# Create Heroku app if it doesn't exist
if ! heroku apps:info --app $APP_NAME &> /dev/null; then
    echo "Creating Heroku app: $APP_NAME"
    heroku create $APP_NAME
else
    echo "Using existing Heroku app: $APP_NAME"
fi

# Add PostgreSQL addon if it doesn't exist
if ! heroku addons:info --app $APP_NAME postgresql &> /dev/null; then
    echo "Adding PostgreSQL addon..."
    heroku addons:create heroku-postgresql:mini --app $APP_NAME
else
    echo "PostgreSQL addon already exists"
fi

# Configure environment variables
echo "Setting environment variables..."
heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set CLIENT_ORIGIN="https://$APP_NAME.herokuapp.com" --app $APP_NAME
heroku config:set SERVER_URL="https://$APP_NAME.herokuapp.com" --app $APP_NAME

# Generate a random JWT secret if not already set
if ! heroku config:get JWT_SECRET --app $APP_NAME &> /dev/null; then
    JWT_SECRET=$(openssl rand -hex 32)
    heroku config:set JWT_SECRET=$JWT_SECRET --app $APP_NAME
fi

# Ensure Git is set up
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for Heroku deployment"
fi

# Add Heroku remote if it doesn't exist
if ! git remote | grep heroku &> /dev/null; then
    echo "Adding Heroku remote..."
    heroku git:remote -a $APP_NAME
fi

# Deploy to Heroku
echo "Deploying to Heroku..."
git push heroku $(git branch --show-current):main

# Run database migrations
echo "Running database migrations..."
heroku run "cd backend && npm run db:reset" --app $APP_NAME

echo "Deployment completed successfully!"
echo "Your app is available at: https://$APP_NAME.herokuapp.com"
echo "View the logs with: heroku logs --tail --app $APP_NAME" 