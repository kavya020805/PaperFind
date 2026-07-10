const { Queue, Worker } = require('bullmq');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const connection = {
  host: 'localhost',
  port: 6379
};

const analyticsQueue = new Queue('analytics', { connection });

const worker = new Worker('analytics', async (job) => {
  const { query } = job.data;
  console.log(`[Worker] Processing analytics for query: "${query}"`);
  
  if (!query) return;

  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO search_analytics (query) VALUES ($1)',
      [query]
    );
  } catch (err) {
    console.error('[Worker] Error inserting query into DB:', err);
    throw err;
  } finally {
    client.release();
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

module.exports = { analyticsQueue };
