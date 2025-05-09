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
    
    // Replace Using Heroku DATABASE_URL message
    newContent = newContent.replace(/Using Heroku DATABASE_URL for connection/g, 
                                   'Using Digital Ocean PostgreSQL connection');
    
    // Replace DATABASE_URL check with null to force using individual env vars
    newContent = newContent.replace(/process\.env\.DATABASE_URL/g, 
                                   'null /* Removed Heroku DATABASE_URL reference */');
    
    // Replace the entire condition to check DATABASE_URL 
    newContent = newContent.replace(/if\s*\(\s*databaseUrl\s*\)\s*\{[\s\S]*?\}\s*else\s*if/g, 
                                   'if (false) {} else if');
    
    // Remove any conditional blocks that rely on DATABASE_URL
    newContent = newContent.replace(/if\s*\(\s*process\.env\.DATABASE_URL\s*\)\s*\{[\s\S]*?\}/g, 
                                   '/* Removed Heroku DATABASE_URL block */');
    
    // Replace direct references to Heroku in comments
    newContent = newContent.replace(/heroku/gi, 'digital_ocean');
    newContent = newContent.replace(/Heroku/g, 'Digital Ocean');
    
    // Write changes
    fs.writeFileSync(filePath, newContent, 'utf8');
    modifiedFiles++;
  }
}

console.log(`Checked ${jsFiles.length} files. Modified ${modifiedFiles} files with Heroku references.`);

// Now check for app.module.js specifically and make sure it doesn't have Heroku references
const appModulePath = path.join('dist', 'src', 'app.module.js');
if (fs.existsSync(appModulePath)) {
  console.log(`Checking ${appModulePath} specifically...`);
  
  let appModuleContent = fs.readFileSync(appModulePath, 'utf8');
  
  // Check for DATABASE_URL or Heroku references in plain text
  if (appModuleContent.includes('DATABASE_URL') || 
      appModuleContent.includes('Heroku') || 
      appModuleContent.includes('heroku')) {
    
    console.log(`Found Heroku reference in app.module.js, applying targeted fix...`);
    
    // Forcefully replace the entire TypeOrmModule.forRootAsync factory
    const startMarker = 'useFactory: (configService) => {';
    const factoryStart = appModuleContent.indexOf(startMarker);
    
    if (factoryStart !== -1) {
      // Find the function start and end
      let bracketCount = 1;
      let endPos = factoryStart + startMarker.length;
      
      while (bracketCount > 0 && endPos < appModuleContent.length) {
        if (appModuleContent[endPos] === '{') bracketCount++;
        if (appModuleContent[endPos] === '}') bracketCount--;
        endPos++;
      }
      
      // Only extract if we found a proper end
      if (bracketCount === 0) {
        const factoryEnd = endPos;
        
        // Create a clean replacement factory without Heroku code
        const replacement = `useFactory: (configService) => {
          const entities = [
            user_entity_1.User,
            task_entity_1.Task,
            project_entity_1.Project,
            accuracy_rating_entity_1.AccuracyRating,
            user_stats_entity_1.UserStats,
            project_stats_entity_1.ProjectStats,
          ];
          
          // Using Digital Ocean PostgreSQL connection
          console.log('Using Digital Ocean PostgreSQL connection');
          const useSSL = configService.get('DB_SSL') === 'true';
          const sslMode = configService.get('DB_SSL_MODE');
          const dbPort = configService.get('DB_PORT');
          
          return {
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: dbPort ? parseInt(dbPort) : 5432,
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities,
            synchronize: true,
            ssl: useSSL ? {
              rejectUnauthorized: false,
              mode: sslMode
            } : false,
            logging: ["query", "error"],
            logger: "advanced-console",
          };
        }`;
        
        // Replace the factory function
        appModuleContent = appModuleContent.substring(0, factoryStart) + 
                          replacement + 
                          appModuleContent.substring(factoryEnd);
        
        fs.writeFileSync(appModulePath, appModuleContent, 'utf8');
        console.log('Successfully applied targeted fix to app.module.js');
      } else {
        console.warn('Failed to find end of factory function in app.module.js');
      }
    } else {
      console.warn('Could not find factory function in app.module.js');
    }
  }
} 