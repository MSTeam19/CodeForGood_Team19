import dotenv from "dotenv";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const HUGGINGFACE_API_KEY = process.env.HF_API_KEY!;

const tables = [
  "campaigns",
  "champions",
  "donations",
  "knowledge",
  "leaderboard_region",
  "post",
  "regions"
];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ------------------ HELPER FUNCTIONS ------------------

// Safely convert any value to string
function sanitizeValue(v: any): string {
  if (v === null || v === undefined) return "null";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("url" in v) return `[IMAGE: ${v.url}]`;
    return JSON.stringify(v);
  }
  return String(v);
}

// Convert a row into a single string
function rowToText(row: any, tableName: string): string {
  return `Table: ${tableName}, ` + Object.entries(row)
    .map(([k, v]) => `${k}: ${sanitizeValue(v)}`)
    .join(", ");
}

// Get embedding from Hugging Face
async function getEmbedding(text: string): Promise<number[] | null> {
  if (!text || text.trim() === "") return null;
  
  // truncate if too long
  const MAX_CHARS = 5000;
  const input = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
  
  try {
    const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-small/pipeline/feature-extraction",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: input })
      }
    );
    
    const data = await response.json();
    
    // Fixed validation logic - handle both possible response formats
    let embedding: number[];
    
    if (Array.isArray(data)) {
      // If data is directly an array of numbers (your current case)
      if (typeof data[0] === 'number') {
        embedding = data;
      }
      // If data is an array containing an array of numbers
      else if (Array.isArray(data[0]) && typeof data[0][0] === 'number') {
        embedding = data[0];
      }
      // Invalid format
      else {
        console.error("Unexpected HF API response format:", data);
        return null;
      }
    } else {
      console.error("Unexpected HF API response - not an array:", data);
      return null;
    }
    
    // Validate embedding has reasonable length
    if (embedding.length === 0) {
      console.error("Received empty embedding");
      return null;
    }
    
    return embedding;
    
  } catch (err) {
    console.error("Error fetching embedding:", err);
    return null;
  }
}

// ------------------ MAIN INGESTION ------------------

async function main() {
  for (const table of tables) {
    console.log(`Processing table: ${table}`);
    
    const { data: rows, error } = await supabase.from(table).select("*");
    
    if (error) {
      console.error(`Error fetching table ${table}:`, error);
      continue;
    }
    
    if (!rows || rows.length === 0) {
      console.log(`Table ${table} is empty, skipping.`);
      continue;
    }
    
    for (const row of rows) {
      const rowId = row.id ?? "[no id]";
      
      try {
        const content = rowToText(row, table);
        const embedding = await getEmbedding(content);
        
        if (!embedding || embedding.length === 0) {
          console.warn(`Row ${rowId} produced no embedding, skipping.`);
          continue;
        }
        
        const { error: insertError } = await supabase
          .from("documents")
          .insert([{
            content,
            metadata: { source_table: table, source_id: row.id ?? null },
            embeddings: embedding
          }]);
        
        if (insertError) {
          console.error(`Failed to insert row ${rowId} from ${table}:`, insertError);
        } else {
          console.log(`Inserted row ${rowId} from ${table} (embedding length: ${embedding.length})`);
        }
        
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(`Error processing row ${rowId} from ${table}:`, err.message);
        } else {
          console.error(`Unknown error processing row ${rowId} from ${table}:`, err);
        }
      }
    }
  }
  
  console.log("Ingestion complete!");
}

main().catch(err => {
  if (err instanceof Error) {
    console.error("Fatal error:", err.message);
  } else {
    console.error("Fatal unknown error:", err);
  }
});