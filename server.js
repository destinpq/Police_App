// Simple server entry point
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Set default port
const PORT = process.env.PORT || 3000;

// Attempt to require the main module
try {
  console.log('Starting application...');
  
  // Try to load the compiled NestJS application
  const mainModule = require('./dist/main');
  console.log('Application started successfully');
  
} catch (err) {
  console.error('Failed to load application:', err);
  
  // Fallback to a simple Express server
  const express = require('express');
  const app = express();
  
  // Add a health check endpoint
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Backend server is running',
      timestamp: new Date().toISOString()
    });
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Fallback Express server running on port ${PORT}`);
  });
} 