// Simple entry point for DigitalOcean App Platform
console.log('Starting application via index.js');

try {
  // Try to load the compiled dist/main.js
  if (require('fs').existsSync('./dist/main.js')) {
    console.log('Loading from dist/main.js');
    require('./dist/main.js');
  } else if (require('fs').existsSync('./dist/main')) {
    console.log('Loading from dist/main');
    require('./dist/main');
  } else {
    // Try using the server.js loader
    console.log('Trying server.js loader');
    require('./server.js');
  }
} catch (error) {
  console.error('Error starting application:', error);
  process.exit(1);
} 