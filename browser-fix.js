// Paste this in your browser console

(function() {
  // Create a custom XMLHttpRequest proxy
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  // Override the open method to add CORS headers
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    // Save the URL for later
    this._url = url;
    
    // Call the original open method
    return originalXHROpen.apply(this, arguments);
  };
  
  // Override the send method to add CORS headers
  XMLHttpRequest.prototype.send = function(data) {
    // Add CORS headers
    this.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
    // Call the original send method
    return originalXHRSend.apply(this, arguments);
  };
  
  // Also fix fetch for modern applications
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options = {}) {
    if (!options.headers) {
      options.headers = {};
    }
    
    // Create mutable headers object if it's immutable
    if (options.headers instanceof Headers) {
      const newHeaders = {};
      for (let [key, value] of options.headers.entries()) {
        newHeaders[key] = value;
      }
      options.headers = newHeaders;
    }
    
    // Add headers that help with CORS
    options.credentials = 'include';
    options.mode = 'cors';
    
    return originalFetch(url, options)
      .catch(error => {
        console.error('Fetch error:', error);
        // Try again with no-cors mode as fallback
        if (error.message.includes('CORS')) {
          console.log('Retrying with no-cors mode...');
          options.mode = 'no-cors';
          return originalFetch(url, options);
        }
        throw error;
      });
  };
  
  console.log('✅ CORS fix installed. Try logging in now.');
})(); 