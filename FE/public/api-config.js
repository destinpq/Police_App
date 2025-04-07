// This script injects the API URL as a global variable
// It will be loaded before any React code runs
(function() {
  try {
    // Check if the API URL is already set by server environment
    const apiUrlMeta = document.querySelector('meta[name="api-url"]');
    
    if (apiUrlMeta && apiUrlMeta.content) {
      // Use the meta tag value if available
      window.ENV_API_URL = apiUrlMeta.content;
    } else {
      // Default API endpoints based on hostname
      const hostname = window.location.hostname;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Development environment
        window.ENV_API_URL = 'http://localhost:8888/api';
      } else if (hostname.includes('staging')) {
        // Staging environment
        window.ENV_API_URL = 'https://tasktracker-staging.ondigitalocean.app/api';
      } else {
        // Production environment
        window.ENV_API_URL = 'https://tasktracker.ondigitalocean.app/api';
      }
    }
    
    console.log('API configured:', window.ENV_API_URL);
  } catch (e) {
    console.error('Failed to configure API URL:', e);
    // Fallback to production URL if there's an error
    window.ENV_API_URL = 'https://tasktracker.ondigitalocean.app/api';
  }
})(); 