// Digital Ocean App Platform Entry Point
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Debugging information
console.log('Current working directory:', process.cwd());
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DB_HOST:', process.env.DB_HOST ? 'Set' : 'Not set');
console.log('- DB_DATABASE:', process.env.DB_DATABASE ? 'Set' : 'Not set');

// Set default port
const PORT = process.env.PORT || 8080;

// Check if dist directory exists
try {
  if (fs.existsSync('./dist')) {
    console.log('dist directory exists, contents:');
    console.log(fs.readdirSync('./dist'));
  } else {
    console.log('dist directory does not exist');
  }
} catch (err) {
  console.error('Error checking dist directory:', err);
}

// Apply crypto patch if needed
try {
  require('./patch-crypto');
  console.log('Crypto patch applied successfully');
} catch (err) {
  console.warn('Failed to apply crypto patch:', err.message);
}

// Attempt to require the main module
try {
  console.log('Attempting to load main module...');
  
  // Define possible entry points
  const possibleEntryPoints = [
    './dist/src/main.js',
    './dist/main.js'
  ];
  
  let mainModule = null;
  
  // Try each possible entry point
  for (const entryPoint of possibleEntryPoints) {
    try {
      if (fs.existsSync(entryPoint)) {
        console.log(`Found entry point at ${entryPoint}, loading...`);
        mainModule = require(entryPoint);
        console.log('Main module loaded successfully');
        break;
      }
    } catch (err) {
      console.error(`Failed to load ${entryPoint}:`, err.message);
    }
  }
  
  // If we couldn't load the main module, start a fallback server
  if (!mainModule) {
    throw new Error('Main module not found or could not be loaded');
  }
  
} catch (err) {
  console.error('Error starting application:', err);
  
  // Fallback to a simple Express server
  const express = require('express');
  const app = express();
  
  // Add CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });
  
  // Add a health check endpoint
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Police Task Tracker API',
      version: require('./package.json').version,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });
  
  // Start the fallback server
  app.listen(PORT, () => {
    console.log(`Fallback Express server running on port ${PORT}`);
  });
} 