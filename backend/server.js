// This is a direct entry point for DigitalOcean App Platform
// It will look for the compiled code in the dist directory

// Show directory contents for debugging
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('Current working directory:', process.cwd());
console.log('Environment variables set:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DB_HOST:', process.env.DB_HOST ? 'Set' : 'Not set');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

console.log('Directory contents:');
try {
  console.log(fs.readdirSync('.'));
} catch (err) {
  console.error('Error reading directory:', err);
}

// Check if dist directory exists
try {
  if (fs.existsSync('./dist')) {
    console.log('dist directory exists, contents:');
    console.log(fs.readdirSync('./dist'));
    
    if (fs.existsSync('./dist/src')) {
      console.log('dist/src directory exists, contents:');
      console.log(fs.readdirSync('./dist/src'));
    }
  } else {
    console.log('dist directory does not exist');
  }
} catch (err) {
  console.error('Error checking dist directory:', err);
}

// Set default port
const PORT = process.env.PORT || 8080;
console.log(`Setting PORT to ${PORT}`);
process.env.PORT = PORT;

// Attempt to require the main module
try {
  console.log('Attempting to load main module...');
  // Try several possible paths
  const possiblePaths = [
    './dist/src/main.js',
    './dist/src/main',
    './dist/main.js',
    './dist/main',
    './main.js',
    './main'
  ];

  let mainModule = null;
  let successPath = null;

  for (const modulePath of possiblePaths) {
    try {
      console.log(`Trying to require: ${modulePath}`);
      if (fs.existsSync(modulePath)) {
        console.log(`Found file at ${modulePath}`);
        mainModule = require(modulePath);
        successPath = modulePath;
        console.log(`Successfully loaded: ${modulePath}`);
        break;
      } else {
        console.log(`File does not exist at ${modulePath}`);
      }
    } catch (err) {
      console.log(`Failed to load ${modulePath}: ${err.message}`);
    }
  }

  if (!mainModule) {
    // If we still can't find the module, try running the app directly
    console.log('Could not find main module. Starting app with Express fallback.');
    const express = require('express');
    const app = express();
    
    // Add CORS middleware
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      next();
    });
    
    // Add a health check endpoint
    app.get('/', (req, res) => {
      res.json({
        status: 'ok',
        message: 'Backend server is running',
        timestamp: new Date().toISOString()
      });
    });
    
    // Add a users endpoint
    app.get('/users', (req, res) => {
      res.json({
        message: 'This is a fallback users endpoint',
        note: 'The main application failed to load, this is a placeholder.'
      });
    });
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Fallback Express server running on port ${PORT}`);
    });
  }

  console.log(`Application loaded from: ${successPath}`);
} catch (err) {
  console.error('Failed to load application:', err);
  console.error('Error details:', err.stack);
  process.exit(1);
} 