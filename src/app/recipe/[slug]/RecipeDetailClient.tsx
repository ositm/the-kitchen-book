"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePantry } from "@/lib/pantryStore";
import { calculateRecipeMatch } from "@/lib/matchingEngine";
import MissingIngredientsModal from "@/components/MissingIngredientsModal";
import StepByStepCookModal from "@/components/StepByStepCookModal";
import {
  Clock,
  Users,
  Star,
  Flame,
  CheckCircle2,
  AlertCircle,
  Play,
  Share2,
  Heart,
  ShoppingCart,
  ChevronLeft,
  Sparkles,
  BookOpen
} from "lucide-react";

// Lazy loaded YouTube video player
function LazyVideo({ videoUrl, title }: { videoUrl: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl);

  if (!videoId) return null;

  if (!isLoaded) {
    return (
      <button
        onClick={() => setIsLoaded(true)}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[var(--surface-warm)] group flex items-center justify-center border border-[var(--line)]"
        aria-label={`Play video for ${title}`}
      >
        <Image
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
        <div className="relative w-14 h-14 rounded-full bg-[var(--pepper)] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 fill-white ml-0.5" />
        </div>
      </button>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[var(--line)] shadow-xs">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

interface RecipeDetailClientProps {
  recipe: any;
}

export default function RecipeDetailClient({ recipe }: RecipeDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "ingredients" | "steps" | "video">("overview");
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [showCookModal, setShowCookModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { items: pantryItems } = usePantry();

  // Match calculations
  const matchResult = calculateRecipeMatch(recipe.recipe_ingredients || [], pantryItems);
  const matchScore = matchResult.matchScore;
  const haveIngredients = matchResult.haveIngredients;
  const missingIngredients = matchResult.missingIngredients;

  // Cost estimates
  const costEstimate =
    recipe.cost_level === 1 ? "₦1,800 - ₦2,500" : recipe.cost_level === 2 ? "₦3,500 - ₦5,000" : "₦8,000+";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out how to cook ${recipe.title} on The Kitchen Book!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(`🍳 Check out how to cook ${recipe.title} on The Kitchen Book: ${window.location.href}`)}`;
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <div className="flex flex-col pb-24 max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* 1. HERO IMAGE BANNER (Magazine Full-bleed header) */}
      <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-[var(--surface-warm)] shadow-md border border-[var(--line)]">
        <Image
          src={recipe.image_url || "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80"}
          alt={recipe.title}
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

        {/* Top Floating Controls */}
        <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors shadow-sm"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
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
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Bottom Title & Chips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="capitalize bg-[var(--pepper)] text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                {recipe.cuisine} food
              </span>
              <div className="bg-[var(--pepper)] text-white text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>{matchScore}% PANTRY MATCH</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md leading-tight font-display">
              {recipe.title}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. STATS & METADATA BAR */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-4 sm:p-5 mt-4 shadow-2xs flex items-center justify-around text-center">
        <div>
          <span className="text-[11px] font-bold text-[var(--tan)] uppercase block mb-1 font-mono">
            Cook Time
          </span>
          <div className="flex items-center justify-center gap-1 font-extrabold text-[var(--cream)] text-sm sm:text-base font-display">
            <Clock className="w-4 h-4 text-[var(--pepper)]" />
            <span>{recipe.cook_time_mins}m</span>
          </div>
        </div>

        <div className="h-8 w-px bg-[var(--line)]" />

        <div>
          <span className="text-[11px] font-bold text-[var(--tan)] uppercase block mb-1 font-mono">
            Servings
          </span>
          <div className="flex items-center justify-center gap-1 font-extrabold text-[var(--cream)] text-sm sm:text-base font-display">
            <Users className="w-4 h-4 text-[var(--pepper)]" />
            <span>{recipe.servings} people</span>
          </div>
        </div>

        <div className="h-8 w-px bg-[var(--line)]" />

        <div>
          <span className="text-[11px] font-bold text-[var(--tan)] uppercase block mb-1 font-mono">
            Est. Cost
          </span>
          <div className="flex items-center justify-center gap-1 font-extrabold text-[var(--palm)] text-sm sm:text-base font-mono">
            <span>{costEstimate}</span>
          </div>
        </div>

        <div className="h-8 w-px bg-[var(--line)]" />

        <div>
          <span className="text-[11px] font-bold text-[var(--tan)] uppercase block mb-1 font-mono">
            Rating
          </span>
          <div className="flex items-center justify-center gap-1 font-extrabold text-[var(--cream)] text-sm sm:text-base font-display">
            <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span>4.8</span>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY ACTION: Start Step-by-Step Cooking Button */}
      <div className="mt-4">
        <button
          onClick={() => setShowCookModal(true)}
          className="w-full bg-[var(--pepper)] hover:opacity-90 active:scale-98 text-white font-extrabold py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-base sm:text-lg font-display"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Start Step-by-Step Cooking</span>
        </button>
      </div>

      {/* 4. TABS: Overview | Ingredients | Steps | Video */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] mt-6 pb-2 overflow-x-auto hide-scrollbar">
        {[
          { id: "overview", label: "Overview" },
          { id: "ingredients", label: `Ingredients (${haveIngredients.length}/${recipe.recipe_ingredients?.length || 0})` },
          { id: "steps", label: `Steps (${recipe.steps?.length || 0})` },
          { id: "video", label: "Video Tutorial" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all font-mono ${
              activeTab === tab.id
                ? "bg-[var(--pepper)] text-white shadow-2xs"
                : "text-[var(--tan)] hover:text-[var(--cream)] hover:bg-[var(--surface)]"
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
              <div className="bg-[var(--surface)] rounded-3xl p-6 border border-[var(--line)] shadow-2xs">
                <h3 className="text-xs font-extrabold text-[var(--tan)] uppercase tracking-wider mb-2 font-mono">
                  About this Dish
                </h3>
                <p className="text-[var(--cream)] text-sm sm:text-base leading-relaxed font-body">
                  {recipe.description}
                </p>
              </div>
            )}

            {/* Quick Ingredients Have / Missing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--pepper)]/10 border border-[var(--pepper)]/30 rounded-3xl p-5">
                <h4 className="text-xs font-bold text-[var(--pepper)] uppercase tracking-wider flex items-center gap-1.5 mb-3 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-[var(--pepper)]" />
                  <span>You Have in Pantry ({haveIngredients.length})</span>
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--cream)] font-medium font-body">
                  {haveIngredients.slice(0, 5).map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[var(--pepper)] rounded-full" />
                      <span className="capitalize">{item.name}</span>
                    </li>
                  ))}
                  {haveIngredients.length > 5 && (
                    <li className="text-xs text-[var(--pepper)] italic font-semibold">
                      + {haveIngredients.length - 5} more items
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-[var(--surface-warm)] border border-[var(--palm)]/30 rounded-3xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--palm)] uppercase tracking-wider flex items-center gap-1.5 mb-3 font-mono">
                    <AlertCircle className="w-4 h-4 text-[var(--palm)]" />
                    <span>You're Missing ({missingIngredients.length})</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-[var(--cream)] font-medium mb-4 font-body">
                    {missingIngredients.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[var(--palm)] rounded-full" />
                        <span className="capitalize">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {missingIngredients.length > 0 && (
                  <button
                    onClick={() => setShowMissingModal(true)}
                    className="w-full bg-[var(--palm)] text-[var(--ink)] text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5 font-display"
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
          <div className="bg-[var(--surface)] rounded-3xl p-6 border border-[var(--line)] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="font-bold text-base text-[var(--cream)] font-display">Recipe Ingredients</h3>
                <p className="text-xs text-[var(--tan)] font-body">
                  Tick ingredients to check them off as you cook
                </p>
              </div>

              {missingIngredients.length > 0 && (
                <button
                  onClick={() => setShowMissingModal(true)}
                  className="bg-[var(--palm)] text-[var(--ink)] text-xs font-bold py-2 px-3 rounded-xl transition-opacity hover:opacity-90 flex items-center gap-1 font-display"
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
                        ? "bg-[var(--surface-warm)] border-[var(--pepper)]/30 text-[var(--cream)]"
                        : "bg-[var(--surface)] border-[var(--line)] text-[var(--cream)]/85"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isHave ? "bg-[var(--pepper)] text-white" : "bg-[var(--line)] text-[var(--tan)]"
                        }`}
                      >
                        {isHave ? "✓" : "○"}
                      </div>
                      <div>
                        <span className="font-semibold text-sm capitalize block font-body">
                          {ingName}
                        </span>
                        {ri.notes && (
                          <span className="text-[11px] text-[var(--tan)] block font-body">{ri.notes}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[var(--pepper)] block font-mono">
                        {ri.qty ? `${ri.qty} ` : ""}{ri.unit || ""}
                      </span>
                      {ri.is_core && (
                        <span className="text-[10px] uppercase font-extrabold text-[var(--palm)] font-mono">
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
          <div className="bg-[var(--surface)] rounded-3xl p-6 border border-[var(--line)] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="font-bold text-base text-[var(--cream)] font-display">Cooking Method</h3>
                <p className="text-xs text-[var(--tan)] font-body">
                  Follow these step-by-step instructions
                </p>
              </div>

              <button
                onClick={() => setShowCookModal(true)}
                className="bg-[var(--pepper)] hover:opacity-90 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1 font-display"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Cook Mode</span>
              </button>
            </div>

            <div className="space-y-4">
              {(recipe.steps || []).map((stepText: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--surface-warm)] border border-[var(--line)]"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--pepper)] text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs font-display">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--cream)] leading-relaxed flex-1 font-medium font-body">
                    {stepText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VIDEO MASTERCLASS */}
        {activeTab === "video" && (
          <div className="bg-[var(--surface)] rounded-3xl p-6 border border-[var(--line)] shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-[var(--cream)] font-display">Video Masterclass</h3>
              <p className="text-xs text-[var(--tan)] font-body">
                Watch how authentic chefs prepare {recipe.title}
              </p>
            </div>

            {recipe.video_url ? (
              <div className="rounded-2xl overflow-hidden shadow-xs border border-[var(--line)]">
                <LazyVideo videoUrl={recipe.video_url} title={recipe.title} />
              </div>
            ) : (
              <div className="p-8 text-center bg-[var(--surface-warm)] rounded-2xl border border-[var(--line)] text-[var(--tan)] space-y-2">
                <p className="text-sm font-semibold text-[var(--cream)]">No video attached yet for this recipe.</p>
                <p className="text-xs font-body">Follow the step-by-step text guide above.</p>
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
