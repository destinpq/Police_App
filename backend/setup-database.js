const { spawn } = require('child_process');
const path = require('path');

console.log('=== Database Setup Script ===');
console.log('This script will run migrations and seed the database');

// Helper function to run a command
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`> Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function setupDatabase() {
  try {
    // Run TypeORM migrations
    console.log('\n=== Running Migrations ===');
    await runCommand('npx', ['typeorm', 'migration:run']);
    
    // Run seed script
    console.log('\n=== Seeding Database ===');
    await runCommand('node', ['dist/seed.js']);
    
    console.log('\n=== Setup Completed Successfully ===');
    console.log('Your database is now ready to use!');
  } catch (error) {
    console.error('\nError during database setup:', error.message);
    process.exit(1);
  }
}

setupDatabase(); 