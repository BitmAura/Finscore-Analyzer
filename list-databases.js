// Script to check all databases in PostgreSQL instance
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.development' });

async function listDatabases() {
  console.log('Checking all databases in PostgreSQL instance...');
  
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('Connected to postgres database');
    
    try {
      // List all databases
      console.log('\nListing all databases:');
      const dbResult = await client.query(`
        SELECT datname FROM pg_database 
        WHERE datistemplate = false
        ORDER BY datname;
      `);
      
      if (dbResult.rows.length === 0) {
        console.log('No databases found.');
      } else {
        for (const row of dbResult.rows) {
          console.log(`- ${row.datname}`);
        }
      }
      
      // For each database, check if it contains our tables
      console.log('\nChecking each database for our tables:');
      
      for (const row of dbResult.rows) {
        const dbName = row.datname;
        console.log(`\nChecking database: ${dbName}`);
        
        // Skip template and system databases
        if (dbName.startsWith('template') || dbName === 'postgres') {
          console.log('System database, skipping detailed check.');
          continue;
        }
        
        // Connect to this specific database
        const dbPool = new Pool({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432'),
          database: dbName,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: { rejectUnauthorized: false }
        });
        
        try {
          const dbClient = await dbPool.connect();
          
          // List all tables in this database
          const tableResult = await dbClient.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name;
          `);
          
          if (tableResult.rows.length === 0) {
            console.log(`  No user tables found in ${dbName}`);
          } else {
            console.log(`  Found ${tableResult.rows.length} tables in ${dbName}:`);
            tableResult.rows.forEach(tbl => {
              console.log(`  - ${tbl.table_schema}.${tbl.table_name}`);
            });
            
            // Look specifically for our users table
            const userTableResult = await dbClient.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'users'
              ) as exists;
            `);
            
            if (userTableResult.rows[0].exists) {
              console.log(`\n✅ FOUND USERS TABLE IN DATABASE: ${dbName}`);
              console.log('This appears to be your FinScore database!');
              
              // Update .env.development with this database name
              console.log(`\nUpdate your .env.development file to use this database:`);
              console.log(`DB_NAME=${dbName}`);
            }
          }
          
          dbClient.release();
        } catch (err) {
          console.log(`  Error connecting to ${dbName}: ${err.message}`);
        } finally {
          await dbPool.end();
        }
      }
      
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database connection error:', err.message);
  } finally {
    await pool.end();
  }
}

listDatabases();
