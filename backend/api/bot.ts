
import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
const GENERATOR_MODEL = 'Xenova/LaMini-Flan-T5-783M';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_API_KEY!
);

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  console.log("\n--- New /api/bot request ---");
  const hfToken = process.env.HF_API_TOKEN;
  if (!hfToken) {
    console.error("CRITICAL ERROR: HF_API_TOKEN is not defined in .env.local!");
    return new Response(JSON.stringify({ error: "Server configuration error: Hugging Face token is missing." }), { status: 500 });
  } else {
    console.log("Hugging Face token loaded successfully from environment.");
    console.log(`Token starts with: ${hfToken.substring(0, 5)}...`);
  }

  try {
    // extract the user's query from the request body.
    const { query } = await request.json();
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required.' }), { status: 400 });
    }
    console.log(`Received query: "${query}"`);

    // generate embedding
    console.log("Step 1: Generating embedding for the query...");
    const embeddingResponse = await fetch(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`,
      {
        headers: { Authorization: `Bearer ${hfToken}` },
        method: 'POST',
        body: JSON.stringify({ inputs: query, options: { wait_for_model: true } }),
      }
    );
    const queryEmbedding = await embeddingResponse.json();
    if (!embeddingResponse.ok) {
        console.error("HUGGING FACE EMBEDDING API FAILED!");
        console.error(`Status Code: ${embeddingResponse.status}`);
        console.error("Error Response from HF:", JSON.stringify(queryEmbedding, null, 2));
        throw new Error(`Failed to get embedding: ${JSON.stringify(queryEmbedding)}`);
    }
    console.log("Step 1 SUCCESS: Embedding generated.");

    // retrieve relevant documents from Supabase using the embedding.
    console.log("Step 2: Matching documents in Supabase...");
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 3,
    });

    if (error) {
      console.error('SUPABASE RPC ERROR:', error);
      throw new Error('Failed to retrieve documents from the database.');
    }
    console.log(`Step 2 SUCCESS: Found ${documents.length} matching documents.`);


    const context = documents.map((doc: any) => doc.content).join('\n\n---\n\n');

    const prompt = `Based only on the provided context, answer the user's question. If the context doesn't contain the answer, say "I'm sorry, I don't have that specific information."\n\nContext:\n${context}\n\nQuestion:\n${query}\n\nAnswer:`;
    
    // generate response
    console.log("Step 3: Generating final answer with the generator model...");
    const generationResponse = await fetch(
      `https://api-inference.huggingface.co/models/${GENERATOR_MODEL}`,
      {
        headers: { Authorization: `Bearer ${hfToken}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 250, temperature: 0.7 },
          options: { wait_for_model: true }
        }),
      }
    );
    const generationResult = await generationResponse.json();
    if (!generationResponse.ok) {
        console.error("HUGGING FACE GENERATION API FAILED!");
        console.error(`Status Code: ${generationResponse.status}`);
        console.error("Error Response from HF:", JSON.stringify(generationResult, null, 2));
        throw new Error(`Failed to generate text: ${JSON.stringify(generationResult)}`);
    }
    console.log("Step 3 SUCCESS: Final answer generated.");

    const generatedText = generationResult[0]?.generated_text || "Sorry, I couldn't generate a response.";
    const finalAnswer = generatedText.replace(prompt, "").trim();

    return new Response(JSON.stringify({ answer: finalAnswer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("--- ERROR CAUGHT IN CATCH BLOCK ---");
    console.error(error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}