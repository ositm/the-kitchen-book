import { supabase } from "@/lib/supabase";
import RecipeCard from "@/components/RecipeCard";
import IngredientSearch from "@/components/IngredientSearch";
import TipCard from "@/components/TipCard";
import MoodRail from "@/components/MoodRail";
import { REGIONS } from "@/lib/constants";
import { sortRecipesWithNigerianPriority, isNigerianRecipe } from "@/lib/matchingEngine";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Flame, ChefHat, ArrowRight, Star, Clock, Plus, Utensils, BookOpen } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // Fetch real published recipes from Supabase
  const { data: rawRecipes } = await supabase
    .from("recipes")
    .select(`
      *,
      recipe_ingredients (
        qty,
        unit,
        is_core,
        ingredients (
          name
        )
      )
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(40);

  // Sort with Nigerian recipes always at the top
  const recipes = sortRecipesWithNigerianPriority(rawRecipes || []);

  // Pick an authentic Nigerian dish for the featured card (prefer Jollof or Egusi or first Nigerian item)
  const nigerianRecipes = recipes.filter((r) => isNigerianRecipe(r));
  const featuredRecipe = nigerianRecipes.length > 0 ? nigerianRecipes[0] : recipes[0] || null;
  const trendingRecipes = recipes.filter((r) => r.id !== featuredRecipe?.id).slice(0, 12);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">
            GOOD MORNING, UGO 👋
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight font-serif">
            What will we cook today?
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-xl">
            Tell us what you have in your kitchen, and discover authentic dishes ranked by your ingredients.
          </p>
        </div>

        {/* Primary Interactive Ingredient Search & Pantry Quick-Pills */}
        <IngredientSearch />
      </section>

      {/* 2. EDITORIAL FEATURED RECIPE CARD */}
      {featuredRecipe && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Featured Dish of the Day
            </span>
            <Link
              href={`/recipe/${featuredRecipe.slug}`}
              className="text-xs font-bold text-primary hover:text-accent transition-colors flex items-center gap-1"
            >
              <span>Cook this recipe</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-card rounded-3xl p-5 sm:p-6 border border-border shadow-xs food-card-hover flex flex-col md:flex-row items-center gap-6">
            {/* Left/Top: Large Food Image */}
            <div className="relative w-full md:w-1/2 h-56 sm:h-64 rounded-2xl overflow-hidden bg-card-warm flex-shrink-0 shadow-2xs">
              <Image
                src={featuredRecipe.image_url || "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80"}
                alt={featuredRecipe.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-md text-primary font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs border border-border/50">
                ⭐ NIGERIAN CLASSIC
              </div>
            </div>

            {/* Right: Editorial Content */}
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-1">
                  <span>📍 {featuredRecipe.cuisine || "Nigerian"}</span>
                  <span>•</span>
                  <span>{featuredRecipe.meal_type === "soup" ? "Soup & Stew" : "Main Course"}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight leading-snug font-serif">
                  {featuredRecipe.title}
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                  {featuredRecipe.description ||
                    "Rich, smoky and packed with authentic Nigerian spices, fresh pepper mix, and tender seasoning."}
                </p>
              </div>

              <div className="pt-3 border-t border-border-light flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs font-semibold text-foreground/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {featuredRecipe.cook_time_mins || 45} mins
                  </span>
                  <span>•</span>
                  <span className="text-[#2E8B57] font-bold">Easy</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#F59E0B]">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                    4.8 (120+ cooks)
                  </span>
                </div>

                <Link
                  href={`/recipe/${featuredRecipe.slug}`}
                  className="bg-primary hover:bg-primary-dark active:scale-98 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>View Recipe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. TODAY'S KITCHEN TIP */}
      <section>
        <TipCard />
      </section>

      {/* 4. MOOD / SITUATION RECOMMENDATION RAIL */}
      <section>
        <MoodRail />
      </section>

      {/* 5. REGIONAL CUISINE EXPLORATION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Explore Nigerian Regional Cuisines
            </h2>
          </div>
          <Link
            href="/search"
            className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {REGIONS.map((region) => (
            <Link
              key={region.id}
              href={region.id === "all" ? "/search" : `/search?cuisine=${region.id}`}
              className="bg-card hover:bg-sage-light border border-border hover:border-primary/40 rounded-2xl p-3 text-center transition-all shadow-2xs food-card-hover group flex flex-col items-center justify-center gap-1.5"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                {region.icon}
              </span>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                {region.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. POPULAR & TRENDING RECIPES GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Trending Dishes across Nigeria 🍲
            </h2>
            <p className="text-xs text-muted-foreground">
              Ranked live by the ingredients in your kitchen pantry
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
          >
            <span>Browse All ({recipes?.length || 0})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trendingRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              slug={recipe.slug}
              title={recipe.title}
              image_url={recipe.image_url}
              cook_time_mins={recipe.cook_time_mins}
              cuisine={recipe.cuisine}
              cost_level={recipe.cost_level}
              recipeIngredients={recipe.recipe_ingredients || []}
              rating={4.8}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
