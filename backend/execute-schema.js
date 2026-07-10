const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Read and execute schema
async function executeSchema() {
  try {
    const schemaPath = path.join(__dirname, 'sql', 'neon_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('⏳ Executing schema file...');
    console.log('━'.repeat(60));
    
    // Execute the schema
    await pool.query(schemaSQL);
    
    console.log('✅ Schema executed successfully!');
    console.log('━'.repeat(60));
    console.log('✓ roles table created');
    console.log('✓ users table updated with role_id');
    console.log('✓ Default roles inserted');
    console.log('✓ Sample data inserted');
    
  } catch (error) {
    console.error('❌ Error executing schema:', error.message);
    if (error.detail) console.error('Details:', error.detail);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

executeSchema();
