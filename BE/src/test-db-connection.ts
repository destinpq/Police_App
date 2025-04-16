import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

// Load environment variables
config();

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  const configService = new ConfigService();
  
  // Get database configuration
  const host = configService.get<string>('DB_HOST', 'localhost');
  const port = configService.get<number>('DB_PORT', 5432);
  const username = configService.get<string>('DB_USERNAME');
  const password = configService.get<string>('DB_PASSWORD');
  const database = configService.get<string>('DB_DATABASE');
  
  console.log('Database configuration:');
  console.log(`- Host: ${host}`);
  console.log(`- Port: ${port}`);
  console.log(`- Username: ${username}`);
  console.log(`- Password: ${password ? '********' : 'NOT SET'}`);
  console.log(`- Database: ${database}`);
  
  // Create a basic connection (no entities or migrations)
  const dataSource = new DataSource({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    logging: true
  });
  
  try {
    console.log('Attempting to connect to the database...');
    await dataSource.initialize();
    
    console.log('✅ Database connection successful!');
    
    // Check if database contains expected tables
    console.log('Checking database tables...');
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Database tables:');
    tables.forEach((table: any) => {
      console.log(`- ${table.table_name}`);
    });
    
    if (tables.length === 0) {
      console.warn('⚠️ No tables found in the database. The database might be empty.');
      console.log('You may need to run migrations or seed data.');
    }
    
    // Generate a successful connection report
    const report = {
      timestamp: new Date().toISOString(),
      success: true,
      database: {
        host,
        port,
        username,
        database,
        tables: tables.map((t: any) => t.table_name)
      }
    };
    
    fs.writeFileSync('db-connection-test-result.json', JSON.stringify(report, null, 2));
    console.log('Connection report saved to db-connection-test-result.json');
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(error);
    
    // Generate a failed connection report
    const report = {
      timestamp: new Date().toISOString(),
      success: false,
      database: {
        host,
        port,
        username,
        database
      },
      error: {
        message: error.message,
        code: error.code,
        detail: error.detail
      }
    };
    
    fs.writeFileSync('db-connection-test-result.json', JSON.stringify(report, null, 2));
    console.log('Connection error report saved to db-connection-test-result.json');
    
    // Provide helpful troubleshooting tips
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify PostgreSQL is running: Check service status');
    console.log('2. Check database credentials in .env file');
    console.log('3. Ensure the database exists: Run "CREATE DATABASE task_tracker_db;" in psql');
    console.log('4. Verify network connectivity to the database (if not localhost)');
    console.log('5. Check PostgreSQL logs for errors');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\nSpecific issue: Connection refused');
      console.log('- PostgreSQL might not be running or listening on the specified port');
      console.log('- Check if the port is correct and if PostgreSQL is running');
    } else if (error.code === '28P01') {
      console.log('\nSpecific issue: Authentication failed');
      console.log('- Username or password is incorrect');
      console.log('- Check your .env file and PostgreSQL user credentials');
    } else if (error.code === '3D000') {
      console.log('\nSpecific issue: Database does not exist');
      console.log('- Create the database first:');
      console.log('  1. Connect to PostgreSQL: psql -U postgres');
      console.log(`  2. Create database: CREATE DATABASE ${database};`);
    }
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

// Run the test
testDatabaseConnection().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 