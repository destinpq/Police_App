const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dirsToRemove = [
  'node_modules',
  'FE/node_modules',
  'BE/node_modules',
  'FE/.next',
  'BE/dist',
  'coverage',
  'FE/coverage',
  'BE/coverage',
];

const filesToRemove = [
  'package-lock.json',
  'FE/package-lock.json',
  'BE/package-lock.json',
  'yarn-error.log',
  'FE/yarn-error.log',
  'BE/yarn-error.log',
];

console.log('Cleaning project...');

// Remove directories
dirsToRemove.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dir}`);
    if (process.platform === 'win32') {
      try {
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`Error removing ${dir}: ${error.message}`);
      }
    } else {
      try {
        execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`Error removing ${dir}: ${error.message}`);
      }
    }
  }
});

// Remove files
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`Removing ${file}`);
    fs.unlinkSync(filePath);
  }
});

console.log('Cleaning complete!');
console.log('To reinstall dependencies, run:');
console.log('  yarn'); 