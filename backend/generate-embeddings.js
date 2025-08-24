// File: backend/generate-embeddings.js (NEW & IMPROVED)

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { HfInference } = require('@huggingface/inference');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const hfToken = process.env.HF_API_TOKEN;

if (!supabaseUrl || !supabaseKey || !hfToken) {
  console.error("❌ Missing Supabase or Hugging Face credentials in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const hf = new HfInference(hfToken);
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

// --- NEW: Function to format content based on table ---
function formatContent(tableName, doc) {
    switch (tableName) {
        case 'campaigns':
            return `Campaign named "${doc.name}": ${doc.description}. Status is ${doc.status}. Goal is ${doc.goal_cents / 100} cents.`;
        case 'champions':
            return `Community champion named ${doc.name} from ${doc.organization}. Bio: ${doc.bio}. Their next initiative is "${doc.next_initiative_title}" which involves: ${doc.next_initiative_description}.`;
        case 'donations':
            return `A donation was made by ${doc.is_anonymous ? 'an anonymous donor' : doc.donor_name} of ${doc.amount_cents / 100} ${doc.currency}.`;
        case 'post':
            return `A post by ${doc.author} says: "${doc.description}".`;
        case 'leaderboard_region':
             return `The leaderboard for the region ${doc.name} in ${doc.country} shows a total of ${doc.total_amount_cents / 100} cents raised with ${doc.donation_count} donations. The lead champion is ${doc.lead_champion_name}.`;
        case 'regions':
            return `This is the ${doc.name} region in country ${doc.country}. The fundraising goal is ${doc.goal_cents / 100} cents.`;
        default:
            return JSON.stringify(doc);
    }
}


async function generateAndUpdateEmbeddings() {
  console.log('➡️ Starting embedding generation process...');
  const tablesToProcess = ['campaigns', 'champions', 'donations', 'post', 'leaderboard_region', 'regions'];

  for (const tableName of tablesToProcess) {
    console.log(`\n--- Processing table: ${tableName} ---`);
    
    const { data: records, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.error(`❌ Error fetching from ${tableName}:`, error);
      continue;
    }

    if (!records || records.length === 0) {
      console.log(`✅ No records found in ${tableName}.`);
      continue;
    }

    for (const record of records) {
      const content = formatContent(tableName, record);
      const id = record.id; // Use the primary key from the source table

      console.log(`\nProcessing ${tableName} record ID: ${id}`);
      try {
        console.log(`  Formatted Content: "${content.substring(0, 80)}..."`);
        
        const embedding = await hf.featureExtraction({
          model: EMBEDDING_MODEL,
          inputs: content,
        });

        // Upsert into the documents table
        const { error: upsertError } = await supabase.from('documents').upsert({
          id: id, // Using the original UUID
          content: content,
          metadata: { source_table: tableName, source_id: id },
          embeddings: embedding,
        }, { onConflict: 'id' }); // This will update if the ID already exists

        if (upsertError) {
          console.error(`  ❌ Failed to upsert document ${id}:`, upsertError.message);
        } else {
          console.log(`  ✅ Successfully upserted document ${id}.`);
        }
      } catch (e) {
        console.error(`  ❌ An error occurred while processing record ${id}:`, e.message);
      }
    }
  }

  console.log('\n--- ✨ Process Complete ---');
}

generateAndUpdateEmbeddings();