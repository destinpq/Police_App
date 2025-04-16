/**
 * Startup Script for Next.js Application
 * 
 * This script starts the Next.js development server.
 */

const { spawn } = require('child_process');

// Use environment variable for API URL with a local fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';

// Function to run Next.js development server
function startNextApp() {
  console.log('Starting Next.js application...');
  console.log(`API URL: ${API_BASE_URL}`);
  
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  nextProcess.on('error', (error) => {
    console.error('Failed to start Next.js application:', error);
    process.exit(1);
  });
  
  nextProcess.on('close', (code) => {
    console.log(`Next.js application exited with code ${code}`);
    process.exit(code);
  });
}

// Main function
function main() {
  console.log('==== Starting application ====');
  startNextApp();
}

// Run the main function
main(); 