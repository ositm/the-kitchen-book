"use client";

import { useState, useMemo } from "react";
import { Search, Plus, X, Sparkles, Check, Flame, ArrowRight, Utensils } from "lucide-react";
import { usePantry } from "@/lib/pantryStore";
import Link from "next/link";
import AiMealSuggesterModal from "./AiMealSuggesterModal";

// Common Nigerian kitchen ingredients with local aliases
export const CANONICAL_INGREDIENTS = [
  { name: "rice", label: "Rice", category: "grain", icon: "🍚" },
  { name: "tomatoes", label: "Tomatoes", category: "vegetable", icon: "🍅" },
  { name: "onions", label: "Onions", category: "vegetable", icon: "🧅" },
  { name: "scotch bonnet", label: "Atarodo", category: "spice", icon: "🌶️" },
  { name: "palm oil", label: "Palm Oil", category: "oil", icon: "🛢️" },
  { name: "vegetable oil", label: "Vegetable Oil", category: "oil", icon: "🍾" },
  { name: "maggi", label: "Maggi Cubes", category: "spice", icon: "🧂" },
  { name: "crayfish", label: "Crayfish", category: "protein", icon: "🦐" },
  { name: "garri", label: "Garri", category: "grain", icon: "🥣" },
  { name: "chicken", label: "Chicken", category: "protein", icon: "🍗" },
  { name: "beef", label: "Beef", category: "protein", icon: "🥩" },
  { name: "fish", label: "Fish", category: "protein", icon: "🐟" },
  { name: "egusi", label: "Egusi", category: "protein", icon: "🍈" },
  { name: "beans", label: "Beans", category: "protein", icon: "🫘" },
  { name: "yam", label: "Yam", category: "grain", icon: "🍠" },
  { name: "plantain", label: "Plantain", category: "other", icon: "🍌" },
  { name: "ugu", label: "Ugu Leaves", category: "vegetable", icon: "🥬" },
  { name: "locust beans", label: "Iru / Dawadawa", category: "spice", icon: "🫘" },
  { name: "curry powder", label: "Curry Powder", category: "spice", icon: "🍛" },
  { name: "thyme", label: "Thyme", category: "spice", icon: "🌿" },
  { name: "garlic", label: "Garlic", category: "spice", icon: "🧄" },
  { name: "ginger", label: "Ginger", category: "spice", icon: "🫚" },
  { name: "eggs", label: "Eggs", category: "protein", icon: "🥚" },
  { name: "okra", label: "Okra", category: "vegetable", icon: "🥒" },
];

function getCategory(name: string): "protein" | "veg" | "spice" {
  const n = name.toLowerCase().trim();
  const canonical = CANONICAL_INGREDIENTS.find(
    (i) => i.name.toLowerCase() === n || i.label.toLowerCase() === n
  );
  if (canonical) {
    if (canonical.category === "protein") return "protein";
    if (canonical.category === "vegetable") return "veg";
    return "spice";
  }
  if (n.includes("fish") || n.includes("beef") || n.includes("chicken") || n.includes("meat") || n.includes("egg") || n.includes("bean") || n.includes("crayfish") || n.includes("prawn") || n.includes("shrimp") || n.includes("egusi")) {
    return "protein";
  }
  if (n.includes("onion") || n.includes("tomato") || n.includes("leaf") || n.includes("leaves") || n.includes("ugu") || n.includes("okra") || n.includes("spinach") || n.includes("pepper")) {
    return "veg";
  }
  return "spice";
}

interface IngredientSearchProps {
  onFindRecipes?: () => void;
  showFindButton?: boolean;
}

