const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2';

/**
 * Generate embedding for a single document
 */
async function generateEmbedding(text) {
  try {
    const result = await hf.featureExtraction({
      model: MODEL_NAME,
      inputs: text,
    });
    // For this model, HF returns a 1D array of 384 floats.
    return result;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * Generate embeddings for a batch of documents
 */
async function generateEmbeddingsBatch(texts) {
  try {
    const result = await hf.featureExtraction({
      model: MODEL_NAME,
      inputs: texts,
    });
    // For a batch, HF returns a 2D array: array of arrays of floats
    return result;
  } catch (error) {
    console.error("Error generating batch embeddings:", error);
    throw error;
  }
}

module.exports = {
  generateEmbedding,
  generateEmbeddingsBatch
};
