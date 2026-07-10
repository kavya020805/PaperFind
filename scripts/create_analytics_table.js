require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTable() {
  const client = await pool.connect();
  try {
    console.log('Creating search_analytics table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS search_analytics (
          id SERIAL PRIMARY KEY,
          query TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table created successfully.');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

createTable();
