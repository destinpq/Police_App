// CORS Proxy Server
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Enable CORS for all requests
app.use(cors({ origin: '*' }));

// Handle preflight requests
app.options('*', cors());

// Proxy all POST requests to the Heroku backend
app.post('*', async (req, res) => {
  try {
    const targetUrl = 'https://police-app-backend.herokuapp.com' + req.originalUrl;
    console.log(`Proxying POST request to: ${targetUrl}`);
    
    // Get the request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        // Parse the body if it's JSON
        let jsonBody = {};
        try {
          jsonBody = JSON.parse(body);
        } catch (e) {
          console.log('Not JSON body or empty body');
        }
        
        // Forward the request to the target server
        const response = await axios.post(targetUrl, jsonBody, {
          headers: {
            'Content-Type': 'application/json',
            // Forward any auth headers
            ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}),
          }
        });
        
        // Return the response
        res.status(response.status).json(response.data);
      } catch (error) {
        console.error('Error forwarding request:', error.message);
        res.status(500).json({ error: 'Proxy error', details: error.message });
      }
    });
  } catch (error) {
    console.error('Error in proxy:', error);
    res.status(500).json({ error: 'Proxy server error', message: error.message });
  }
});

// Proxy all GET requests
app.get('*', async (req, res) => {
  try {
    const targetUrl = 'https://police-app-backend.herokuapp.com' + req.originalUrl;
    console.log(`Proxying GET request to: ${targetUrl}`);
    
    const response = await axios.get(targetUrl, {
      headers: {
        // Forward any auth headers
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}),
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error in proxy:', error);
    res.status(500).json({ error: 'Proxy server error', message: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`CORS Proxy running on port ${PORT}`);
  console.log(`To use: Update frontend API_BASE_URL to http://localhost:${PORT}`);
}); 