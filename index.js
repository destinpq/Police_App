// Simple entry point that forwards to the main app
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

try {
  // Try to load the compiled application
  require('./dist/main');
} catch (err) {
  console.error('Error loading application:', err.message);
  console.error('Make sure the application is built with "npm run build"');
} 