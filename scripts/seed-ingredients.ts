import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedIngredients() {
  console.log("Starting ingredient seed...");
  const dataPath = path.join(process.cwd(), 'scripts', 'ingredients.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const ingredients = JSON.parse(rawData);

  console.log(`Loaded ${ingredients.length} ingredients from JSON.`);

  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const ingredient of ingredients) {
    const { data, error } = await supabase
      .from('ingredients')
      .upsert({
        name: ingredient.name,
        aliases: ingredient.aliases || [],
        category: ingredient.category,
        is_staple: ingredient.is_staple || false,
      }, { onConflict: 'name' })
      .select();

    if (error) {
      console.error(`Error upserting ${ingredient.name}:`, error.message);
      errorCount++;
    } else {
      if (data && data.length > 0) {
        insertedCount++;
      }
    }
  }

  console.log("=========================================");
  console.log("Seed complete.");
  console.log(`Total Processed: ${ingredients.length}`);
  console.log(`Successfully Upserted: ${insertedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log("=========================================");
}

seedIngredients().catch(console.error);
