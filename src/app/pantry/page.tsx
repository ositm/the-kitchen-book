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
    <div className="flex flex-col gap-6 pb-24">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-serif">
            My Pantry ({count})
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Add the ingredients in your kitchen to see real-time recipe matches.
          </p>
        </div>

        {count > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-error font-semibold px-3 py-1.5 rounded-xl border border-border hover:border-error/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear all</span>
          </button>
        )}
      </div>

      {/* 1. CURRENT PANTRY ITEMS (Chips container) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE4D7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
            Ingredients in Your Kitchen ({items.length})
          </h2>
          <span className="text-[11px] text-muted-foreground">Tap ✕ to remove</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-border/80 rounded-2xl p-4 bg-[#FAF7F2]">
            <ChefHat className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">Your pantry is currently empty</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Select common Nigerian staples below or search to add what you have.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-light text-primary border border-sage-border/60 text-xs font-semibold shadow-2xs group"
              >
                <span className="capitalize">{item}</span>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  className="w-4 h-4 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                  aria-label={`Remove ${item}`}
                >
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Action Button: Find Recipes */}
        {count > 0 && (
          <div className="pt-3 border-t border-[#F0ECE3]">
            <Link
              href="/search"
              className="w-full bg-primary hover:bg-primary-dark active:scale-98 text-white font-bold py-3.5 px-4 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Flame className="w-4 h-4 fill-accent text-accent" />
              <span>Find Recipes with these {count} Ingredients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. INGREDIENT CATALOG (Search & Categories) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE4D7] shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Quick-Add Ingredients to Pantry
        </h2>

        {/* Search input for ingredients */}
        <form onSubmit={handleCustomAdd} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-20 py-3 bg-[#FAF7F2] border border-[#EAE4D7] rounded-xl text-foreground text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground"
            placeholder="Search by ingredient name (e.g. atarodo, ugwu, iru)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.trim() && (
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-all flex items-center gap-1"
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
                  ? "bg-primary text-white border-primary shadow-2xs"
                  : "bg-[#FAF7F2] text-foreground/80 border-[#EAE4D7] hover:border-primary/40 hover:bg-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
          {filteredCatalog.map((ing) => {
            const inPantry = has(ing.name);
            return (
              <button
                key={ing.name}
                type="button"
                onClick={() => toggle(ing.name)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all food-card-hover ${
                  inPantry
                    ? "bg-sage-light/60 border-sage-border text-primary font-bold shadow-2xs"
                    : "bg-[#FAF7F2] border-[#EAE4D7] text-foreground/85 hover:border-primary/40 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg flex-shrink-0">{ing.icon}</span>
                  <span className="text-xs truncate">{ing.label}</span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    inPantry
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
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
