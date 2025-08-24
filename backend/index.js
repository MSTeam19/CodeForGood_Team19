require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { HfInference } = require('@huggingface/inference');

const app = express();
const PORT = process.env.PORT || 3000;

const CONFIG = {
  EMBEDDING_MODEL: 'sentence-transformers/all-MiniLM-L6-v2',
  QA_MODEL: 'distilbert-base-cased-distilled-squad',
  DB_MATCH_THRESHOLD: 0.1,
  DB_MATCH_COUNT: 5,
};

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
      model: CONFIG.EMBEDDING_MODEL,
      inputs: sanitizedQuery
    });
    console.log("✅ Step 1 SUCCESS: Embedding generated.");

    // retrieve relevant documents
    console.log("➡️ Step 2: Matching documents in Supabase...");
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: CONFIG.DB_MATCH_THRESHOLD,
      match_count: CONFIG.DB_MATCH_COUNT,
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

    // fenerate a user-friendly response based on document count
    let finalAnswer = "";

    // if we get multiple results, format a friendly list of the top 3.
    if (documents.length > 1) {
      console.log("➡️ Step 3: Multiple documents found. Formatting a user-friendly list.");

      const listIntros = {
        campaign: `Here are the top campaigns I found related to "${query}":`,
        champion: `Here are some community champions I found for "${query}":`,
        donor: `I found these donors based on your query "${query}":`,
        post: `Here are some recent posts relevant to "${query}":`,
        leaderboard: `Here is the leaderboard information I could find for "${query}":`
      };

      // find a matching keyword to use a specific, friendly intro
      const matchedKeyword = Object.keys(listIntros).find(k => sanitizedQuery.includes(k));
      const intro = matchedKeyword 
        ? listIntros[matchedKeyword] 
        : `I found a few things related to your query. Here are the top 3:`; // Generic fallback

      // slice to get a maximum of 3 documents and format them into a list
      const topThreeDocs = documents.slice(0, 3);
      const listItems = topThreeDocs.map(doc => `• ${doc.content}`).join('\n');
      
      finalAnswer = `${intro}\n\n${listItems}`;
      console.log("✅ Step 3 SUCCESS: List formatted.");

    } else {
      console.log("➡️ Step 3: Single document found. Using QA model for a precise answer...");
      const context = documents[0].content;
      
      const qaResult = await hf.questionAnswering({
        model: CONFIG.QA_MODEL,
        inputs: {
          question: query,
          context: context
        }
      });

      // if the model gives an answer, use it. Otherwise, return the full context.
      finalAnswer = qaResult.answer 
        ? qaResult.answer 
        : `I found this information, but couldn't extract a specific answer: \n\n${context}`;
        
      console.log("✅ Step 3 SUCCESS: Precise answer extracted.");
    }
    
    return response.status(200).json({ answer: finalAnswer.trim() });

  } catch (error) {
    console.error("--- ❌ An error was caught by the main handler ---");
    console.error(error.message); 
    return response.status(500).json({ error: error.message });
  }
}

app.post('/api/bot', realBotHandler);
app.get('/campaigns/active', (req, res) => res.status(200).json([]));

app.listen(PORT, () => {
  console.log(`✅ Server is running successfully on http://localhost:${PORT}`);
});