export default function IngredientSearch({ onFindRecipes, showFindButton = true }: IngredientSearchProps) {
  const [query, setQuery] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const { items, add, remove, toggle, has, clear } = usePantry();

  // Suggestions based on input
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return CANONICAL_INGREDIENTS.filter(
      (ing) => ing.name.includes(q) || ing.label.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const handleAddFromInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    add(query.trim().toLowerCase());
    setQuery("");
  };

  return (
    <div className="w-full bg-[var(--surface)] rounded-3xl p-5 sm:p-7 border border-[var(--line)] shadow-sm">
      {/* Search Input Box */}
      <form onSubmit={handleAddFromInput} className="relative mb-4">
        <label className="text-xs font-bold text-[var(--cream)] uppercase tracking-wider block mb-2 font-mono">
          What ingredients do you have in your kitchen?
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-4 text-[var(--pepper)] pointer-events-none">
            <Search className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-24 py-3.5 bg-[var(--surface-warm)] hover:bg-[var(--surface)] focus:bg-[var(--surface)] border border-[var(--line)] rounded-2xl text-[var(--cream)] placeholder:text-[var(--tan)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--pepper)]/30 focus:border-[var(--pepper)] transition-all font-mono"
            placeholder="Type an ingredient (e.g. Rice, Palm oil, Crayfish, Egusi)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query.trim() ? (
            <button
              type="submit"
              className="absolute right-2 bg-[var(--pepper)] text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shadow-2xs font-display"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </button>
          ) : (
            <span className="absolute right-3.5 text-[11px] text-[var(--tan)] font-mono hidden sm:inline">
              Press Enter ↵
            </span>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xl z-30 overflow-hidden py-1">
            {suggestions.map((sug) => {
              const inPantry = has(sug.name);
              return (
                <button
                  key={sug.name}
                  type="button"
                  onClick={() => {
                    toggle(sug.name);
                    setQuery("");
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-[var(--cream)] hover:bg-[var(--line)]/20 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{sug.icon}</span>
                    <span className="font-semibold">{sug.label}</span>
                  </span>
                  {inPantry ? (
                    <span className="text-[var(--pepper)] font-bold text-xs flex items-center gap-1 font-mono">
                      <Check className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <span className="text-[var(--tan)] text-xs font-mono">+ Add to kitchen</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </form>

      {/* Selected Pantry Ingredients (Pills with tap-to-remove - NO GREEN) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--cream)] font-mono uppercase">
            In Your Kitchen Pantry ({items.length})
          </span>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="text-[11px] text-[var(--tan)] hover:text-red-500 transition-colors font-mono"
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-[var(--tan)] py-1 italic font-body">
            No ingredients added yet. Tap popular staples below or type above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto py-1">
            {items.map((item) => {
              const cat = getCategory(item);
              let tagStyle = "bg-[var(--palm)]/15 text-[var(--palm)] border border-[var(--palm)]/30";
              if (cat === "protein") {
                tagStyle = "bg-[var(--pepper)]/15 text-[var(--pepper)] border border-[var(--pepper)]/30";
              } else if (cat === "veg") {
                tagStyle = "bg-[var(--berry)]/15 text-[var(--berry-light)] border border-[var(--berry)]/30";
              }

              return (
                <span
                  key={item}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs group transition-all ${tagStyle}`}
                >
                  <span className="capitalize">{item}</span>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className="w-4 h-4 rounded-full bg-[var(--line)] hover:bg-[var(--pepper)] hover:text-white flex items-center justify-center transition-colors"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="w-2.5 h-2.5 stroke-[3]" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Quick Staple Selector Pills */}
        <div className="pt-2 border-t border-[var(--line)]">
          <span className="text-[11px] font-bold text-[var(--tan)] block mb-2 font-mono uppercase">
            Quick Add Popular Staples:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CANONICAL_INGREDIENTS.slice(0, 10).map((staple) => {
              const inPantry = has(staple.name);
              return (
                <button
                  key={staple.name}
                  type="button"
                  onClick={() => toggle(staple.name)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                    inPantry
                      ? "bg-[var(--pepper)] text-white border-[var(--pepper)] shadow-2xs font-bold"
                      : "bg-[var(--surface-warm)] text-[var(--cream)] border-[var(--line)] hover:border-[var(--pepper)]/40 hover:bg-[var(--surface)]"
                  }`}
                >
                  <span>{staple.icon}</span>
                  <span>{staple.label.split(" ")[0]}</span>
                  {inPantry && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {showFindButton && (
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5">
            <Link
              href="/search"
              className="w-full sm:flex-1 bg-[var(--pepper)] hover:opacity-90 active:scale-98 text-white font-bold py-3.5 px-5 rounded-2xl shadow-sm transition-all text-xs sm:text-sm text-center flex items-center justify-center gap-2 font-display"
            >
              <Flame className="w-4 h-4 fill-white text-white" />
              <span>Find What I Can Cook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="w-full sm:w-auto bg-[var(--surface-warm)] hover:bg-[var(--surface)] border border-[var(--line)] text-[var(--cream)] font-bold py-3.5 px-4 rounded-2xl transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs font-display"
            >
              <Sparkles className="w-4 h-4 text-[var(--pepper)]" />
              <span>Ask Chef AI ✨</span>
            </button>
          </div>
        )}
      </div>

      <AiMealSuggesterModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />
    </div>
  );
}
