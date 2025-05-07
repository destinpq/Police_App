// This is a direct entry point for DigitalOcean App Platform
// It will look for the compiled code in the dist directory

// Show directory contents for debugging
const fs = require('fs');
const path = require('path');

console.log('Current working directory:', process.cwd());
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
  } else {
    console.log('dist directory does not exist');
  }
} catch (err) {
  console.error('Error checking dist directory:', err);
}

// Attempt to require the main module
try {
  console.log('Attempting to load main module...');
  // Try several possible paths
  const possiblePaths = [
    './dist/main.js',
    './dist/main',
    './main.js',
    './main',
    './dist/src/main.js',
    './dist/src/main'
  ];

  let mainModule = null;
  let successPath = null;

  for (const modulePath of possiblePaths) {
    try {
      console.log(`Trying to require: ${modulePath}`);
      mainModule = require(modulePath);
      successPath = modulePath;
      console.log(`Successfully loaded: ${modulePath}`);
      break;
    } catch (err) {
      console.log(`Failed to load ${modulePath}: ${err.message}`);
    }
  }

  if (!mainModule) {
    // Last resort - directly execute the typescript
    console.log('Trying to use ts-node to execute source directly');
    require('ts-node/register');
    mainModule = require('./src/main.ts');
    successPath = './src/main.ts';
  }

  console.log(`Application loaded from: ${successPath}`);
} catch (err) {
  console.error('Failed to load application:', err);
  process.exit(1);
} 