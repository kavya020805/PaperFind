require('dotenv').config();
const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to the database.');

    console.log('Dropping old embeddings table...');
    await client.query('DROP TABLE IF EXISTS embeddings;');
    
    console.log('Recreating embeddings table with vector(384)...');
    await client.query(`
      CREATE TABLE embeddings (
          id SERIAL PRIMARY KEY,
          document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
          embedding vector(384) NOT NULL
      );
    `);
    
    console.log('Recreating HNSW index...');
    await client.query(`
      CREATE INDEX embeddings_vector_idx ON embeddings USING hnsw (embedding vector_cosine_ops);
    `);

    console.log('Migration successful.');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await client.end();
  }
}

migrate();
