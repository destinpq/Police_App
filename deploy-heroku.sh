#!/bin/bash

# This script deploys just the backend to Heroku

# Exit on error
set -e

# Define the app name (change this to your desired app name)
APP_NAME="police-app-backend"

echo "Starting deployment of backend to Heroku as $APP_NAME..."

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
    heroku addons:create heroku-postgresql:essential-0 --app $APP_NAME
else
    echo "PostgreSQL addon already exists"
fi

# Configure environment variables
echo "Setting environment variables..."
heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set PORT=8080 --app $APP_NAME
heroku config:set CLIENT_ORIGIN="https://walrus-app-r6lhp.ondigitalocean.app" --app $APP_NAME
heroku config:set SERVER_URL="https://$APP_NAME.herokuapp.com" --app $APP_NAME
heroku config:set DB_SSL=true --app $APP_NAME

# Generate a random JWT secret if not already set
if ! heroku config:get JWT_SECRET --app $APP_NAME &> /dev/null; then
    JWT_SECRET=$(openssl rand -hex 32)
    heroku config:set JWT_SECRET=$JWT_SECRET --app $APP_NAME
fi

# Create a Git repository in the backend directory if not already present
cd $(dirname "$0")  # Navigate to the script directory (backend)
if [ ! -d .git ]; then
    echo "Initializing Git repository in the backend folder..."
    git init
    git add .
    git commit -m "Initial commit for Heroku backend deployment"
fi

# Add Heroku remote if it doesn't exist
if ! git remote | grep heroku &> /dev/null; then
    echo "Adding Heroku remote..."
    heroku git:remote -a $APP_NAME
fi

# Deploy to Heroku
echo "Deploying backend to Heroku..."
git push heroku HEAD:main -f

# Run database migrations
echo "Running database migrations..."
heroku run "npm run db:reset" --app $APP_NAME

# After the app is deployed, modify the main.js file to add CORS headers
echo "Adding CORS headers patch to the deployed app..."
heroku run bash -a police-app-backend << 'EOFSCRIPT'
cat > cors-patch.js << 'EOF'
const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(process.cwd(), 'dist/src/main.js');
console.log('Reading file:', mainJsPath);

try {
  let content = fs.readFileSync(mainJsPath, 'utf8');
  
  // Add CORS middleware before the app.listen line
  const corsMiddleware = `
  // CORS middleware added by deploy script
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://walrus-app-r6lhp.ondigitalocean.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });
  `;
  
  // Insert the middleware before app.listen
  const listenPattern = /app\.listen\(/;
  if (listenPattern.test(content)) {
    content = content.replace(listenPattern, `${corsMiddleware}\n\napp.listen(`);
    fs.writeFileSync(mainJsPath, content, 'utf8');
    console.log('Successfully added CORS middleware to main.js');
  } else {
    console.log('Could not find app.listen line in main.js');
  }
} catch (error) {
  console.error('Error updating main.js:', error);
}
EOF

node cors-patch.js
rm cors-patch.js
EOFSCRIPT

# Restart the app to apply changes
heroku ps:restart -a police-app-backend

echo "CORS patch applied and app restarted."

echo "Deployment completed successfully!"
echo "Your backend API is available at: https://$APP_NAME.herokuapp.com"
echo "View the logs with: heroku logs --tail --app $APP_NAME" 