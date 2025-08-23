
export const config = {
  runtime: 'edge',
};

const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
const GENERATOR_MODEL = 'Xenova/LaMini-Flan-T5-783M';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { query, context } = await request.json();

    // generate an embedding for the user's query
    const queryEmbeddingResponse = await fetch(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`,
      {
        headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` },
        method: 'POST',
        body: JSON.stringify({ inputs: query, options: { wait_for_model: true } }),
      }
    );
    const queryEmbedding = await queryEmbeddingResponse.json();
    
    if (!Array.isArray(queryEmbedding)) {
       throw new Error(`Invalid embedding response: ${JSON.stringify(queryEmbedding)}`);
    }

    // find the most relevant context (simulated)
    // update to fetch from supabase

    // 3. Generate the final response
    const prompt = `Based only on the provided context, answer the user's question. If the context doesn't contain the answer, say "I'm sorry, I don't have that specific information."\n\nContext:\n${context}\n\nQuestion:\n${query}\n\nAnswer:`;
    
    const generationResponse = await fetch(
      `https://api-inference.huggingface.co/models/${GENERATOR_MODEL}`,
      {
        headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 250 },
          options: { wait_for_model: true } 
        }),
      }
    );
    const generationResult = await generationResponse.json();

    const generatedText = generationResult[0]?.generated_text || "Sorry, I couldn't generate a response.";
    const finalAnswer = generatedText.replace(prompt, "").trim();

    return new Response(JSON.stringify({ answer: finalAnswer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to process request.' }), { status: 500 });
  }
}