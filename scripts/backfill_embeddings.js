require('dotenv').config();
const { Pool } = require('pg');
const { generateEmbeddingsBatch, generateEmbedding } = require('../src/embeddings');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function backfill() {
  const client = await pool.connect();
  try {
    console.log("Fetching documents without embeddings...");
    const { rows: docs } = await client.query(`
      SELECT d.id, d.title, d.content 
      FROM documents d
      LEFT JOIN embeddings e ON d.id = e.document_id
      WHERE e.id IS NULL
    `);

    console.log(`Found ${docs.length} documents to process.`);
    if (docs.length === 0) return;

    // Note: Gemini's batchEmbedContents might have strict limits for the free tier.
    // If it fails, we fall back to sequential processing.
    const BATCH_SIZE = 50; 
    
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(docs.length / BATCH_SIZE)}...`);
      
      const texts = batch.map(d => `Title: ${d.title}\n\nAbstract: ${d.content}`);
      
      try {
        const vectors = await generateEmbeddingsBatch(texts);
        
        await client.query('BEGIN');
        for (let j = 0; j < batch.length; j++) {
          const docId = batch[j].id;
          const vectorString = `[${vectors[j].join(',')}]`;
          
          await client.query(
            `INSERT INTO embeddings (document_id, embedding) VALUES ($1, $2)`,
            [docId, vectorString]
          );
        }
        await client.query('COMMIT');
        console.log(`Successfully saved batch to DB.`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error("Batch failed, attempting sequential for this batch...");
        
        // Fallback to sequential to avoid losing the whole batch if one fails or batch is too large
        for (let j = 0; j < batch.length; j++) {
          try {
            const vector = await generateEmbedding(texts[j]);
            const docId = batch[j].id;
            const vectorString = `[${vector.join(',')}]`;
            
            await client.query(
              `INSERT INTO embeddings (document_id, embedding) VALUES ($1, $2)`,
              [docId, vectorString]
            );
          } catch (innerErr) {
            console.error(`Failed to embed document ID ${batch[j].id}:`, innerErr.message);
          }
        }
      }
      
      // Sleep slightly to respect rate limits
      await new Promise(r => setTimeout(r, 2000));
    }
    
    console.log("Backfill complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

backfill();
