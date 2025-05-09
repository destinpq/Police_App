/**
 * This script detects and removes any Heroku references 
 * from the compiled JavaScript files
 */
const fs = require('fs');
const path = require('path');

console.log('Checking for Heroku references in compiled code...');

// Get all compiled JavaScript files
function getAllJsFiles(directory) {
  const files = [];
  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      files.push(...getAllJsFiles(fullPath));
    } else if (item.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Check if dist directory exists
if (!fs.existsSync('dist')) {
  console.log('No dist directory found. Nothing to check.');
  process.exit(0);
}

// Get all JS files
const jsFiles = getAllJsFiles('dist');
console.log(`Found ${jsFiles.length} JavaScript files to check.`);

// Count of files modified
let modifiedFiles = 0;

// Process each file
for (const filePath of jsFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for Heroku references
  if (content.includes('DATABASE_URL') || 
      content.includes('Heroku') || 
      content.includes('heroku')) {
    
    console.log(`Found Heroku reference in ${filePath}`);
    
    // Replace Heroku references with Digital Ocean
    let newContent = content;
    newContent = newContent.replace(/Using Heroku DATABASE_URL for connection/g, 
                                   'Using Digital Ocean PostgreSQL connection');
    newContent = newContent.replace(/process\.env\.DATABASE_URL/g, 
                                   'null /* Removed Heroku DATABASE_URL reference */');
    
    // Write changes
    fs.writeFileSync(filePath, newContent, 'utf8');
    modifiedFiles++;
  }
}

console.log(`Checked ${jsFiles.length} files. Modified ${modifiedFiles} files with Heroku references.`); 