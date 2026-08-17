"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { usePantry } from "@/lib/pantryStore";
import { calculateRecipeMatch, sortRecipesWithNigerianPriority } from "@/lib/matchingEngine";
import RecipeCard from "@/components/RecipeCard";
import { Search as SearchIcon, Loader2, Filter, Flame, Clock, Sparkles, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialMood = searchParams.get("mood") || "";
  const initialCuisine = searchParams.get("cuisine") || "";
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedFilter, setSelectedFilter] = useState<string>(initialMood || initialCuisine || "all");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { items: pantryItems } = usePantry();

  // Load all published recipes from Supabase
  useEffect(() => {
    async function loadRecipes() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("recipes")
          .select(`
            *,
            recipe_ingredients (
              qty,
              unit,
              is_core,
              notes,
              ingredients (
                name
              )
            )
          `)
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setRecipes(data);
        }
      } catch (err) {
        console.error("Failed to load recipes", err);
      } finally {
        setLoading(false);
      }
    }
    loadRecipes();
  }, []);

  // Compute % Match and filter results
  const rankedRecipes = useMemo(() => {
    let list = recipes.map((recipe) => {
      const matchResult = calculateRecipeMatch(
        recipe.recipe_ingredients || [],
        pantryItems
      );
      return {
        ...recipe,
        matchScore: matchResult.matchScore,
        haveCount: matchResult.haveCount,
        totalCount: matchResult.totalCount,
      };
    });

    // Query filter
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.cuisine?.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }

    // Category / Mood filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "quick") {
        list = list.filter((r) => r.cook_time_mins <= 30);
      } else if (selectedFilter === "comfort" || selectedFilter === "rainy_day" || selectedFilter === "broke_week" || selectedFilter === "celebration") {
        list = list.filter((r) => r.mood_tags && r.mood_tags.includes(selectedFilter));
      } else if (selectedFilter === "soups") {
        list = list.filter((r) => r.meal_type === "soup" || r.title.toLowerCase().includes("soup") || r.title.toLowerCase().includes("stew"));
      } else if (selectedFilter === "street") {
        list = list.filter((r) => r.meal_type === "snack" || r.title.toLowerCase().includes("suya") || r.title.toLowerCase().includes("plantain"));
      } else if (selectedFilter === "igbo" || selectedFilter === "yoruba" || selectedFilter === "hausa") {
        list = list.filter((r) => r.cuisine?.toLowerCase().includes(selectedFilter) || r.title.toLowerCase().includes(selectedFilter));
      }
    }

    // Sort with Nigerian dishes always at the top of the list
    return sortRecipesWithNigerianPriority(list);
  }, [recipes, pantryItems, query, selectedFilter]);

  const filterTabs = [
    { id: "all", label: "Best Match ⭐" },
    { id: "quick", label: "⚡ <30 Mins" },
    { id: "soups", label: "🍲 Soups & Stews" },
    { id: "comfort", label: "❤️ Comfort Food" },
    { id: "broke_week", label: "💸 Broke Week" },
    { id: "street", label: "🍢 Street Food" },
    { id: "igbo", label: "Igbo food" },
    { id: "yoruba", label: "Yoruba food" },
    { id: "hausa", label: "Hausa food" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Recipe Matcher</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-serif">
          Find What to Cook
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Ranked live by the ingredients in your pantry ({pantryItems.length} available).
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
          <SearchIcon className="h-4.5 w-4.5" />
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-10 py-3.5 bg-card border border-border rounded-2xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground text-sm md:text-base font-medium placeholder:text-muted-foreground transition-all"
          placeholder="Search by recipe name, soup, stew, rice..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Filter Chips Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedFilter === tab.id
                ? "bg-primary text-white border-primary shadow-2xs"
                : "bg-card text-foreground/80 border-border hover:border-primary/40 hover:bg-sage-light"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-1">
        <span>Showing {rankedRecipes.length} recipes</span>
        {pantryItems.length > 0 && (
          <span className="text-primary font-bold">
            Matched against {pantryItems.length} pantry items
          </span>
        )}
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Matching recipes with your pantry...</p>
        </div>
      ) : rankedRecipes.length === 0 ? (
        <div className="bg-white text-foreground p-10 rounded-3xl border border-[#EAE4D7] text-center shadow-xs space-y-3">
          <span className="text-3xl block">🍲</span>
          <h3 className="text-lg font-bold">Hmm... nothing quite matches yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try searching for another dish, clearing filters, or adding more ingredients to your pantry.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedFilter("all");
            }}
            className="inline-block bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rankedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              slug={recipe.slug}
              title={recipe.title}
              image_url={recipe.image_url}
              cook_time_mins={recipe.cook_time_mins}
              cuisine={recipe.cuisine}
              cost_level={recipe.cost_level}
              matchScore={recipe.matchScore}
              haveCount={recipe.haveCount}
              totalCount={recipe.totalCount}
              rating={4.8}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Loading recipe matcher...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
