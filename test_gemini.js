const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const model1 = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const res1 = await model1.embedContent("Hello world");
    console.log("text-embedding-004 SUCCESS, dimensions:", res1.embedding.values.length);
  } catch (e) {
    console.error("text-embedding-004 ERROR:", e.message);
  }

  try {
    const model2 = genAI.getGenerativeModel({ model: "embedding-001" });
    const res2 = await model2.embedContent("Hello world");
    console.log("embedding-001 SUCCESS, dimensions:", res2.embedding.values.length);
  } catch (e) {
    console.error("embedding-001 ERROR:", e.message);
  }
}
run();
