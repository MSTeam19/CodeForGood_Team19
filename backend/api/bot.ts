
import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
const GENERATOR_MODEL = 'Xenova/LaMini-Flan-T5-783M';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { query } = await request.json();

    // generate an embedding for the user's query
    const embeddingResponse = await fetch(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`,
      {
        headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` },
        method: 'POST',
        body: JSON.stringify({ inputs: query, options: { wait_for_model: true } }),
      }
    );
    const queryEmbedding = await embeddingResponse.json();
    if (!embeddingResponse.ok) throw new Error(JSON.stringify(queryEmbedding));

    // find the most relevant documents in supabase
    const { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.70,
      match_count: 3,
    });
    if (error) throw error;
    
    const context = documents.map((doc: any) => doc.content).join('\n\n---\n\n');

    // generate the final response using the retrieved context
    const prompt = `Based only on the provided context, answer the user's question. If the context doesn't contain the answer, say "I'm sorry, I don't have that specific information."\n\nContext:\n${context}\n\nQuestion:\n${query}\n\nAnswer:`;
    
    const generationResponse = await fetch(
      `https://api-inference.huggingface.co/models/${GENERATOR_MODEL}`,
      {
        headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 250, temperature: 0.7 },
          options: { wait_for_model: true }
        }),
      }
    );
    const generationResult = await generationResponse.json();
    if (!generationResponse.ok) throw new Error(JSON.stringify(generationResult));

    const generatedText = generationResult[0]?.generated_text || "Sorry, I couldn't generate a response.";
    const finalAnswer = generatedText.replace(prompt, "").trim();

    return new Response(JSON.stringify({ answer: finalAnswer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}