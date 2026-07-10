require('dotenv').config();
const { Pool } = require('pg');
const axios = require('axios');
const xml2js = require('xml2js');

// Make sure to define DATABASE_URL in your .env file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const MAX_RESULTS = 500;
const SEARCH_QUERY = 'cat:cs.AI OR cat:cs.LG OR cat:cs.CL';

async function fetchArxivData() {
  const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(SEARCH_QUERY)}&start=0&max_results=${MAX_RESULTS}&sortBy=submittedDate&sortOrder=descending`;
  console.log(`Fetching from arXiv: ${url}`);
  
  const response = await axios.get(url);
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(response.data);
  
  const entries = result.feed.entry || [];
  console.log(`Fetched ${entries.length} articles.`);
  
  return entries.map(entry => {
    return {
      title: entry.title[0].replace(/\n/g, ' ').trim(),
      summary: entry.summary[0].replace(/\n/g, ' ').trim(),
      url: entry.id[0],
      published: new Date(entry.published[0])
    };
  });
}

async function ingestData() {
  try {
    const papers = await fetchArxivData();
    console.log('Inserting into database...');

    let insertedCount = 0;
    for (const paper of papers) {
      try {
        const result = await pool.query(
          `INSERT INTO documents (title, content, source_url, created_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (source_url) DO NOTHING
           RETURNING id;`,
          [paper.title, paper.summary, paper.url, paper.published]
        );
        if (result.rows.length > 0) {
          insertedCount++;
        }
      } catch (err) {
        console.error(`Failed to insert paper ${paper.url}:`, err.message);
      }
    }

    console.log(`Ingestion complete! Successfully inserted ${insertedCount} new papers.`);
  } catch (error) {
    console.error('Error during ingestion:', error);
  } finally {
    await pool.end();
  }
}

ingestData();
