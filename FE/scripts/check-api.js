/**
 * API Connection Checker Script
 * Run this script to verify API connectivity before starting the application
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';

async function checkApiConnection() {
  console.log(`Checking API connection to: ${API_BASE_URL}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/ping`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log('✅ API ping successful:', data.message || 'Connected');
        return true;
      } catch (e) {
        console.log('✅ API responded but returned non-JSON data');
        return true;
      }
    }
    
    console.error(`❌ API ping failed with status: ${response.status}`);
    return false;
  } catch (error) {
    console.error('❌ API ping failed:', error.message);
    
    // If first ping failed, try health endpoint as fallback 
    try {
      const fallbackResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (fallbackResponse.ok) {
        console.log('✅ API health check successful');
        return true;
      }
    } catch (fallbackError) {
      console.error('❌ API health check also failed:', fallbackError.message);
    }
    
    return false;
  }
}

// Check if the backend server is available
async function checkBackendServer() {
  const baseUrl = API_BASE_URL.replace('/api', '');
  console.log(`Checking backend server at: ${baseUrl}`);
  
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      mode: 'no-cors', // Use no-cors to check if server is reachable at all
      cache: 'no-cache'
    });
    
    // With no-cors, we can't read the response, but if we got here, the server is reachable
    console.log('✅ Backend server is reachable');
    return true;
  } catch (error) {
    console.error('❌ Backend server is not reachable:', error.message);
    return false;
  }
}

// Main function to run diagnostics
async function runDiagnostics() {
  console.log('===== API CONNECTION DIAGNOSTICS =====');
  
  // Check backend server
  const serverReachable = await checkBackendServer();
  
  // Check API endpoints
  const apiConnected = await checkApiConnection();
  
  console.log('\n===== DIAGNOSTICS RESULTS =====');
  console.log(`Backend Server: ${serverReachable ? '✅ REACHABLE' : '❌ UNREACHABLE'}`);
  console.log(`API Connection: ${apiConnected ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
  
  if (!serverReachable || !apiConnected) {
    console.log('\n===== TROUBLESHOOTING =====');
    console.log('1. Ensure the backend server is running');
    console.log('2. Check that the NEXT_PUBLIC_API_URL environment variable is set correctly');
    console.log('3. Verify there are no firewall or network issues');
    console.log('4. Check CORS configuration on the backend');
    
    // Exit with error code
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed. API is connected and working properly.');
    process.exit(0);
  }
}

// Run the diagnostics
runDiagnostics(); 