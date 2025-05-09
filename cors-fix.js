// Simple Express server with CORS enabled
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for all routes with all options
app.use(cors({
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add CORS headers as middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Proxy all requests to the actual Heroku backend
const apiProxy = createProxyMiddleware({
  target: 'https://police-app-backend.herokuapp.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // remove /api prefix when forwarding to target
  },
});

app.use('/api', apiProxy);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CORS proxy server running on port ${PORT}`);
});

// Copy and paste this into your browser console

(function() {
  // Override fetch with CORS headers
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options = {}) {
    // Add CORS mode to all options
    options.mode = 'cors';
    options.credentials = 'include';
    
    // Ensure headers exist
    if (!options.headers) {
      options.headers = {};
    }
    
    // Add CORS headers to the request
    options.headers = {
      ...options.headers,
      'Origin': window.location.origin,
      'Access-Control-Request-Method': options.method || 'GET',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    };
    
    console.log(`Fetching with CORS headers: ${url}`);
    return originalFetch(url, options);
  };
  
  console.log('✅ CORS override installed - try logging in now');
})(); 