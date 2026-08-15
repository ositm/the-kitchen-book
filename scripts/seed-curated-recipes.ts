import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seedCuratedRecipes() {
  console.log("Loading ingredients from DB for mapping...");
  const { data: dbIngredients, error: ingError } = await supabase.from('ingredients').select('id, name, aliases');
  if (ingError) throw ingError;

  const ingredientMap = new Map<string, string>();
  for (const ing of dbIngredients || []) {
    ingredientMap.set(ing.name.toLowerCase(), ing.id);
    for (const alias of ing.aliases || []) {
      ingredientMap.set(alias.toLowerCase(), ing.id);
    }
  }

  const dataPath = path.join(process.cwd(), 'scripts', 'curated_recipes.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const recipes = JSON.parse(rawData);

  console.log(`Loaded ${recipes.length} curated recipes from JSON.`);

  let insertedCount = 0;
  let errorCount = 0;

  for (const recipe of recipes) {
    const slug = slugify(recipe.title);
    
    const { data: recipeData, error: recipeError } = await supabase.from('recipes').upsert({
      title: recipe.title,
      slug,
      description: recipe.description,
      cuisine: recipe.cuisine,
      meal_type: recipe.meal_type,
      cook_time_mins: recipe.cook_time_mins,
      cost_level: recipe.cost_level,
      servings: recipe.servings,
      steps: recipe.steps,
      image_url: recipe.image_url,
      video_url: recipe.video_url,
      mood_tags: recipe.mood_tags,
      dietary_flags: recipe.dietary_flags,
      source: 'curated',
      is_published: true
    }, { onConflict: 'slug' }).select('id').single();

    if (recipeError) {
      console.error(`Failed to insert recipe ${recipe.title}:`, recipeError.message);
      errorCount++;
      continue;
    }

    const recipeId = recipeData.id;

    for (const ing of recipe.ingredients) {
      const matchId = ingredientMap.get(ing.name.toLowerCase());
      if (matchId) {
        await supabase.from('recipe_ingredients').upsert({
          recipe_id: recipeId,
          ingredient_id: matchId,
          qty: null,
          unit: ing.unit,
          is_core: ing.is_core,
          notes: ''
        }, { onConflict: 'recipe_id, ingredient_id' });
      } else {
        console.warn(`Ingredient not found in DB: ${ing.name} (for recipe ${recipe.title})`);
      }
    }
    insertedCount++;
  }

  console.log("=========================================");
  console.log("Curated Recipes Seed Complete");
  console.log(`Successfully Upserted: ${insertedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log("=========================================");
}

seedCuratedRecipes().catch(console.error);
