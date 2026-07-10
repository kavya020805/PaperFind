# PaperFind

PaperFind is an AI-powered semantic search engine for academic papers, built using PostgreSQL, pgvector, Node/Express, and React. It uses HuggingFace embeddings to understand the semantic meaning behind search queries, combining them with traditional keyword search for a powerful Hybrid Search experience.

## Features
- **Hybrid Search**: Combines Cosine Distance Semantic Search with Full-Text Keyword Search.
- **Fast**: Redis query caching layer for sub-millisecond responses on repeated queries.
- **Scalable**: Asynchronous background analytics logging using BullMQ.
- **Modern UI**: A premium, responsive, glassmorphic dark-mode interface.

---

## Deployment Instructions

This repository is fully configured for a seamless deployment using **Render** (for the backend and database) and **Vercel** (for the frontend).

### 1. Deploy the Backend & Database to Render
Render natively supports our `render.yaml` Blueprint file, which will automatically provision a PostgreSQL database, a Redis instance, and an Express Node web service.

1. Create a free account at [Render.com](https://render.com).
2. Go to your Dashboard and click **New > Blueprint**.
3. Connect your GitHub account and select this `PaperFind` repository.
4. Render will automatically read the `render.yaml` file.
5. In the final step before deploying, Render will ask you for a value for `HUGGINGFACE_API_KEY`. Paste your HuggingFace key here.
6. Click **Apply**.
7. *Note: The database and Redis will spin up first, followed by the web service. Once deployed, note the URL of your Web Service (e.g., `https://paperfind-backend-xxx.onrender.com`).*

### 2. Deploy the Frontend to Vercel
Vercel is highly optimized for deploying React/Vite applications.

1. Create a free account at [Vercel.com](https://vercel.com).
2. Click **Add New > Project**.
3. Import this `PaperFind` repository from your GitHub.
4. Expand the **Framework Preset** section and ensure it detected **Vite**.
5. Set the **Root Directory** to `frontend`.
6. Expand **Environment Variables** and add the following:
   - Key: `VITE_API_URL`
   - Value: *The URL of your deployed Render Web Service* (e.g., `https://paperfind-backend-xxx.onrender.com`)
7. Click **Deploy**.

That's it! Your Vercel frontend will now communicate securely with your Render backend.

---

## Local Development

If you prefer to run the app locally, you can use Docker and NPM.

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)

### Setup
1. Clone the repository.
2. Create a `.env` file in the root based on `.env.example`, providing your `HUGGINGFACE_API_KEY`.
3. Spin up the Postgres and Redis databases:
   ```bash
   docker-compose up -d
   ```
4. Run the database migration script:
   ```bash
   node scripts/create_analytics_table.js
   ```
5. Start the Express Backend:
   ```bash
   npm install
   npm run dev
   ```
6. In a separate terminal, start the React Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
7. Visit `http://localhost:5173` in your browser.