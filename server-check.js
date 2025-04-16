/**
 * Server Health Check Script
 * 
 * This script checks if the backend server is running and starts it if not.
 * It also verifies the database connection.
 */

const { exec, spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3001/api/health';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // ms

// Log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Check if server is running by sending a request to the health endpoint
async function checkServerHealth() {
  return new Promise((resolve) => {
    log('Checking if backend server is running...');
    
    const req = http.get(API_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const healthData = JSON.parse(data);
            log(`Server is running. Status: ${healthData.status}`);
            log(`Database status: ${healthData.database?.status || 'unknown'}`);
            
            resolve({
              running: true,
              status: healthData.status,
              database: healthData.database
            });
          } catch (err) {
            log('Error parsing health check response');
            resolve({ running: true, status: 'unknown' });
          }
        } else {
          log(`Server returned non-200 status code: ${res.statusCode}`);
          resolve({ running: false });
        }
      });
    });
    
    req.on('error', (err) => {
      log(`Server health check failed: ${err.message}`);
      resolve({ running: false, error: err.message });
    });
    
    req.setTimeout(5000, () => {
      req.abort();
      log('Server health check timed out');
      resolve({ running: false, error: 'timeout' });
    });
  });
}

// Start the backend server
function startBackendServer() {
  log('Starting backend server...');
  
  // Check if backend folder exists
  if (!fs.existsSync(path.join(process.cwd(), 'BE'))) {
    log('Error: BE directory not found');
    return false;
  }
  
  // Use spawn to keep the server running in the background
  const server = spawn('npm', ['run', 'start:dev'], { 
    cwd: path.join(process.cwd(), 'BE'),
    detached: true,
    stdio: 'pipe'
  });
  
  server.stdout.on('data', (data) => {
    log(`Server stdout: ${data}`);
  });
  
  server.stderr.on('data', (data) => {
    log(`Server stderr: ${data}`);
  });
  
  server.on('error', (err) => {
    log(`Failed to start server: ${err.message}`);
    return false;
  });
  
  // Detach the server process so it keeps running after this script exits
  server.unref();
  
  log('Backend server started in the background');
  return true;
}

// Fix database connection if needed
async function fixDatabaseConnection() {
  return new Promise((resolve) => {
    log('Checking PostgreSQL service...');
    
    // For Windows: Check if PostgreSQL service is running
    exec('Get-Service postgresql-x64-17 | Select-Object -Property Status', 
      { shell: 'powershell.exe' }, 
      (error, stdout, stderr) => {
        if (error) {
          log(`Error checking PostgreSQL service: ${error.message}`);
          resolve(false);
          return;
        }
        
        if (stdout.includes('Running')) {
          log('PostgreSQL service is running');
          resolve(true);
        } else {
          log('PostgreSQL service is not running. Attempting to start...');
          
          // Try to start the service
          exec('Start-Service postgresql-x64-17', 
            { shell: 'powershell.exe' }, 
            (startError, startStdout, startStderr) => {
              if (startError) {
                log(`Error starting PostgreSQL service: ${startError.message}`);
                resolve(false);
                return;
              }
              
              log('PostgreSQL service started successfully');
              resolve(true);
            }
          );
        }
      }
    );
  });
}

// Main function with retry logic
async function main() {
  log('Starting server health check...');
  
  let retries = 0;
  let serverRunning = false;
  let serverHealth = null;
  
  while (retries < MAX_RETRIES && !serverRunning) {
    // Check if server is already running
    serverHealth = await checkServerHealth();
    serverRunning = serverHealth.running;
    
    if (serverRunning) {
      // Server is running, check database status
      if (serverHealth.database && serverHealth.database.status !== 'connected') {
        log('Database connection issue detected. Attempting to fix...');
        await fixDatabaseConnection();
      } else {
        log('Server and database are both running correctly');
      }
      break;
    }
    
    // Server is not running, attempt to start it
    log(`Server not running (attempt ${retries + 1} of ${MAX_RETRIES})`);
    const started = startBackendServer();
    
    if (!started) {
      log('Failed to start backend server');
      process.exit(1);
    }
    
    // Wait for server to start
    log(`Waiting ${RETRY_DELAY/1000} seconds for server to start...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    
    retries++;
  }
  
  if (!serverRunning) {
    log(`Failed to start server after ${MAX_RETRIES} attempts`);
    process.exit(1);
  }
  
  log('Server check completed successfully');
}

main().catch(err => {
  log(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 