
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { HfInference } = require('@huggingface/inference');

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or API Key in .env file.");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const hfToken = process.env.HF_API_TOKEN;
if (!hfToken) {
  console.error("❌ CRITICAL ERROR: API tokens are not defined in the .env file!");
  process.exit(1);
}
const hf = new HfInference(hfToken);

app.use(cors());
app.use(express.json());

async function realBotHandler(request, response) {
  console.log("\n--- New /api/bot request ---");
  const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
  const QA_MODEL = 'distilbert-base-cased-distilled-squad'; 
  
  try {
    const { query } = request.body;
    if (!query) {
      return response.status(400).json({ error: 'Query is required.' });
    }
    const sanitizedQuery = query.toLowerCase().trim();
    console.log(`Received query: "${sanitizedQuery}"`);

    // generate embedding
    console.log("➡️ Step 1: Generating embedding for the query...");
    const queryEmbedding = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: sanitizedQuery
    });
    console.log("✅ Step 1 SUCCESS: Embedding generated.");

    // retrieve relevant documents
    console.log("➡️ Step 2: Matching documents in Supabase...");
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.1, 
      match_count: 5,
    });

    if (error) {
      console.error('❌ SUPABASE RPC ERROR:', error);
      throw new Error('Failed to retrieve documents from the database.');
    }
    console.log(`✅ Step 2 SUCCESS: Found ${documents.length} matching documents.`);
    
    if (documents.length === 0) {
      console.log("⚠️ No relevant documents found. Responding with a fallback message.");
      return response.status(200).json({ answer: "I'm sorry, I couldn't find any specific information about that in my knowledge base. Could you try rephrasing your question?" });
    }

    const listKeywords = ['campaign', 'campaigns', 'champion', 'champions', 'donor', 'donors', 'leaderboard', 'post', 'posts'];
    const isListRequest = listKeywords.includes(sanitizedQuery);

    let finalAnswer = "";

    if (isListRequest) {
      console.log("➡️ Step 3: Formatting a list response for a general query...");
      // format the documents into a readable list instead of asking the AI
      const listItems = documents.map(doc => `• ${doc.content}`).join('\n');
      finalAnswer = `Here are the top results I found for "${query}":\n\n${listItems}`;
      console.log("✅ Step 3 SUCCESS: List formatted.");

    } else {
      // if it's a specific question, use the AI to find a precise answer
      const context = documents.map((doc) => doc.content).join('\n\n');
      
      console.log("➡️ Step 3: Extracting answer with the Question-Answering model...");
      const qaResult = await hf.questionAnswering({
        model: QA_MODEL,
        inputs: {
          question: query,
          context: context
        }
      });
      console.log("✅ Step 3 SUCCESS: Final answer extracted.");
      finalAnswer = qaResult.answer || "Based on the information I found, I'm not able to answer that question precisely. Could you try rephrasing?";
    }
    
    return response.status(200).json({ answer: finalAnswer.trim() });

  } catch (error) {
    console.error("--- ❌ An error was caught by the main handler ---");
    console.error(error.message); 
    return response.status(500).json({ error: error.message });
  }
}

app.post('/api/bot', realBotHandler);

app.get('/campaigns/active', (req, res) => res.status(200).json(activeCampaigns));

app.listen(PORT, () => {
  console.log(`✅ Server is running successfully on http://localhost:${PORT}`);
});