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

      const { data, error } = await supabase
        .from("recipes")
        .insert({
          title: dish.title,
          slug,
          description: dish.description,
          cuisine: dish.cuisine.toLowerCase().includes("yoruba") ? "yoruba" : dish.cuisine.toLowerCase().includes("igbo") ? "igbo" : "nigerian",
          meal_type: dish.title.toLowerCase().includes("soup") ? "soup" : "dinner",
          cook_time_mins: parseInt(dish.cookTime) || 30,
          cost_level: 1,
          servings: 2,
          steps: dish.steps,
          image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
          mood_tags: ["ai_suggested", "comfort"],
          source: "ai_oracle",
          is_published: true
        })
        .select("slug")
        .single();

      if (!error && data) {
        setSavedRecipes((prev) => ({ ...prev, [dish.id]: data.slug }));
      }
    } catch (err) {
      console.error("Failed to save AI recipe:", err);
    } finally {
      setSavingRecipeId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFF9ED] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-[#EAE4D7] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="p-5 bg-white border-b border-[#EAE4D7] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-foreground font-serif leading-tight">
                  Chef Oracle AI Meal Suggester ✨
                </h2>
                <p className="text-xs text-muted-foreground">
                  Analyzing {pantryItems.length} ingredients from your kitchen pantry
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-5">
            {/* Pantry Ingredients Preview */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAE4D7] space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Ingredients In Your Pantry ({pantryItems.length}):
              </span>
              {pantryItems.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Your pantry is empty. Chef Oracle will suggest standard Nigerian staples.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {pantryItems.map((item) => (
                    <span
                      key={item}
                      className="capitalize px-2.5 py-1 rounded-full bg-sage-light text-primary text-[11px] font-semibold border border-sage-border/50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Prompts Rail */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
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
                        ? "bg-primary text-white border-primary shadow-2xs"
                        : "bg-white text-foreground border-[#EAE4D7] hover:border-primary/40 hover:bg-sage-light"
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
                className="w-full pl-4 pr-24 py-3 bg-white border border-[#EAE4D7] rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Ask Chef Oracle (e.g. 'Dinner for 2 with no oil', 'Use my boiled rice')..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
              />
              <button
                onClick={() => handleGenerate()}
                disabled={loading}
                className="absolute right-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Ask AI</span>
              </button>
            </div>

            {/* AI Suggestions Results List */}
            {loading ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-[#EAE4D7] space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="font-bold text-sm text-foreground font-serif">
                  Chef Oracle is creating your meals...
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Balancing your pantry ingredients with authentic Nigerian cooking methods.
                </p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-4">
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  Recommended Meals For You:
                </span>

                {suggestions.map((dish) => {
                  const savedSlug = savedRecipes[dish.id];
                  const isSaving = savingRecipeId === dish.id;

                  return (
                    <div
                      key={dish.id}
                      className="bg-white rounded-3xl p-5 border border-[#EAE4D7] shadow-xs space-y-4 food-card-hover"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-sage-light text-primary rounded-full border border-sage-border/50">
                              {dish.cuisine}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3 text-primary" />
                              {dish.cookTime}
                            </span>
                            <span className="text-xs font-bold text-[#2E8B57]">
                              • {dish.difficulty}
                            </span>
                          </div>
                          <h3 className="font-bold text-base sm:text-lg text-foreground font-serif leading-tight">
                            {dish.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveCookDish(dish)}
                            className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Cook Mode</span>
                          </button>

                          {savedSlug ? (
                            <Link
                              href={`/recipe/${savedSlug}`}
                              onClick={onClose}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-sage-light text-primary border border-sage-border flex items-center gap-1 hover:bg-primary hover:text-white transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>View in Recipes →</span>
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleSaveToCookbook(dish)}
                              disabled={isSaving}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#FAF7F2] text-foreground border border-border hover:bg-sage-light hover:border-primary/40 transition-all flex items-center gap-1"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="w-3.5 h-3.5 text-primary" />
                                  <span>Save Recipe</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                        {dish.description}
                      </p>

                      {/* Why this works */}
                      <div className="bg-sage-light/40 p-3 rounded-2xl border border-sage-border/40 text-xs">
                        <strong className="text-primary block mb-0.5">💡 Why this works:</strong>
                        <span className="text-foreground/80">{dish.whyItWorks}</span>
                      </div>

                      {/* Ingredients Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-[#FAF7F2] p-3 rounded-xl border border-border/60">
                          <span className="font-bold text-primary block mb-1">
                            ✓ You have ({dish.haveIngredients.length}):
                          </span>
                          <span className="capitalize text-muted-foreground">
                            {dish.haveIngredients.join(", ") || "All basic items"}
                          </span>
                        </div>
                        <div className="bg-[#FAF7F2] p-3 rounded-xl border border-border/60">
                          <span className="font-bold text-accent block mb-1">
                            + Optional / missing:
                          </span>
                          <span className="capitalize text-muted-foreground">
                            {dish.missingIngredients.join(", ") || "None"}
                          </span>
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="space-y-2 pt-2 border-t border-[#F0ECE3]">
                        <span className="text-xs font-bold text-foreground block">
                          Quick Cooking Steps:
                        </span>
                        <ol className="space-y-1.5 text-xs text-foreground/85">
                          {dish.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Chef Tip */}
                      {dish.chefTip && (
                        <div className="bg-accent-light/40 p-3 rounded-2xl border border-accent/20 text-xs flex items-start gap-2">
                          <Flame className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-accent-dark block">Chef Secret:</strong>
                            <span className="text-foreground/80">{dish.chefTip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-[#EAE4D7] space-y-2">
                <ChefHat className="w-10 h-10 text-primary/40 mx-auto" />
                <h3 className="font-bold text-sm text-foreground">
                  Ready to find what you can cook?
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Tap one of the quick scenario pills above or type any custom request.
                </p>
                <button
                  onClick={() => handleGenerate()}
                  className="mt-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
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
