"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CANONICAL_INGREDIENTS } from "@/components/IngredientSearch";
import {
  ChefHat,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  Clock,
  Users,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play
} from "lucide-react";

export const PRESET_RECIPE_IMAGES = [
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80"
];

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`
  );
}

export default function CreateRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Recipe basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("nigerian");
  const [mealType, setMealType] = useState("dinner");
  const [cookTimeMins, setCookTimeMins] = useState(45);
  const [servings, setServings] = useState(4);
  const [costLevel, setCostLevel] = useState(2);
  const [imageUrl, setImageUrl] = useState(PRESET_RECIPE_IMAGES[0]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Ingredients state
  const [ingredients, setIngredients] = useState<
    Array<{ name: string; qty: string; unit: string; is_core: boolean }>
  >([
    { name: "rice", qty: "3", unit: "cups", is_core: true },
    { name: "tomatoes", qty: "6", unit: "pieces", is_core: true },
    { name: "onions", qty: "2", unit: "large", is_core: true },
    { name: "vegetable oil", qty: "1/2", unit: "cup", is_core: false }
  ]);

  // Steps state
  const [steps, setSteps] = useState<string[]>([
    "Prep and wash all fresh vegetables and ingredients thoroughly.",
    "Blend the pepper mix and fry in oil with seasonings until fragrant.",
    "Add the core ingredients, cover tightly with foil, and simmer until tender and delicious."
  ]);

  // Handle adding an ingredient row
  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: "", qty: "1", unit: "unit", is_core: true }]);
  };

  const removeIngredientRow = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredientRow = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    (updated[index] as any)[field] = value;
    setIngredients(updated);
  };

  // Handle adding a step row
  const addStepRow = () => {
    setSteps([...steps, ""]);
  };

  const removeStepRow = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStepRow = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a recipe title.");
      return;
    }

    const validIngredients = ingredients.filter((i) => i.name.trim().length > 0);
    if (validIngredients.length === 0) {
      setErrorMsg("Please add at least one ingredient to your recipe.");
      return;
    }

    const validSteps = steps.filter((s) => s.trim().length > 0);
    if (validSteps.length === 0) {
      setErrorMsg("Please add at least one cooking step.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const finalImage = customImageUrl.trim() || imageUrl;
      const slug = slugify(title);

      // 1. Insert base recipe into Supabase `recipes` table
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          title: title.trim(),
          slug,
          description: description.trim(),
          cuisine,
          meal_type: mealType,
          cook_time_mins: cookTimeMins,
          servings,
          cost_level: costLevel,
          image_url: finalImage,
          video_url: videoUrl.trim() || null,
          is_featured: false,
          created_at: new Date().toISOString()
        })
        .select("id, slug")
        .single();

      if (recipeError) {
        throw new Error(recipeError.message);
      }

      const newRecipeId = recipeData.id;

      // 2. Ensure ingredients exist in `ingredients` table and insert junction records in `recipe_ingredients`
      for (const item of validIngredients) {
        const cleanName = item.name.trim().toLowerCase();

        // Find or create canonical ingredient
        const { data: existingIng } = await supabase
          .from("ingredients")
          .select("id")
          .eq("name", cleanName)
          .maybeSingle();

        let ingredientId = existingIng?.id;

        if (!ingredientId) {
          const { data: newIng, error: ingError } = await supabase
            .from("ingredients")
            .insert({
              name: cleanName,
              category: "other"
            })
            .select("id")
            .single();

          if (!ingError && newIng) {
            ingredientId = newIng.id;
          }
        }

        if (ingredientId) {
          await supabase.from("recipe_ingredients").insert({
            recipe_id: newRecipeId,
            ingredient_id: ingredientId,
            quantity: item.qty.trim() || null,
            unit: item.unit.trim() || null,
            is_core: item.is_core
          });
        }
      }

      // 3. Insert cooking steps into `recipe_steps` table
      const stepsPayload = validSteps.map((instruction, idx) => ({
        recipe_id: newRecipeId,
        step_number: idx + 1,
        instruction: instruction.trim()
      }));

      await supabase.from("recipe_steps").insert(stepsPayload);

      // Redirect directly to the newly created recipe page
      router.push(`/recipe/${recipeData.slug}`);
    } catch (err: any) {
      console.error("Failed to create recipe:", err);
      setErrorMsg(err.message || "Failed to publish recipe. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-28 max-w-2xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--cream)] hover:bg-[var(--surface-warm)] transition-colors shadow-2xs"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--pepper)] uppercase tracking-wider mb-0.5 font-mono">
            <ChefHat className="w-4 h-4" />
            <span>Recipe Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--cream)] tracking-tight font-display">
            Create Your Recipe 🍳
          </h1>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 text-xs sm:text-sm font-semibold flex items-center gap-2 font-body">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: BASICS */}
        <div className="bg-[var(--surface)] rounded-3xl p-5 sm:p-6 border border-[var(--line)] shadow-sm space-y-4">
          <h2 className="text-xs sm:text-sm font-extrabold text-[var(--cream)] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[var(--line)] font-mono">
            <span>1. Recipe Details</span>
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--cream)] font-mono">Recipe Title *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-[var(--cream)] font-semibold text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] focus:border-[var(--pepper)] transition-all font-display placeholder:text-[var(--tan)]"
              placeholder="e.g. Seafood Okra Soup, Mama's Party Jollof..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--cream)] font-mono">Short Description</label>
            <textarea
              rows={2}
              className="w-full p-4 bg-[var(--surface-warm)] border border-[var(--line)] rounded-2xl text-[var(--cream)] text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] focus:border-[var(--pepper)] resize-none transition-all font-body placeholder:text-[var(--tan)]"
              placeholder="What makes this dish special? (e.g. Smoky, rich with fresh prawns and ugwu leaves)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-[var(--tan)] uppercase block mb-1 font-mono">
                Cuisine
              </label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--pepper)]"
              >
                <option value="nigerian">Nigerian</option>
                <option value="igbo">Igbo food</option>
                <option value="yoruba">Yoruba food</option>
                <option value="hausa">Hausa food</option>
                <option value="street">Street Food</option>
                <option value="west_african">West African</option>
                <option value="continental">Continental</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--tan)] uppercase block mb-1 font-mono">
                Meal Type
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--pepper)]"
              >
                <option value="soup">Soup & Stew</option>
                <option value="dinner">Dinner</option>
                <option value="lunch">Lunch</option>
                <option value="breakfast">Breakfast</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--tan)] uppercase block mb-1 font-mono">
                Cook Time (mins)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={cookTimeMins}
                onChange={(e) => setCookTimeMins(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--tan)] uppercase block mb-1 font-mono">
                Servings
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PHOTO & VIDEO */}
        <div className="bg-[var(--surface)] rounded-3xl p-5 sm:p-6 border border-[var(--line)] shadow-sm space-y-4">
          <h2 className="text-xs sm:text-sm font-extrabold text-[var(--cream)] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[var(--line)] font-mono">
            <span>2. Cover Photo & Video</span>
          </h2>

          <div>
            <label className="text-xs font-bold text-[var(--cream)] block mb-2 font-mono">
              Select Preset Photo
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 hide-scrollbar overscroll-x-contain touch-pan-x -mx-2 px-2">
              {PRESET_RECIPE_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setImageUrl(img);
                    setCustomImageUrl("");
                  }}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    imageUrl === img && !customImageUrl
                      ? "border-[var(--pepper)] scale-105 shadow-2xs"
                      : "border-[var(--line)] opacity-70"
                  }`}
                >
                  <Image src={img} alt="Preset preview" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--cream)] font-mono">Or Custom Image URL</label>
            <input
              type="url"
              className="w-full px-4 py-2.5 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] placeholder:text-[var(--tan)] font-mono"
              placeholder="https://images.unsplash.com/..."
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--cream)] font-mono">Optional YouTube Video Link</label>
            <input
              type="url"
              className="w-full px-4 py-2.5 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] placeholder:text-[var(--tan)] font-mono"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 3: INGREDIENTS BUILDER */}
        <div className="bg-[var(--surface)] rounded-3xl p-5 sm:p-6 border border-[var(--line)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
            <h2 className="text-xs sm:text-sm font-extrabold text-[var(--cream)] uppercase tracking-wider font-mono">
              3. Ingredients ({ingredients.length})
            </h2>
            <button
              type="button"
              onClick={addIngredientRow}
              className="bg-[var(--pepper)] text-white hover:opacity-90 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs font-display"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Ingredient</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {ingredients.map((ing, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-[var(--surface-warm)] rounded-2xl border border-[var(--line)]"
              >
                <input
                  type="text"
                  required
                  placeholder="Ingredient (e.g. Rice, Palm oil, Crayfish)"
                  value={ing.name}
                  onChange={(e) => updateIngredientRow(idx, "name", e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] placeholder:text-[var(--tan)]"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Qty"
                    value={ing.qty}
                    onChange={(e) => updateIngredientRow(idx, "qty", e.target.value)}
                    className="w-16 px-2 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs font-medium text-center focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] placeholder:text-[var(--tan)] font-mono"
                  />

                  <input
                    type="text"
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => updateIngredientRow(idx, "unit", e.target.value)}
                    className="w-20 px-2 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] placeholder:text-[var(--tan)]"
                  />

                  <label className="flex items-center gap-1 text-[11px] font-semibold text-[var(--tan)] cursor-pointer select-none px-1 font-mono">
                    <input
                      type="checkbox"
                      checked={ing.is_core}
                      onChange={(e) => updateIngredientRow(idx, "is_core", e.target.checked)}
                      className="rounded text-[var(--pepper)] focus:ring-[var(--pepper)] w-3.5 h-3.5"
                    />
                    <span>Core</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeIngredientRow(idx)}
                    className="w-7 h-7 ml-auto rounded-lg text-[var(--tan)] hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                    aria-label="Remove ingredient"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: STEP-BY-STEP INSTRUCTIONS */}
        <div className="bg-[var(--surface)] rounded-3xl p-5 sm:p-6 border border-[var(--line)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
            <h2 className="text-xs sm:text-sm font-extrabold text-[var(--cream)] uppercase tracking-wider font-mono">
              4. Cooking Steps ({steps.length})
            </h2>
            <button
              type="button"
              onClick={addStepRow}
              className="bg-[var(--pepper)] text-white hover:opacity-90 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs font-display"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--pepper)] text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-1 shadow-2xs font-display">
                  {idx + 1}
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder={`Step ${idx + 1} instructions...`}
                  value={step}
                  onChange={(e) => updateStepRow(idx, e.target.value)}
                  className="flex-1 min-w-0 p-3 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] resize-none transition-all font-body placeholder:text-[var(--tan)]"
                />
                <button
                  type="button"
                  onClick={() => removeStepRow(idx)}
                  className="w-8 h-8 rounded-lg text-[var(--tan)] hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors mt-1"
                  aria-label="Remove step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--pepper)] hover:opacity-90 active:scale-98 text-white font-extrabold py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 font-display"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Publishing Recipe to Database...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Publish Recipe</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
