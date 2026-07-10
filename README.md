# PaperFind

## Description
PaperFind is a Semantic Search Engine designed for research papers and documents. It ingests documents (such as arXiv paper abstracts or any text corpus), generates embeddings, and stores them in a Dockerized PostgreSQL instance with pgvector. It exposes a powerful hybrid search (combining semantic and keyword search) via an Express API, with an intuitive React frontend for users to interact with.

## Features
- **Document Ingestion**: Seamlessly ingest real datasets (e.g., CS paper abstracts from arXiv).
- **Hybrid Search**: Combines cosine-similarity approximate nearest-neighbor (ANN) queries with `tsvector` keyword search to provide a weighted score merge for highly accurate results.
- **Semantic & Keyword Ranking**: Returns results based on both semantic meaning and exact keyword matches.
- **RESTful API**: Exposes robust endpoints for document ingestion and search, complete with pagination, JWT-based basic auth, and rate limiting.
- **React UI**: A polished frontend featuring a search bar, result cards with similarity scores, and highlighted keyword matches.
- **Related Papers**: Easily find nearest neighbors of a given document to discover related research.
- **Query Caching**: Utilizes Redis for caching repeated queries to improve response times.
- **Asynchronous Background Processing**: Uses BullMQ/cron for background jobs to re-index and re-embed documents without blocking requests.

## Tech Stack
- **Frontend**: React
- **Backend API**: Node.js, Express.js
- **Database**: PostgreSQL (Dockerized) with `pgvector` extension
- **Embeddings**: OpenAI / Gemini / HuggingFace Inference API
- **Caching**: Redis
- **Background Jobs**: BullMQ (or similar cron-based solution)
- **Deployment**: Render/Railway (Backend & DB), Vercel (Frontend)