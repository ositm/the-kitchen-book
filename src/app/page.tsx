"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { usePantry } from "@/lib/pantryStore";
import { useMoods, MOOD_COLOR_MAP } from "@/lib/moodStore";
import { CANONICAL_INGREDIENTS } from "@/components/IngredientSearch";
import RecipeCard from "@/components/RecipeCard";
import AiMealSuggesterModal from "@/components/AiMealSuggesterModal";
import CustomizeMoodsModal from "@/components/CustomizeMoodsModal";
import AuthModal from "@/components/AuthModal";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { sortRecipesWithNigerianPriority } from "@/lib/matchingEngine";
import { ChevronDown, MapPin, Sparkles, ArrowRight, Flame, Search, SlidersHorizontal, Plus } from "lucide-react";

export const NIGERIAN_CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Enugu",
  "Benin City",
  "Kano",
  "Calabar",
  "Asaba"
];

// Helper to determine category for color-coding pantry tags (NO GREEN)
function getIngredientCategory(name: string): "protein" | "veg" | "spice" {
  const n = name.toLowerCase().trim();
  const canonical = CANONICAL_INGREDIENTS.find(
    (i) => i.name.toLowerCase() === n || i.label.toLowerCase() === n
  );

  if (canonical) {
    if (canonical.category === "protein") return "protein";
    if (canonical.category === "vegetable") return "veg";
    return "spice";
  }

  // Fallback heuristics
  if (
    n.includes("fish") ||
    n.includes("beef") ||
    n.includes("chicken") ||
    n.includes("meat") ||
    n.includes("egg") ||
    n.includes("bean") ||
    n.includes("crayfish") ||
    n.includes("prawn") ||
    n.includes("shrimp") ||
    n.includes("egusi") ||
    n.includes("turkey") ||
    n.includes("goat") ||
    n.includes("snails")
  ) {
    return "protein";
  }

  if (
    n.includes("onion") ||
    n.includes("tomato") ||
    n.includes("leaf") ||
    n.includes("leaves") ||
    n.includes("ugu") ||
    n.includes("ugwu") ||
    n.includes("okra") ||
    n.includes("spinach") ||
    n.includes("ewedu") ||
    n.includes("bitterleaf") ||
    n.includes("efo") ||
    n.includes("waterleaf") ||
    n.includes("cabbage") ||
    n.includes("carrot") ||
    n.includes("pepper")
  ) {
    return "veg";
  }

  return "spice";
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, count, isReady } = usePantry();
  const { moods } = useMoods();

  const [selectedCity, setSelectedCity] = useState("Lagos");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showMoodsModal, setShowMoodsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeString, setTimeString] = useState("Wednesday, 7:42am");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  // Dynamic day/time string
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = now.toLocaleDateString("en-US", { weekday: "long" });
      const time = now
        .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        .toLowerCase()
        .replace(" ", "");
      setTimeString(`${day}, ${time}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live recipes for dynamic web/mobile grid
  useEffect(() => {
    async function loadRecipes() {
      try {
        const { data } = await supabase
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
          .limit(12);

        if (data) {
          const sorted = sortRecipesWithNigerianPriority(data);
          setRecipes(sorted);
        }
      } catch (err) {
        console.error("Failed to load recipes", err);
      } finally {
        setIsLoadingRecipes(false);
      }
    }
    loadRecipes();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Resolved user name — always defaults to "Chef" instead of hardcoded names
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.name?.split(" ")[0] ||
    (user?.email ? user.email.split("@")[0] : "Chef");

  const avatarInitial = firstName.charAt(0).toUpperCase() || "C";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // Pantry display items
  const maxInlineTags = 8;
  const displayItems = isReady ? items.slice(0, maxInlineTags) : ["onions", "tomatoes", "scotch bonnet", "palm oil", "crayfish"];
  const moreCount = isReady ? Math.max(0, items.length - maxInlineTags) : 2;
  const totalCount = isReady ? count : 10;

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--cream)] flex justify-center selection:bg-[var(--pepper)] selection:text-white transition-colors duration-200">
      {/* Responsive Container: mobile 380px frame metrics, expands gracefully up to 5xl on desktop */}
      <div className="w-full max-w-5xl mx-auto flex flex-col pb-20 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
        
        {/* 1. TOP BAR — DYNAMIC FOR MOBILE & WEB (LIGHT & DARK COMPATIBLE) */}
        <header className="topbar flex items-center justify-between gap-3 sm:gap-4 w-full">
          {/* Location Pill */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="locale flex items-center gap-[6px] text-[13px] sm:text-sm font-semibold text-[var(--cream)] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pepper)] rounded-full px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--line)] shadow-2xs"
              aria-label="Select city"
            >
              <span className="dot w-[6px] h-[6px] rounded-full bg-[var(--pepper)] shrink-0" />
              <span className="truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[140px]">{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-[var(--tan)]" />
            </button>

            {/* City Selector Dropdown */}
            {showLocationDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-mono font-bold text-[var(--tan)] uppercase tracking-wider">
                  Select City
                </div>
                {NIGERIAN_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--line)]/20 transition-colors ${
                      selectedCity === city
                        ? "font-bold text-[var(--pepper)] bg-[var(--line)]/10"
                        : "text-[var(--cream)]"
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <span className="text-[var(--pepper)] text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-full sm:max-w-md md:max-w-lg min-w-0">
            <div className="relative">
              <input
                type="text"
                placeholder="search recipes, ingredients…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search w-full bg-[var(--surface)] border border-[var(--line)] rounded-[12px] px-[12px] py-[9px] text-[12px] sm:text-xs text-[var(--cream)] placeholder:text-[var(--tan)] font-mono focus:outline-none focus:border-[var(--pepper)] focus:ring-1 focus:ring-[var(--pepper)] transition-all pr-8 shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-[var(--tan)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </form>

          {/* Right Controls: Theme Toggle + Avatar Button */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle showLabel={false} />

            <button
              type="button"
              onClick={() => {
                if (user) {
                  router.push("/profile");
                } else {
                  setShowAuthModal(true);
                }
              }}
              className="avatar-btn shrink-0 w-[30px] h-[30px] sm:w-[32px] sm:h-[32px] rounded-full bg-[var(--pepper)] flex items-center justify-center font-mono text-[11px] sm:text-xs font-bold text-white hover:scale-105 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pepper)] overflow-hidden shadow-xs"
              aria-label="User Profile"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={firstName}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarInitial
              )}
            </button>
          </div>
        </header>

        {/* 2. HERO — MONO EYEBROW + BOLD TWO-LINE HEADLINE (No "Ugo", now "Chef") */}
        <section className="hero pt-2 sm:pt-4">
          <div className="eyebrow font-mono text-[10.5px] sm:text-xs tracking-[0.1em] uppercase text-[var(--palm)] mb-1.5 sm:mb-2">
            {timeString}
          </div>
          <h1 className="headline font-display font-extrabold text-[30px] sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.01em] text-[var(--cream)]">
            What&apos;s <em className="not-italic text-[var(--pepper)]">cooking</em>,<br />
            {firstName}?
          </h1>
        </section>

        {/* 3. PANTRY SECTION — HIGH CONTRAST CATEGORY TAGS (NO GREEN) */}
        <section className="pantry pb-5 sm:pb-6 border-b border-[var(--line)]">
          <div className="pantry-head flex items-baseline justify-between mb-3">
            <h2 className="pantry-title font-display font-bold text-[14px] sm:text-base text-[var(--cream)]">
              Your pantry
            </h2>
            <Link
              href="/pantry"
              className="pantry-count font-mono text-[11.5px] sm:text-xs text-[var(--palm)] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--palm)] rounded font-semibold"
            >
              {totalCount} items · edit
            </Link>
          </div>

          <div className="tag-row flex flex-wrap gap-[7px] sm:gap-2">
            {displayItems.length > 0 ? (
              <>
                {displayItems.map((item, idx) => {
                  const category = getIngredientCategory(item);
                  
                  // Warm, high-contrast, readable tag colors without any green:
                  let tagStyle = "bg-[var(--palm)]/15 text-[var(--palm)] border border-[var(--palm)]/30"; // spice/grain/oil
                  if (category === "protein") {
                    tagStyle = "bg-[var(--pepper)]/15 text-[var(--pepper)] border border-[var(--pepper)]/30";
                  } else if (category === "veg") {
                    tagStyle = "bg-[var(--berry)]/15 text-[var(--berry-light)] border border-[var(--berry)]/30";
                  }

                  return (
                    <span
                      key={`${item}-${idx}`}
                      className={`tag px-[11px] sm:px-3 py-[6px] sm:py-1.5 rounded-[20px] text-[12px] sm:text-xs font-semibold capitalize transition-all ${tagStyle}`}
                    >
                      {item}
                    </span>
                  );
                })}

                {moreCount > 0 && (
                  <Link
                    href="/pantry"
                    className="tag more bg-transparent border border-[var(--line)] text-[var(--tan)] hover:text-[var(--cream)] hover:border-[var(--tan)] px-[11px] sm:px-3 py-[6px] sm:py-1.5 rounded-[20px] text-[12px] sm:text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pepper)]"
                  >
                    +{moreCount} more
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/pantry"
                className="tag more bg-transparent border border-[var(--line)] text-[var(--tan)] hover:text-[var(--cream)] hover:border-[var(--pepper)] px-[14px] py-[8px] rounded-[20px] text-[12px] font-semibold transition-colors"
              >
                + Add your first kitchen ingredient
              </Link>
            )}
          </div>
        </section>

        {/* 4. "COOK YOUR MOOD" SHELF — CUSTOMIZABLE MOOD CARDS (NO GREEN) */}
        <section className="shelf">
          <div className="shelf-head flex items-baseline justify-between mb-3">
            <h2 className="shelf-title font-display font-bold text-[16px] sm:text-lg md:text-xl text-[var(--cream)]">
              Cook your mood
            </h2>
            <button
              type="button"
              onClick={() => setShowMoodsModal(true)}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-xs text-[var(--pepper)] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pepper)] rounded py-0.5 px-1 font-semibold"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Customize Moods</span>
            </button>
          </div>

          {/* Mobile: Horizontal scroll, Desktop: Responsive grid */}
          <div className="flex sm:grid sm:grid-cols-3 gap-[10px] sm:gap-4 md:gap-6 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {moods.map((card) => {
              const colorInfo = MOOD_COLOR_MAP[card.color] || MOOD_COLOR_MAP.pepper;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => router.push(`/search?mood=${encodeURIComponent(card.tag)}&q=${encodeURIComponent(card.context || card.label)}`)}
                  className={`mood-card shrink-0 w-[150px] sm:w-auto h-[150px] sm:h-[170px] md:h-[190px] rounded-[16px] sm:rounded-[20px] p-[14px] sm:p-5 md:p-6 flex flex-col justify-between text-left transition-all hover:scale-[1.02] sm:hover:-translate-y-1 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cream)] shadow-md ${colorInfo.bg}`}
                  aria-label={`Cook mood: ${card.tag} - ${card.label}`}
                >
                  <div>
                    <span className={`mood-tag font-mono text-[9.5px] sm:text-xs uppercase tracking-[0.06em] block ${colorInfo.tagText}`}>
                      {card.tag}
                    </span>
                    {card.context && (
                      <span className="hidden sm:block text-[10px] opacity-75 font-body line-clamp-1 mt-0.5">
                        {card.context}
                      </span>
                    )}
                  </div>
                  <span className={`mood-label font-display font-extrabold text-[17px] sm:text-xl md:text-2xl leading-[1.1] ${colorInfo.text}`}>
                    {card.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. "ASK CHEF AI" ROW — QUIET OUTLINED CARD */}
        <section className="cta-row">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="cta w-full bg-[var(--surface)] border border-[var(--line)] rounded-[16px] sm:rounded-[20px] p-[15px_16px] sm:p-6 flex items-center justify-between text-left hover:border-[var(--pepper)]/50 active:scale-[0.99] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pepper)] shadow-2xs"
          >
            <div>
              <div className="cta-text font-display font-bold text-[14px] sm:text-base md:text-lg text-[var(--cream)] group-hover:text-[var(--pepper)] transition-colors">
                Ask Chef AI
              </div>
              <div className="cta-sub text-[11.5px] sm:text-xs text-[var(--tan)] mt-[2px] font-body">
                Stuck? Describe your fridge.
              </div>
            </div>
            <div
              className="cta-arrow shrink-0 w-[30px] h-[30px] sm:w-[36px] sm:h-[36px] rounded-full bg-[var(--pepper)] text-white flex items-center justify-center text-[13px] sm:text-sm font-bold group-hover:scale-105 transition-transform shadow-xs"
              aria-hidden="true"
            >
              →
            </div>
          </button>
        </section>

        {/* 6. PANTRY-MATCHED RECIPES (Dynamic Live Recipes for Web & Mobile) */}
        {recipes.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-[var(--cream)]">
                  Cook with what you have
                </h2>
                <p className="text-xs text-[var(--tan)] mt-0.5">
                  Authentic Nigerian dishes ranked by your available ingredients
                </p>
              </div>
              <Link
                href="/search"
                className="font-mono text-xs text-[var(--pepper)] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {recipes.slice(0, 6).map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  slug={recipe.slug}
                  title={recipe.title}
                  image_url={recipe.image_url}
                  cook_time_mins={recipe.cook_time_mins}
                  cuisine={recipe.cuisine}
                  cost_level={recipe.cost_level}
                  recipeIngredients={recipe.recipe_ingredients}
                  region={recipe.region}
                />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Interactive Modals */}
      <AiMealSuggesterModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />
      <CustomizeMoodsModal isOpen={showMoodsModal} onClose={() => setShowMoodsModal(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
