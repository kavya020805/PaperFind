const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { generateEmbedding } = require('./embeddings');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

// Middleware for basic JWT authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Dev route to generate a token for testing
router.get('/auth/token', (req, res) => {
  const token = jwt.sign({ user: 'dev_user' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// POST /documents: Ingest single document
router.post('/documents', authenticateToken, async (req, res) => {
  const { title, content, source_url } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    // 1. Generate embedding
    const textToEmbed = `Title: ${title}\n\nAbstract: ${content}`;
    const vector = await generateEmbedding(textToEmbed);

    // 2. Format vector for pgvector: '[v1, v2, ...]'
    const vectorString = `[${vector.join(',')}]`;

    // 3. Insert into DB inside a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const docResult = await client.query(
        `INSERT INTO documents (title, content, source_url) 
         VALUES ($1, $2, $3) RETURNING id`,
        [title, content, source_url]
      );
      const docId = docResult.rows[0].id;

      await client.query(
        `INSERT INTO embeddings (document_id, embedding) 
         VALUES ($1, $2)`,
        [docId, vectorString]
      );

      await client.query('COMMIT');
      res.status(201).json({ message: "Document ingested successfully", id: docId });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /search: Hybrid Search
router.get('/search', async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: "Search query 'q' is required." });
  }

  const offset = (page - 1) * limit;

  try {
    // 1. Embed query
    const queryVector = await generateEmbedding(q);
    const vectorString = `[${queryVector.join(',')}]`;

    // 2. Perform Hybrid Search
    // We combine semantic similarity (vector_cosine_ops, `<=>`) and keyword matching (ts_rank)
    // Formula: rank_score = (semantic_weight * semantic_score) + (keyword_weight * keyword_score)
    // Note: `<=>` gives distance (0 is perfect match), so similarity is 1 - distance
    const searchSQL = `
      WITH semantic_search AS (
        SELECT 
          d.id, 
          d.title, 
          d.content, 
          d.source_url,
          (1 - (e.embedding <=> $1::vector)) AS semantic_score
        FROM documents d
        JOIN embeddings e ON d.id = e.document_id
      ),
      keyword_search AS (
        SELECT 
          id,
          ts_rank(fts_vector, plainto_tsquery('english', $2)) AS keyword_score
        FROM documents
        WHERE fts_vector @@ plainto_tsquery('english', $2)
      )
      SELECT 
        s.id, 
        s.title, 
        substring(s.content from 1 for 200) || '...' as snippet,
        s.source_url,
        s.semantic_score,
        COALESCE(k.keyword_score, 0) AS keyword_score,
        -- Weighted hybrid score: 70% semantic, 30% keyword
        (s.semantic_score * 0.7 + COALESCE(k.keyword_score, 0) * 0.3) AS hybrid_score
      FROM semantic_search s
      LEFT JOIN keyword_search k ON s.id = k.id
      ORDER BY hybrid_score DESC
      LIMIT $3 OFFSET $4;
    `;

    const result = await pool.query(searchSQL, [vectorString, q, limit, offset]);
    
    // Count total results for semantic (approximation)
    // In production we wouldn't do a full count, but it's fine for our scale
    
    res.json({
      query: q,
      page: parseInt(page),
      results: result.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
