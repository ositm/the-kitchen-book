"use client";

import { useState, useEffect } from "react";
import { usePantry } from "@/lib/pantryStore";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import StepByStepCookModal from "./StepByStepCookModal";
import {
  Sparkles,
  X,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Send,
  Loader2,
  ChefHat,
  ArrowRight,
  BookOpen,
  BookmarkPlus,
  Play
} from "lucide-react";

interface AiSuggestion {
  id: string;
  title: string;
  cuisine: string;
  cookTime: string;
  difficulty: string;
  description: string;
  whyItWorks: string;
  haveIngredients: string[];
  missingIngredients: string[];
  steps: string[];
  chefTip: string;
}

interface AiMealSuggesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiMealSuggesterModal({ isOpen, onClose }: AiMealSuggesterModalProps) {
  const { items: pantryItems } = usePantry();

  const [prompt, setPrompt] = useState("");
  const [selectedMood, setSelectedMood] = useState("quick");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Record<string, string>>({}); // id -> slug
  const [activeCookDish, setActiveCookDish] = useState<AiSuggestion | null>(null);

  const quickPrompts = [
    { id: "quick", label: "⚡ <20 Mins Quick Meal", text: "Suggest a fast meal under 20 minutes" },
    { id: "broke_week", label: "💸 Broke Week (Budget)", text: "Make it low-cost with everyday kitchen staples" },
    { id: "soup", label: "🍲 Hearty Soup or Stew", text: "Suggest a rich swallow soup or savory stew" },
    { id: "spicy", label: "🌶️ Extra Peppery & Hot", text: "Make it spicy, hot, and packed with flavor" },
    { id: "no_meat", label: "🌿 No Meat / Vegetarian", text: "Cook without beef, chicken, or fish" },
  ];

