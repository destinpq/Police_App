// Script to initialize the Heroku database
const { Client } = require('pg');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function initDatabase() {
  console.log('Starting database initialization');

  // Create a client from the DATABASE_URL
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Connect to the database
    console.log('Connecting to Heroku PostgreSQL database...');
    await client.connect();
    console.log('Connected to the database.');

    // Create initial tables
    console.log('Creating tables...');
    
    // Create users table first as other tables depend on it
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS "user" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR NOT NULL UNIQUE,
        "name" VARCHAR,
        "isAdmin" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createUsersTable);
    console.log('Users table created.');

    // Create projects table
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS "project" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "description" TEXT,
        "createdById" INTEGER REFERENCES "user"("id"),
        "created_at" TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createProjectsTable);
    console.log('Projects table created.');

    // Create tasks table
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS "task" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR NOT NULL,
        "description" TEXT,
        "status" VARCHAR DEFAULT 'OPEN',
        "priority" VARCHAR DEFAULT 'MEDIUM',
        "createdById" INTEGER REFERENCES "user"("id"),
        "assignedToId" INTEGER REFERENCES "user"("id"),
        "projectId" INTEGER REFERENCES "project"("id"),
        "moneySpent" NUMERIC(10,2) DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createTasksTable);
    console.log('Tasks table created.');

    // Insert seed data - admin user
    const insertAdminQuery = `
      INSERT INTO "user" (email, name, "isAdmin")
      VALUES ('admin@destinpq.com', 'Admin User', true)
      ON CONFLICT (email) DO NOTHING;
    `;
    
    await client.query(insertAdminQuery);
    console.log('Admin user created.');

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.end();
  }
}

// Run the initialization
initDatabase().catch(console.error); 