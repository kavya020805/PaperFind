-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- The abstract or full text
    source_url TEXT UNIQUE, -- URL to the arXiv paper
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- tsvector column for full-text keyword search
    fts_vector tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(content, '')), 'B')) STORED
);

-- Create embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    embedding vector(384) NOT NULL
);

-- Index for full-text search (keyword search)
CREATE INDEX IF NOT EXISTS documents_fts_idx ON documents USING GIN (fts_vector);

-- Index for approximate nearest-neighbor search (semantic search)
-- We use HNSW (Hierarchical Navigable Small World) for fast ANN search
CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings USING hnsw (embedding vector_cosine_ops);
