import { createClient } from '@supabase/supabase-js';

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

async function run() {
  console.log("Fetching existing ingredients for mapping...");
  const { data: dbIngredients, error: ingError } = await supabase.from('ingredients').select('id, name, aliases');
  if (ingError) throw ingError;

  // Build a lookup map: lowercase name/alias -> ingredient id
  const ingredientMap = new Map<string, string>();
  for (const ing of dbIngredients || []) {
    ingredientMap.set(ing.name.toLowerCase(), ing.id);
    for (const alias of ing.aliases || []) {
      ingredientMap.set(alias.toLowerCase(), ing.id);
    }
  }

  const unmappedIngredients = new Set<string>();
  let importedCount = 0;

  // We'll fetch meals starting with a few letters to get a good base (~50-100 recipes)
  const letters = ['a', 'b', 'c', 's', 'p'];
  
  for (const letter of letters) {
    console.log(`Fetching TheMealDB recipes starting with '${letter}'...`);
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`);
    const data = await res.json() as any;

    if (!data.meals) continue;

    for (const meal of data.meals) {
      const title = meal.strMeal;
      const slug = slugify(title);

      // Upsert the recipe
      const area = meal.strArea || 'unknown';
      const category = meal.strCategory || 'unknown';
      
      const { data: recipeData, error: recipeError } = await supabase.from('recipes').upsert({
        title,
        slug,
        description: `A delicious ${area} ${category.toLowerCase()} dish.`,
        cuisine: area.toLowerCase(),
        meal_type: category.toLowerCase(),
        cook_time_mins: 45, // default
        cost_level: 2,
        servings: 4,
        steps: (meal.strInstructions || '').split('\n').map((s: string) => s.trim()).filter(Boolean),
        image_url: meal.strMealThumb,
        video_url: meal.strYoutube,
        mood_tags: [],
        dietary_flags: [],
        source: 'imported',
        is_published: true
      }, { onConflict: 'slug' }).select('id').single();

      if (recipeError) {
        console.error(`Failed to insert recipe ${title}:`, recipeError.message);
        continue;
      }

      const recipeId = recipeData.id;
      
      // Process ingredients
      for (let i = 1; i <= 20; i++) {
        const rawIng = meal[`strIngredient${i}`];
        const rawQty = meal[`strMeasure${i}`];

        if (!rawIng || !rawIng.trim()) continue;

        const ingName = rawIng.trim().toLowerCase();
        let matchId = ingredientMap.get(ingName);
        
        // Try partial matching if strict fails
        if (!matchId) {
          for (const [key, id] of ingredientMap.entries()) {
            if (ingName.includes(key) || key.includes(ingName)) {
              matchId = id;
              break;
            }
          }
        }

        if (matchId) {
          // Insert into recipe_ingredients
          await supabase.from('recipe_ingredients').upsert({
            recipe_id: recipeId,
            ingredient_id: matchId,
            qty: null,
            unit: rawQty ? rawQty.trim() : '',
            is_core: true,
            notes: ''
          }, { onConflict: 'recipe_id, ingredient_id' });
        } else {
          unmappedIngredients.add(ingName);
        }
      }
      importedCount++;
    }
  }

  console.log("=========================================");
  console.log(`Successfully imported ${importedCount} recipes.`);
  console.log("=========================================");
  console.log(`Failed to map ${unmappedIngredients.size} unique ingredients. Please consider adding these to canonical list:`);
  console.log(Array.from(unmappedIngredients).sort().join(', '));
  console.log("=========================================");
}

run().catch(console.error);
