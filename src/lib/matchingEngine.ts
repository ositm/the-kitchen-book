export interface RecipeIngredientMatch {
  name: string;
  qty?: number | string;
  unit?: string;
  is_core?: boolean;
  notes?: string;
  inPantry: boolean;
}

export interface RecipeMatchResult {
  recipeId: string;
  matchScore: number;
  haveCount: number;
  missingCount: number;
  totalCount: number;
  haveIngredients: RecipeIngredientMatch[];
  missingIngredients: RecipeIngredientMatch[];
}

/**
 * Normalizes an ingredient name for flexible matching (e.g. handles aliases / plurals)
 */
export function normalizeIngredient(name: string): string {
  if (!name) return "";
  let clean = name.toLowerCase().trim();
  // Remove common prefixes/quantifiers
  clean = clean.replace(/^(fresh|ground|dried|sliced|chopped|diced|raw|cooked)\s+/, "");
  // Simple singularization
  if (clean.endsWith("es") && clean.length > 4) clean = clean.slice(0, -2);
  else if (clean.endsWith("s") && !clean.endsWith("ss") && clean.length > 3) clean = clean.slice(0, -1);
  return clean;
}

/**
 * Checks if a recipe ingredient is present in the pantry
 */
export function isIngredientInPantry(ingredientName: string, pantryItems: string[]): boolean {
  if (!ingredientName || !pantryItems || pantryItems.length === 0) return false;
  
  const normIng = normalizeIngredient(ingredientName);
  const rawIng = ingredientName.toLowerCase().trim();

  return pantryItems.some(p => {
    const normPantry = normalizeIngredient(p);
    const rawPantry = p.toLowerCase().trim();

    return (
      rawIng === rawPantry ||
      normIng === normPantry ||
      rawIng.includes(rawPantry) ||
      rawPantry.includes(rawIng) ||
      normIng.includes(normPantry) ||
      normPantry.includes(normIng)
    );
  });
}

/**
 * Detects if a recipe is an authentic Nigerian or West African dish
 */
export function isNigerianRecipe(recipe: { cuisine?: string; title?: string; description?: string }): boolean {
  if (!recipe) return false;
  const c = (recipe.cuisine || "").toLowerCase();
  const t = (recipe.title || "").toLowerCase();
  const d = (recipe.description || "").toLowerCase();

  const nigerianCuisines = ["nigerian", "igbo", "yoruba", "hausa", "street", "west_african"];
  if (nigerianCuisines.some(nc => c.includes(nc))) return true;

  const nigerianKeywords = [
    "jollof", "egusi", "ewa agoyin", "agoyin", "okra", "okro", "ogbono", "afang", "oha",
    "pepper soup", "peppersoup", "asaro", "moi moi", "moimoi", "akara", "suya", "banga", "edikang",
    "edikaikong", "bitterleaf", "nkwobi", "abacha", "isi ewu", "amala", "ewedu", "gbegiri",
    "tuwo", "shinkafa", "masa", "kilishi", "dodo", "puff puff", "puff-puff", "meat pie", "chin chin",
    "garri", "concoction", "ofada", "ayamase", "fried rice", "fisherman soup", "white soup",
    "nsala", "banga soup", "cassava", "yam porridge", "bole", "boli", "gizdodo", "plantain",
    "mfon", "calabar", "efik", "urhobo", "itsekiri", "tiv", "edo"
  ];

  return nigerianKeywords.some(kw => t.includes(kw) || d.includes(kw) || c.includes(kw));
}

/**
 * Sorts recipes ensuring Nigerian dishes are ALWAYS ranked at the top of the list
 */
export function sortRecipesWithNigerianPriority<T extends { cuisine?: string; title?: string; matchScore?: number }>(
  recipes: T[]
): T[] {
  return [...recipes].sort((a, b) => {
    const aIsNaija = isNigerianRecipe(a);
    const bIsNaija = isNigerianRecipe(b);

    // If one is Nigerian and the other is not, the Nigerian recipe always comes first!
    if (aIsNaija && !bIsNaija) return -1;
    if (!aIsNaija && bIsNaija) return 1;

    // Within the same category, sort by matchScore (if available) or alphabetically
    const scoreA = a.matchScore ?? 0;
    const scoreB = b.matchScore ?? 0;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    return (a.title || "").localeCompare(b.title || "");
  });
}

/**
 * Computes the % Match between a recipe and user pantry items
 */
export function calculateRecipeMatch(
  recipeIngredients: Array<{
    qty?: any;
    unit?: string;
    is_core?: boolean;
    notes?: string;
    ingredients?: { name: string } | null;
    name?: string;
  }>,
  pantryItems: string[]
): RecipeMatchResult {
  const items = recipeIngredients || [];
  if (items.length === 0) {
    return {
      recipeId: "",
      matchScore: 0,
      haveCount: 0,
      missingCount: 0,
      totalCount: 0,
      haveIngredients: [],
      missingIngredients: []
    };
  }

  const mapped: RecipeIngredientMatch[] = items.map(item => {
    const name = item.ingredients?.name || item.name || "ingredient";
    const inPantry = isIngredientInPantry(name, pantryItems);
    return {
      name,
      qty: item.qty,
      unit: item.unit,
      is_core: item.is_core ?? true,
      notes: item.notes,
      inPantry
    };
  });

  const haveIngredients = mapped.filter(m => m.inPantry);
  const missingIngredients = mapped.filter(m => !m.inPantry);

  // Weight core ingredients higher (75% core weight, 25% non-core weight)
  const coreItems = mapped.filter(m => m.is_core);
  const nonCoreItems = mapped.filter(m => !m.is_core);

  let matchScore = 0;
  if (coreItems.length > 0 && nonCoreItems.length > 0) {
    const coreHave = coreItems.filter(m => m.inPantry).length;
    const nonCoreHave = nonCoreItems.filter(m => m.inPantry).length;
    const coreScore = (coreHave / coreItems.length) * 75;
    const nonCoreScore = (nonCoreHave / nonCoreItems.length) * 25;
    matchScore = Math.round(coreScore + nonCoreScore);
  } else {
    matchScore = Math.round((haveIngredients.length / mapped.length) * 100);
  }

  return {
    recipeId: "",
    matchScore: Math.min(100, Math.max(0, matchScore)),
    haveCount: haveIngredients.length,
    missingCount: missingIngredients.length,
    totalCount: mapped.length,
    haveIngredients,
    missingIngredients
  };
}
