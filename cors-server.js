// Direct CORS fix for Heroku
const express = require('express');
const cors = require('cors');
const app = express();

// Set up CORS middleware with specific origin
app.use(cors({
  origin: 'https://walrus-app-r6lhp.ondigitalocean.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Proxy to the original app
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/', createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CORS server running on port ${PORT}`);
}); 