"use client";

import { useState } from "react";
import Link from "next/link";
import { usePantry, DEFAULT_STAPLES } from "@/lib/pantryStore";
import { CANONICAL_INGREDIENTS } from "@/components/IngredientSearch";
import { Plus, X, Check, Search, Trash2, Flame, ChefHat, Sparkles, ArrowRight } from "lucide-react";

export const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "grain", label: "🌾 Grains & Tubers" },
  { id: "protein", label: "🍗 Proteins & Seafood" },
  { id: "vegetable", label: "🥬 Vegetables & Leaves" },
  { id: "oil", label: "🛢️ Oils & Fats" },
  { id: "spice", label: "🧂 Spices & Seasoning" },
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

export default function PantryPage() {
  const { items, add, remove, toggle, has, clear, count } = usePantry();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter canonical ingredients by search and category
  const filteredCatalog = CANONICAL_INGREDIENTS.filter((ing) => {
    const matchesCategory = activeCategory === "all" || ing.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    add(searchQuery.trim().toLowerCase());
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[var(--pepper)] font-bold text-xs uppercase tracking-wider mb-1 font-mono">
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--cream)] tracking-tight font-display">
            My Pantry ({count})
          </h1>
          <p className="text-xs sm:text-sm text-[var(--tan)] mt-0.5 font-body">
            Add the ingredients in your kitchen to see real-time recipe matches.
          </p>
        </div>

        {count > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1 text-xs text-[var(--tan)] hover:text-red-500 font-semibold px-3 py-1.5 rounded-xl border border-[var(--line)] hover:border-red-500/30 transition-colors bg-[var(--surface)] shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear all</span>
          </button>
        )}
      </div>

      {/* 1. CURRENT PANTRY ITEMS (Chips container - NO GREEN) */}
      <div className="bg-[var(--surface)] rounded-3xl p-5 sm:p-6 border border-[var(--line)] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-[var(--cream)] uppercase tracking-wider font-mono">
            Ingredients in Your Kitchen ({items.length})
          </h2>
          <span className="text-[11px] text-[var(--tan)] font-mono">Tap ✕ to remove</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-[var(--line)] rounded-2xl p-4 bg-[var(--surface-warm)]">
            <ChefHat className="w-8 h-8 text-[var(--tan)]/50 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[var(--cream)]">Your pantry is currently empty</p>
            <p className="text-[11px] text-[var(--tan)] mt-0.5">
              Select common Nigerian staples below or search to add what you have.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {items.map((item) => {
              const category = getIngredientCategory(item);
              
              let tagStyle = "bg-[var(--palm)]/15 text-[var(--palm)] border border-[var(--palm)]/30";
              if (category === "protein") {
                tagStyle = "bg-[var(--pepper)]/15 text-[var(--pepper)] border border-[var(--pepper)]/30";
              } else if (category === "veg") {
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

        {/* Action Button: Find Recipes */}
        {count > 0 && (
          <div className="pt-3 border-t border-[var(--line)]">
            <Link
              href="/search"
              className="w-full bg-[var(--pepper)] hover:opacity-90 active:scale-98 text-white font-bold py-3.5 px-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-display"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Find Recipes with these {count} Ingredients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. INGREDIENT CATALOG (Search & Categories - NO GREEN) */}
      <div className="bg-[var(--surface)] rounded-3xl p-5 sm:p-6 border border-[var(--line)] shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[var(--cream)] uppercase tracking-wider font-mono">
          Quick-Add Ingredients to Pantry
        </h2>

        {/* Search input for ingredients */}
        <form onSubmit={handleCustomAdd} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--tan)]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-20 py-3 bg-[var(--surface-warm)] border border-[var(--line)] rounded-xl text-[var(--cream)] text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--pepper)] focus:border-[var(--pepper)] transition-all placeholder:text-[var(--tan)]"
            placeholder="Search by ingredient name (e.g. atarodo, ugwu, iru)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.trim() && (
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[var(--pepper)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Add</span>
            </button>
          )}
        </form>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-2 px-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? "bg-[var(--pepper)] text-white border-[var(--pepper)] shadow-2xs"
                  : "bg-[var(--surface-warm)] text-[var(--cream)] border-[var(--line)] hover:border-[var(--pepper)]/40 hover:bg-[var(--surface)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Ingredients Grid - High Contrast Selected State */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
          {filteredCatalog.map((ing) => {
            const inPantry = has(ing.name);
            return (
              <button
                key={ing.name}
                type="button"
                onClick={() => toggle(ing.name)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                  inPantry
                    ? "bg-[var(--pepper)] border-[var(--pepper)] text-white font-bold shadow-xs"
                    : "bg-[var(--surface-warm)] border-[var(--line)] text-[var(--cream)] hover:border-[var(--pepper)]/50 hover:bg-[var(--surface)]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg flex-shrink-0">{ing.icon}</span>
                  <span className="text-xs truncate">{ing.label}</span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    inPantry
                      ? "bg-white text-[var(--pepper)] shadow-xs"
                      : "bg-[var(--line)] text-[var(--tan)]"
                  }`}
                >
                  {inPantry ? "✓" : "+"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
