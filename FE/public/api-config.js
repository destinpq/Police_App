// This script injects the API URL as a global variable
// It will be loaded before any React code runs
(function() {
  try {
    // Default production API endpoint
    window.ENV_API_URL = 'https://octopus-app-ct5vs.ondigitalocean.app/api';
    
    console.log('API configured:', window.ENV_API_URL);
  } catch (e) {
    console.error('Failed to configure API URL:', e);
  }
})(); 