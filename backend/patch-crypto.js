const fs = require('fs');
const path = require('path');

// Path to the file that needs patching
const filePath = path.join(__dirname, 'node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js');

console.log(`Checking if file exists: ${filePath}`);
if (fs.existsSync(filePath)) {
  console.log('File exists, applying patch...');
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the patch is needed (crypto import doesn't exist)
  if (!content.includes('const crypto = require(\'crypto\');')) {
    console.log('Patching file with crypto import...');
    
    // Add the crypto import after the first line with exports definition
    content = content.replace(
      'exports.generateString = exports.getConnectionToken = void 0;',
      'exports.generateString = exports.getConnectionToken = void 0;\nconst crypto = require(\'crypto\');'
    );
    
    // Write the patched file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patch applied successfully!');
  } else {
    console.log('File already patched.');
  }
} else {
  console.error('Error: File not found!');
  process.exit(1);
} 