# Sprint 1: Data & Database Foundation
**Duration**: Days 1-2

## Goals
Establish the core database schema and ingest initial datasets for search functionality.

## Tasks
- [ ] Set up a Dockerized PostgreSQL database with the `pgvector` extension.
- [ ] Design and implement the database schema:
  - `documents` table (id, title, content, source_url, created_at)
  - `embeddings` table (document_id, vector) using `vector(1536)` column type.
- [ ] Create an HNSW or IVFFlat index for approximate nearest-neighbor search.
- [ ] Write a script to fetch and ingest a real dataset (e.g., 500-1000 CS paper abstracts via the arXiv API).
