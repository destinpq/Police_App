const fs = require('fs');
const path = require('path');

// Path to the main.js file
const mainJsPath = path.join(process.cwd(), 'dist/src/main.js');
console.log('Reading file:', mainJsPath);

try {
  let content = fs.readFileSync(mainJsPath, 'utf8');
  
  // Add CORS middleware before the app.listen line
  const corsMiddleware = `
  // CORS middleware added by patch script
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://walrus-app-r6lhp.ondigitalocean.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });
  `;
  
  // Insert the middleware before app.listen
  const listenPattern = /app\.listen\(/;
  if (listenPattern.test(content)) {
    content = content.replace(listenPattern, `${corsMiddleware}\n\napp.listen(`);
    fs.writeFileSync(mainJsPath, content, 'utf8');
    console.log('Successfully added CORS middleware to main.js');
  } else {
    console.log('Could not find app.listen line in main.js');
  }
} catch (error) {
  console.error('Error updating main.js:', error);
} 