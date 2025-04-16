// This script injects the API URL as a global variable
// It will be loaded before any React code runs
(function() {
  try {
    if (typeof window === 'undefined') {
      console.log('API config running on server - skipping');
      return; // Skip on server side
    }

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
        window.ENV_API_URL = 'http://localhost:3001/api';
      } else if (hostname.includes('staging')) {
        // Staging environment
        window.ENV_API_URL = 'http://localhost:3001/api';
      } else {
        // Production environment
        window.ENV_API_URL = 'http://localhost:3001/api';
      }
    }
    
    console.log('API configured:', window.ENV_API_URL);
  } catch (e) {
    console.error('Failed to configure API URL:', e);
    // Fallback to production URL if there's an error
    if (typeof window !== 'undefined') {
      window.ENV_API_URL = 'http://localhost:3001/api';
    }
  }
})(); 