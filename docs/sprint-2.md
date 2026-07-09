# Sprint 2: Express API & Embedding Pipeline
**Duration**: Days 3-5

## Goals
Build the backend API to handle document ingestion, embeddings generation, and search queries.

## Tasks
- [ ] Set up the Node.js/Express project structure.
- [ ] Implement `POST /documents` endpoint:
  - Chunk long text if necessary.
  - Call the embedding API (OpenAI/Gemini/HuggingFace) to generate vectors.
  - Store the vectors in the database.
- [ ] Implement `GET /search?q=...` endpoint:
  - Embed the incoming search query.
  - Execute a cosine-similarity ANN query (`ORDER BY embedding <=> query_vector LIMIT 10`).
  - Combine with `tsvector` keyword search for hybrid ranking (weighted score merge).
- [ ] Add pagination to search results.
- [ ] Implement basic authentication (JWT).
- [ ] Add rate limiting middleware.
