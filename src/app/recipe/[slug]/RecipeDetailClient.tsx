"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePantry } from "@/lib/pantryStore";
import { calculateRecipeMatch } from "@/lib/matchingEngine";
import LazyVideo from "@/components/LazyVideo";
import MissingIngredientsModal from "@/components/MissingIngredientsModal";
import StepByStepCookModal from "@/components/StepByStepCookModal";
import {
  Clock,
  Users,
  Banknote,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Play,
  Share2,
  Heart,
  ChevronRight,
  Flame,
  Star,
  BookOpen,
  ArrowLeft
} from "lucide-react";

interface RecipeDetailClientProps {
  recipe: any;
}

export default function RecipeDetailClient({ recipe }: RecipeDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "ingredients" | "steps" | "video">("overview");
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [showCookModal, setShowCookModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { items: pantryItems } = usePantry();

  // Compute live Have vs. Missing split based on client pantry state
  const matchResult = calculateRecipeMatch(
    recipe.recipe_ingredients || [],
    pantryItems
  );

  const haveIngredients = matchResult.haveIngredients;
  const missingIngredients = matchResult.missingIngredients;
  const matchScore = matchResult.matchScore;

  // Estimated Naira Cost
  const costEstimate = recipe.cost_level === 1 ? "₦1,800" : recipe.cost_level === 2 ? "₦3,500" : "₦8,200";

  // Share recipe handler
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe for ${recipe.title} on The Kitchen Book!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Recipe link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 -mt-4 sm:-mt-6">
      {/* 1. HERO PHOTO BANNER */}
      <div className="relative w-full h-72 sm:h-96 -mx-4 sm:-mx-6 max-w-none bg-[#FAF7F2] overflow-hidden">
        <Image
          src={recipe.image_url || "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80"}
          alt={recipe.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-between p-4 sm:p-6 md:p-8">
          {/* Top Actions: Back, Share, Favorite */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                title="Share recipe"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                title="Save recipe"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-error text-error" : ""}`} />
              </button>
            </div>
          </div>

          {/* Bottom Title & Chips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="capitalize bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                {recipe.cuisine} food
              </span>
              <div className="bg-[#2E8B57] text-white text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>{matchScore}% PANTRY MATCH</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md leading-tight font-serif">
              {recipe.title}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. STATS & METADATA BAR */}
      <div className="bg-white border border-[#EAE4D7] rounded-3xl p-4 sm:p-5 mt-4 shadow-2xs flex items-center justify-around text-center">
        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
            Cook Time
          </span>
          <div className="flex items-center justify-center gap-1 font-extrabold text-foreground text-sm sm:text-base">
            <Clock className="w-4 h-4 text-primary" />
            <span>{recipe.cook_time_mins}m</span>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
            Servings
          </span>
          <div className="flex items-center justify-center gap-1 font-extrabold text-foreground text-sm sm:text-base">
            <Users className="w-4 h-4 text-primary" />
            <span>{recipe.servings} people</span>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
            Est. Cost
          </span>
          <div className="flex items-center justify-center gap-1 font-extrabold text-primary text-sm sm:text-base">
            <span>{costEstimate}</span>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
            Rating
          </span>
          <div className="flex items-center justify-center gap-1 font-extrabold text-foreground text-sm sm:text-base">
            <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span>4.8</span>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY ACTION: Start Step-by-Step Cooking Button */}
      <div className="mt-4">
        <button
          onClick={() => setShowCookModal(true)}
          className="w-full bg-primary hover:bg-primary-dark active:scale-98 text-white font-extrabold py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-base sm:text-lg"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Start Step-by-Step Cooking</span>
        </button>
      </div>

      {/* 4. TABS: Overview | Ingredients | Steps | Video */}
      <div className="flex items-center gap-2 border-b border-[#EAE4D7] mt-6 pb-2 overflow-x-auto hide-scrollbar">
        {[
          { id: "overview", label: "Overview" },
          { id: "ingredients", label: `Ingredients (${haveIngredients.length}/${recipe.recipe_ingredients?.length || 0})` },
          { id: "steps", label: `Steps (${recipe.steps?.length || 0})` },
          { id: "video", label: "Video Tutorial" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5. TAB CONTENT */}
      <div className="mt-6 space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {recipe.description && (
              <div className="bg-white rounded-3xl p-6 border border-[#EAE4D7] shadow-2xs">
                <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-2">
                  About this Dish
                </h3>
                <p className="text-foreground text-sm sm:text-base leading-relaxed">
                  {recipe.description}
                </p>
              </div>
            )}

            {/* Quick Ingredients Have / Missing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sage-light/60 border border-sage-border/60 rounded-3xl p-5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>You Have in Pantry ({haveIngredients.length})</span>
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-foreground font-medium">
                  {haveIngredients.slice(0, 5).map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="capitalize">{item.name}</span>
                    </li>
                  ))}
                  {haveIngredients.length > 5 && (
                    <li className="text-xs text-primary italic font-semibold">
                      + {haveIngredients.length - 5} more items
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-accent-light/50 border border-accent/30 rounded-3xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-accent-dark uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <AlertCircle className="w-4 h-4 text-accent" />
                    <span>You're Missing ({missingIngredients.length})</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-foreground font-medium mb-4">
                    {missingIngredients.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                        <span className="capitalize">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {missingIngredients.length > 0 && (
                  <button
                    onClick={() => setShowMissingModal(true)}
                    className="w-full bg-accent hover:bg-accent-dark text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Get Missing Ingredients Near You</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL INGREDIENTS LIST */}
        {activeTab === "ingredients" && (
          <div className="bg-white rounded-3xl p-6 border border-[#EAE4D7] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
              <div>
                <h3 className="font-bold text-base text-foreground">Recipe Ingredients</h3>
                <p className="text-xs text-muted-foreground">
                  Tick ingredients to check them off as you cook
                </p>
              </div>

              {missingIngredients.length > 0 && (
                <button
                  onClick={() => setShowMissingModal(true)}
                  className="bg-accent hover:bg-accent-dark text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center gap-1"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Shop Missing</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {(recipe.recipe_ingredients || []).map((ri: any, idx: number) => {
                const ingName = ri.ingredients?.name || "Ingredient";
                const isHave = pantryItems.includes(ingName.toLowerCase());

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isHave
                        ? "bg-sage-light/40 border-sage-border/60 text-foreground"
                        : "bg-[#FAF7F2] border-[#EAE4D7] text-foreground/85"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isHave ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isHave ? "✓" : "○"}
                      </div>
                      <div>
                        <span className="font-semibold text-sm capitalize block">
                          {ingName}
                        </span>
                        {ri.notes && (
                          <span className="text-[11px] text-muted-foreground block">{ri.notes}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-primary block">
                        {ri.qty ? `${ri.qty} ` : ""}{ri.unit || ""}
                      </span>
                      {ri.is_core && (
                        <span className="text-[10px] uppercase font-extrabold text-accent">
                          Core
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STEP-BY-STEP INSTRUCTIONS */}
        {activeTab === "steps" && (
          <div className="bg-white rounded-3xl p-6 border border-[#EAE4D7] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE3]">
              <div>
                <h3 className="font-bold text-base text-foreground">Cooking Method</h3>
                <p className="text-xs text-muted-foreground">
                  Follow these step-by-step instructions
                </p>
              </div>

              <button
                onClick={() => setShowCookModal(true)}
                className="bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Cook Mode</span>
              </button>
            </div>

            <div className="space-y-4">
              {(recipe.steps || []).map((stepText: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE4D7]"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed flex-1 font-medium">
                    {stepText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VIDEO MASTERCLASS */}
        {activeTab === "video" && (
          <div className="bg-white rounded-3xl p-6 border border-[#EAE4D7] shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-foreground">Video Masterclass</h3>
              <p className="text-xs text-muted-foreground">
                Watch how authentic chefs prepare {recipe.title}
              </p>
            </div>

            {recipe.video_url ? (
              <div className="rounded-2xl overflow-hidden shadow-xs border border-border">
                <LazyVideo videoUrl={recipe.video_url} title={recipe.title} />
              </div>
            ) : (
              <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-border text-muted-foreground space-y-2">
                <p className="text-sm font-semibold text-foreground">No video attached yet for this recipe.</p>
                <p className="text-xs">Follow the step-by-step text guide above.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. MODALS */}
      <MissingIngredientsModal
        isOpen={showMissingModal}
        missingIngredients={missingIngredients}
        recipeTitle={recipe.title}
        onClose={() => setShowMissingModal(false)}
      />

      <StepByStepCookModal
        isOpen={showCookModal}
        recipeTitle={recipe.title}
        recipeImage={recipe.image_url || "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80"}
        steps={recipe.steps || []}
        cookTimeMins={recipe.cook_time_mins || 45}
        onClose={() => setShowCookModal(false)}
      />
    </div>
  );
}