  const handleGenerate = async (customPrompt?: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pantry: pantryItems,
          mood: selectedMood,
          prompt: customPrompt || prompt
        })
      });

      if (!res.ok) throw new Error("Failed to fetch suggestions");

      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("AI Generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on first open if suggestions are empty
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      handleGenerate();
    }
  }, [isOpen]);

  const handleSaveToCookbook = async (dish: AiSuggestion) => {
    setSavingRecipeId(dish.id);
    try {
      const slug = dish.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`;

      // 1. Insert main recipe
      const { data: newRecipe, error } = await supabase
        .from("recipes")
        .insert({
          title: dish.title,
          slug,
          description: dish.description,
          cuisine: dish.cuisine.toLowerCase() || "nigerian",
          meal_type: "dinner",
          cook_time_mins: parseInt(dish.cookTime) || 30,
          servings: 4,
          cost_level: 2,
          image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
          is_featured: false,
          created_at: new Date().toISOString()
        })
        .select("id, slug")
        .single();

      if (error) throw error;

      // 2. Save cooking steps
      if (dish.steps && dish.steps.length > 0) {
        const stepsPayload = dish.steps.map((instruction, idx) => ({
          recipe_id: newRecipe.id,
          step_number: idx + 1,
          instruction
        }));
        await supabase.from("recipe_steps").insert(stepsPayload);
      }

      setSavedRecipes((prev) => ({ ...prev, [dish.id]: newRecipe.slug }));
    } catch (err) {
      console.error("Failed to save AI recipe:", err);
      alert("Failed to save recipe to your database. Please try again.");
    } finally {
      setSavingRecipeId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-[var(--surface)] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-[var(--line)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
          {/* Header - Solid Color, No Gradient */}
          <div className="p-5 bg-[var(--surface)] border-b border-[var(--line)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[var(--pepper)] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-[var(--cream)] font-display leading-tight">
                  Chef AI Meal Suggester ✨
                </h2>
                <p className="text-xs text-[var(--tan)] font-mono">
                  Analyzing {pantryItems.length} ingredients from your kitchen pantry
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-[var(--surface-warm)] flex items-center justify-center text-[var(--tan)] hover:text-[var(--cream)] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-5">
            {/* Pantry Ingredients Preview */}
            <div className="bg-[var(--surface-warm)] rounded-2xl p-4 border border-[var(--line)] space-y-2">
              <span className="text-[11px] font-bold text-[var(--tan)] uppercase tracking-wider block font-mono">
                Ingredients In Your Pantry ({pantryItems.length}):
              </span>
              {pantryItems.length === 0 ? (
                <p className="text-xs text-[var(--tan)] italic font-body">
                  Your pantry is empty. Chef AI will suggest standard Nigerian staples.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {pantryItems.map((item) => (
                    <span
                      key={item}
                      className="capitalize px-2.5 py-1 rounded-full bg-[var(--palm)]/15 text-[var(--palm)] text-[11px] font-semibold border border-[var(--palm)]/30"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Prompts Rail */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[var(--tan)] uppercase tracking-wider block font-mono">
                Pick a Cooking Scenario:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp.id}
                    type="button"
                    onClick={() => {
                      setSelectedMood(qp.id);
                      handleGenerate(qp.text);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedMood === qp.id
                        ? "bg-[var(--pepper)] text-white border-[var(--pepper)] shadow-2xs font-bold"
                        : "bg-[var(--surface-warm)] text-[var(--cream)] border-[var(--line)] hover:border-[var(--pepper)]/40 hover:bg-[var(--surface)]"
                    }`}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Question Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                className="w-full pl-4 pr-24 py-3 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-xs sm:text-sm text-[var(--cream)] placeholder:text-[var(--tan)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--pepper)]"
                placeholder="Ask Chef AI (e.g. 'Dinner for 2 with no oil', 'Use my boiled rice')..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
              />
              <button
                onClick={() => handleGenerate()}
                disabled={loading}
                type="button"
                className="absolute right-1.5 bg-[var(--pepper)] hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 font-display"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 fill-white" />}
                <span>Ask AI</span>
              </button>
            </div>

            {/* AI Suggestions Results List */}
            {loading ? (
              <div className="py-12 text-center bg-[var(--surface-warm)] rounded-3xl border border-[var(--line)] space-y-3">
                <Loader2 className="w-8 h-8 text-[var(--pepper)] animate-spin mx-auto" />
                <p className="font-bold text-sm text-[var(--cream)] font-display">
                  Chef AI is creating your meals...
                </p>
                <p className="text-xs text-[var(--tan)] max-w-xs mx-auto font-body">
                  Balancing your pantry ingredients with authentic cooking methods.
                </p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-4">
                <span className="text-xs font-bold text-[var(--pepper)] uppercase tracking-wider block font-mono">
                  Recommended Meals For You:
                </span>

                {suggestions.map((dish) => {
                  const savedSlug = savedRecipes[dish.id];
                  const isSaving = savingRecipeId === dish.id;

                  return (
                    <div
                      key={dish.id}
                      className="bg-[var(--surface-warm)] rounded-3xl p-5 border border-[var(--line)] shadow-xs space-y-4"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[var(--pepper)]/15 text-[var(--pepper)] rounded-full border border-[var(--pepper)]/30 font-mono">
                              {dish.cuisine}
                            </span>
                            <span className="text-xs font-bold text-[var(--tan)] flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-[var(--pepper)]" />
                              {dish.cookTime}
                            </span>
                            <span className="text-xs font-bold text-[var(--palm)] font-mono">
                              • {dish.difficulty}
                            </span>
                          </div>
                          <h3 className="font-bold text-base sm:text-lg text-[var(--cream)] font-display leading-tight">
                            {dish.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveCookDish(dish)}
                            type="button"
                            className="bg-[var(--pepper)] hover:opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs font-display"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Cook Mode</span>
                          </button>

                          {savedSlug ? (
                            <Link
                              href={`/recipe/${savedSlug}`}
                              onClick={onClose}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--palm)]/15 text-[var(--palm)] border border-[var(--palm)]/30 flex items-center gap-1 hover:bg-[var(--palm)] hover:text-white transition-all font-mono"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>View in Recipes →</span>
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleSaveToCookbook(dish)}
                              disabled={isSaving}
                              type="button"
                              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--surface)] text-[var(--cream)] border border-[var(--line)] hover:border-[var(--pepper)]/40 transition-all flex items-center gap-1 font-mono"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--pepper)]" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="w-3.5 h-3.5 text-[var(--pepper)]" />
                                  <span>Save Recipe</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[var(--cream)]/85 leading-relaxed font-body">
                        {dish.description}
                      </p>

                      {/* Why this works */}
                      <div className="bg-[var(--surface)] p-3 rounded-2xl border border-[var(--line)] text-xs">
                        <strong className="text-[var(--pepper)] block mb-0.5 font-display">💡 Why this works:</strong>
                        <span className="text-[var(--cream)] font-body">{dish.whyItWorks}</span>
                      </div>

                      {/* Ingredients Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--line)]">
                          <span className="font-bold text-[var(--pepper)] block mb-1 font-mono">
                            ✓ You have ({dish.haveIngredients.length}):
                          </span>
                          <span className="capitalize text-[var(--tan)] font-body">
                            {dish.haveIngredients.join(", ") || "All basic items"}
                          </span>
                        </div>
                        <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--line)]">
                          <span className="font-bold text-[var(--palm)] block mb-1 font-mono">
                            + Optional / missing:
                          </span>
                          <span className="capitalize text-[var(--tan)] font-body">
                            {dish.missingIngredients.join(", ") || "None"}
                          </span>
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                        <span className="text-xs font-bold text-[var(--cream)] block font-mono">
                          Quick Cooking Steps:
                        </span>
                        <ol className="space-y-1.5 text-xs text-[var(--cream)]/85 font-body">
                          {dish.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-[var(--pepper)]/15 text-[var(--pepper)] font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Chef Tip */}
                      {dish.chefTip && (
                        <div className="bg-[var(--surface)] p-3 rounded-2xl border border-[var(--palm)]/30 text-xs flex items-start gap-2">
                          <Flame className="w-4 h-4 text-[var(--palm)] flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-[var(--palm)] block font-display">Chef Secret:</strong>
                            <span className="text-[var(--cream)] font-body">{dish.chefTip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-[var(--surface-warm)] rounded-3xl border border-[var(--line)] space-y-2">
                <ChefHat className="w-10 h-10 text-[var(--pepper)]/40 mx-auto" />
                <h3 className="font-bold text-sm text-[var(--cream)] font-display">
                  Ready to find what you can cook?
                </h3>
                <p className="text-xs text-[var(--tan)] max-w-xs mx-auto font-body">
                  Tap one of the quick scenario pills above or type any custom request.
                </p>
                <button
                  onClick={() => handleGenerate()}
                  type="button"
                  className="mt-2 bg-[var(--pepper)] hover:opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 font-display"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  <span>Suggest Meals Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guided Cooking Modal for AI Dish */}
      {activeCookDish && (
        <StepByStepCookModal
          isOpen={!!activeCookDish}
          onClose={() => setActiveCookDish(null)}
          recipeTitle={activeCookDish.title}
          recipeImage="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80"
          steps={activeCookDish.steps}
          cookTimeMins={parseInt(activeCookDish.cookTime) || 25}
        />
      )}
    </>
  );
}
